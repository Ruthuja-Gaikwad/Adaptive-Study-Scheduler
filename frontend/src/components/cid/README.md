# 🧠 Cognitive Intelligence Dashboard (CID)
## Futuristic HUD-Style Analytics Platform

### Overview

The Cognitive Intelligence Dashboard (CID) is a premium, real-time analytics interface designed to monitor and optimize cognitive performance. It combines neuroscience principles with a sleek futuristic HUD aesthetic to provide learners with actionable insights about their mental state, study effectiveness, and wellbeing.

---

## 🎯 Core Features

### 1. **Cognitive Stability Index (CSI) - The Command Center**
- **Visual**: Circular radial gauge with smooth animations
- **Metrics Tracked**:
  - Overall CSI Score (0-100)
  - Focus Score (0-100)
  - Retention Average (%)
  - Burnout Inverse Score (0-100)
  - Performance Trend (+/-)

- **Status Indicators**:
  - 🔵 **Blue (Stable)**: CSI ≥ 80 - Optimal cognitive state
  - 🟡 **Yellow (Warning)**: CSI 60-79 - Monitor closely
  - 🔴 **Red (Burnout)**: CSI < 60 - Recovery needed

- **Expandable Breakdown**: Click to see detailed metric table with trends

### 2. **Burnout Radar - Early Warning System**
- **Real-time Burnout Tracking**:
  - Current burnout percentage (0-100%)
  - Sleep deficit indicator (-/+ hours)
  - Consecutive study days counter
  - Risk level badge (Low/Moderate/High)

- **Recovery Mode**: Activates when risk is high
  - Reduces study load
  - Calms UI tone
  - Suggests breaks

- **Visual Feedback**:
  - Card pulses red when high risk
  - Animated risk badge for emphasis

### 3. **Memory Heatmap - Neural Weakness Detection**
- **Subject-Topic Tree Structure**:
  - Main subjects as collapsible nodes
  - Sub-topics with retention percentages
  - Color-coded retention strength

- **Retention Status**:
  - 🔵 Strong (>75% retention)
  - 🟡 Fading (40-75% retention)
  - 🔴 At Risk (<40% retention)

- **Hover Intelligence**: Shows next revision date for each topic
- **Quick Action**: Start targeted revision for weak areas

### 4. **Performance & Focus Analytics**
#### Performance Card
- Last 5 quiz/test results chart
- Accuracy percentage with trend indicator
- AI-generated insights about performance patterns
- Example: "Accuracy dropped 8% in last 3 tests"

#### Focus Card
- Average deep work duration (minutes)
- Task switching rate (per hour)
- Daily focus score bar
- Focus quality badge (Excellent/Good/Needs Work)

### 5. **Intervention Alert Panel**
- **Smart Alerts** for at-risk situations
- **Alert Types**:
  - Memory Risk Detected
  - Attention Drop Warning
  - Sleep Deficit Alert
  - New Concept Overload

- **Severity Levels** with color coding
- **Quick Actions**: 
  - 5-min Recall session
  - Schedule for tomorrow
  - Take break
  - Dismiss

### 6. **Live Cognitive Timeline**
- **Horizontal Activity Feed** showing cognitive events
- **Event Types**:
  - 📖 Deep Work sessions
  - ⚠️ Burnout warnings
  - ⚡ Revision suggestions
  - ✅ Quiz completions
  - 🔄 Focus breaks

- **Real-time Updates**: Reflects ongoing activities
- **Scrollable**: See full day's cognitive activity

### 7. **Cognitive Forecast - Predictive Analytics**
- **Tomorrow's Productivity Forecast**: Predicted % change
- **Recommended Sleep**: Based on fatigue patterns (e.g., 7.5h)
- **Risk Assessment**: Tomorrow's burnout probability
- **AI Recommendations**: Personalized study strategy (3-4 items)

---

## 📊 Data Integration

### Supabase Real-time Subscriptions

The CID subscribes to multiple Supabase tables for live updates:

```javascript
// Cognitive Index Updates
channel: 'cognitive_updates'
table: 'cognitive_index'
Fields: csi_score, focus_score, retention_avg

// Burnout Metrics
channel: 'burnout_updates'
table: 'burnout_metrics'
Fields: burnout_score, sleep_deficit, risk_level

// User Statistics
channel: 'stats_updates'
table: 'user_stats'
Fields: xp, streak, accuracy, completion_rate
```

### Expected Database Schema

```sql
-- Cognitive Index
CREATE TABLE cognitive_index (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  csi_score INTEGER,
  focus_score INTEGER,
  retention_avg DECIMAL,
  burnout_inverse INTEGER,
  performance_trend INTEGER,
  updated_at TIMESTAMP
);

-- Burnout Metrics
CREATE TABLE burnout_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  burnout_score INTEGER,
  sleep_deficit DECIMAL,
  consecutive_study_days INTEGER,
  risk_level VARCHAR(20), -- 'low', 'moderate', 'high'
  updated_at TIMESTAMP
);

-- User Stats
CREATE TABLE user_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  xp INTEGER,
  level INTEGER,
  streak INTEGER,
  accuracy DECIMAL,
  avg_deep_work_duration INTEGER,
  task_switch_rate DECIMAL,
  daily_focus_score INTEGER,
  updated_at TIMESTAMP
);

-- Memory Tracking
CREATE TABLE memory_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subject VARCHAR(100),
  topic VARCHAR(100),
  retention_percentage INTEGER,
  next_revision_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Intervention Logs
CREATE TABLE intervention_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  intervention_type VARCHAR(50),
  subject VARCHAR(100),
  severity VARCHAR(20), -- 'low', 'medium', 'high'
  action_taken VARCHAR(50),
  timestamp TIMESTAMP
);
```

---

## 🎨 Design System

### Theme Variants

#### 1. **Night Owls Mode** (Dark)
```
Background: Deep indigo (#0F172A)
CSI Ring: Neon blue with glow
Heatmap: Electric gradient
Cards: Slate with transparency
Primary: Indigo-500, Cyan-400
Danger: Red-500, Pink-500
Warning: Yellow-500, Orange-500
Text: Slate-100
Secondary: Slate-400
```

#### 2. **Clean Tech Mode** (Light)
```
Background: Soft gray-white
CSI Ring: Teal + Sky Blue
Cards: White with subtle shadows
Primary: Indigo-600, Cyan-500
Danger: Red-600, Pink-500
Warning: Yellow-600, Orange-500
Text: Slate-900
Secondary: Slate-600
```

### Component Styling
All components use Tailwind CSS with:
- CSS Variables for consistency
- Glassmorphism effects (backdrop blur)
- Gradient overlays
- Smooth transitions
- Responsive design

---

## ✨ Micro-Interactions

### Animations & Feedback

1. **CSI Gauge**
   - Smooth circle fill on score update
   - Glowing ring pulses based on status
   - Metric values animate in on load

2. **Burnout Radar**
   - Card background pulses red on high risk
   - Risk badge shakes slightly
   - Smooth bar fill on score change

3. **Memory Heatmap**
   - Topic nodes pulse when near decay threshold
   - Smooth expand/collapse with stagger
   - Hover highlights with scale transform

4. **Timeline Events**
   - Icons animate with radiating pulse
   - Smooth scroll with no jank
   - Staggered entrance animation

5. **XP & Streak**
   - XP bar fills smoothly
   - Streak badge glows with orange pulse
   - Level-up celebration animation

---

## 🔄 Component Architecture

```
CognitiveIntelligenceDashboard (Main Container)
├── TopBar
│   ├── Greeting Section
│   ├── Level + XP Bar
│   ├── Streak Badge
│   ├── CSI Mini Indicator
│   └── Theme Toggle
├── CSICore
│   ├── Circular Gauge
│   ├── Status Label
│   ├── Expand Button
│   └── Metrics Table (Conditional)
├── Three-Column Layout
│   ├── BurnoutRadar
│   ├── Column 2 (Stacked)
│   │   ├── PerformanceCard
│   │   └── FocusCard
│   └── MemoryHeatmap
├── InterventionPanel
├── CognitiveTimeline
└── CognitiveForecast

```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 1 column layout
- **Tablet**: 2 columns with stacked cards
- **Desktop**: 3 columns full layout

