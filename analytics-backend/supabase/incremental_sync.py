"""
Incremental Sync: BigQuery → Supabase
Runs daily at 8 PM IST to sync new data only.

Flow:
1. Get last_processed_timestamp from Supabase
2. Query BigQuery for data after that timestamp
3. Transform raw events into materialized views
4. APPEND new data to BigQuery materialized tables
5. APPEND new data to Supabase tables
6. Update last_processed_timestamp
"""

import os
import sys
from datetime import datetime, timedelta, date
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from google.cloud import bigquery
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / "functions" / ".env"
load_dotenv(env_path)

# BigQuery config
PROJECT_ID = "portfolio-483605"
BQ_DATASET = "analytics_materialized"
BQ_RAW_DATASET = "analytics_325aborty"  # Raw GA4 events dataset

# Supabase config
SUPABASE_CONFIG = {
    "host": os.getenv("SUPABASE_HOST", "aws-1-ap-south-1.pooler.supabase.com"),
    "port": os.getenv("SUPABASE_PORT", "6543"),
    "database": os.getenv("SUPABASE_DATABASE", "postgres"),
    "user": os.getenv("SUPABASE_USER", "postgres.pabymjbidxkatgcsqrnd"),
    "password": os.getenv("SUPABASE_PASSWORD"),
}


def get_bigquery_client():
    """Initialize BigQuery client"""
    credentials_path = Path(__file__).parent.parent / "credentials" / "gcp-service-account.json"
    if credentials_path.exists():
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path)
    return bigquery.Client(project=PROJECT_ID)


def get_supabase_connection():
    """Get PostgreSQL connection to Supabase"""
    return psycopg2.connect(
        host=SUPABASE_CONFIG["host"],
        port=SUPABASE_CONFIG["port"],
        database=SUPABASE_CONFIG["database"],
        user=SUPABASE_CONFIG["user"],
        password=SUPABASE_CONFIG["password"],
        sslmode="require",
        cursor_factory=RealDictCursor
    )


def get_last_sync_timestamp(pg_conn, table_name: str) -> datetime:
    """Get the last sync timestamp for a table from Supabase"""
    with pg_conn.cursor() as cursor:
        cursor.execute("""
            SELECT last_synced_at
            FROM sync_metadata
            WHERE table_name = %s
            ORDER BY last_synced_at DESC
            LIMIT 1
        """, (table_name,))
        result = cursor.fetchone()

        if result and result['last_synced_at']:
            return result['last_synced_at']

        # Default: 30 days ago if no previous sync
        return datetime.utcnow() - timedelta(days=30)


def update_sync_timestamp(pg_conn, table_name: str, rows_synced: int, duration: float):
    """Update the sync metadata after successful sync"""
    with pg_conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO sync_metadata (table_name, last_synced_at, rows_synced, sync_duration_seconds, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (table_name, datetime.utcnow(), rows_synced, duration, 'success'))
        pg_conn.commit()


def get_new_session_date(pg_conn) -> date:
    """Get the date to start syncing from (day after last synced session)"""
    with pg_conn.cursor() as cursor:
        cursor.execute("""
            SELECT MAX(session_date) as last_date FROM sessions
        """)
        result = cursor.fetchone()

        if result and result['last_date']:
            # Start from the day after the last synced date
            return result['last_date'] + timedelta(days=1)

        # Default: 30 days ago if no data
        return (datetime.utcnow() - timedelta(days=30)).date()


# ============================================================================
# INCREMENTAL SYNC FUNCTIONS FOR EACH TABLE
# ============================================================================

