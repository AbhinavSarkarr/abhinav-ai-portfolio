# Databricks notebook source
# MAGIC %md
# MAGIC # Gold · Layer 3 — rankings & insights
# MAGIC
# MAGIC 7-day (and 30-day for visitor_insights / recommendations) rolling
# MAGIC analyses derived from Layer 2 and (where needed) Silver. Ports the
# MAGIC 10 views in `analytics-backend/sql/layer3_rankings/`.
# MAGIC
# MAGIC ## Source tier
# MAGIC
# MAGIC | Reads from        | How                    | Tables                                  |
# MAGIC | ----------------- | ---------------------- | --------------------------------------- |
# MAGIC | Same pipeline (L2)| `dlt.read("name")`     | project/skill/section/client/domain/exp rankings, recommendation_performance partly |
# MAGIC | Silver pipeline   | `spark.read.table(...)`| visitor_insights, tech_demand_insights, recommendation_performance partly |
# MAGIC | Same pipeline (L3)| `dlt.read("name")`     | recommendations  (reads visitor_insights + project_rankings) |
# MAGIC
# MAGIC ## BQ → Databricks notes
# MAGIC - `ARRAY_CONCAT_AGG(arr_col)` → `flatten(collect_list(arr_col))`
# MAGIC - `ARRAY_AGG(DISTINCT x IGNORE NULLS ORDER BY x LIMIT N)` → `slice(array_sort(collect_set(x)), 1, N)`
# MAGIC - `ANY_VALUE(x)` → `any_value(x)` (built-in in Databricks)
# MAGIC - `ARRAY_LENGTH(arr)` → `size(arr)`
# MAGIC - `EXISTS (SELECT FROM UNNEST(a) WHERE x IN UNNEST(b))` → `arrays_overlap(a, b)`
# MAGIC - `x IN (SELECT FROM UNNEST(arr))` → `array_contains(arr, x)`
# MAGIC - `DATE_DIFF(a, b, DAY)` → `datediff(a, b)`
# MAGIC - `ARRAY(SELECT AS STRUCT ... LIMIT N)` → CTE returning `collect_list(struct(...))` then cross join
# MAGIC - `FORMAT_DATE("%Y%m%d", DATE_SUB(...))` → unneeded; our `event_date` is DATE, compare directly via `date_sub(current_date(), N)`

# COMMAND ----------

import dlt

SILVER_CATALOG = spark.conf.get("silver_catalog")
SILVER_SCHEMA = spark.conf.get("silver_schema")


def _silver(table: str) -> str:
    return f"{SILVER_CATALOG}.{SILVER_SCHEMA}.{table}"


# ----------------------------------------------------------------------
# gold.project_rankings   (reads gold.project_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="project_rankings", comment="7-day rolling project rankings with engagement score, tiers, and recommended display position.")
@dlt.expect("non_null_project", "project_id IS NOT NULL")
def project_rankings():
    return spark.sql("""
        WITH project_7day AS (
          SELECT
            project_id,
            project_title,
            project_category,

            SUM(views)                                      AS total_views,
            SUM(unique_viewers)                             AS total_unique_viewers,
            SUM(clicks)                                     AS total_clicks,
            SUM(expands)                                    AS total_expands,
            SUM(link_clicks)                                AS total_link_clicks,
            AVG(avg_view_duration_ms)                       AS avg_view_duration_ms,
            AVG(click_through_rate)                         AS avg_ctr,
            SUM(github_clicks)                              AS total_github_clicks,
            SUM(demo_clicks)                                AS total_demo_clicks,

            array_distinct(flatten(collect_list(technologies_clicked))) AS all_technologies_clicked

          FROM LIVE.project_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY project_id, project_title, project_category
        ),
        scored AS (
          SELECT
            *,
            (
              (total_views                              * 1.0) +
              (total_unique_viewers                     * 2.0) +
              (total_clicks                             * 3.0) +
              (total_expands                            * 4.0) +
              (total_link_clicks                        * 5.0) +
              (total_github_clicks                      * 6.0) +
              (total_demo_clicks                        * 7.0) +
              (COALESCE(avg_view_duration_ms, 0) / 1000.0 * 0.5) +
              (COALESCE(avg_ctr, 0)                     * 2.0)
            ) AS raw_engagement_score
          FROM project_7day
        )
        SELECT
          project_id,
          project_title,
          project_category,

          total_views, total_unique_viewers, total_clicks, total_expands, total_link_clicks,
          total_github_clicks, total_demo_clicks,
          ROUND(avg_view_duration_ms / 1000.0, 2) AS avg_view_duration_sec,
          ROUND(avg_ctr, 2) AS avg_ctr_percent,

          ROUND(raw_engagement_score, 2) AS engagement_score,

          ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC)                                AS overall_rank,
          ROW_NUMBER() OVER (PARTITION BY project_category ORDER BY raw_engagement_score DESC) AS category_rank,

          ROUND(PERCENT_RANK() OVER (ORDER BY raw_engagement_score) * 100, 2) AS engagement_percentile,

          CASE
            WHEN raw_engagement_score > (SELECT AVG(raw_engagement_score) FROM scored)
            THEN 'above_average' ELSE 'below_average'
          END AS performance_tier,

          all_technologies_clicked,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 3 THEN 'featured'
            WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 6 THEN 'primary'
            ELSE 'secondary'
          END AS recommended_position,

          current_timestamp() AS ranked_at

        FROM scored
    """)


