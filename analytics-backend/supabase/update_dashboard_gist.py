"""
Update Dashboard Gist - Pre-computes dashboard data for all date ranges
Runs after BigQuery → Supabase sync in GitHub Actions workflow.

Computes data for: yesterday, last_7_days, last_14_days, last_30_days, all_time
Updates the GitHub Gist with the compiled data.
"""

import os
import json
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date, datetime, timedelta
from decimal import Decimal

# Supabase config
SUPABASE_CONFIG = {
    "host": os.getenv("SUPABASE_HOST"),
    "port": os.getenv("SUPABASE_PORT", "6543"),
    "database": os.getenv("SUPABASE_DATABASE", "postgres"),
    "user": os.getenv("SUPABASE_USER"),
    "password": os.getenv("SUPABASE_PASSWORD"),
}

# Gist config
GIST_TOKEN = os.getenv("GIST_TOKEN")
GIST_ID = os.getenv("GIST_ID", "dedbbf6ebcb32542e7b724b86f2b214f")


def get_connection():
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


def run_query(query: str, params: tuple = None) -> list[dict]:
    """Run a single PostgreSQL query"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def json_serializer(obj):
    """Custom JSON serializer for types not serializable by default"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


def get_data_date_range() -> tuple[date, date]:
    """Get the min and max dates with data in the sessions table"""
    result = run_query("""
        SELECT MIN(session_date) as min_date, MAX(session_date) as max_date
        FROM sessions
    """)
    if result and result[0]["min_date"] and result[0]["max_date"]:
        return result[0]["min_date"], result[0]["max_date"]
    # Fallback to last 30 days if no data
    today = date.today()
    return today - timedelta(days=30), today - timedelta(days=1)


