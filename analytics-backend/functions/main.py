"""
Analytics API - FastAPI backend for Portfolio Analytics Dashboard
Queries ONLY from BigQuery materialized tables (analytics_materialized dataset)
All 31 tables are refreshed daily at 2 PM IST via GitHub Actions workflow

Tables available:
- Layer 1 (9): sessions, page_views, project_events, section_events, skill_events,
              conversion_events, client_events, recommendation_events, certification_events
- Layer 2 (11): daily_metrics, project_daily_stats, section_daily_stats, skill_daily_stats,
               traffic_daily_stats, conversion_funnel, client_daily_stats, domain_daily_stats,
               experience_daily_stats, recommendation_daily_stats, content_reading_stats
- Layer 3 (10): project_rankings, skill_rankings, section_rankings, visitor_insights,
               recommendations, client_rankings, domain_rankings, experience_rankings,
               recommendation_performance, tech_demand_insights
- ML (1): ml_training_data
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import bigquery
from datetime import date, datetime, timedelta
from typing import Optional
from pathlib import Path
import os
import json

# Load credentials from env or default path
credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
if not credentials_path:
    default_path = Path(__file__).parent.parent / "credentials" / "gcp-service-account.json"
    if default_path.exists():
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(default_path)

app = FastAPI(title="Portfolio Analytics API", version="2.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# BigQuery config - ONLY using materialized tables
PROJECT_ID = "portfolio-483605"
DATASET = "analytics_materialized"

def get_client():
    return bigquery.Client(project=PROJECT_ID)

def parse_date(d: Optional[str]) -> Optional[date]:
    if not d:
        return None
    return datetime.strptime(d, "%Y-%m-%d").date()

def get_date_filter(start_date: Optional[str], end_date: Optional[str]) -> tuple[date, date]:
    """Get date range, defaulting to last 7 days"""
    end = parse_date(end_date) or (date.today() - timedelta(days=1))
    start = parse_date(start_date) or (end - timedelta(days=6))
    return start, end

def run_query(query: str, params: list = None) -> list:
    """Execute BigQuery query and return results as list of dicts"""
    client = get_client()
    job_config = bigquery.QueryJobConfig(query_parameters=params or [])
    result = client.query(query, job_config=job_config).result()
    return [dict(row) for row in result]


# ==============================================================================
# LAYER 1: BASE EVENT DATA (with date range filtering)
# ==============================================================================

@app.get("/api/sessions")
async def get_sessions(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get session data from materialized sessions table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    WITH filtered AS (
        SELECT * FROM `{PROJECT_ID}.{DATASET}.sessions`
        WHERE session_date BETWEEN @start_date AND @end_date
    ),
    overview AS (
        SELECT
            COUNT(*) as total_sessions,
            COUNT(DISTINCT user_pseudo_id) as unique_visitors,
            AVG(session_duration_seconds) as avg_session_duration,
            COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0) as bounce_rate,
            COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0) as engagement_rate,
            AVG(engagement_score) as avg_engagement_score,
            COUNTIF(has_conversion) * 100.0 / NULLIF(COUNT(*), 0) as conversion_rate
        FROM filtered
    ),
    returning_visitors AS (
        SELECT
            COUNTIF(visitor_type = 'new') as new_visitors,
            COUNTIF(visitor_type = 'returning') as returning_visitors,
            COUNTIF(visitor_type = 'loyal') as loyal_visitors
        FROM filtered
    ),
    engagement_dist AS (
        SELECT engagement_tier as tier, COUNT(*) as sessions
        FROM filtered GROUP BY engagement_tier
    ),
    traffic_sources AS (
        SELECT
            COALESCE(traffic_source, 'Direct') as source,
            COUNT(*) as sessions,
            AVG(engagement_score) as avg_engagement
        FROM filtered GROUP BY traffic_source ORDER BY sessions DESC LIMIT 10
    ),
    device_breakdown AS (
        SELECT device_category, COUNT(*) as sessions
        FROM filtered GROUP BY device_category
    ),
    country_breakdown AS (
        SELECT country, COUNT(DISTINCT user_pseudo_id) as visitors
        FROM filtered GROUP BY country ORDER BY visitors DESC LIMIT 10
    )
    SELECT
        (SELECT TO_JSON_STRING(o) FROM overview o) as overview,
        (SELECT TO_JSON_STRING(r) FROM returning_visitors r) as returning_visitors,
        (SELECT TO_JSON_STRING(ARRAY_AGG(e)) FROM engagement_dist e) as engagement_distribution,
        (SELECT TO_JSON_STRING(ARRAY_AGG(t)) FROM traffic_sources t) as traffic_sources,
        (SELECT TO_JSON_STRING(ARRAY_AGG(d)) FROM device_breakdown d) as device_breakdown,
        (SELECT TO_JSON_STRING(ARRAY_AGG(c)) FROM country_breakdown c) as top_countries
    """

    try:
        result = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])
        row = result[0] if result else {}

        return {
            "overview": json.loads(row.get("overview") or "{}"),
            "returningVisitors": json.loads(row.get("returning_visitors") or "{}"),
            "engagementDistribution": json.loads(row.get("engagement_distribution") or "[]"),
            "trafficSources": json.loads(row.get("traffic_sources") or "[]"),
            "deviceBreakdown": json.loads(row.get("device_breakdown") or "[]"),
            "topCountries": json.loads(row.get("top_countries") or "[]"),
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/page-views")
async def get_page_views(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get page view data from materialized page_views table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    WITH filtered AS (
        SELECT * FROM `{PROJECT_ID}.{DATASET}.page_views`
        WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    )
    SELECT
        COUNT(*) as total_page_views,
        COUNT(DISTINCT user_pseudo_id) as unique_viewers,
        COUNT(DISTINCT session_id) as sessions_with_views,
        AVG(engagement_time_msec / 1000) as avg_time_on_page_sec
    FROM filtered
    """

    top_pages_query = f"""
    SELECT
        page_url,
        COUNT(*) as views,
        COUNT(DISTINCT user_pseudo_id) as unique_viewers,
        AVG(engagement_time_msec / 1000) as avg_time_sec
    FROM `{PROJECT_ID}.{DATASET}.page_views`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY page_url ORDER BY views DESC LIMIT 10
    """

    try:
        params = [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ]
        overview = run_query(query, params)
        top_pages = run_query(top_pages_query, params)

        return {
            "overview": overview[0] if overview else {},
            "topPages": top_pages,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/project-events")
async def get_project_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get project events from materialized project_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        project_id,
        project_title,
        project_category,
        COUNTIF(event_name = 'project_view') as views,
        COUNTIF(event_name = 'project_click') as clicks,
        COUNTIF(event_name = 'case_study_open') as case_study_opens,
        COUNT(DISTINCT user_pseudo_id) as unique_users,
        AVG(hover_duration_sec) as avg_hover_duration,
        COUNTIF(is_deep_read = 'true') as deep_reads,
        AVG(scroll_depth_percent) as avg_scroll_depth
    FROM `{PROJECT_ID}.{DATASET}.project_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY project_id, project_title, project_category
    ORDER BY views DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "projects": results,
            "totalProjects": len(results),
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/section-events")
async def get_section_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get section events from materialized section_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        section_id,
        section_name,
        COUNTIF(event_name = 'section_view') as views,
        COUNT(DISTINCT user_pseudo_id) as unique_viewers,
        AVG(scroll_depth_percent) as avg_scroll_depth,
        AVG(time_spent_seconds) as avg_time_spent,
        COUNTIF(event_name = 'section_exit') as exits
    FROM `{PROJECT_ID}.{DATASET}.section_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY section_id, section_name
    ORDER BY views DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "sections": results,
            "totalSections": len(results),
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/skill-events")
async def get_skill_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get skill events from materialized skill_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        skill_name,
        skill_category,
        skill_level,
        COUNTIF(event_name = 'skill_click') as clicks,
        COUNTIF(event_name = 'skill_hover') as hovers,
        COUNT(DISTINCT user_pseudo_id) as unique_users,
        AVG(time_on_site_sec) as avg_time_on_site
    FROM `{PROJECT_ID}.{DATASET}.skill_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY skill_name, skill_category, skill_level
    ORDER BY clicks DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "skills": results,
            "totalSkills": len(results),
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/conversion-events")
async def get_conversion_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get conversion events from materialized conversion_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        event_name,
        COUNT(*) as count,
        COUNT(DISTINCT user_pseudo_id) as unique_users,
        AVG(time_to_submit_sec) as avg_time_to_convert
    FROM `{PROJECT_ID}.{DATASET}.conversion_events`
    WHERE DATE(event_timestamp) BETWEEN @start_date AND @end_date
    GROUP BY event_name
    ORDER BY count DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "conversions": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/client-events")
async def get_client_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get client events from materialized client_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        client_id,
        client_name,
        domain,
        COUNT(*) as interactions,
        COUNT(DISTINCT user_pseudo_id) as unique_visitors,
        COUNTIF(event_name = 'client_click') as clicks,
        AVG(time_spent_seconds) as avg_time_spent,
        AVG(scroll_depth_percent) as avg_scroll_depth
    FROM `{PROJECT_ID}.{DATASET}.client_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY client_id, client_name, domain
    ORDER BY interactions DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "clients": results,
            "totalClients": len(results),
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommendation-events")
async def get_recommendation_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get recommendation events from materialized recommendation_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        recommended_project_id,
        recommended_project_title,
        COUNTIF(event_name = 'recommendation_shown') as impressions,
        COUNTIF(event_name = 'recommendation_click') as clicks,
        ROUND(COUNTIF(event_name = 'recommendation_click') * 100.0 /
              NULLIF(COUNTIF(event_name = 'recommendation_shown'), 0), 2) as ctr,
        AVG(position) as avg_position
    FROM `{PROJECT_ID}.{DATASET}.recommendation_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY recommended_project_id, recommended_project_title
    ORDER BY impressions DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "recommendations": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/certification-events")
async def get_certification_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get certification events from materialized certification_events table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        cert_title,
        cert_issuer,
        cert_category,
        COUNT(*) as clicks,
        COUNT(DISTINCT user_pseudo_id) as unique_users,
        AVG(time_on_site_sec) as avg_time_on_site
    FROM `{PROJECT_ID}.{DATASET}.certification_events`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY cert_title, cert_issuer, cert_category
    ORDER BY clicks DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "certifications": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# LAYER 2: DAILY AGGREGATED DATA (with date range filtering)
# ==============================================================================

@app.get("/api/daily-metrics")
async def get_daily_metrics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get daily site metrics from materialized daily_metrics table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        FORMAT_DATE('%Y-%m-%d', session_date) as date,
        total_sessions as sessions,
        unique_visitors as visitors,
        total_page_views as page_views,
        ROUND(avg_pages_per_session, 2) as avg_pages_per_session,
        ROUND(engagement_rate, 2) as engagement_rate,
        ROUND(bounce_rate, 2) as bounce_rate,
        ROUND(avg_session_duration_sec, 0) as avg_session_duration_sec,
        desktop_sessions,
        mobile_sessions,
        tablet_sessions,
        ROUND(avg_engagement_score, 1) as avg_engagement_score,
        ROUND(returning_visitor_rate, 2) as returning_visitor_rate,
        ROUND(dark_mode_percentage, 2) as dark_mode_percentage
    FROM `{PROJECT_ID}.{DATASET}.daily_metrics`
    WHERE session_date BETWEEN @start_date AND @end_date
    ORDER BY session_date DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        summary = {
            "totalSessions": sum(r.get("sessions", 0) or 0 for r in results),
            "totalVisitors": sum(r.get("visitors", 0) or 0 for r in results),
            "totalPageViews": sum(r.get("page_views", 0) or 0 for r in results),
            "avgEngagementRate": round(sum(r.get("engagement_rate", 0) or 0 for r in results) / len(results), 2) if results else 0,
            "avgBounceRate": round(sum(r.get("bounce_rate", 0) or 0 for r in results) / len(results), 2) if results else 0,
        }

        return {
            "data": results,
            "summary": summary,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/project-daily-stats")
async def get_project_daily_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get project daily stats from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        project_id,
        project_title,
        project_category,
        SUM(views) as total_views,
        SUM(clicks) as total_clicks,
        SUM(expands) as total_expands,
        SUM(link_clicks) as total_link_clicks,
        SUM(unique_viewers) as unique_viewers,
        ROUND(AVG(click_through_rate), 2) as avg_ctr,
        SUM(github_clicks) as github_clicks,
        SUM(demo_clicks) as demo_clicks,
        SUM(deep_reads) as deep_reads,
        SUM(skill_driven_clicks) as skill_driven_clicks
    FROM `{PROJECT_ID}.{DATASET}.project_daily_stats`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY project_id, project_title, project_category
    ORDER BY total_views DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "projects": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/section-daily-stats")
async def get_section_daily_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get section daily stats from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        section_id,
        SUM(views) as total_views,
        SUM(unique_viewers) as unique_viewers,
        ROUND(AVG(engagement_rate), 2) as avg_engagement_rate,
        ROUND(AVG(avg_time_spent_seconds), 1) as avg_time_spent,
        ROUND(AVG(avg_scroll_depth_percent), 1) as avg_scroll_depth,
        ROUND(AVG(exit_rate), 2) as avg_exit_rate,
        SUM(desktop_views) as desktop_views,
        SUM(mobile_views) as mobile_views
    FROM `{PROJECT_ID}.{DATASET}.section_daily_stats`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY section_id
    ORDER BY total_views DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "sections": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/skill-daily-stats")
async def get_skill_daily_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get skill daily stats from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        skill_name,
        skill_category,
        SUM(clicks) as total_clicks,
        SUM(hovers) as total_hovers,
        SUM(unique_users) as unique_users,
        SUM(weighted_interest_score) as interest_score,
        ROUND(AVG(avg_position), 1) as avg_position
    FROM `{PROJECT_ID}.{DATASET}.skill_daily_stats`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY skill_name, skill_category
    ORDER BY total_clicks DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "skills": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/traffic-daily-stats")
async def get_traffic_daily_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get traffic daily stats from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        traffic_source,
        traffic_medium,
        SUM(sessions) as total_sessions,
        SUM(unique_visitors) as unique_visitors,
        ROUND(AVG(engagement_rate), 2) as avg_engagement_rate,
        ROUND(AVG(bounce_rate), 2) as avg_bounce_rate,
        ROUND(AVG(avg_session_duration_sec), 1) as avg_session_duration,
        SUM(conversions) as total_conversions
    FROM `{PROJECT_ID}.{DATASET}.traffic_daily_stats`
    WHERE event_date BETWEEN @start_date AND @end_date
    GROUP BY traffic_source, traffic_medium
    ORDER BY total_sessions DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "trafficSources": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/conversion-funnel")
async def get_conversion_funnel(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get conversion funnel from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        SUM(total_sessions) as total_sessions,
        SUM(unique_visitors) as unique_visitors,
        SUM(total_cta_views) as cta_views,
        SUM(total_cta_clicks) as cta_clicks,
        ROUND(SUM(total_cta_clicks) * 100.0 / NULLIF(SUM(total_cta_views), 0), 2) as cta_click_rate,
        SUM(contact_form_starts) as form_starts,
        SUM(contact_form_submissions) as form_submissions,
        ROUND(SUM(contact_form_submissions) * 100.0 / NULLIF(SUM(contact_form_starts), 0), 2) as form_completion_rate,
        SUM(social_clicks) as social_clicks,
        SUM(resume_downloads) as resume_downloads,
        SUM(publication_clicks) as publication_clicks,
        SUM(content_copies) as content_copies
    FROM `{PROJECT_ID}.{DATASET}.conversion_funnel`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    """

    daily_query = f"""
    SELECT
        FORMAT_DATE('%Y-%m-%d', PARSE_DATE('%Y%m%d', event_date)) as date,
        contact_form_submissions,
        resume_downloads,
        social_clicks,
        ROUND(avg_conversion_score, 3) as conversion_score
    FROM `{PROJECT_ID}.{DATASET}.conversion_funnel`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    ORDER BY event_date DESC
    """

    try:
        params = [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ]
        summary = run_query(query, params)
        daily = run_query(daily_query, params)

        return {
            "summary": summary[0] if summary else {},
            "daily": daily,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/client-daily-stats")
async def get_client_daily_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get client daily stats from materialized table"""
    start, end = get_date_filter(start_date, end_date)

    query = f"""
    SELECT
        client_id,
        client_name,
        experience_id,
        domain,
        SUM(total_views) as total_views,
        SUM(total_clicks) as total_clicks,
        SUM(unique_viewers) as unique_viewers,
        ROUND(AVG(avg_time_spent_sec), 1) as avg_time_spent,
        ROUND(AVG(avg_scroll_depth), 1) as avg_scroll_depth,
        SUM(deep_reads) as deep_reads
    FROM `{PROJECT_ID}.{DATASET}.client_daily_stats`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    GROUP BY client_id, client_name, experience_id, domain
    ORDER BY total_views DESC
    """

    try:
        results = run_query(query, [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ])

        return {
            "clients": results,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# LAYER 3: RANKINGS & INSIGHTS (pre-computed 7-day rolling)
# ==============================================================================

@app.get("/api/project-rankings")
async def get_project_rankings():
    """Get project rankings from materialized table (7-day rolling)"""
    query = f"""
    SELECT
        project_id,
        project_title,
        project_category,
        total_views,
        total_clicks,
        total_expands,
        total_link_clicks,
        ROUND(engagement_score, 2) as engagement_score,
        overall_rank,
        category_rank,
        performance_tier,
        recommended_position
    FROM `{PROJECT_ID}.{DATASET}.project_rankings`
    ORDER BY overall_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "totalProjects": len(results),
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/skill-rankings")
async def get_skill_rankings():
    """Get skill rankings from materialized table"""
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{DATASET}.skill_rankings`
    ORDER BY skill_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/section-rankings")
async def get_section_rankings():
    """Get section rankings from materialized table"""
    query = f"""
    SELECT
        section_id,
        total_views,
        ROUND(health_score, 1) as health_score,
        health_tier,
        engagement_rank,
        dropoff_indicator,
        optimization_priority
    FROM `{PROJECT_ID}.{DATASET}.section_rankings`
    ORDER BY engagement_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/visitor-insights")
async def get_visitor_insights():
    """Get visitor insights from materialized table"""
    query = f"""
    SELECT
        visitor_segment,
        interest_profile,
        COUNT(*) as visitor_count,
        ROUND(AVG(total_sessions), 1) as avg_sessions,
        ROUND(AVG(avg_session_duration_sec), 1) as avg_session_duration,
        ROUND(AVG(projects_viewed), 1) as avg_projects_viewed,
        SUM(form_submissions) as total_form_submissions,
        SUM(resume_downloads) as total_resume_downloads
    FROM `{PROJECT_ID}.{DATASET}.visitor_insights`
    GROUP BY visitor_segment, interest_profile
    ORDER BY visitor_count DESC
    """

    try:
        results = run_query(query)

        segment_totals = {}
        for r in results:
            seg = r.get("visitor_segment", "unknown")
            segment_totals[seg] = segment_totals.get(seg, 0) + r.get("visitor_count", 0)

        return {
            "insights": results,
            "segmentTotals": segment_totals,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tech-demand-insights")
async def get_tech_demand_insights():
    """Get tech demand insights from materialized table"""
    query = f"""
    SELECT
        technology as skill_name,
        skill_category,
        total_interest_signals,
        unique_interested_users,
        demand_rank,
        demand_tier,
        learning_priority,
        market_position
    FROM `{PROJECT_ID}.{DATASET}.tech_demand_insights`
    ORDER BY demand_rank
    """

    try:
        results = run_query(query)
        return {
            "insights": results,
            "totalTechnologies": len(results),
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/client-rankings")
async def get_client_rankings():
    """Get client rankings from materialized table"""
    query = f"""
    SELECT
        client_id,
        client_name,
        experience_id,
        domain,
        total_views,
        total_clicks,
        unique_viewers,
        ROUND(engagement_score, 2) as engagement_score,
        engagement_rank,
        engagement_tier
    FROM `{PROJECT_ID}.{DATASET}.client_rankings`
    ORDER BY engagement_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/domain-rankings")
async def get_domain_rankings():
    """Get domain rankings from materialized table"""
    query = f"""
    SELECT
        domain,
        total_interest_score,
        unique_interested_visitors,
        interest_rank,
        demand_tier,
        portfolio_recommendation
    FROM `{PROJECT_ID}.{DATASET}.domain_rankings`
    ORDER BY interest_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/experience-rankings")
async def get_experience_rankings():
    """Get experience rankings from materialized table"""
    query = f"""
    SELECT
        experience_id,
        total_interactions,
        unique_viewers,
        experience_rank,
        interest_tier
    FROM `{PROJECT_ID}.{DATASET}.experience_rankings`
    ORDER BY experience_rank
    """

    try:
        results = run_query(query)
        return {
            "rankings": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommendation-performance")
async def get_recommendation_performance():
    """Get recommendation performance from materialized table"""
    query = f"""
    SELECT
        metric_type,
        metric_name,
        times_shown,
        times_clicked,
        ROUND(click_through_rate, 2) as ctr,
        performance_tier
    FROM `{PROJECT_ID}.{DATASET}.recommendation_performance`
    ORDER BY times_shown DESC
    """

    try:
        results = run_query(query)
        return {
            "performance": results,
            "source": "materialized_table",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# DASHBOARD OVERVIEW (combines multiple materialized tables)
# ==============================================================================

@app.get("/api/dashboard")
async def get_dashboard(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get comprehensive dashboard overview from materialized tables"""
    start, end = get_date_filter(start_date, end_date)

    metrics_query = f"""
    SELECT
        SUM(total_sessions) as total_sessions,
        SUM(unique_visitors) as total_visitors,
        SUM(total_page_views) as total_page_views,
        ROUND(AVG(engagement_rate), 2) as avg_engagement_rate,
        ROUND(AVG(bounce_rate), 2) as avg_bounce_rate,
        ROUND(AVG(avg_session_duration_sec), 0) as avg_session_duration
    FROM `{PROJECT_ID}.{DATASET}.daily_metrics`
    WHERE session_date BETWEEN @start_date AND @end_date
    """

    conversions_query = f"""
    SELECT
        SUM(contact_form_submissions) as form_submissions,
        SUM(resume_downloads) as resume_downloads,
        SUM(social_clicks) as social_clicks
    FROM `{PROJECT_ID}.{DATASET}.conversion_funnel`
    WHERE PARSE_DATE('%Y%m%d', event_date) BETWEEN @start_date AND @end_date
    """

    top_projects_query = f"""
    SELECT project_id, project_title, total_views, total_clicks, overall_rank
    FROM `{PROJECT_ID}.{DATASET}.project_rankings`
    ORDER BY overall_rank LIMIT 5
    """

    top_skills_query = f"""
    SELECT technology as skill_name, demand_rank, demand_tier, total_interest_signals
    FROM `{PROJECT_ID}.{DATASET}.tech_demand_insights`
    ORDER BY demand_rank LIMIT 5
    """

    visitor_segments_query = f"""
    SELECT visitor_segment, COUNT(*) as count
    FROM `{PROJECT_ID}.{DATASET}.visitor_insights`
    GROUP BY visitor_segment
    """

    try:
        params = [
            bigquery.ScalarQueryParameter("start_date", "DATE", start),
            bigquery.ScalarQueryParameter("end_date", "DATE", end),
        ]

        metrics = run_query(metrics_query, params)
        conversions = run_query(conversions_query, params)
        top_projects = run_query(top_projects_query)
        top_skills = run_query(top_skills_query)
        visitor_segments = run_query(visitor_segments_query)

        return {
            "overview": metrics[0] if metrics else {},
            "conversions": conversions[0] if conversions else {},
            "topProjects": top_projects,
            "topSkills": top_skills,
            "visitorSegments": visitor_segments,
            "dateRange": {"start": str(start), "end": str(end)},
            "source": "materialized_tables",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# HEALTH & INFO
# ==============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.get("/")
async def root():
    return {
        "name": "Portfolio Analytics API",
        "version": "2.0.0",
        "description": "Queries ONLY from materialized tables in analytics_materialized dataset",
        "dataset": DATASET,
        "materialized_tables": {
            "layer1_events": ["sessions", "page_views", "project_events", "section_events",
                             "skill_events", "conversion_events", "client_events",
                             "recommendation_events", "certification_events"],
            "layer2_daily": ["daily_metrics", "project_daily_stats", "section_daily_stats",
                            "skill_daily_stats", "traffic_daily_stats", "conversion_funnel",
                            "client_daily_stats", "domain_daily_stats", "experience_daily_stats",
                            "recommendation_daily_stats", "content_reading_stats"],
            "layer3_rankings": ["project_rankings", "skill_rankings", "section_rankings",
                               "visitor_insights", "recommendations", "client_rankings",
                               "domain_rankings", "experience_rankings", "recommendation_performance",
                               "tech_demand_insights"],
            "ml": ["ml_training_data"]
        },
        "endpoints": {
            "layer1": ["/api/sessions", "/api/page-views", "/api/project-events",
                      "/api/section-events", "/api/skill-events", "/api/conversion-events",
                      "/api/client-events", "/api/recommendation-events", "/api/certification-events"],
            "layer2": ["/api/daily-metrics", "/api/project-daily-stats", "/api/section-daily-stats",
                      "/api/skill-daily-stats", "/api/traffic-daily-stats", "/api/conversion-funnel",
                      "/api/client-daily-stats"],
            "layer3": ["/api/project-rankings", "/api/skill-rankings", "/api/section-rankings",
                      "/api/visitor-insights", "/api/tech-demand-insights", "/api/client-rankings",
                      "/api/domain-rankings", "/api/experience-rankings", "/api/recommendation-performance"],
            "dashboard": ["/api/dashboard"],
            "health": ["/health"]
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