# ----------------------------------------------------------------------
# gold.skill_rankings   (reads gold.skill_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="skill_rankings", comment="7-day rolling skill rankings with demand tier and learning recommendation.")
@dlt.expect("non_null_skill", "skill_name IS NOT NULL")
def skill_rankings():
    return spark.sql("""
        WITH skill_7day AS (
          SELECT
            skill_name,
            skill_category,
            SUM(clicks)                  AS total_clicks,
            SUM(hovers)                  AS total_hovers,
            SUM(unique_users)            AS total_unique_users,
            SUM(unique_sessions)         AS total_unique_sessions,
            SUM(weighted_interest_score) AS total_interest_score
          FROM LIVE.skill_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY skill_name, skill_category
        )
        SELECT
          skill_name, skill_category,
          total_clicks, total_hovers, total_unique_users, total_unique_sessions, total_interest_score,

          ROW_NUMBER() OVER (ORDER BY total_interest_score DESC)                                AS overall_rank,
          ROW_NUMBER() OVER (PARTITION BY skill_category ORDER BY total_interest_score DESC)    AS category_rank,
          ROUND(PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100, 2)                   AS interest_percentile,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'high_demand'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 15 THEN 'moderate_demand'
            ELSE 'low_demand'
          END AS demand_tier,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5  THEN 'maintain_expertise'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 10 THEN 'showcase_more'
            ELSE 'consider_highlighting'
          END AS recommendation,

          current_timestamp() AS ranked_at

        FROM skill_7day
    """)


# ----------------------------------------------------------------------
# gold.section_rankings   (reads gold.section_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="section_rankings", comment="7-day rolling section health: engagement/view/retention ranks, health tier, optimization hints.")
@dlt.expect("non_null_section", "section_id IS NOT NULL")
def section_rankings():
    return spark.sql("""
        WITH section_7day AS (
          SELECT
            section_id,

            SUM(unique_views)               AS total_unique_views,
            SUM(unique_exits)               AS total_unique_exits,
            AVG(unique_exit_rate)           AS avg_exit_rate,

            SUM(total_views)                AS total_views,
            SUM(total_exits)                AS total_exits,
            AVG(total_exit_rate)            AS avg_total_exit_rate,
            AVG(avg_revisits_per_session)   AS avg_revisits,

            SUM(unique_viewers)             AS total_unique_viewers,
            SUM(engaged_sessions)           AS total_engaged_sessions,
            AVG(engagement_rate)            AS avg_engagement_rate,
            AVG(avg_time_spent_seconds)     AS avg_time_spent_seconds,
            AVG(avg_scroll_depth_percent)   AS avg_scroll_depth_percent,
            MAX(max_scroll_milestone)       AS max_scroll_milestone

          FROM LIVE.section_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY section_id
        ),
        scored AS (
          SELECT
            *,
            (
              (avg_engagement_rate * 2) +
              (avg_scroll_depth_percent * 0.5) +
              (100 - avg_exit_rate) * 0.3
            ) AS health_score
          FROM section_7day
        )
        SELECT
          section_id,

          total_unique_views, total_unique_exits, total_unique_viewers,
          ROUND(avg_exit_rate, 2)              AS avg_exit_rate,

          total_views, total_exits,
          ROUND(avg_total_exit_rate, 2)        AS avg_total_exit_rate,
          ROUND(avg_revisits, 2)               AS avg_revisits_per_session,

          total_engaged_sessions,
          ROUND(avg_engagement_rate, 2)        AS avg_engagement_rate,
          ROUND(avg_time_spent_seconds, 2)     AS avg_time_spent_seconds,
          ROUND(avg_scroll_depth_percent, 2)   AS avg_scroll_depth_percent,
          max_scroll_milestone,

          ROUND(health_score, 2)               AS health_score,

          ROW_NUMBER() OVER (ORDER BY health_score DESC)   AS engagement_rank,
          ROW_NUMBER() OVER (ORDER BY total_views DESC)    AS view_rank,
          ROW_NUMBER() OVER (ORDER BY avg_exit_rate ASC)   AS retention_rank,

          CASE
            WHEN health_score >= 80 THEN 'excellent'
            WHEN health_score >= 60 THEN 'good'
            WHEN health_score >= 40 THEN 'needs_attention'
            ELSE 'critical'
          END AS health_tier,

          CASE
            WHEN avg_exit_rate > 50 THEN 'high_dropoff'
            WHEN avg_exit_rate > 30 THEN 'moderate_dropoff'
            ELSE 'low_dropoff'
          END AS dropoff_indicator,

          CASE
            WHEN avg_engagement_rate < 30 AND total_views > 100 THEN 'improve_content'
            WHEN avg_exit_rate > 50                              THEN 'add_cta_or_navigation'
            WHEN avg_scroll_depth_percent < 50                    THEN 'hook_earlier'
            WHEN avg_time_spent_seconds < 3                       THEN 'make_more_engaging'
            ELSE 'performing_well'
          END AS optimization_hint,

          current_timestamp() AS ranked_at

        FROM scored
    """)


