"""
Sync BigQuery Materialized Tables to Supabase
Run this script after BigQuery materialization to copy data to Supabase for fast API reads.
"""

import os
import sys
from datetime import datetime
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values
from google.cloud import bigquery
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / "functions" / ".env"
load_dotenv(env_path)

# BigQuery config
PROJECT_ID = "portfolio-483605"
BQ_DATASET = "analytics_materialized"

# Supabase config
SUPABASE_CONFIG = {
    "host": os.getenv("SUPABASE_HOST", "aws-1-ap-northeast-1.pooler.supabase.com"),
    "port": os.getenv("SUPABASE_PORT", "6543"),
    "database": os.getenv("SUPABASE_DATABASE", "postgres"),
    "user": os.getenv("SUPABASE_USER", "postgres.keutkhwgljfjqyiwxfbb"),
    "password": os.getenv("SUPABASE_PASSWORD"),
}

# Tables to sync with their column mappings
TABLES_TO_SYNC = {
    "sessions": {
        "bq_columns": """
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
        """,
        "pg_columns": """
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
        """
    },
    "daily_metrics": {
        "bq_columns": """
            session_date, total_sessions, unique_visitors, total_page_views,
            avg_pages_per_session, engaged_sessions, engagement_rate,
            bounces, bounce_rate, avg_session_duration_sec, avg_engagement_time_sec,
            desktop_sessions, mobile_sessions, tablet_sessions,
            avg_engagement_score, returning_visitor_sessions, returning_visitor_rate,
            dark_mode_sessions, light_mode_sessions, materialized_at
        """,
        "pg_columns": """
            session_date, total_sessions, unique_visitors, total_page_views,
            avg_pages_per_session, engaged_sessions, engagement_rate,
            bounces, bounce_rate, avg_session_duration_sec, avg_engagement_time_sec,
            desktop_sessions, mobile_sessions, tablet_sessions,
            avg_engagement_score, returning_visitor_sessions, returning_visitor_rate,
            dark_mode_sessions, light_mode_sessions, materialized_at
        """
    },
    "traffic_daily_stats": {
        "bq_columns": """
            event_date, traffic_source, traffic_medium, campaign_name,
            sessions, unique_visitors, total_page_views, avg_pages_per_session,
            avg_session_duration_sec, engagement_rate, bounce_rate,
            desktop_sessions, mobile_sessions, avg_engagement_score,
            high_engagement_sessions, high_engagement_rate,
            returning_visitors, returning_visitor_rate, avg_scroll_depth, materialized_at
        """,
        "pg_columns": """
            event_date, traffic_source, traffic_medium, campaign_name,
            sessions, unique_visitors, total_page_views, avg_pages_per_session,
            avg_session_duration_sec, engagement_rate, bounce_rate,
            desktop_sessions, mobile_sessions, avg_engagement_score,
            high_engagement_sessions, high_engagement_rate,
            returning_visitors, returning_visitor_rate, avg_scroll_depth, materialized_at
        """
    },
    "conversion_funnel": {
        "bq_columns": """
            event_date, total_sessions, unique_visitors,
            total_cta_views, total_cta_clicks, cta_click_rate,
            contact_form_starts, contact_form_submissions, form_completion_rate,
            social_clicks, social_click_rate, outbound_clicks, outbound_click_rate,
            resume_downloads, file_downloads, publication_clicks, content_copies,
            avg_conversion_score, materialized_at
        """,
        "pg_columns": """
            event_date, total_sessions, unique_visitors,
            total_cta_views, total_cta_clicks, cta_click_rate,
            contact_form_starts, contact_form_submissions, form_completion_rate,
            social_clicks, social_click_rate, outbound_clicks, outbound_click_rate,
            resume_downloads, file_downloads, publication_clicks, content_copies,
            avg_conversion_score, materialized_at
        """
    },
    "project_rankings": {
        "bq_columns": """
            project_id, project_title, project_category,
            total_views, total_unique_viewers, total_clicks, total_expands,
            total_link_clicks, total_github_clicks, total_demo_clicks,
            avg_view_duration_sec, avg_ctr_percent, engagement_score,
            overall_rank, category_rank, engagement_percentile,
            performance_tier, recommended_position, ranked_at, materialized_at
        """,
        "pg_columns": """
            project_id, project_title, project_category,
            total_views, total_unique_viewers, total_clicks, total_expands,
            total_link_clicks, total_github_clicks, total_demo_clicks,
            avg_view_duration_sec, avg_ctr_percent, engagement_score,
            overall_rank, category_rank, engagement_percentile,
            performance_tier, recommended_position, ranked_at, materialized_at
        """
    },
    "section_rankings": {
        "bq_columns": """
            section_id,
            total_unique_views, total_unique_exits, total_unique_viewers, avg_exit_rate,
            total_views, total_exits, avg_total_exit_rate, avg_revisits_per_session,
            total_engaged_views, avg_engagement_rate, avg_time_spent_seconds,
            avg_scroll_depth_percent, max_scroll_milestone,
            health_score, engagement_rank, view_rank, retention_rank,
            health_tier, dropoff_indicator, optimization_hint, ranked_at, materialized_at
        """,
        "pg_columns": """
            section_id,
            total_unique_views, total_unique_exits, total_unique_viewers, avg_exit_rate,
            total_views, total_exits, avg_total_exit_rate, avg_revisits_per_session,
            total_engaged_views, avg_engagement_rate, avg_time_spent_seconds,
            avg_scroll_depth_percent, max_scroll_milestone,
            health_score, engagement_rank, view_rank, retention_rank,
            health_tier, dropoff_indicator, optimization_hint, ranked_at, materialized_at
        """
    },
    "visitor_insights": {
        "bq_columns": """
            user_pseudo_id, total_sessions, first_visit, last_visit,
            visitor_tenure_days, total_page_views, avg_session_duration_sec,
            engaged_sessions, engagement_rate, primary_device, primary_country,
            primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
            social_clicks, resume_downloads, outbound_clicks,
            visitor_value_score, visitor_segment, interest_profile, materialized_at
        """,
        "pg_columns": """
            user_pseudo_id, total_sessions, first_visit, last_visit,
            visitor_tenure_days, total_page_views, avg_session_duration_sec,
            engaged_sessions, engagement_rate, primary_device, primary_country,
            primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
            social_clicks, resume_downloads, outbound_clicks,
            visitor_value_score, visitor_segment, interest_profile, materialized_at
        """
    },
    "tech_demand_insights": {
        "bq_columns": """
            technology, total_interactions, total_unique_users,
            demand_rank, demand_percentile, demand_tier,
            learning_priority, generated_at, materialized_at
        """,
        "pg_columns": """
            technology, total_interactions, total_unique_users,
            demand_rank, demand_percentile, demand_tier,
            learning_priority, generated_at, materialized_at
        """
    },
    "domain_rankings": {
        "bq_columns": """
            domain, total_explicit_interest, total_implicit_interest,
            total_interactions, total_unique_users, total_interest_score,
            interest_rank, interest_percentile, demand_tier,
            portfolio_recommendation, ranked_at, materialized_at
        """,
        "pg_columns": """
            domain, total_explicit_interest, total_implicit_interest,
            total_interactions, total_unique_users, total_interest_score,
            interest_rank, interest_percentile, demand_tier,
            portfolio_recommendation, ranked_at, materialized_at
        """
    },
    "experience_rankings": {
        "bq_columns": """
            experience_id, experience_title, company,
            total_interactions, total_unique_users, total_sessions,
            interest_rank, interest_percentile, role_attractiveness,
            positioning_suggestion, ranked_at, materialized_at
        """,
        "pg_columns": """
            experience_id, experience_title, company,
            total_interactions, total_unique_users, total_sessions,
            interest_rank, interest_percentile, role_attractiveness,
            positioning_suggestion, ranked_at, materialized_at
        """
    },
    "recommendation_performance": {
        "bq_columns": """
            total_impressions, total_clicks, overall_ctr,
            total_users_shown, total_users_clicked, user_conversion_rate,
            position_1_ctr, position_2_ctr, position_3_ctr,
            best_position_insight, system_health, generated_at, materialized_at
        """,
        "pg_columns": """
            total_impressions, total_clicks, overall_ctr,
            total_users_shown, total_users_clicked, user_conversion_rate,
            position_1_ctr, position_2_ctr, position_3_ctr,
            best_position_insight, system_health, generated_at, materialized_at
        """
    },
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
        sslmode="require"
    )


