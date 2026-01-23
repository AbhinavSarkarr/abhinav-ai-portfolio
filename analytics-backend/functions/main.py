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
                COUNT(DISTINCT session_id) as total_sessions,
                COUNT(DISTINCT user_pseudo_id) as unique_visitors,
                ROUND(AVG(session_duration_seconds)::numeric, 0) as avg_session_duration,
                ROUND(AVG(page_views)::numeric, 1) as avg_pages_per_session,
                ROUND(COUNT(DISTINCT CASE WHEN is_bounce THEN session_id END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0), 2) as bounce_rate,
                ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0), 2) as engagement_rate,
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
            WITH aggregated AS (
                SELECT
                    project_id,
                    MAX(project_title) as project_title,
                    MAX(project_category) as project_category,
                    SUM(COALESCE(views, 0)) as total_views,
                    SUM(COALESCE(unique_viewers, 0)) as total_unique_viewers,
                    SUM(COALESCE(clicks, 0)) as total_clicks,
                    SUM(COALESCE(expands, 0)) as total_expands,
                    SUM(COALESCE(link_clicks, 0)) as total_link_clicks,
                    SUM(COALESCE(github_clicks, 0)) as total_github_clicks,
                    SUM(COALESCE(demo_clicks, 0)) as total_demo_clicks,
                    -- Engagement score: clicks*5 + expands*3 + link_clicks*4 + views*1
                    (SUM(COALESCE(clicks, 0)) * 5 + SUM(COALESCE(expands, 0)) * 3 +
                     SUM(COALESCE(link_clicks, 0)) * 4 + SUM(COALESCE(views, 0)) * 1) as engagement_score
                FROM project_daily_stats
                WHERE event_date BETWEEN %s AND %s
                GROUP BY project_id
            ),
            ranked AS (
                SELECT *,
                    ROW_NUMBER() OVER (ORDER BY engagement_score DESC) as overall_rank,
                    CASE
                        WHEN engagement_score >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY engagement_score) FROM aggregated) THEN 'top_performer'
                        WHEN engagement_score >= (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY engagement_score) FROM aggregated) THEN 'above_average'
                        ELSE 'below_average'
                    END as performance_tier,
                    ROUND((PERCENT_RANK() OVER (ORDER BY engagement_score) * 100)::numeric, 1) as engagement_percentile
                FROM aggregated
            )
            SELECT project_id, project_title, project_category, total_views, total_unique_viewers,
                   total_clicks, total_expands, total_link_clicks, total_github_clicks, total_demo_clicks,
                   engagement_score, overall_rank::int, performance_tier,
                   CASE WHEN overall_rank <= 3 THEN 'featured' ELSE 'standard' END as recommended_position,
                   engagement_percentile
            FROM ranked ORDER BY overall_rank LIMIT 10
        """, (start, end)),
        "section_rankings": ("""
            WITH aggregated AS (
                SELECT
                    section_id,
                    SUM(COALESCE(unique_views, 0)) as total_unique_views,
                    SUM(COALESCE(unique_exits, 0)) as total_unique_exits,
                    SUM(COALESCE(unique_viewers, 0)) as total_unique_viewers,
                    ROUND(AVG(unique_exit_rate)::numeric, 2) as avg_exit_rate,
                    SUM(COALESCE(total_views, 0)) as total_views,
                    SUM(COALESCE(total_exits, 0)) as total_exits,
                    ROUND(AVG(total_exit_rate)::numeric, 2) as avg_total_exit_rate,
                    ROUND(AVG(avg_revisits_per_session)::numeric, 2) as avg_revisits_per_session,
                    SUM(COALESCE(engaged_sessions, 0)) as total_engaged_views,
                    ROUND(AVG(engagement_rate)::numeric, 2) as avg_engagement_rate,
                    ROUND(AVG(avg_time_spent_seconds)::numeric, 2) as avg_time_spent_seconds,
                    ROUND(AVG(avg_scroll_depth_percent)::numeric, 2) as avg_scroll_depth_percent,
                    MAX(max_scroll_milestone) as max_scroll_milestone,
                    -- Health score: engagement_rate * 2 + (100 - exit_rate) + time_spent + scroll_depth
                    (COALESCE(AVG(engagement_rate), 0) * 2 +
                     (100 - COALESCE(AVG(unique_exit_rate), 100)) +
                     LEAST(COALESCE(AVG(avg_time_spent_seconds), 0), 100) +
                     COALESCE(AVG(avg_scroll_depth_percent), 0)) as health_score
                FROM section_daily_stats
                WHERE event_date BETWEEN %s AND %s
                GROUP BY section_id
            ),
            ranked AS (
                SELECT *,
                    ROW_NUMBER() OVER (ORDER BY avg_engagement_rate DESC) as engagement_rank,
                    ROW_NUMBER() OVER (ORDER BY total_views DESC) as view_rank,
                    ROW_NUMBER() OVER (ORDER BY avg_exit_rate ASC) as retention_rank,
                    CASE
                        WHEN health_score >= 300 THEN 'excellent'
                        WHEN health_score >= 150 THEN 'good'
                        WHEN health_score >= 50 THEN 'needs_attention'
                        ELSE 'critical'
                    END as health_tier,
                    CASE
                        WHEN avg_exit_rate >= 90 THEN 'high_dropoff'
                        WHEN avg_exit_rate >= 70 THEN 'moderate_dropoff'
                        ELSE 'low_dropoff'
                    END as dropoff_indicator,
                    CASE
                        WHEN avg_engagement_rate < 20 THEN 'improve_content'
                        WHEN avg_exit_rate > 85 THEN 'add_cta_or_navigation'
                        ELSE 'maintain'
                    END as optimization_hint
                FROM aggregated
            )
            SELECT section_id, total_unique_views, total_unique_exits, total_unique_viewers,
                   avg_exit_rate, total_views, total_exits, avg_total_exit_rate,
                   avg_revisits_per_session, total_engaged_views, avg_engagement_rate,
                   avg_time_spent_seconds, avg_scroll_depth_percent, max_scroll_milestone,
                   ROUND(health_score::numeric, 2) as health_score,
                   engagement_rank::int, view_rank::int, retention_rank::int,
                   health_tier, dropoff_indicator, optimization_hint
            FROM ranked ORDER BY health_score DESC
        """, (start, end)),
        "visitor_segments": ("""
            WITH visitor_stats AS (
                SELECT
                    user_pseudo_id,
                    COUNT(DISTINCT session_id) as total_sessions,
                    SUM(page_views) as total_page_views,
                    ROUND(AVG(session_duration_seconds)::numeric, 2) as avg_duration,
                    ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0), 2) as engagement_rate,
                    SUM(conversions_count) as total_conversions,
                    MAX(session_date) - MIN(session_date) as tenure_days,
                    -- Value score: sessions*2 + page_views + conversions*20 + (engagement_rate/10)
                    (COUNT(DISTINCT session_id) * 2 + SUM(page_views) + SUM(conversions_count) * 20) as value_score
                FROM sessions
                WHERE session_date BETWEEN %s AND %s
                GROUP BY user_pseudo_id
            ),
            segmented AS (
                SELECT *,
                    CASE
                        WHEN total_conversions > 0 THEN 'converter'
                        WHEN total_sessions >= 3 AND engagement_rate >= 80 THEN 'engaged_explorer'
                        WHEN total_sessions >= 2 THEN 'returning_visitor'
                        WHEN engagement_rate >= 50 THEN 'engaged_new'
                        ELSE 'casual_browser'
                    END as visitor_segment
                FROM visitor_stats
            )
            SELECT visitor_segment, COUNT(*) as count,
                   ROUND(AVG(value_score)::numeric, 2) as avg_value_score,
                   ROUND(AVG(total_sessions)::numeric, 2) as avg_sessions,
                   ROUND(AVG(engagement_rate)::numeric, 2) as avg_engagement_rate
            FROM segmented GROUP BY visitor_segment ORDER BY count DESC
        """, (start, end)),
        "top_visitors": ("""
            WITH visitor_stats AS (
                SELECT
                    user_pseudo_id,
                    COUNT(DISTINCT session_id) as total_sessions,
                    MAX(session_date) - MIN(session_date) as visitor_tenure_days,
                    SUM(page_views) as total_page_views,
                    ROUND(AVG(session_duration_seconds)::numeric, 2) as avg_session_duration_sec,
                    ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0), 2) as engagement_rate,
                    MODE() WITHIN GROUP (ORDER BY device_category) as primary_device,
                    MODE() WITHIN GROUP (ORDER BY country) as primary_country,
                    MODE() WITHIN GROUP (ORDER BY traffic_source) as primary_traffic_source,
                    SUM(projects_clicked_count) as projects_viewed,
                    0 as cta_clicks,
                    SUM(CASE WHEN has_conversion THEN 1 ELSE 0 END) as form_submissions,
                    0 as social_clicks,
                    0 as resume_downloads,
                    -- Value score
                    (COUNT(DISTINCT session_id) * 2 + SUM(page_views) + SUM(conversions_count) * 20) as visitor_value_score,
                    CASE
                        WHEN SUM(conversions_count) > 0 THEN 'converter'
                        WHEN COUNT(DISTINCT session_id) >= 3 AND COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0) >= 80 THEN 'engaged_explorer'
                        WHEN COUNT(DISTINCT session_id) >= 2 THEN 'returning_visitor'
                        WHEN COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0) >= 50 THEN 'engaged_new'
                        ELSE 'casual_browser'
                    END as visitor_segment,
                    'general_visitor' as interest_profile
                FROM sessions
                WHERE session_date BETWEEN %s AND %s
                GROUP BY user_pseudo_id
            )
            SELECT user_pseudo_id, total_sessions, visitor_tenure_days, total_page_views,
                   avg_session_duration_sec, engagement_rate, primary_device, primary_country,
                   primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
                   social_clicks, resume_downloads, visitor_value_score, visitor_segment, interest_profile
            FROM visitor_stats ORDER BY visitor_value_score DESC LIMIT 15
        """, (start, end)),
        "tech_demand": ("""
            WITH aggregated AS (
                SELECT
                    skill_name,
                    SUM(COALESCE(clicks, 0) + COALESCE(hovers, 0)) as total_interactions,
                    SUM(COALESCE(unique_users, 0)) as total_unique_users,
                    SUM(COALESCE(weighted_interest_score, 0)) as weighted_score
                FROM skill_daily_stats
                WHERE event_date BETWEEN %s AND %s
                GROUP BY skill_name
            ),
            ranked AS (
                SELECT *,
                    ROW_NUMBER() OVER (ORDER BY weighted_score DESC) as demand_rank,
                    ROUND((PERCENT_RANK() OVER (ORDER BY weighted_score) * 100)::numeric, 1) as demand_percentile,
                    CASE
                        WHEN weighted_score >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY weighted_score) FROM aggregated) THEN 'high_demand'
                        WHEN weighted_score >= (SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY weighted_score) FROM aggregated) THEN 'moderate_demand'
                        ELSE 'low_demand'
                    END as demand_tier,
                    CASE
                        WHEN weighted_score >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY weighted_score) FROM aggregated) THEN 'master_this'
                        WHEN weighted_score >= (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY weighted_score) FROM aggregated) THEN 'strengthen'
                        ELSE 'maintain'
                    END as learning_priority
                FROM aggregated
                WHERE weighted_score > 0
            )
            SELECT skill_name, total_interactions, total_unique_users,
                   demand_rank::int, demand_percentile, demand_tier, learning_priority
            FROM ranked ORDER BY demand_rank
        """, (start, end)),
        "domain_rankings": ("""
            WITH aggregated AS (
                SELECT
                    domain,
                    SUM(COALESCE(explicit_interest_signals, 0)) as total_explicit_interest,
                    SUM(COALESCE(implicit_interest_from_views, 0)) as total_implicit_interest,
                    SUM(COALESCE(total_domain_interactions, 0)) as total_interactions,
                    SUM(COALESCE(unique_interested_users, 0)) as total_unique_users,
                    SUM(COALESCE(domain_interest_score, 0)) as total_interest_score
                FROM domain_daily_stats
                WHERE event_date BETWEEN %s AND %s
                GROUP BY domain
            ),
            ranked AS (
                SELECT *,
                    ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) as interest_rank,
                    ROUND((PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100)::numeric, 1) as interest_percentile,
                    CASE
                        WHEN total_interest_score >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_interest_score) FROM aggregated) THEN 'high_demand'
                        WHEN total_interest_score >= (SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_interest_score) FROM aggregated) THEN 'moderate_demand'
                        ELSE 'low_demand'
                    END as demand_tier,
                    CASE
                        WHEN total_interest_score >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_interest_score) FROM aggregated) THEN 'primary_strength'
                        WHEN total_interest_score >= (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_interest_score) FROM aggregated) THEN 'secondary_strength'
                        ELSE 'explore_opportunities'
                    END as portfolio_recommendation
                FROM aggregated
                WHERE total_interactions > 0
            )
            SELECT domain, total_explicit_interest, total_implicit_interest, total_interactions,
                   total_unique_users, total_interest_score, interest_rank::int, interest_percentile,
                   demand_tier, portfolio_recommendation
            FROM ranked ORDER BY interest_rank
        """, (start, end)),
        "experience_rankings": ("""
            WITH aggregated AS (
                SELECT
                    experience_id,
                    MAX(experience_title) as experience_title,
                    MAX(company) as company,
                    SUM(COALESCE(total_interactions, 0)) as total_interactions,
                    SUM(COALESCE(unique_interested_users, 0)) as total_unique_users,
                    SUM(COALESCE(unique_sessions, 0)) as total_sessions
                FROM experience_daily_stats
                WHERE event_date BETWEEN %s AND %s
                GROUP BY experience_id
            ),
            ranked AS (
                SELECT *,
                    ROW_NUMBER() OVER (ORDER BY total_interactions DESC) as interest_rank,
                    ROUND((PERCENT_RANK() OVER (ORDER BY total_interactions) * 100)::numeric, 1) as interest_percentile,
                    CASE
                        WHEN total_interactions >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_interactions) FROM aggregated) THEN 'most_attractive_role'
                        WHEN total_interactions >= (SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_interactions) FROM aggregated) THEN 'moderately_attractive'
                        ELSE 'needs_highlighting'
                    END as role_attractiveness,
                    CASE
                        WHEN total_interactions >= (SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_interactions) FROM aggregated) THEN 'lead_with_this'
                        WHEN total_interactions >= (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_interactions) FROM aggregated) THEN 'feature_prominently'
                        ELSE 'include_for_completeness'
                    END as positioning_suggestion
                FROM aggregated
                WHERE total_interactions > 0
            )
            SELECT experience_id, experience_title, company, total_interactions, total_unique_users,
                   total_sessions, interest_rank::int, interest_percentile, role_attractiveness, positioning_suggestion
            FROM ranked ORDER BY interest_rank
        """, (start, end)),
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

        # Ensure all 7 days are present in temporal_dow, even with zero values
        all_days = [
            (1, 'Sunday'), (2, 'Monday'), (3, 'Tuesday'), (4, 'Wednesday'),
            (5, 'Thursday'), (6, 'Friday'), (7, 'Saturday')
        ]
        dow_raw = {row['day_number']: row for row in data.get("temporal_dow", [])}
        data["temporal_dow"] = [
            dow_raw.get(num, {
                'day_name': name, 'day_number': num, 'sessions': 0,
                'unique_visitors': 0, 'avg_engagement': 0, 'engagement_rate': 0
            }) for num, name in all_days
        ]

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