# ----------------------------------------------------------------------
# gold.visitor_insights   (reads SILVER tables — cross-pipeline)
# ----------------------------------------------------------------------


@dlt.table(name="visitor_insights", comment="Per-visitor 30-day behavior: tenure, engagement, segment, interest profile.")
@dlt.expect("non_null_user", "user_pseudo_id IS NOT NULL")
@dlt.expect("engaged_le_total", "engaged_sessions <= total_sessions")
def visitor_insights():
    return spark.sql(f"""
        WITH visitor_sessions AS (
          SELECT
            user_pseudo_id,
            COUNT(DISTINCT session_id)                          AS total_sessions,
            MIN(session_start)                                  AS first_visit,
            MAX(session_end)                                    AS last_visit,
            SUM(page_views)                                     AS total_page_views,
            AVG(session_duration_seconds)                       AS avg_session_duration,
            COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) AS engaged_sessions,
            any_value(device_category)                          AS primary_device,
            any_value(country)                                  AS primary_country,
            any_value(traffic_source)                           AS primary_traffic_source,
            slice(array_sort(collect_set(landing_page)), 1, 5)  AS landing_pages,
            slice(array_sort(collect_set(exit_page)),    1, 5)  AS exit_pages
          FROM {_silver("sessions")}
          WHERE session_date >= date_sub(current_date(), 30)
          GROUP BY user_pseudo_id
        ),
        visitor_projects AS (
          SELECT
            user_pseudo_id,
            COUNT(DISTINCT project_id)                                AS projects_viewed,
            slice(array_sort(collect_set(project_id)),       1, 10)   AS project_ids_viewed,
            slice(array_sort(collect_set(project_category)), 1, 5)    AS project_categories_viewed,
            slice(array_sort(collect_set(technology)),       1, 10)   AS technologies_explored
          FROM {_silver("project_events")}
          WHERE event_date >= date_sub(current_date(), 30)
          GROUP BY user_pseudo_id
        ),
        visitor_skills AS (
          SELECT
            user_pseudo_id,
            slice(array_sort(collect_set(skill_name)),     1, 15) AS skills_clicked,
            slice(array_sort(collect_set(skill_category)), 1, 5)  AS skill_categories
          FROM {_silver("skill_events")}
          WHERE event_date >= date_sub(current_date(), 30)
          GROUP BY user_pseudo_id
        ),
        visitor_conversions AS (
          SELECT
            user_pseudo_id,
            count_if(event_name = 'cta_click')           AS cta_clicks,
            count_if(event_name = 'contact_form_submit') AS form_submissions,
            count_if(event_name = 'social_click')        AS social_clicks,
            count_if(event_name = 'resume_download')     AS resume_downloads,
            count_if(event_name = 'outbound_link')       AS outbound_clicks,
            count_if(event_name = 'publication_click')   AS publication_clicks,
            count_if(event_name = 'content_copy')        AS content_copies
          FROM {_silver("conversion_events")}
          WHERE DATE(event_timestamp) >= date_sub(current_date(), 30)
          GROUP BY user_pseudo_id
        )

        SELECT
          vs.user_pseudo_id,

          vs.total_sessions,
          vs.first_visit,
          vs.last_visit,
          datediff(DATE(vs.last_visit), DATE(vs.first_visit)) AS visitor_tenure_days,
          vs.total_page_views,
          ROUND(vs.avg_session_duration, 2)  AS avg_session_duration_sec,
          vs.engaged_sessions,
          ROUND(vs.engaged_sessions * 100.0 / NULLIF(vs.total_sessions, 0), 2) AS engagement_rate,

          vs.primary_device, vs.primary_country, vs.primary_traffic_source,
          vs.landing_pages, vs.exit_pages,

          COALESCE(vp.projects_viewed, 0)        AS projects_viewed,
          vp.project_ids_viewed,
          vp.project_categories_viewed,
          vp.technologies_explored,
          vsk.skills_clicked,
          vsk.skill_categories,

          COALESCE(vc.cta_clicks, 0)         AS cta_clicks,
          COALESCE(vc.form_submissions, 0)   AS form_submissions,
          COALESCE(vc.social_clicks, 0)      AS social_clicks,
          COALESCE(vc.resume_downloads, 0)   AS resume_downloads,
          COALESCE(vc.outbound_clicks, 0)    AS outbound_clicks,
          COALESCE(vc.publication_clicks, 0) AS publication_clicks,
          COALESCE(vc.content_copies, 0)     AS content_copies,

          (
            (vs.total_sessions * 1) +
            (vs.engaged_sessions * 3) +
            (COALESCE(vp.projects_viewed, 0) * 2) +
            (COALESCE(vc.form_submissions, 0) * 20) +
            (COALESCE(vc.resume_downloads, 0) * 15) +
            (COALESCE(vc.social_clicks, 0) * 5) +
            (COALESCE(vc.content_copies, 0) * 8)
          ) AS visitor_value_score,

          CASE
            WHEN COALESCE(vc.form_submissions, 0) > 0
              OR COALESCE(vc.resume_downloads, 0) > 0 THEN 'converter'
            WHEN vs.engaged_sessions >= 2 AND COALESCE(vp.projects_viewed, 0) >= 3 THEN 'engaged_explorer'
            WHEN vs.total_sessions >= 2 THEN 'returning_visitor'
            WHEN vs.engaged_sessions = 1 THEN 'engaged_new'
            ELSE 'casual_browser'
          END AS visitor_segment,

          CASE
            WHEN size(vp.technologies_explored) > 5 THEN 'tech_enthusiast'
            WHEN size(vsk.skills_clicked)      > 3 THEN 'skills_focused'
            WHEN COALESCE(vp.projects_viewed, 0) >= 4 THEN 'portfolio_explorer'
            WHEN COALESCE(vc.publication_clicks, 0) > 0 THEN 'research_interested'
            ELSE 'general_visitor'
          END AS interest_profile

        FROM visitor_sessions vs
        LEFT JOIN visitor_projects    vp  ON vs.user_pseudo_id = vp.user_pseudo_id
        LEFT JOIN visitor_skills      vsk ON vs.user_pseudo_id = vsk.user_pseudo_id
        LEFT JOIN visitor_conversions vc  ON vs.user_pseudo_id = vc.user_pseudo_id
    """)


