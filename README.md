# 🏋️ Gain Train - Fitness Tracker

A comprehensive, offline-first workout tracking progressive web app designed for serious lifters who want to track their progress without the bloat of commercial fitness apps.

## ✨ Features at a Glance

- 📅 **Intuitive Calendar Interface** - Month and week views with swipe navigation
- 💪 **Smart Exercise Tracking** - Auto-fill from previous sessions, personal best tracking
- 📊 **Progress Visualization** - Volume charts, weekly progress graphs, yearly heatmaps
- 🎯 **Custom Workout Types** - Create your own workout categories with custom colors
- 📝 **Flexible Templates** - Save and reuse workout templates
- ⚖️ **Weight Tracking** - Log bodyweight alongside workouts
- 🔍 **Exercise History** - Detailed history for every exercise with editing capabilities
- 🌐 **Offline First** - All data stored locally, works without internet
- 📱 **Mobile Optimized** - Swipe gestures, touch-friendly interface

## 🚀 Getting Started

### Installation

1. **Direct Use**: Simply open `index.html` in any modern web browser
2. **Local Server** (recommended for PWA features):
```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
```
3. **Install as PWA**: When prompted, add to home screen for app-like experience

### First Steps

1. Navigate to **Home** screen
2. Select a workout type (Push, Pull, Legs, Upper, Lower, or Whole Body)
3. Choose a template or create from scratch
4. Log your first workout!

## 📋 Core Features

### 1. Home Screen - Workout Selection

**Pre-built Workout Types:**
- **Push** - Chest, shoulders, triceps
- **Pull** - Back, biceps
- **Legs** - Quads, hamstrings, glutes
- **Upper Body** - Full upper body session
- **Lower Body** - Complete leg day
- **Whole Body** - Full body workout
- **Warm-up/Cool-down** - Mobility and recovery sessions

**Additional Features:**
- Mark rest days
- Create custom workout types with custom colors
- Quick access to all exercises

### 2. Workout Logging

**Exercise Management:**
- **Add exercises** with sets, reps, weight, and rest periods
- **Auto-fill** from last session for the same exercise
- **Personal Best tracking** - Automatically highlights PRs
- **Volume comparison** - See if you're doing more or less than last time
- **Notes field** - Log form cues, how you felt, etc.
- **Mini graphs** - Visual progress indicator for each exercise

**Smart Features:**
- Color-coded volume indicators (green = progress, red = regression, gray = same)
- Bodyweight exercise toggle
- Rest timer suggestions
- Swipe-to-delete on exercise cards

### 3. Calendar View

**Two View Modes:**
- **Monthly View** - See your entire month at a glance
- **Weekly View** (expanded) - Focus on current week with more detail

**Visual Indicators:**
- Workout types shown with distinct colors
- Custom workouts display with your chosen color
- Weight logging indicator (orange dot)
- Today's date highlighted

**Interactions:**
- Swipe left/right to navigate months or weeks
- Tap any date to view/log workouts
- Quick actions: Log weight, view details, edit, delete, reschedule

**Text Mode Toggle:**
- Switch between colored tiles and text labels
- Useful for visual clarity preferences

### 4. Workout Details Panel

When you select a date, see:
- All exercises performed that day
- Sets × Reps @ Weight breakdown
- Personal bests highlighted with ⭐
- Exercise notes
- Mini volume graphs

**Quick Actions:**
- Edit existing workout
- Delete workout
- Change workout type
- Reschedule to different date
- Log bodyweight
- Toggle simplified/detailed view

### 5. Stats Screen

**Comprehensive Analytics:**

**Monthly vs All-Time Comparison:**
- Total workouts logged
- Rest days taken
- Average workouts per week
- Days tracked

**Visual Charts:**
- **Weekly Progress Graph** - Workouts per week over time
- **Weight Progress Chart** - Bodyweight tracking timeline
- **Yearly Heatmap** - GitHub-style contribution graph for workouts

**Weight Management:**
- Log weight for any date
- Edit/delete weight entries
- Visual trend analysis

### 6. Exercise History

**Detailed Exercise Tracking:**
- View complete history for any exercise
- See all past sessions sorted by date
- Edit previous sessions (sets, reps, weight, notes, rest)
- Delete individual sessions
- Volume progression charts
- Timeline filters: Daily, Weekly, Monthly

**Smart Merging:**
- Rename exercises across all history
- Consolidate variations (e.g., "Bench Press" + "Barbell Bench Press")

### 7. Templates

**Template Types:**
- **Default** - Pre-loaded exercise list
- **Previous** - Copy from your last workout
- **Custom Saved** - Your own templates with custom names

**Template Management:**
- Create unlimited templates per workout type
- Edit template names
- Delete unused templates
- Save any workout as a template

## 📖 Usage Guide

### Logging a Workout

1. **From Home Screen:**
   - Tap a workout type
   - Choose template (Default, Previous, or Custom)
   - Add/edit exercises
   - Tap "Log" when complete

2. **From Calendar:**
   - Tap any date
   - Tap "Log Workout"
   - Select workout type and template
   - Complete workout
   - Automatically saved to that date

### Creating Custom Workout Types

1. Tap "➕" button on home screen
2. Enter workout name
3. Select color
4. Choose exercises from any category
5. Optionally add first template name
6. Save

### Editing Exercises

