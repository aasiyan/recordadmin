import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjvrzdtysyorsntbmrwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdnJ6ZHR5c3lvcnNudGJtcnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MDI5ODEsImV4cCI6MjA1MTM3ODk4MX0.TfZuPp4Dzqu27xhHTpqwXseyumoQmHTHCVJ1oOIsEqM';

export const supabase = createClient(supabaseUrl, supabaseKey);
