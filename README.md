
# EcoScan - LVMH Sustainability Prototype

A high-fidelity GreenOps dashboard designed for LVMH to analyze, audit, and optimize the carbon footprint of AI and Technical Infrastructure projects. Powered by Google Gemini API.

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory of the project. You must add your Google Gemini API Key here for the AI analysis features to work.

**File: `.env`**
```env
API_KEY=your_google_gemini_api_key_here
```

> **Note:** The application uses `process.env.API_KEY` to authenticate with Google's GenAI services.

### 4. Running Locally
Start the development server:

```bash
npm start
```
*Depending on your build tool (e.g., Vite, CRA, Parcel), the command might be `npm run dev`.*

Open your browser to `http://localhost:1234` (or the port specified in your console).

## 🛠 Features

*   **Lifecycle Assessment (LCA):** Calculates Scope 2 & 3 emissions for AI Training and Inference.
*   **AI Audit:** Upload project charters (.txt, .json) to automatically extract hardware specs and get sustainability recommendations using Gemini 1.5 Pro.
*   **Strategy Lab:** Interactive simulation to apply/revert optimizations (e.g., changing regions, hardware, or model quantization).
*   **Dashboard:** Visualizes "Macro Environmental Delta" (Legacy vs. Optimized footprints).

## 🔐 Default Login
*   **Username:** Alexander Dior
*   **Password:** password
*   *(Or register a new profile directly in the app)*
