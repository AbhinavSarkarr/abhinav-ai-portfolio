-- Layer 3: Recommendations View - Content Recommendations
-- Real-time content recommendations based on visitor behavior
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendations` AS

-- Part 1: Visitor-Project Affinity Matrix
WITH visitor_project_affinity AS (
  SELECT
    user_pseudo_id,
    project_id,
    SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) AS views,
    SUM(CASE WHEN event_name = 'project_click' THEN 3 ELSE 0 END) AS clicks,
    SUM(CASE WHEN event_name = 'project_expand' THEN 5 ELSE 0 END) AS expands,
    SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END) AS link_clicks,
    -- Affinity score
    (SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN event_name = 'project_click' THEN 3 ELSE 0 END) +
     SUM(CASE WHEN event_name = 'project_expand' THEN 5 ELSE 0 END) +
     SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END)) AS affinity_score

  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    AND project_id IS NOT NULL
  GROUP BY user_pseudo_id, project_id
),

-- Part 2: Similar Users (Collaborative Filtering Basis)
user_similarity AS (
  SELECT
    a.user_pseudo_id AS user_a,
    b.user_pseudo_id AS user_b,
    COUNT(DISTINCT a.project_id) AS common_projects,
    -- Cosine similarity approximation
    SUM(a.affinity_score * b.affinity_score) AS similarity_score

  FROM visitor_project_affinity a
  JOIN visitor_project_affinity b
    ON a.project_id = b.project_id
    AND a.user_pseudo_id != b.user_pseudo_id
  GROUP BY a.user_pseudo_id, b.user_pseudo_id
  HAVING common_projects >= 2
),

-- Part 3: Collaborative Recommendations
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
  -- Only recommend projects the user hasn't seen
  LEFT JOIN visitor_project_affinity existing
    ON us.user_a = existing.user_pseudo_id
    AND vpa.project_id = existing.project_id
  WHERE existing.project_id IS NULL
  GROUP BY us.user_a, vpa.project_id
),

-- Part 4: Content-Based Recommendations (Technology matching)
content_recs AS (
  SELECT
    vi.user_pseudo_id,
    pr.project_id AS recommended_project_id,
    'content_based' AS recommendation_type,
    pr.engagement_score AS recommendation_score,
    1 AS recommending_users

  FROM `portfolio-483605.analytics_processed.v_visitor_insights` vi
  CROSS JOIN `portfolio-483605.analytics_processed.v_project_rankings` pr
  -- Match based on technology interests
  WHERE EXISTS (
    SELECT 1
    FROM UNNEST(vi.technologies_explored) AS tech
    WHERE tech IN (SELECT * FROM UNNEST(pr.all_technologies_clicked))
  )
  -- Exclude already viewed
  AND pr.project_id NOT IN (
    SELECT * FROM UNNEST(vi.project_ids_viewed)
  )
),

-- Part 5: Popularity-Based Recommendations (fallback)
popularity_recs AS (
  SELECT
    vi.user_pseudo_id,
    pr.project_id AS recommended_project_id,
    'popularity' AS recommendation_type,
    pr.engagement_score AS recommendation_score,
    pr.total_unique_viewers AS recommending_users

  FROM `portfolio-483605.analytics_processed.v_visitor_insights` vi
  CROSS JOIN (
    SELECT * FROM `portfolio-483605.analytics_processed.v_project_rankings`
    WHERE overall_rank <= 5
  ) pr
  -- Exclude already viewed
  WHERE pr.project_id NOT IN (
    SELECT * FROM UNNEST(vi.project_ids_viewed)
  )
),

-- Combine all recommendations
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

  -- Final rank per user (blended)
  ROW_NUMBER() OVER (
    PARTITION BY user_pseudo_id
    ORDER BY
      -- Prioritize collaborative, then content, then popularity
      CASE recommendation_type
        WHEN 'collaborative' THEN 1
        WHEN 'content_based' THEN 2
        ELSE 3
      END,
      recommendation_score DESC
  ) AS recommendation_rank,

  -- Explanation
  CASE recommendation_type
    WHEN 'collaborative' THEN CONCAT('Users similar to you also liked this (', recommending_users, ' similar users)')
    WHEN 'content_based' THEN 'Based on technologies you explored'
    ELSE CONCAT('Popular project (', recommending_users, ' visitors)')
  END AS recommendation_reason,

  CURRENT_TIMESTAMP() AS generated_at

FROM all_recs
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY user_pseudo_id, recommended_project_id
  ORDER BY recommendation_score DESC
) = 1  -- Dedupe same project from multiple methods
ORDER BY user_pseudo_id, recommendation_rank;