# ----------------------------------------------------------------------
# gold.recommendations   (reads gold.visitor_insights + gold.project_rankings + silver.project_events)
# ----------------------------------------------------------------------


@dlt.table(name="recommendations", comment="Per-visitor project recommendations: collaborative + content-based + popularity.")
@dlt.expect("non_null_keys", "user_pseudo_id IS NOT NULL AND recommended_project_id IS NOT NULL")
def recommendations():
    return spark.sql(f"""
        WITH visitor_project_affinity AS (
          SELECT
            user_pseudo_id,
            project_id,
            SUM(CASE WHEN event_name = 'project_view'   THEN 1 ELSE 0 END) AS views,
            SUM(CASE WHEN event_name = 'project_click'  THEN 3 ELSE 0 END) AS clicks,
            SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 5 ELSE 0 END) AS expands,
            SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END) AS link_clicks,
            (SUM(CASE WHEN event_name = 'project_view'  THEN 1 ELSE 0 END) +
             SUM(CASE WHEN event_name = 'project_click' THEN 3 ELSE 0 END) +
             SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 5 ELSE 0 END) +
             SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END)) AS affinity_score
          FROM {_silver("project_events")}
          WHERE event_date >= date_sub(current_date(), 30)
            AND project_id IS NOT NULL
          GROUP BY user_pseudo_id, project_id
        ),
        user_similarity AS (
          SELECT
            a.user_pseudo_id AS user_a,
            b.user_pseudo_id AS user_b,
            COUNT(DISTINCT a.project_id)              AS common_projects,
            SUM(a.affinity_score * b.affinity_score)  AS similarity_score
          FROM visitor_project_affinity a
          JOIN visitor_project_affinity b
            ON a.project_id    = b.project_id
           AND a.user_pseudo_id != b.user_pseudo_id
          GROUP BY a.user_pseudo_id, b.user_pseudo_id
          HAVING common_projects >= 2
        ),
        collaborative_recs AS (
          SELECT
            us.user_a AS user_pseudo_id,
            vpa.project_id AS recommended_project_id,
            'collaborative' AS recommendation_type,
            AVG(vpa.affinity_score * us.similarity_score) AS recommendation_score,
            COUNT(DISTINCT us.user_b) AS recommending_users
          FROM user_similarity us
          JOIN visitor_project_affinity vpa
            ON us.user_b = vpa.user_pseudo_id
          LEFT JOIN visitor_project_affinity existing
            ON us.user_a = existing.user_pseudo_id
           AND vpa.project_id = existing.project_id
          WHERE existing.project_id IS NULL
          GROUP BY us.user_a, vpa.project_id
        ),
        content_recs AS (
          SELECT
            vi.user_pseudo_id,
            pr.project_id AS recommended_project_id,
            'content_based' AS recommendation_type,
            pr.engagement_score AS recommendation_score,
            1 AS recommending_users
          FROM LIVE.visitor_insights vi
          CROSS JOIN LIVE.project_rankings pr
          WHERE arrays_overlap(vi.technologies_explored, pr.all_technologies_clicked)
            AND NOT array_contains(vi.project_ids_viewed, pr.project_id)
        ),
        popularity_recs AS (
          SELECT
            vi.user_pseudo_id,
            pr.project_id AS recommended_project_id,
            'popularity' AS recommendation_type,
            pr.engagement_score AS recommendation_score,
            pr.total_unique_viewers AS recommending_users
          FROM LIVE.visitor_insights vi
          CROSS JOIN (
            SELECT * FROM LIVE.project_rankings WHERE overall_rank <= 5
          ) pr
          WHERE NOT array_contains(vi.project_ids_viewed, pr.project_id)
        ),
        all_recs AS (
          SELECT * FROM collaborative_recs
          UNION ALL
          SELECT * FROM content_recs
          UNION ALL
          SELECT * FROM popularity_recs
        )

        SELECT
          user_pseudo_id,
          recommended_project_id,
          recommendation_type,
          ROUND(recommendation_score, 2) AS recommendation_score,
          recommending_users,

          ROW_NUMBER() OVER (
            PARTITION BY user_pseudo_id
            ORDER BY
              CASE recommendation_type
                WHEN 'collaborative' THEN 1
                WHEN 'content_based' THEN 2
                ELSE 3
              END,
              recommendation_score DESC
          ) AS recommendation_rank,

          CASE recommendation_type
            WHEN 'collaborative' THEN CONCAT('Users similar to you also liked this (', CAST(recommending_users AS STRING), ' similar users)')
            WHEN 'content_based' THEN 'Based on technologies you explored'
            ELSE CONCAT('Popular project (', CAST(recommending_users AS STRING), ' visitors)')
          END AS recommendation_reason,

          current_timestamp() AS generated_at

        FROM all_recs
        QUALIFY ROW_NUMBER() OVER (
          PARTITION BY user_pseudo_id, recommended_project_id
          ORDER BY recommendation_score DESC
        ) = 1
    """)


# ----------------------------------------------------------------------
# gold.client_rankings   (reads gold.client_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="client_rankings", comment="7-day rolling client rankings with engagement score and reader behavior classification.")
@dlt.expect("non_null_client", "client_id IS NOT NULL")
def client_rankings():
    return spark.sql("""
        WITH client_7day AS (
          SELECT
            client_id, client_name, domain,
            SUM(views)                       AS total_views,
            SUM(unique_viewers)              AS total_unique_viewers,
            SUM(clicks)                      AS total_clicks,
            SUM(case_study_opens)            AS total_case_study_opens,
            SUM(case_study_engagements)      AS total_case_study_engagements,
            AVG(avg_case_study_time_sec)     AS avg_case_study_time_sec,
            AVG(avg_case_study_scroll_depth) AS avg_case_study_scroll_depth,
            SUM(problem_reads)               AS total_problem_reads,
            SUM(solution_reads)              AS total_solution_reads,
            SUM(contribution_views)          AS total_contribution_views,
            SUM(tech_stack_clicks)           AS total_tech_stack_clicks,
            AVG(case_study_open_rate)        AS avg_case_study_open_rate
          FROM LIVE.client_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY client_id, client_name, domain
        ),
        scored AS (
          SELECT
            *,
            (
              (total_views                                 * 1.0) +
              (total_unique_viewers                        * 2.0) +
              (total_clicks                                * 3.0) +
              (total_case_study_opens                      * 5.0) +
              (total_case_study_engagements                * 7.0) +
              (total_problem_reads                         * 4.0) +
              (total_solution_reads                        * 4.0) +
              (total_contribution_views                    * 3.0) +
              (total_tech_stack_clicks                     * 4.0) +
              (COALESCE(avg_case_study_time_sec, 0)        * 0.2) +
              (COALESCE(avg_case_study_scroll_depth, 0)    * 0.1)
            ) AS raw_engagement_score
          FROM client_7day
        )
        SELECT
          client_id, client_name, domain,

          total_views, total_unique_viewers, total_clicks,
          total_case_study_opens, total_case_study_engagements,
          ROUND(avg_case_study_time_sec, 2)     AS avg_case_study_time_sec,
          ROUND(avg_case_study_scroll_depth, 2) AS avg_case_study_scroll_depth,
          total_problem_reads, total_solution_reads, total_contribution_views, total_tech_stack_clicks,
          ROUND(avg_case_study_open_rate, 2)    AS avg_case_study_open_rate,

          ROUND(raw_engagement_score, 2) AS engagement_score,

          ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC)                          AS overall_rank,
          ROW_NUMBER() OVER (PARTITION BY domain ORDER BY raw_engagement_score DESC)       AS domain_rank,
          ROUND(PERCENT_RANK() OVER (ORDER BY raw_engagement_score) * 100, 2)              AS engagement_percentile,

          CASE
            WHEN total_case_study_opens > 0 AND avg_case_study_time_sec > 60 THEN 'high_engagement'
            WHEN total_case_study_opens > 0                                   THEN 'moderate_engagement'
            WHEN total_views > 5                                              THEN 'viewed_but_not_explored'
            ELSE 'low_visibility'
          END AS engagement_tier,

          CASE
            WHEN total_problem_reads > 0 AND total_solution_reads > 0 THEN 'full_story_readers'
            WHEN total_solution_reads > total_problem_reads           THEN 'solution_focused'
            WHEN total_problem_reads > 0                               THEN 'problem_curious'
            ELSE 'skimmers'
          END AS reader_behavior,

          current_timestamp() AS ranked_at

        FROM scored
    """)