def fetch_dashboard_data(start_date: date, end_date: date) -> dict:
    """Fetch all dashboard data for a given date range"""

    queries = {
        "overview": ("""
            SELECT
                COUNT(*) as total_sessions,
                COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_session_duration,
                ROUND(AVG(page_views)::numeric, 1) as avg_pages_per_session,
                ROUND(COUNT(*) FILTER (WHERE is_bounce)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as bounce_rate,
                ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate,
                ROUND(AVG(engagement_score)::numeric, 2) as avg_engagement_score
            FROM sessions WHERE session_date BETWEEN %s AND %s
        """, (start_date, end_date)),

        "daily_metrics": ("""
            SELECT session_date as date, total_sessions as sessions, unique_visitors as visitors,
                   engagement_rate, bounce_rate, avg_session_duration_sec as avg_duration,
                   desktop_sessions, mobile_sessions, tablet_sessions
            FROM daily_metrics WHERE session_date BETWEEN %s AND %s ORDER BY session_date
        """, (start_date, end_date)),

        "traffic_sources_summary": ("""
            SELECT traffic_source, traffic_medium, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate,
                   ROUND(COUNT(*) FILTER (WHERE is_bounce)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as bounce_rate,
                   ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_duration
            FROM sessions WHERE session_date BETWEEN %s AND %s
            GROUP BY traffic_source, traffic_medium ORDER BY sessions DESC LIMIT 10
        """, (start_date, end_date)),

        "conversion_summary": ("""
            SELECT
                SUM(total_cta_views) as cta_views,
                SUM(total_cta_clicks) as cta_clicks,
                SUM(contact_form_starts) as form_starts,
                SUM(contact_form_submissions) as form_submissions,
                SUM(resume_downloads) as resume_downloads,
                SUM(social_clicks) as social_clicks,
                SUM(outbound_clicks) as outbound_clicks,
                SUM(publication_clicks) as publication_clicks,
                SUM(content_copies) as content_copies
            FROM conversion_funnel WHERE event_date BETWEEN %s AND %s
        """, (start_date, end_date)),

        "project_rankings": ("""
            SELECT project_id, project_title, project_category, total_views, total_unique_viewers,
                   total_clicks, total_expands, total_link_clicks, total_github_clicks, total_demo_clicks,
                   engagement_score, overall_rank, performance_tier, recommended_position,
                   engagement_percentile
            FROM project_rankings ORDER BY overall_rank LIMIT 10
        """, None),

        "section_rankings": ("""
            SELECT section_id, total_views, total_unique_viewers, total_engaged_views,
                   avg_engagement_rate, avg_time_spent_seconds, avg_scroll_depth_percent,
                   total_exits, avg_exit_rate, health_score, engagement_rank,
                   health_tier, dropoff_indicator, optimization_hint
            FROM section_rankings ORDER BY health_score DESC
        """, None),

        "visitor_segments": ("""
            SELECT visitor_segment, COUNT(*) as count,
                   ROUND(AVG(visitor_value_score)::numeric, 2) as avg_value_score,
                   ROUND(AVG(total_sessions)::numeric, 2) as avg_sessions,
                   ROUND(AVG(engagement_rate)::numeric, 2) as avg_engagement_rate
            FROM visitor_insights GROUP BY visitor_segment ORDER BY count DESC
        """, None),

        "top_visitors": ("""
            SELECT user_pseudo_id, total_sessions, visitor_tenure_days, total_page_views,
                   avg_session_duration_sec, engagement_rate, primary_device, primary_country,
                   primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
                   social_clicks, resume_downloads, visitor_value_score, visitor_segment, interest_profile
            FROM visitor_insights ORDER BY visitor_value_score DESC LIMIT 15
        """, None),

        "tech_demand": ("""
            SELECT technology as skill_name, total_interactions, total_unique_users,
                   demand_rank, demand_percentile, demand_tier, learning_priority
            FROM tech_demand_insights ORDER BY demand_rank
        """, None),

        "domain_rankings": ("""
            SELECT domain, total_explicit_interest, total_implicit_interest, total_interactions,
                   total_unique_users, total_interest_score, interest_rank, interest_percentile,
                   demand_tier, portfolio_recommendation
            FROM domain_rankings ORDER BY interest_rank
        """, None),

        "experience_rankings": ("""
            SELECT experience_id, experience_title, company, total_interactions, total_unique_users,
                   total_sessions, interest_rank, interest_percentile, role_attractiveness, positioning_suggestion
            FROM experience_rankings ORDER BY interest_rank
        """, None),

        "recommendation_performance": ("""
            SELECT * FROM recommendation_performance LIMIT 1
        """, None),

        "temporal_hourly": ("""
            SELECT hour_of_day as hour, COUNT(*) as sessions, COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(AVG(engagement_score)::numeric, 2) as avg_engagement,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate
            FROM sessions WHERE session_date BETWEEN %s AND %s AND hour_of_day IS NOT NULL
            GROUP BY hour_of_day ORDER BY hour_of_day
        """, (start_date, end_date)),

        "temporal_dow": ("""
            SELECT
                CASE session_day_of_week
                    WHEN 1 THEN 'Sunday'
                    WHEN 2 THEN 'Monday'
                    WHEN 3 THEN 'Tuesday'
                    WHEN 4 THEN 'Wednesday'
                    WHEN 5 THEN 'Thursday'
                    WHEN 6 THEN 'Friday'
                    WHEN 7 THEN 'Saturday'
                END as day_name,
                session_day_of_week as day_number,
                COUNT(*) as sessions,
                COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                ROUND(AVG(engagement_score)::numeric, 2) as avg_engagement,
                ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate
            FROM sessions WHERE session_date BETWEEN %s AND %s
            GROUP BY session_day_of_week ORDER BY session_day_of_week
        """, (start_date, end_date)),

        "devices": ("""
            SELECT device_category, COUNT(*) as sessions, COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate,
                   ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_duration
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY device_category ORDER BY sessions DESC
        """, (start_date, end_date)),

        "browsers": ("""
            SELECT COALESCE(browser, 'Unknown') as browser, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY browser ORDER BY sessions DESC LIMIT 10
        """, (start_date, end_date)),

        "operating_systems": ("""
            SELECT COALESCE(os, 'Unknown') as operating_system, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY os ORDER BY sessions DESC LIMIT 10
        """, (start_date, end_date)),

        "geographic": ("""
            SELECT country, city, COUNT(*) as sessions, COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY country, city ORDER BY sessions DESC LIMIT 20
        """, (start_date, end_date)),
    }

    # Run all queries
    data = {}
    for name, (query, params) in queries.items():
        try:
            data[name] = run_query(query, params)
        except Exception as e:
            print(f"Warning: Query '{name}' failed: {e}")
            data[name] = []

    # Process overview
    overview = data["overview"][0] if data["overview"] else {}

    # Build visitor segments dict
    visitor_segments = {}
    for seg in data.get("visitor_segments", []):
        visitor_segments[seg["visitor_segment"]] = {
            "count": seg["count"],
            "avg_value_score": float(seg["avg_value_score"] or 0),
            "avg_sessions": float(seg["avg_sessions"] or 0),
            "avg_engagement_rate": float(seg["avg_engagement_rate"] or 0)
        }

    # Build conversion summary
    conv = data.get("conversion_summary", [{}])[0] if data.get("conversion_summary") else {}
    conversion_summary = {
        "cta_views": int(conv.get("cta_views") or 0),
        "cta_clicks": int(conv.get("cta_clicks") or 0),
        "form_starts": int(conv.get("form_starts") or 0),
        "form_submissions": int(conv.get("form_submissions") or 0),
        "resume_downloads": int(conv.get("resume_downloads") or 0),
        "social_clicks": int(conv.get("social_clicks") or 0),
        "outbound_clicks": int(conv.get("outbound_clicks") or 0),
        "publication_clicks": int(conv.get("publication_clicks") or 0),
        "content_copies": int(conv.get("content_copies") or 0),
    }
    total_conversions = (conversion_summary["form_submissions"] +
                        conversion_summary["resume_downloads"] +
                        conversion_summary["social_clicks"])

    return {
        "overview": {
            "totalSessions": int(overview.get("total_sessions") or 0),
            "uniqueVisitors": int(overview.get("unique_visitors") or 0),
            "avgSessionDuration": float(overview.get("avg_session_duration") or 0),
            "avgPagesPerSession": float(overview.get("avg_pages_per_session") or 0),
            "bounceRate": float(overview.get("bounce_rate") or 0),
            "engagementRate": float(overview.get("engagement_rate") or 0),
            "avgEngagementScore": float(overview.get("avg_engagement_score") or 0),
            "totalConversions": total_conversions,
        },
        "dailyMetrics": data["daily_metrics"],
        "trafficSources": data["traffic_sources_summary"],
        "conversionSummary": conversion_summary,
        "projectRankings": data["project_rankings"],
        "sectionRankings": data["section_rankings"],
        "visitorSegments": visitor_segments,
        "topVisitors": data["top_visitors"],
        "techDemand": data["tech_demand"],
        "domainRankings": data["domain_rankings"],
        "experienceRankings": data["experience_rankings"],
        "recommendationPerformance": data["recommendation_performance"],
        "temporal": {
            "hourlyDistribution": data["temporal_hourly"],
            "dayOfWeekDistribution": data["temporal_dow"],
        },
        "devices": {
            "categories": data["devices"],
            "browsers": data["browsers"],
            "operatingSystems": data["operating_systems"],
        },
        "geographic": data["geographic"],
        "dateRange": {"start": str(start_date), "end": str(end_date)},
    }