def sync_sessions_incremental(bq_client, pg_conn, start_date: date) -> dict:
    """Sync new sessions from BigQuery to Supabase"""
    start_time = datetime.now()
    table_name = "sessions"

    print(f"  Syncing {table_name} (from {start_date})...")

    # Query BigQuery for new sessions
    query = f"""
        SELECT
            user_pseudo_id, session_id, session_start, session_end,
            device_category, os, browser, country, region, city, continent,
            traffic_source, traffic_medium, campaign_name,
            total_events, page_views, scroll_events, click_events,
            engaged_session, landing_page, exit_page, is_returning,
            engagement_score, engagement_level, max_scroll_depth,
            sections_viewed_count, projects_clicked_count, conversions_count,
            day_of_week_name, hour_of_day, session_duration_seconds,
            session_date, session_hour, session_day_of_week,
            is_bounce, is_engaged, engagement_tier, visitor_type,
            has_conversion, materialized_at
        FROM `{PROJECT_ID}.{BQ_DATASET}.sessions`
        WHERE session_date >= @start_date
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("start_date", "DATE", start_date)
        ]
    )

    try:
        query_job = bq_client.query(query, job_config=job_config)
        rows = list(query_job.result())

        if not rows:
            print(f"    No new data for {table_name}")
            return {"table": table_name, "rows": 0, "status": "no_new_data"}

        # Convert to list of tuples
        data = [tuple(row.values()) for row in rows]

        # Insert into Supabase (append)
        with pg_conn.cursor() as cursor:
            columns = """
                user_pseudo_id, session_id, session_start, session_end,
                device_category, os, browser, country, region, city, continent,
                traffic_source, traffic_medium, campaign_name,
                total_events, page_views, scroll_events, click_events,
                engaged_session, landing_page, exit_page, is_returning,
                engagement_score, engagement_level, max_scroll_depth,
                sections_viewed_count, projects_clicked_count, conversions_count,
                day_of_week_name, hour_of_day, session_duration_seconds,
                session_date, session_hour, session_day_of_week,
                is_bounce, is_engaged, engagement_tier, visitor_type,
                has_conversion, materialized_at
            """.replace('\n', '').replace(' ', '')

            # Use ON CONFLICT to handle duplicates (upsert)
            insert_query = f"""
                INSERT INTO {table_name} ({columns})
                VALUES %s
                ON CONFLICT (session_id, user_pseudo_id) DO NOTHING
            """

            # For tables without unique constraint, just insert
            insert_query = f"""
                INSERT INTO {table_name} ({columns})
                VALUES %s
            """

            execute_values(cursor, insert_query, data)
            pg_conn.commit()

        duration = (datetime.now() - start_time).total_seconds()
        print(f"    Synced {len(data)} rows in {duration:.2f}s")

        update_sync_timestamp(pg_conn, table_name, len(data), duration)

        return {"table": table_name, "rows": len(data), "duration": duration, "status": "success"}

    except Exception as e:
        print(f"    Error: {e}")
        pg_conn.rollback()
        return {"table": table_name, "rows": 0, "status": "error", "error": str(e)}


def sync_daily_metrics_incremental(bq_client, pg_conn, start_date: date) -> dict:
    """Sync new daily metrics"""
    start_time = datetime.now()
    table_name = "daily_metrics"

    print(f"  Syncing {table_name} (from {start_date})...")

    query = f"""
        SELECT
            session_date, total_sessions, unique_visitors, total_page_views,
            avg_pages_per_session, engaged_sessions, engagement_rate,
            bounces, bounce_rate, avg_session_duration_sec, avg_engagement_time_sec,
            desktop_sessions, mobile_sessions, tablet_sessions,
            avg_engagement_score, returning_visitor_sessions, returning_visitor_rate,
            dark_mode_sessions, light_mode_sessions, materialized_at
        FROM `{PROJECT_ID}.{BQ_DATASET}.daily_metrics`
        WHERE session_date >= @start_date
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("start_date", "DATE", start_date)
        ]
    )

    try:
        query_job = bq_client.query(query, job_config=job_config)
        rows = list(query_job.result())

        if not rows:
            print(f"    No new data for {table_name}")
            return {"table": table_name, "rows": 0, "status": "no_new_data"}

        data = [tuple(row.values()) for row in rows]

        with pg_conn.cursor() as cursor:
            columns = """
                session_date, total_sessions, unique_visitors, total_page_views,
                avg_pages_per_session, engaged_sessions, engagement_rate,
                bounces, bounce_rate, avg_session_duration_sec, avg_engagement_time_sec,
                desktop_sessions, mobile_sessions, tablet_sessions,
                avg_engagement_score, returning_visitor_sessions, returning_visitor_rate,
                dark_mode_sessions, light_mode_sessions, materialized_at
            """.replace('\n', '').replace(' ', '')

            # Delete existing data for these dates (to handle updates)
            cursor.execute(f"DELETE FROM {table_name} WHERE session_date >= %s", (start_date,))

            insert_query = f"INSERT INTO {table_name} ({columns}) VALUES %s"
            execute_values(cursor, insert_query, data)
            pg_conn.commit()

        duration = (datetime.now() - start_time).total_seconds()
        print(f"    Synced {len(data)} rows in {duration:.2f}s")
        update_sync_timestamp(pg_conn, table_name, len(data), duration)

        return {"table": table_name, "rows": len(data), "duration": duration, "status": "success"}

    except Exception as e:
        print(f"    Error: {e}")
        pg_conn.rollback()
        return {"table": table_name, "rows": 0, "status": "error", "error": str(e)}