# ----------------------------------------------------------------------
# gold.domain_rankings   (reads gold.domain_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="domain_rankings", comment="7-day rolling domain (industry) rankings with demand tier and portfolio guidance.")
@dlt.expect("non_null_domain", "domain IS NOT NULL")
def domain_rankings():
    return spark.sql("""
        WITH domain_7day AS (
          SELECT
            domain,
            SUM(explicit_interest_signals)    AS total_explicit_interest,
            SUM(implicit_interest_from_views) AS total_implicit_interest,
            SUM(total_domain_interactions)    AS total_interactions,
            SUM(unique_interested_users)      AS total_unique_users,
            SUM(domain_interest_score)        AS total_interest_score
          FROM LIVE.domain_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY domain
        )
        SELECT
          domain,
          total_explicit_interest, total_implicit_interest, total_interactions,
          total_unique_users, total_interest_score,

          ROW_NUMBER() OVER (ORDER BY total_interest_score DESC)                AS interest_rank,
          ROUND(PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100, 2)   AS interest_percentile,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 2 THEN 'high_demand'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 4 THEN 'moderate_demand'
            ELSE 'niche_interest'
          END AS demand_tier,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) = 1 THEN 'primary_strength'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'showcase_more'
            ELSE 'consider_expanding'
          END AS portfolio_recommendation,

          current_timestamp() AS ranked_at

        FROM domain_7day
    """)


