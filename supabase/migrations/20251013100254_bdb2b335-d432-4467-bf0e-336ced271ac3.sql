-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cron job to delete old visitor content every hour
SELECT cron.schedule(
  'delete-visitor-content-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT public.delete_old_visitor_content();
  $$
);