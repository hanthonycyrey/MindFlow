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



# MindFlow 🧠

An AI-powered thought notebook that transforms chaotic thinking into organized, actionable insights.

## Problem Solved

Your notes are piling up. Your thoughts are scattered. You know there are valuable insights buried in there—you just can't see them clearly. **MindFlow** solves this by capturing your raw thoughts and using AI to extract themes, identify patterns, suggest relevant frameworks, and visualize everything as an interactive mind map.

## What is MindFlow?

MindFlow is a mobile-first React app that:
- **Captures** your thoughts without friction (stream-of-consciousness note-taking)
- **Analyzes** your thoughts using Claude AI to find patterns and themes
- **Suggests** relevant frameworks and principles to structure your thinking
- **Visualizes** relationships between ideas as an interactive mind map
- **Organizes** everything so you can find and build on your insights

## Key Features

✨ **Thought Dump Interface** - Distraction-free capture with auto-save  
🤖 **AI-Powered Analysis** - Claude API extracts themes, patterns, and insights  
🎯 **Framework Integration** - Get smart suggestions for thinking frameworks  
🗺️ **Interactive Mind Maps** - Visualize relationships between your ideas  
📊 **Organization Tools** - Search, filter, and group by theme or date  
📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop  
🌓 **Dark/Light Mode** - Easy on the eyes, any time of day  

## How It Works

1. **Dump** your thoughts freely—no structure needed
2. **Analyze** with one click—Claude AI processes your thoughts
3. **Discover** patterns, themes, and applicable frameworks
4. **Visualize** as a mind map to see the big picture
5. **Organize** and build on your insights

## Tech Stack

- **React** - Modern UI with hooks
- **Claude API** - AI analysis and summarization
- **React Flow / Cytoscape** - Interactive mind map visualization
- **Tailwind CSS** - Beautiful, responsive design
- **LocalStorage** - Data persistence

## Getting Started

### Prerequisites
- Node.js 16+
- Anthropic API key

### Installation

```bash
git clone https://github.com/yourusername/mindflow.git
cd mindflow
npm install
```

### Configuration

Create a `.env.local` file:
