# Core Web Vitals Bulk Reporting Dashboard

A modern, responsive web application built with React and Vite that allows users to retrieve and analyze Core Web Vitals (CWV) and other performance metrics for a list of URLs using the Google Chrome UX Report (CrUX) API.

This dashboard provides at-a-glance assessments, actionable recommendations, and convenient export features, making it a powerful tool for web developers, SEO specialists, and product managers.

## Features
Bulk URL Analysis: Enter a list of URLs (separated by newlines or commas) to fetch performance data for all of them in a single batch.
Core Web Vitals Assessment: Each URL receives an overall "Good," "Needs Improvement," or "Poor" assessment based on its LCP, INP, and CLS scores.
Detailed Metrics: Displays key performance metrics, including:
Core Web Vitals: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS). <!-- end list -->
Diagnostic Metrics: First Contentful Paint (FCP), Time to First Byte (TTFB).
Actionable Recommendations: For any metric that isn't "Good," the app provides specific, expert advice on how to improve it, with links to detailed articles on web.dev.
Device-Specific Filtering: View data for different device types by selecting "All Devices" (aggregate, defaulting to Desktop for links), "Desktop," or "Phone."
Intelligent Origin Fallback: If a specific page doesn't have enough data, the app automatically attempts to fetch data for the entire website (the origin) to provide the best available insights.

## External Tool Integration:
PageSpeed Insights: A direct link to run a lab analysis for each URL.
CrUX History: A direct link to the CrUX Visualization Studio for deep-dive historical analysis.
PDF Export: Export the entire report for all submitted URLs into a clean, shareable PDF document with a single click.
Browser-Side Caching: API results are cached in the browser's localStorage to provide instant results for recent queries and reduce API usage.

## Tech Stack
Framework: React
Build Tool: Vite
Styling: Tailwind CSS
API: Google Chrome UX Report (CrUX) API
PDF Generation: jspdf & html2canvas
Language: JavaScript (ES6+) & JSX

## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.

## Prerequisites
Node.js (version 16 or later recommended)
npm (usually comes with Node.js)
A Google CrUX API Key

## Installation & Setup
Clone the repository:
```
git clone <your-repository-url>
cd <repository-directory>
```

### Install dependencies:
```
npm install
```

### Set up your API Key:

You must have a valid API key for the Chrome UX Report API. You can get one from the Google Cloud Platform Console.
In the root of the project directory, create a new file named .env.
Add your API key to this file, prefixed with VITE_, like so:
`VITE_CRUX_API_KEY=AIzaSyABCDEFG...your-actual-api-key`
Remember to configure the key's HTTP referrer restrictions to allow localhost:* for local development and your-domain.com/* for your deployed site.

### Run the development server:

`npm run dev`

The application should now be running, typically at http://localhost:5173.


### Build for production:
To create a static build for deployment, run:

`npm run build`

The production-ready files will be located in the dist/ directory.

## Usage
Enter URLs: Paste one or more URLs into the text area.
Select a Device: Choose "All Devices," "Desktop," or "Phone" from the dropdown. The report will update automatically.
View Results: The dashboard will display a card for each URL with its overall assessment and key metrics.
Get Advice: For any metric that isn't "Good," click the "Show Advice" button to see detailed recommendations.
Export: Click the "Export All to PDF" button to download a PDF of the entire report.
File Structure
The project source code is located in the src/ directory and is organized as follows:

components/: Contains all reusable React components (MetricCard, URLInputForm, etc.).
hooks/: Contains the main useCruxData.js custom hook for all data fetching and state logic.
services/: Contains the cruxApiService.js module, which is responsible for direct communication with the CrUX API.
utils/: Contains helper functions (cwvHelpers.js), constants (constants.js), and our recommendations knowledge base (recommendations.js).

License
This project is licensed under the MIT License.