def sync_rankings_full_refresh(bq_client, pg_conn, table_name: str, query: str, columns: str) -> dict:
    """Full refresh for ranking tables (they're aggregated, not date-based)"""
    start_time = datetime.now()

    print(f"  Syncing {table_name} (full refresh)...")

    try:
        query_job = bq_client.query(query)
        rows = list(query_job.result())

        if not rows:
            print(f"    No data for {table_name}")
            return {"table": table_name, "rows": 0, "status": "empty"}

        data = [tuple(row.values()) for row in rows]

        with pg_conn.cursor() as cursor:
            cursor.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY")
            insert_query = f"INSERT INTO {table_name} ({columns}) VALUES %s"
            execute_values(cursor, insert_query, data)
            pg_conn.commit()

        duration = (datetime.now() - start_time).total_seconds()
        print(f"    Synced {len(data)} rows in {duration:.2f}s")
        update_sync_timestamp(pg_conn, table_name, len(data), duration)

        return {"table": table_name, "rows": len(data), "duration": duration, "status": "success"}

    except Exception as e:
        print(f"    Error: {e}")
        pg_conn.rollback()
        return {"table": table_name, "rows": 0, "status": "error", "error": str(e)}


def main():
    """Main incremental sync function"""
    print("=" * 60)
    print("Incremental Sync: BigQuery → Supabase")
    print("=" * 60)
    print(f"Started at: {datetime.now()}")
    print()

    # Initialize clients
    print("Connecting to BigQuery...")
    bq_client = get_bigquery_client()

    print("Connecting to Supabase...")
    pg_conn = get_supabase_connection()

    # Get the start date for incremental sync
    start_date = get_new_session_date(pg_conn)
    print(f"\nIncremental sync from: {start_date}")
    print()

    results = []

    # ========================================================================
    # DATE-BASED TABLES (Incremental)
    # ========================================================================
    print("Syncing date-based tables (incremental):")

    results.append(sync_sessions_incremental(bq_client, pg_conn, start_date))
    results.append(sync_daily_metrics_incremental(bq_client, pg_conn, start_date))

    # Traffic daily stats
    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "traffic_daily_stats",
        f"""SELECT event_date, traffic_source, traffic_medium, campaign_name,
                   sessions, unique_visitors, total_page_views, avg_pages_per_session,
                   avg_session_duration_sec, engagement_rate, bounce_rate,
                   desktop_sessions, mobile_sessions, avg_engagement_score,
                   high_engagement_sessions, high_engagement_rate,
                   returning_visitors, returning_visitor_rate, avg_scroll_depth, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.traffic_daily_stats`
            WHERE event_date >= '{start_date}'""",
        "event_date,traffic_source,traffic_medium,campaign_name,sessions,unique_visitors,total_page_views,avg_pages_per_session,avg_session_duration_sec,engagement_rate,bounce_rate,desktop_sessions,mobile_sessions,avg_engagement_score,high_engagement_sessions,high_engagement_rate,returning_visitors,returning_visitor_rate,avg_scroll_depth,materialized_at"
    ))

    # Conversion funnel
    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "conversion_funnel",
        f"""SELECT event_date, total_sessions, unique_visitors,
                   total_cta_views, total_cta_clicks, cta_click_rate,
                   contact_form_starts, contact_form_submissions, form_completion_rate,
                   social_clicks, social_click_rate, outbound_clicks, outbound_click_rate,
                   resume_downloads, file_downloads, publication_clicks, content_copies,
                   avg_conversion_score, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.conversion_funnel`
            WHERE event_date >= '{start_date}'""",
        "event_date,total_sessions,unique_visitors,total_cta_views,total_cta_clicks,cta_click_rate,contact_form_starts,contact_form_submissions,form_completion_rate,social_clicks,social_click_rate,outbound_clicks,outbound_click_rate,resume_downloads,file_downloads,publication_clicks,content_copies,avg_conversion_score,materialized_at"
    ))

    # ========================================================================
    # RANKING TABLES (Full Refresh - aggregated data)
    # ========================================================================
    print("\nSyncing ranking tables (full refresh):")

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "project_rankings",
        f"""SELECT project_id, project_title, project_category,
                   total_views, total_unique_viewers, total_clicks, total_expands,
                   total_link_clicks, total_github_clicks, total_demo_clicks,
                   avg_view_duration_sec, avg_ctr_percent, engagement_score,
                   overall_rank, category_rank, engagement_percentile,
                   performance_tier, recommended_position, ranked_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.project_rankings`""",
        "project_id,project_title,project_category,total_views,total_unique_viewers,total_clicks,total_expands,total_link_clicks,total_github_clicks,total_demo_clicks,avg_view_duration_sec,avg_ctr_percent,engagement_score,overall_rank,category_rank,engagement_percentile,performance_tier,recommended_position,ranked_at,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "section_rankings",
        f"""SELECT section_id, total_views, total_unique_viewers, total_engaged_views,
                   avg_engagement_rate, avg_time_spent_seconds, avg_scroll_depth_percent,
                   max_scroll_milestone, total_exits, avg_exit_rate, health_score,
                   engagement_rank, view_rank, retention_rank, health_tier,
                   dropoff_indicator, optimization_hint, ranked_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.section_rankings`""",
        "section_id,total_views,total_unique_viewers,total_engaged_views,avg_engagement_rate,avg_time_spent_seconds,avg_scroll_depth_percent,max_scroll_milestone,total_exits,avg_exit_rate,health_score,engagement_rank,view_rank,retention_rank,health_tier,dropoff_indicator,optimization_hint,ranked_at,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "visitor_insights",
        f"""SELECT user_pseudo_id, total_sessions, first_visit, last_visit,
                   visitor_tenure_days, total_page_views, avg_session_duration_sec,
                   engaged_sessions, engagement_rate, primary_device, primary_country,
                   primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
                   social_clicks, resume_downloads, outbound_clicks,
                   visitor_value_score, visitor_segment, interest_profile, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.visitor_insights`""",
        "user_pseudo_id,total_sessions,first_visit,last_visit,visitor_tenure_days,total_page_views,avg_session_duration_sec,engaged_sessions,engagement_rate,primary_device,primary_country,primary_traffic_source,projects_viewed,cta_clicks,form_submissions,social_clicks,resume_downloads,outbound_clicks,visitor_value_score,visitor_segment,interest_profile,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "tech_demand_insights",
        f"""SELECT technology, total_interactions, total_unique_users,
                   demand_rank, demand_percentile, demand_tier,
                   learning_priority, generated_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.tech_demand_insights`""",
        "technology,total_interactions,total_unique_users,demand_rank,demand_percentile,demand_tier,learning_priority,generated_at,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "domain_rankings",
        f"""SELECT domain, total_explicit_interest, total_implicit_interest,
                   total_interactions, total_unique_users, total_interest_score,
                   interest_rank, interest_percentile, demand_tier,
                   portfolio_recommendation, ranked_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.domain_rankings`""",
        "domain,total_explicit_interest,total_implicit_interest,total_interactions,total_unique_users,total_interest_score,interest_rank,interest_percentile,demand_tier,portfolio_recommendation,ranked_at,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "experience_rankings",
        f"""SELECT experience_id, experience_title, company,
                   total_interactions, total_unique_users, total_sessions,
                   interest_rank, interest_percentile, role_attractiveness,
                   positioning_suggestion, ranked_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.experience_rankings`""",
        "experience_id,experience_title,company,total_interactions,total_unique_users,total_sessions,interest_rank,interest_percentile,role_attractiveness,positioning_suggestion,ranked_at,materialized_at"
    ))

    results.append(sync_rankings_full_refresh(
        bq_client, pg_conn,
        "recommendation_performance",
        f"""SELECT total_impressions, total_clicks, overall_ctr,
                   total_users_shown, total_users_clicked, user_conversion_rate,
                   position_1_ctr, position_2_ctr, position_3_ctr,
                   best_position_insight, system_health, generated_at, materialized_at
            FROM `{PROJECT_ID}.{BQ_DATASET}.recommendation_performance`""",
        "total_impressions,total_clicks,overall_ctr,total_users_shown,total_users_clicked,user_conversion_rate,position_1_ctr,position_2_ctr,position_3_ctr,best_position_insight,system_health,generated_at,materialized_at"
    ))

    # ========================================================================
    # SUMMARY
    # ========================================================================
    print("\n" + "=" * 60)
    print("Sync Summary:")
    print("=" * 60)

    total_rows = sum(r.get("rows", 0) for r in results)
    successful = sum(1 for r in results if r["status"] in ["success", "no_new_data"])
    failed = sum(1 for r in results if r["status"] == "error")

    print(f"  Tables synced: {successful}/{len(results)}")
    print(f"  Total rows: {total_rows}")
    if failed > 0:
        print(f"  Failed: {failed}")
        for r in results:
            if r["status"] == "error":
                print(f"    - {r['table']}: {r.get('error', 'Unknown error')}")

    print(f"\nCompleted at: {datetime.now()}")

    # Close connection
    pg_conn.close()

    # Exit with error if any failures
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