def sync_table(bq_client, pg_conn, table_name: str, config: dict) -> dict:
    """Sync a single table from BigQuery to Supabase"""
    start_time = datetime.now()

    print(f"  Syncing {table_name}...")

    # Query BigQuery
    bq_query = f"""
        SELECT {config['bq_columns']}
        FROM `{PROJECT_ID}.{BQ_DATASET}.{table_name}`
    """

    try:
        query_job = bq_client.query(bq_query)
        rows = list(query_job.result())

        if not rows:
            print(f"    No data in {table_name}")
            return {"table": table_name, "rows": 0, "status": "empty"}

        # Convert to list of tuples
        data = [tuple(row.values()) for row in rows]

        # Get column names for insert
        pg_columns = config['pg_columns'].replace('\n', '').replace(' ', '')
        columns_list = [c.strip() for c in pg_columns.split(',')]

        # Truncate and insert into Supabase
        with pg_conn.cursor() as cursor:
            cursor.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY")

            # Build insert query
            placeholders = ','.join(['%s'] * len(columns_list))
            insert_query = f"""
                INSERT INTO {table_name} ({pg_columns})
                VALUES ({placeholders})
            """

            # Batch insert
            cursor.executemany(insert_query, data)
            pg_conn.commit()

        duration = (datetime.now() - start_time).total_seconds()
        print(f"    Synced {len(data)} rows in {duration:.2f}s")

        return {
            "table": table_name,
            "rows": len(data),
            "duration": duration,
            "status": "success"
        }

    except Exception as e:
        print(f"    Error syncing {table_name}: {e}")
        pg_conn.rollback()
        return {
            "table": table_name,
            "rows": 0,
            "status": "error",
            "error": str(e)
        }