def update_gist(content: dict) -> bool:
    """Update the GitHub Gist with new content"""
    if not GIST_TOKEN:
        print("Error: GIST_TOKEN not set")
        return False

    url = f"https://api.github.com/gists/{GIST_ID}"
    headers = {
        "Authorization": f"token {GIST_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }

    payload = {
        "files": {
            "dashboard-analytics.json": {
                "content": json.dumps(content, indent=2, default=json_serializer)
            }
        }
    }

    response = requests.patch(url, headers=headers, json=payload)

    if response.status_code == 200:
        print(f"Gist updated successfully!")
        return True
    else:
        print(f"Error updating Gist: {response.status_code} - {response.text}")
        return False


def main():
    print("=" * 60)
    print("Dashboard Gist Update - Starting")
    print("=" * 60)

    # Get actual data date range
    data_start, data_end = get_data_date_range()
    print(f"Data available from {data_start} to {data_end}")

    # Calculate date ranges
    today = date.today()
    yesterday = today - timedelta(days=1)

    date_ranges = {
        "yesterday": (yesterday, yesterday),
        "last_7_days": (yesterday - timedelta(days=6), yesterday),
        "last_14_days": (yesterday - timedelta(days=13), yesterday),
        "last_30_days": (yesterday - timedelta(days=29), yesterday),
        "all_time": (data_start, data_end),
    }

    # Build the gist content
    gist_content = {
        "metadata": {
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "data_start_date": str(data_start),
            "data_end_date": str(data_end),
        }
    }

    # Fetch data for each date range
    for range_name, (start, end) in date_ranges.items():
        print(f"\nFetching data for '{range_name}': {start} to {end}")
        try:
            gist_content[range_name] = fetch_dashboard_data(start, end)
            print(f"  ✓ {range_name} data fetched successfully")
        except Exception as e:
            print(f"  ✗ Error fetching {range_name}: {e}")
            gist_content[range_name] = {"error": str(e)}

    # Update the Gist
    print("\n" + "=" * 60)
    print("Updating Gist...")
    success = update_gist(gist_content)

    if success:
        print("\n✓ Dashboard Gist update complete!")
    else:
        print("\n✗ Failed to update Gist")
        exit(1)


if __name__ == "__main__":
    main()
