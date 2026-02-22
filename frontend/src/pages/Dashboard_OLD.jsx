import { CognitiveIntelligenceDashboard } from '../components/cid';

/**
 * Main Dashboard Page
 * 
 * Displays the Cognitive Intelligence Dashboard (CID) - a futuristic HUD-style
 * analytics dashboard for monitoring cognitive load, burnout risk, memory retention,
 * and performance metrics with real-time Supabase integration.
 * 
 * Features:
 * - Cognitive Stability Index (CSI) gauge with live metrics
 * - Burnout risk monitoring with recovery recommendations
 * - Memory heatmap showing retention levels by subject
 * - Performance trend analysis with AI insights
 * - Focus stability tracking with task switching metrics
 * - Intervention alerts for at-risk topics
 * - Live activity timeline showing cognitive events
 * - Predictive cognitive forecast for optimal study planning
 * 
 * Theme Support: Dark mode (Night Owls) and light mode (Clean Tech)
 */
export default function Dashboard() {
  return <CognitiveIntelligenceDashboard />;
}