All components scale gracefully:
- Font sizes adjust
- Padding/margins compress
- Charts remain readable
- Timeline scrolls horizontally

---

## 🚀 Performance Optimizations

1. **Real-time Updates**: Efficient Supabase subscriptions
2. **Animation Performance**: Uses `motion` library with GPU acceleration
3. **Lazy Loading**: Components load on-demand
4. **Memoization**: Prevents unnecessary re-renders
5. **Code Splitting**: Each module is independently importable

---

## 🔧 File Structure

```
src/components/cid/
├── index.js                              # Exports
├── CognitiveIntelligenceDashboard.jsx     # Main container
├── TopBar.jsx                            # Header with greeting
├── CSICore.jsx                           # Central gauge
├── BurnoutRadar.jsx                      # Burnout warnings
├── MemoryHeatmap.jsx                     # Retention tracking
├── PerformanceCard.jsx                   # Quiz analytics
├── FocusCard.jsx                         # Focus metrics
├── InterventionPanel.jsx                 # Alert system
├── CognitiveTimeline.jsx                 # Activity feed
└── CognitiveForecast.jsx                 # AI predictions
```

---

## 💡 Usage Example

### Basic Implementation
```jsx
import { CognitiveIntelligenceDashboard } from '@/components/cid';

export default function Dashboard() {
  return <CognitiveIntelligenceDashboard />;
}
```

### With Custom Props
```jsx
<CognitiveIntelligenceDashboard
  initialData={{
    csiScore: 85,
    burnoutScore: 25,
    userLevel: 15,
    streak: 30
  }}
/>
```

---

## 🔐 Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📚 Dependencies

- **React**: ^18.0.0
- **Framer Motion** (`motion/react`): ^12.0.0+
- **Tailwind CSS**: ^3.0+
- **Lucide Icons**: For all UI icons
- **Supabase**: For real-time data
- **Sonner**: For notifications/toast

---

## 🎨 Customization Guide

### Change Theme Colors
Update in each component's color mapping:
```javascript
const csiColors = {
  stable: 'from-blue-500 to-cyan-400',
  warning: 'from-yellow-500 to-orange-400',
  burnout: 'from-red-500 to-pink-400',
};
```

### Adjust Animation Speeds
Modify `transition` props:
```javascript
animate={{ opacity: 1 }}
transition={{ duration: 1.5 }} // Change duration
```

### Add New Metrics
1. Add field to Supabase schema
2. Add to component state
3. Subscribe to new table
4. Render in appropriate card

---

## 🐛 Troubleshooting

### Animations Not Showing
- Ensure `motion` package is installed: `npm install motion`
- Check `motion/react` import is correct

### Real-time Updates Not Working
- Verify Supabase credentials in `.env`
- Check database tables exist and have correct schema
- Ensure RLS policies allow user to read tables

### Styling Issues
- Verify Tailwind CSS is configured
- Check dark mode context is working
- Ensure backdrop-blur is enabled in Tailwind

---

## 📈 Future Enhancements

- [ ] Sound design for alerts
- [ ] 3D visualization options
- [ ] AR mode for immersive experience
- [ ] Custom alerts configuration
- [ ] Export analytics reports
- [ ] Leaderboard comparison
- [ ] Collaborative cognitive stats
- [ ] ML predictions for burnout

---

## 📝 Notes for Developers

1. **Component Isolation**: Each component is self-contained and can be tested independently
2. **Theme Support**: All components respect dark mode context
3. **Real-time First**: Designed for Supabase Postgres changes
4. **Mobile Ready**: Fully responsive with touch support
5. **Accessibility**: Uses semantic HTML and proper ARIA labels

---

## 🎓 Educational Purpose

This dashboard helps learners understand:
- Their cognitive load levels
- Optimal study times
- Memory retention patterns
- Focus quality indicators
- Burnout risk factors
- Personalized study recommendations

The gamification elements (XP, streaks, levels) keep motivation high while the analytics provide objective feedback for improvement.

---

**Created**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
