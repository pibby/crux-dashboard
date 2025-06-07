import React, { useState, useEffect } from 'react';
import URLInputForm from './components/URLInputForm';
import FormFactorSelector from './components/FormFactorSelector';
import MetricCard from './components/MetricCard';
import useCruxData from './hooks/useCruxData';
import { getOverallAssessment } from './utils/cwvHelpers';
import { clearCache } from './utils/cache';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Core Web Vitals metrics that are part of Google's Core Web Vitals initiative
const CORE_WEB_VITALS_METRICS = [
	'largest_contentful_paint', // Measures loading performance
	'interaction_to_next_paint', // Measures interactivity
	'cumulative_layout_shift' // Measures visual stability
];

// Additional metrics that provide supplementary performance insights
const OTHER_METRICS = [
	'first_contentful_paint', // Measures when the browser renders the first bit of content
	'experimental_time_to_first_byte' // Measures server response time
];

function App() {
	// Custom hook that manages CrUX API data fetching and caching
	const {
		urlData, // Object containing metrics data for each URL
		isLoading, // Loading state indicator
		collectionPeriod, // Date range for the collected data
		fetchDataForUrls, // Function to fetch data for given URLs
		currentUrls, // Array of URLs currently being analyzed
		setCurrentUrls // Function to update the current URLs
	} = useCruxData();

	// State to track the selected device type (ALL, PHONE, or DESKTOP)
	const [selectedFormFactor, setSelectedFormFactor] = useState('ALL');

	// Handler for when URLs are submitted through the form
	const handleUrlsSubmit = (urls) => {
		setCurrentUrls(urls);
	};

	// Effect to fetch data whenever URLs or form factor changes
	useEffect(() => {
		if (currentUrls.length > 0) {
			fetchDataForUrls(currentUrls, selectedFormFactor);
		}
	}, [currentUrls, selectedFormFactor, fetchDataForUrls]);

	// Function to export the current report view as a PDF
	const handleExportPdf = () => {
		const reportElement = document.getElementById('report-container');
		if (!reportElement) {
			console.error("Report container not found!");
			return;
		}
		
		// Convert the report container to a canvas with high resolution
		html2canvas(reportElement, { 
			scale: 2,
			backgroundColor: '#111827'
		}).then(canvas => {
			// Create PDF with dimensions matching the canvas
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'px',
				format: [canvas.width, canvas.height]
			});
			
			// Add the canvas as an image to the PDF and save
			pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
			pdf.save(`crux-report-${new Date().toISOString().slice(0, 10)}.pdf`);
		});
	};

	// Helper function to format the date range for display
	const formatDateRange = (period) => {
		if (!period?.firstDate || !period?.lastDate) {
			return null;
		}
		const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
		const startDate = new Date(Date.UTC(period.firstDate.year, period.firstDate.month - 1, period.firstDate.day));
		const endDate = new Date(Date.UTC(period.lastDate.year, period.lastDate.month - 1, period.lastDate.day));
		return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
	}

	const formattedDateRange = formatDateRange(collectionPeriod);

	// Determine the display text for the selected device type
	let deviceDisplayText;
	if (selectedFormFactor === 'ALL') {
		deviceDisplayText = 'Desktop'; // Default to Desktop for aggregate view
	} else {
		deviceDisplayText = selectedFormFactor.charAt(0).toUpperCase() + selectedFormFactor.slice(1).toLowerCase();
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
			<header className="mb-8 text-center">
				<h1 className="text-4xl font-bold text-indigo-400">Core Web Vitals Dashboard</h1>
				<p className="text-gray-400 mt-1">28-Day Field Data from the CrUX API</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="md:col-span-1 space-y-6">
					<URLInputForm onSubmit={handleUrlsSubmit} isLoading={isLoading} />
					<FormFactorSelector
						selectedFormFactor={selectedFormFactor}
						onFormFactorChange={setSelectedFormFactor}
						isLoading={isLoading}
					/>
					<div className="space-y-2">
						<button
							onClick={handleExportPdf}
							disabled={isLoading || currentUrls.length === 0}
							className="w-full py-2 px-4 border border-green-500 text-green-500 rounded-md hover:bg-green-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Export All to PDF
						</button>
						<button
							onClick={() => { clearCache(); alert("Cache cleared!"); }}
							className="w-full py-2 px-4 border border-yellow-500 text-yellow-500 rounded-md hover:bg-yellow-600 hover:text-gray-900 transition-colors"
						>
							Clear API Cache
						</button>
					</div>
				</div>

				<div className="md:col-span-2" id="report-container">
					{formattedDateRange && (
						<h2 className="text-center text-md text-gray-400 mb-4 font-semibold">
							Data Period: {formattedDateRange} ({deviceDisplayText})
						</h2>
					)}

					{currentUrls.length === 0 && (
						<div className="text-center text-gray-500 py-10 bg-gray-800 rounded-lg shadow-md">
							<p className="text-lg">Enter URLs to get started.</p>
						</div>
					)}
					
					<div className="space-y-4">
						{currentUrls.map(url => {
							const data = urlData[url];
							if (!data) {
								return (
									<div key={url} className="bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
										<div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div className="h-24 bg-gray-700 rounded"></div>
											<div className="h-24 bg-gray-700 rounded"></div>
											<div className="h-24 bg-gray-700 rounded"></div>
										</div>
									</div>
								);
							}
							
							const assessment = data.current ? getOverallAssessment(data.current.metrics) : { rating: 'Loading...', color: 'bg-gray-700' };
							const deviceParam = selectedFormFactor === 'ALL' ? 'DESKTOP' : selectedFormFactor;
							const cruxVisUrl = `https://cruxvis.withgoogle.com/#/?view=cwvsummary&url=${encodeURIComponent(url)}&identifier=url&device=${deviceParam}&periodStart=0&periodEnd=-1&display=p75s`;

							return (
								<div key={url} className="bg-gray-800 p-4 rounded-lg shadow-md break-inside-avoid">
									{data.current && (
										<div className={`text-white text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3 ${assessment.color}`}>
											Core Web Vitals Assessment: {assessment.rating}
										</div>
									)}
									
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="font-semibold text-lg text-indigo-300 break-all">{url}</h3>
											{data.isOriginFallback && (
												<p className="text-xs text-yellow-400 italic">
													(Showing data for origin: {data.fallbackOrigin})
												</p>
											)}
										</div>
										<div className="flex items-center space-x-3 flex-shrink-0 ml-2">
											<a 
												href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`}
												target="_blank" 
												rel="noopener noreferrer"
												title="Test on PageSpeed Insights"
												className="p-2 rounded-full hover:bg-gray-700 transition-colors"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
											</a>
											<a
												href={cruxVisUrl}
												target="_blank"
												rel="noopener noreferrer"
												title="View Historical Data on CrUX Visualization Studio"
												className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
											>
												History
											</a>
										</div>
									</div>
									{data.error && <p className="text-red-400">{data.error}</p>}
									
									{data.current?.metrics && (
										<div className="space-y-3">
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
												{CORE_WEB_VITALS_METRICS.map(apiName => (
													<MetricCard
														key={apiName}
														metricApiName={apiName}
														p75={data.current.metrics[apiName]?.p75}
													/>
												))}
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-700">
												{OTHER_METRICS.map(apiName => (
													<MetricCard
														key={apiName}
														metricApiName={apiName}
														p75={data.current.metrics[apiName]?.p75}
													/>
												))}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;