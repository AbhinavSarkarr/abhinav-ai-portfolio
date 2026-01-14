"""
Analytics API - FastAPI backend for Portfolio Analytics Dashboard
Queries ONLY from Supabase (PostgreSQL) for fast responses.
Data is synced from BigQuery daily at 8 PM IST via GitHub Actions.

Tables available in Supabase:
- sessions, daily_metrics, traffic_daily_stats, conversion_funnel
- project_rankings, section_rankings, visitor_insights
- tech_demand_insights, domain_rankings, experience_rankings
- recommendation_performance, sync_metadata
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timedelta
from typing import Optional
from pathlib import Path
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent / ".env")

# Supabase config (Mumbai - ap-south-1)
SUPABASE_CONFIG = {
    "host": os.getenv("SUPABASE_HOST", "aws-1-ap-south-1.pooler.supabase.com"),
    "port": os.getenv("SUPABASE_PORT", "6543"),
    "database": os.getenv("SUPABASE_DATABASE", "postgres"),
    "user": os.getenv("SUPABASE_USER", "postgres.pabymjbidxkatgcsqrnd"),
    "password": os.getenv("SUPABASE_PASSWORD"),
}

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

def run_pg_query(query: str, params: tuple = None) -> list[dict]:
    """Run a single PostgreSQL query"""
    conn = get_supabase_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

app = FastAPI(title="Portfolio Analytics API", version="3.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for parallel Supabase queries
supabase_executor = ThreadPoolExecutor(max_workers=15)


def parse_date(d: Optional[str]) -> Optional[date]:
    if not d:
        return None
    return datetime.strptime(d, "%Y-%m-%d").date()

def get_date_filter(start_date: Optional[str], end_date: Optional[str]) -> tuple[date, date]:
    """Get date range, defaulting to last 7 days"""
    end = parse_date(end_date) or (date.today() - timedelta(days=1))
    start = parse_date(start_date) or (end - timedelta(days=6))
    return start, end


# ==============================================================================
# MAIN DASHBOARD3 ENDPOINT - Fast Supabase version with parallel queries
# ==============================================================================

@app.get("/api/dashboard3")
async def get_dashboard3_data(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """
    Combined endpoint that fetches ALL Dashboard3 data from Supabase.
    Runs all queries in PARALLEL for maximum speed (~0.5-0.8 seconds).
    """
    start, end = get_date_filter(start_date, end_date)

    # Define all queries
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
        """, (start, end)),
        "daily_metrics": ("""
            SELECT session_date as date, total_sessions as sessions, unique_visitors as visitors,
                   engagement_rate, bounce_rate, avg_session_duration_sec as avg_duration,
                   desktop_sessions, mobile_sessions, tablet_sessions
            FROM daily_metrics WHERE session_date BETWEEN %s AND %s ORDER BY session_date
        """, (start, end)),
        "traffic": ("""
            SELECT traffic_source, traffic_medium,
                   SUM(sessions) as sessions,
                   SUM(unique_visitors) as unique_visitors,
                   ROUND(AVG(engagement_rate)::numeric, 2) as engagement_rate,
                   ROUND(AVG(bounce_rate)::numeric, 2) as bounce_rate
            FROM traffic_daily_stats
            WHERE event_date BETWEEN %s AND %s
            GROUP BY traffic_source, traffic_medium
            ORDER BY SUM(sessions) DESC LIMIT 10
        """, (start, end)),
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
        """, (start, end)),
        "project_rankings": ("""
            SELECT project_id, project_title, project_category, total_views, total_unique_viewers,
                   total_clicks, total_expands, total_link_clicks, total_github_clicks, total_demo_clicks,
                   engagement_score, overall_rank, performance_tier, recommended_position,
                   engagement_percentile
            FROM project_rankings ORDER BY overall_rank LIMIT 10
        """, None),
        "section_rankings": ("""
            SELECT section_id, total_unique_views, total_unique_exits, total_unique_viewers,
                   avg_exit_rate, total_views, total_exits, avg_total_exit_rate,
                   avg_revisits_per_session, total_engaged_views, avg_engagement_rate,
                   avg_time_spent_seconds, avg_scroll_depth_percent, max_scroll_milestone,
                   health_score, engagement_rank, view_rank, retention_rank,
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
        """, (start, end)),
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
        """, (start, end)),
        "devices": ("""
            SELECT device_category, COUNT(*) as sessions, COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate,
                   ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_duration
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY device_category ORDER BY sessions DESC
        """, (start, end)),
        "browsers": ("""
            SELECT COALESCE(browser, 'Unknown') as browser, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY browser ORDER BY sessions DESC LIMIT 10
        """, (start, end)),
        "operating_systems": ("""
            SELECT COALESCE(os, 'Unknown') as operating_system, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY os ORDER BY sessions DESC LIMIT 10
        """, (start, end)),
        "geographic": ("""
            SELECT country, city, COUNT(*) as sessions, COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate
            FROM sessions WHERE session_date BETWEEN %s AND %s GROUP BY country, city ORDER BY sessions DESC LIMIT 20
        """, (start, end)),
        "traffic_sources_summary": ("""
            SELECT traffic_source, traffic_medium, COUNT(*) as sessions,
                   COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                   ROUND(COUNT(*) FILTER (WHERE is_engaged)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as engagement_rate,
                   ROUND(COUNT(*) FILTER (WHERE is_bounce)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2) as bounce_rate,
                   ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_duration
            FROM sessions WHERE session_date BETWEEN %s AND %s
            GROUP BY traffic_source, traffic_medium ORDER BY sessions DESC LIMIT 10
        """, (start, end)),
    }

    try:
        # Run all queries in parallel
        loop = asyncio.get_event_loop()

        async def run_query_async(name: str, query: str, params: tuple):
            result = await loop.run_in_executor(supabase_executor, lambda: run_pg_query(query, params))
            return (name, result)

        tasks = [run_query_async(name, q[0], q[1]) for name, q in queries.items()]
        results = await asyncio.gather(*tasks)

        # Convert to dict
        data = {name: result for name, result in results}

        # Extract overview
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
        # True conversions = form submissions + resume downloads
        # (social_clicks are engagement signals, not conversions)
        total_conversions = (conversion_summary["form_submissions"] +
                           conversion_summary["resume_downloads"])

        return {
            "overview": {
                "totalSessions": overview.get("total_sessions", 0),
                "uniqueVisitors": overview.get("unique_visitors", 0),
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
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "supabase",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# SYNC STATUS ENDPOINT
# ==============================================================================

@app.get("/api/sync-status")
async def get_sync_status():
    """Get the last sync status from Supabase"""
    try:
        result = run_pg_query("""
            SELECT table_name, last_synced_at, rows_synced, sync_duration_seconds, status
            FROM sync_metadata
            ORDER BY last_synced_at DESC
        """)
        return {
            "syncStatus": result,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# HEALTH & INFO
# ==============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        run_pg_query("SELECT 1")
        db_status = "connected"
    except:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/")
async def root():
    return {
        "name": "Portfolio Analytics API",
        "version": "3.0.0",
        "description": "Queries from Supabase (PostgreSQL) for fast responses. Data synced from BigQuery daily at 8 PM IST.",
        "database": "Supabase (Mumbai - ap-south-1)",
        "tables": [
            "sessions", "daily_metrics", "traffic_daily_stats", "conversion_funnel",
            "project_rankings", "section_rankings", "visitor_insights",
            "tech_demand_insights", "domain_rankings", "experience_rankings",
            "recommendation_performance", "sync_metadata"
        ],
        "endpoints": {
            "main": "/api/dashboard3",
            "sync_status": "/api/sync-status",
            "health": "/health"
        },
        "data_refresh": "Daily at 8 PM IST via GitHub Actions (BigQuery → Supabase)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