def update_sync_metadata(pg_conn, results: list):
    """Update sync metadata table"""
    with pg_conn.cursor() as cursor:
        for result in results:
            cursor.execute("""
                INSERT INTO sync_metadata (table_name, last_synced_at, rows_synced, sync_duration_seconds, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                result["table"],
                datetime.now(),
                result.get("rows", 0),
                result.get("duration", 0),
                result["status"]
            ))
        pg_conn.commit()


def main():
    """Main sync function"""
    print("=" * 60)
    print("BigQuery → Supabase Sync")
    print("=" * 60)
    print(f"Started at: {datetime.now()}")
    print()

    # Initialize clients
    print("Connecting to BigQuery...")
    bq_client = get_bigquery_client()

    print("Connecting to Supabase...")
    pg_conn = get_supabase_connection()

    # Sync each table
    print("\nSyncing tables:")
    results = []

    for table_name, config in TABLES_TO_SYNC.items():
        result = sync_table(bq_client, pg_conn, table_name, config)
        results.append(result)

    # Update metadata
    print("\nUpdating sync metadata...")
    update_sync_metadata(pg_conn, results)

    # Summary
    print("\n" + "=" * 60)
    print("Sync Summary:")
    print("=" * 60)

    total_rows = sum(r.get("rows", 0) for r in results)
    successful = sum(1 for r in results if r["status"] == "success")
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
