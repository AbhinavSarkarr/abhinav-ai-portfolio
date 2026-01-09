-- Setup: Create Processed Analytics Dataset
-- Run this FIRST before creating any views
-- Project: portfolio-483605
-- GA4 Property ID: 518701756
-- Raw Data Dataset: analytics_518701756

-- Create the processed dataset (if not exists)
CREATE SCHEMA IF NOT EXISTS `portfolio-483605.analytics_processed`
OPTIONS (
  description = 'Processed analytics data from GA4 export (analytics_518701756)',
  location = 'US'  -- Must match your GA4 export location
);

-- Grant access (optional - for team collaboration)
-- GRANT `roles/bigquery.dataViewer` ON SCHEMA `portfolio-483605.analytics_processed`
-- TO 'user:teammate@example.com';