# ----------------------------------------------------------------------
# gold.experience_rankings   (reads gold.experience_daily_stats)
# ----------------------------------------------------------------------


@dlt.table(name="experience_rankings", comment="7-day rolling experience/role rankings.")
@dlt.expect("non_null_experience", "experience_id IS NOT NULL")
def experience_rankings():
    return spark.sql("""
        WITH experience_7day AS (
          SELECT
            experience_id, experience_title, company,
            SUM(total_interactions)       AS total_interactions,
            SUM(unique_interested_users)  AS total_unique_users,
            SUM(unique_sessions)          AS total_sessions
          FROM LIVE.experience_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY experience_id, experience_title, company
        )
        SELECT
          experience_id, experience_title, company,
          total_interactions, total_unique_users, total_sessions,

          ROW_NUMBER() OVER (ORDER BY total_interactions DESC)              AS interest_rank,
          ROUND(PERCENT_RANK() OVER (ORDER BY total_interactions) * 100, 2) AS interest_percentile,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1  THEN 'most_attractive_role'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3 THEN 'high_interest_role'
            ELSE 'moderate_interest'
          END AS role_attractiveness,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1 THEN 'lead_with_this'
            WHEN total_unique_users > 5                                    THEN 'highlight_prominently'
            ELSE 'include_for_context'
          END AS positioning_suggestion,

          current_timestamp() AS ranked_at

        FROM experience_7day
    """)


# ----------------------------------------------------------------------
# gold.recommendation_performance   (reads gold.recommendation_daily_stats + silver.recommendation_events)
# ----------------------------------------------------------------------


@dlt.table(name="recommendation_performance", comment="7-day rolling recommender CTR + top performing recs + top driving source projects.")
def recommendation_performance():
    return spark.sql(f"""
        WITH rec_7day AS (
          SELECT
            SUM(total_impressions)        AS total_impressions,
            SUM(total_clicks)             AS total_clicks,
            SUM(unique_users_shown_recs)  AS total_users_shown,
            SUM(unique_users_clicked)     AS total_users_clicked,
            AVG(position_1_ctr)           AS avg_position_1_ctr,
            AVG(position_2_ctr)           AS avg_position_2_ctr,
            AVG(position_3_ctr)           AS avg_position_3_ctr
          FROM LIVE.recommendation_daily_stats
          WHERE event_date >= date_sub(current_date(), 7)
        ),
        project_performance AS (
          SELECT
            recommended_project_id,
            recommended_project_title,
            count_if(event_name = 'recommendation_shown') AS impressions,
            count_if(event_name = 'recommendation_click') AS clicks,
            ROUND(
              count_if(event_name = 'recommendation_click') * 100.0 /
              NULLIF(count_if(event_name = 'recommendation_shown'), 0),
              2
            ) AS ctr
          FROM {_silver("recommendation_events")}
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY recommended_project_id, recommended_project_title
        ),
        source_performance AS (
          SELECT
            source_project_id,
            count_if(event_name = 'recommendation_click') AS clicks_generated,
            COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN recommended_project_id END) AS unique_projects_clicked
          FROM {_silver("recommendation_events")}
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY source_project_id
        ),
        top_recs AS (
          SELECT collect_list(
            struct(recommended_project_id, recommended_project_title, impressions, clicks, ctr)
          ) AS top_performing_recommendations
          FROM (
            SELECT recommended_project_id, recommended_project_title, impressions, clicks, ctr
            FROM project_performance
            WHERE impressions >= 5
            ORDER BY ctr DESC
            LIMIT 5
          )
        ),
        top_sources AS (
          SELECT collect_list(
            struct(source_project_id, clicks_generated, unique_projects_clicked)
          ) AS top_recommendation_drivers
          FROM (
            SELECT source_project_id, clicks_generated, unique_projects_clicked
            FROM source_performance
            ORDER BY clicks_generated DESC
            LIMIT 5
          )
        )
        SELECT
          r.total_impressions,
          r.total_clicks,
          ROUND(r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0), 2) AS overall_ctr,
          r.total_users_shown,
          r.total_users_clicked,
          ROUND(r.total_users_clicked * 100.0 / NULLIF(r.total_users_shown, 0), 2) AS user_conversion_rate,

          ROUND(r.avg_position_1_ctr, 2) AS position_1_ctr,
          ROUND(r.avg_position_2_ctr, 2) AS position_2_ctr,
          ROUND(r.avg_position_3_ctr, 2) AS position_3_ctr,

          CASE
            WHEN r.avg_position_1_ctr >= GREATEST(r.avg_position_2_ctr, r.avg_position_3_ctr) THEN 'Position 1 performs best'
            WHEN r.avg_position_2_ctr >= r.avg_position_3_ctr                                 THEN 'Position 2 performs best'
            ELSE 'Position 3 performs best'
          END AS best_position_insight,

          tr.top_performing_recommendations,
          ts.top_recommendation_drivers,

          CASE
            WHEN r.total_impressions IS NULL OR r.total_impressions = 0 THEN 'no_data'
            WHEN r.total_clicks * 100.0 / r.total_impressions >= 10     THEN 'excellent'
            WHEN r.total_clicks * 100.0 / r.total_impressions >= 5      THEN 'good'
            WHEN r.total_clicks * 100.0 / r.total_impressions >= 2      THEN 'needs_improvement'
            ELSE 'underperforming'
          END AS system_health,

          current_timestamp() AS generated_at

        FROM rec_7day r
        CROSS JOIN top_recs    tr
        CROSS JOIN top_sources ts
    """)


