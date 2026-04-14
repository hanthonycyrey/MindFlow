# MindFlow

**AI-powered thought capture and analysis tool that transforms unstructured thinking into organized insights and visual frameworks**

## Purpose

MindFlow solves a critical thinking problem: capturing raw, unstructured thoughts before they fade, then extracting meaningful insights and connections from them. It bridges the gap between stream-of-consciousness thinking and structured decision-making by leveraging AI to analyze patterns, suggest relevant frameworks, and visualize relationships between ideas.

Whether you're brainstorming, problem-solving, reflecting on challenges, or exploring complex topics, MindFlow helps you think more clearly and retain valuable insights.

## Core Functionality

### 1. **Frictionless Thought Capture**
- Lightweight input interface designed for rapid, unstructured note-taking
- Auto-saves as you type to prevent data loss
- Timestamps on every entry for temporal context and review
- Minimal formatting overhead (basic markdown) to keep focus on thinking, not styling

### 2. **AI-Powered Analysis Engine**
- Sends captured thoughts to Claude API for intelligent processing
- Extracts key themes, patterns, and recurring concepts
- Identifies connections between disparate ideas
- Generates concise, actionable summaries of thought clusters
- Suggests relevant thinking frameworks based on content analysis

### 3. **Thinking Frameworks Integration**
- Built-in library of proven frameworks: OODA Loop, First Principles Thinking, Systems Thinking, Pareto Principle, Mental Models, and more
- AI automatically recommends frameworks when analyzing thoughts
- Users can manually tag thoughts with frameworks for deeper organization
- Framework suggestions provide context-specific guidance for decision-making and problem-solving

### 4. **Interactive Mind Map Visualization**
- Converts AI-analyzed thoughts into hierarchical visual mind maps
- Shows relationships and clusters between ideas
- Color-coded by theme or framework for quick visual scanning
- Interactive nodes: click to expand/collapse, view related source thoughts
- Exportable as image (PNG/SVG) or JSON for integration with other tools

### 5. **Thought Organization & Discovery**
- Multiple views: timeline (chronological), list (indexed), or grouped (by theme/framework/date)
- Full-text search across all thoughts
- Filter by date range, framework, theme, or custom tags
- Archive system for old or resolved thought dumps
- Dashboard with quick metrics: total thoughts, themes identified, frameworks applied, analysis count

### 6. **Persistent Storage**
- Local storage for immediate, offline access
- Optional cloud sync via Supabase for cross-device access and backup
- Auto-save prevents accidental data loss

## Data Flow

```
User Input → Auto-save to Storage
    ↓
User Triggers Analysis
    ↓
Send to Claude API (with thought content)
    ↓
Claude Returns: Summary, Themes, Framework Suggestions, Actionable Insights
    ↓
Display Analysis & Recommendations
    ↓
User Generates Mind Map
    ↓
Visualization Engine Renders Interactive Map
    ↓
User Organizes, Tags, Archives, or Exports
```

## Key Benefits

- **Capture thoughts at the speed of thinking** — No friction, no formatting delays
- **Discover hidden patterns** — AI finds connections you might miss
- **Make better decisions** — Framework suggestions provide proven thinking structures
- **Retain valuable insights** — Searchable, organized archive of your thinking journey
- **See the bigger picture** — Visual mind maps clarify complex relationships
- **Think iteratively** — Organize and refine thoughts over time

## Use Cases

- **Problem-solving:** Brainstorm freely, then let AI organize and suggest frameworks
- **Strategic planning:** Capture ideas, identify themes, visualize roadmaps
- **Personal reflection:** Log thoughts, discover patterns in your thinking
- **Research & learning:** Organize research notes with AI-powered summarization
- **Team brainstorming:** Dump ideas individually, then visualize collective thinking
- **Decision-making:** Capture considerations, get framework recommendations, evaluate options

## Technical Architecture

- **Frontend:** React with Hooks-based state management
- **AI Integration:** Claude API for analysis, summarization, and framework suggestions
- **Data Persistence:** localStorage (local) + optional Supabase (cloud)
- **Visualization:** React Flow or Cytoscape for interactive mind map rendering
- **Performance:** Optimized for mobile and desktop; efficient API call batching; lazy-loaded components
- **Error Handling:** Comprehensive error states, loading indicators, offline fallbacks

## Success Metrics

- Thoughts are captured and saved within seconds
- AI suggestions feel contextually relevant and actionable
- Mind maps clearly display theme relationships and hierarchies
- Users discover patterns they hadn't consciously recognized
- Regular return usage, indicating sustained value in the thinking process


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/47a83d1c-eb60-46bf-a4dc-c4713ebe4f4a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