**In Edit Mode:**
- Tap pencil icon on any exercise
- Use +/- buttons or type values
- Toggle bodyweight checkbox
- Add rest time and notes
- Tap ✓ to save or ✗ to cancel

**Features:**
- Dropdown selector for exercise names
- Search across all exercise categories
- Auto-fill from last logged session

### Templates Workflow

**Saving:**
- While editing any workout, tap "Save as"
- Choose category (or current type)
- Enter template name or leave blank for auto-naming
- Template saved for future use

**Using:**
- Select workout type
- Choose from: Default, Previous, or your saved templates
- Edit as needed
- Can save modifications as new template

### Rescheduling Workouts

1. Select workout date in calendar
2. Tap reschedule icon (⟳)
3. Pick new date
4. Confirm (will warn if date already has workout)

### Weight Tracking

**From Calendar:**
- Select any date
- Tap "Log Weight" icon
- Enter weight in kg
- Enter 0 to delete entry

**From Stats:**
- Switch to "Weight" graph
- Log new entries
- Edit or delete previous entries
- View trend over time

### Exercise History & Analysis

1. Tap any exercise name (from workout or all exercises view)
2. View complete history sorted newest first
3. See volume progression chart
4. Edit any past session:
   - Change sets/reps/weight
   - Update rest time
   - Modify notes
5. Delete sessions if needed

### All Exercises View

**Access:** Tap "View All Exercises" in Stats

**Features:**
- Alphabetically sorted list
- Last logged date shown
- Personal best displayed
- Mini progress graph for each
- Tap to view full history
- Merge/rename exercises

## 💾 Data Management

### Local Storage

All data is stored in browser localStorage:
- `workouts` - All logged workouts
- `templates` - Saved workout templates
- `customWorkoutTypes` - Your custom categories
- `weightLogs` - Bodyweight entries
- `calendarTextMode` - View preference
- `isDetailsExpanded` - Calendar view state
- `currentGraphType` - Stats graph preference

### Backup Your Data

**Manual Backup:**
```javascript
// Open browser console (F12) and run:
const backup = {
  workouts: JSON.parse(localStorage.getItem('workouts')),
  templates: JSON.parse(localStorage.getItem('templates')),
  customWorkoutTypes: JSON.parse(localStorage.getItem('customWorkoutTypes')),
  weightLogs: JSON.parse(localStorage.getItem('weightLogs'))
};
console.log(JSON.stringify(backup));
// Copy the output and save to a file
```

**Restore from Backup:**
```javascript
// Paste your backup data, then:
const backup = { /* your backup data */ };
localStorage.setItem('workouts', JSON.stringify(backup.workouts));
localStorage.setItem('templates', JSON.stringify(backup.templates));
localStorage.setItem('customWorkoutTypes', JSON.stringify(backup.customWorkoutTypes));
localStorage.setItem('weightLogs', JSON.stringify(backup.weightLogs));
location.reload();
```

### Data Cleanup

Hidden debug tools (tap screen 7 times in Stats):
- View duplicate entries
- Clean up invalid dates
- See debug log

## 🛠️ Technical Details

### Technologies Used

- **Vanilla JavaScript** - No frameworks, pure JS
- **Chart.js** - Graphs and visualizations
- **LocalStorage API** - Data persistence
- **CSS Grid/Flexbox** - Responsive layouts
- **Touch Events API** - Swipe gestures
- **Material Symbols** - Icon font

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Performance

- Lightweight: ~50KB total (HTML + CSS + JS)
- No external dependencies except Chart.js
- Instant load times
- Offline-capable

## 💡 Tips & Tricks

### Productivity Tips

1. **Use Templates** - Save time by creating templates for your regular routines
2. **Swipe Navigation** - Quickly move between dates/months with swipes
3. **Auto-fill** - Let the app remember your last sets/reps/weight
4. **Mini Graphs** - Quick visual check if you're progressing
5. **Notes Field** - Track form cues, PRs, how you felt
6. **Rest Timers** - Log rest periods to track workout intensity

### Advanced Usage

1. **Exercise Variations** - Use "Same As" feature to merge similar exercises
2. **Weekly View** - Expand calendar for focused weekly planning
3. **Volume Tracking** - Watch total volume to track progressive overload
4. **Simplified View** - Toggle in calendar details for cleaner display
5. **Batch Template Creation** - Create templates for full training blocks

### Data Insights

- **Yearly Heatmap** - Spot consistency patterns
- **Weekly Average** - Track adherence to your program
- **Exercise History** - Identify plateaus and PRs
- **Volume Charts** - See true progress over time
- **Weight Correlation** - Compare bodyweight to performance

## 🎯 Workout Programming Ideas

### PPL (Push/Pull/Legs)
- Use Push/Pull/Legs workout types
- Create templates for each
- Track 6-day or 3-day split

### Upper/Lower Split
- Utilize Upper/Lower workout types
- Perfect for 4-day training weeks

### Full Body
- Use Whole Body type
- Great for 3x/week training

### Custom Splits
- Create custom workout types for specialized training:
  - Olympic Lifts
  - Powerlifting
  - Bodybuilding
  - CrossFit
  - Calisthenics

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📄 License

Free to use and modify for personal use.

## 🙏 Acknowledgments

Built with dedication for lifters who value:
- Data ownership
- Privacy
- Offline functionality
- Detailed tracking
- Clean interface

---

**Happy Training! 💪**

Made with ❤️ for the gains