# ----------------------------------------------------------------------
# gold.tech_demand_insights   (reads SILVER tables — cross-pipeline)
# ----------------------------------------------------------------------


@dlt.table(name="tech_demand_insights", comment="7-day rolling technology demand across client work, project events, and skills.")
@dlt.expect("non_null_technology", "technology IS NOT NULL")
def tech_demand_insights():
    return spark.sql(f"""
        WITH tech_from_clients AS (
          SELECT
            technology, domain, 'client_work' AS source,
            COUNT(*)                       AS interactions,
            COUNT(DISTINCT user_pseudo_id) AS unique_users
          FROM {_silver("client_events")}
          WHERE event_name = 'client_tech_stack_click'
            AND technology IS NOT NULL
            AND event_date >= date_sub(current_date(), 7)
          GROUP BY technology, domain
        ),
        tech_from_projects AS (
          SELECT
            technology, project_category AS domain, 'project' AS source,
            COUNT(*)                       AS interactions,
            COUNT(DISTINCT user_pseudo_id) AS unique_users
          FROM {_silver("project_events")}
          WHERE event_name = 'technology_interest'
            AND technology IS NOT NULL
            AND event_date >= date_sub(current_date(), 7)
          GROUP BY technology, project_category
        ),
        tech_from_skills AS (
          SELECT
            skill_name AS technology,
            skill_category AS domain,
            'skills_section' AS source,
            COUNT(*)                       AS interactions,
            COUNT(DISTINCT user_pseudo_id) AS unique_users
          FROM {_silver("skill_events")}
          WHERE event_date >= date_sub(current_date(), 7)
          GROUP BY skill_name, skill_category
        ),
        all_tech AS (
          SELECT * FROM tech_from_clients
          UNION ALL
          SELECT * FROM tech_from_projects
          UNION ALL
          SELECT * FROM tech_from_skills
        ),
        tech_aggregated AS (
          SELECT
            technology,
            SUM(interactions) AS total_interactions,
            SUM(unique_users) AS total_unique_users
          FROM all_tech
          WHERE technology IS NOT NULL
          GROUP BY technology
        )
        SELECT
          technology,
          total_interactions,
          total_unique_users,

          ROW_NUMBER() OVER (ORDER BY total_interactions DESC)              AS demand_rank,
          ROUND(PERCENT_RANK() OVER (ORDER BY total_interactions) * 100, 2) AS demand_percentile,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 5  THEN 'high_demand'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 15 THEN 'moderate_demand'
            ELSE 'niche_interest'
          END AS demand_tier,

          CASE
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3  THEN 'master_this'
            WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 10 THEN 'strengthen_skills'
            ELSE 'maintain_awareness'
          END AS learning_priority,

          current_timestamp() AS generated_at

        FROM tech_aggregated
    """)
