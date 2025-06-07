import { METRIC_THRESHOLDS, METRIC_CONFIG } from './constants';

/**
 * Determines if a metric value is 'Good', 'Needs Improvement', or 'Poor'.
 * @param {string} metricNameKey - The short name of the metric (e.g., "LCP", "FCP").
 * @param {number} rawValue - The numeric p75 value from the API.
 * @returns {string} - The rating string.
 */
export const getMetricRating = (metricNameKey, rawValue) => {
	const thresholds = METRIC_THRESHOLDS[metricNameKey];
	if (!thresholds || rawValue === undefined || rawValue === null) {
		return 'N/A';
	}
	if (rawValue <= thresholds.good) return 'Good';
	if (rawValue <= thresholds.needsImprovement) return 'Needs Improvement';
	return 'Poor';
};

/**
 * Formats a raw metric value for display (e.g., converting ms to s).
 * @param {string} metricApiName - The full API name of the metric (e.g., "largest_contentful_paint").
 * @param {number} rawValue - The numeric p75 value from the API.
 * @returns {string} - The formatted value string.
 */
export const formatMetricValue = (metricApiName, rawValue) => {
	if (rawValue === undefined || rawValue === null) return 'N/A';
	const config = Object.values(METRIC_CONFIG).find(m => m.apiName === metricApiName);
	if (!config) return String(rawValue);
	
	let value = parseFloat(String(rawValue));
	
	if (config.name === 'LCP' || config.name === 'FCP') return (value / 1000).toFixed(2);
	if (config.name === 'CLS') return value.toFixed(2);
	if (config.name === 'INP' || config.name === 'TTFB') return Math.round(value);
	
	return String(value);
};

/**
 * Determines the overall Core Web Vitals assessment for a URL.
 * @param {object} currentMetrics - The metrics object containing p75 values for all metrics.
 * @returns {object} - An object with the rating string and a corresponding color class.
 */
export const getOverallAssessment = (currentMetrics) => {
	if (!currentMetrics) return { rating: 'Incomplete', color: 'bg-gray-500' };
	const cwvMetrics = [
		{ name: 'LCP', p75: currentMetrics.largest_contentful_paint?.p75 },
		{ name: 'INP', p75: currentMetrics.interaction_to_next_paint?.p75 },
		{ name: 'CLS', p75: currentMetrics.cumulative_layout_shift?.p75 },
	];
	const ratings = cwvMetrics.map(m => getMetricRating(m.name, m.p75));
	if (ratings.includes('N/A') || ratings.length < 3) return { rating: 'Incomplete Data', color: 'bg-gray-500' };
	if (ratings.includes('Poor')) return { rating: 'Poor', color: 'bg-red-600' };
	if (ratings.includes('Needs Improvement')) return { rating: 'Needs Improvement', color: 'bg-yellow-500' };
	return { rating: 'Good', color: 'bg-green-600' };
};

/**
 * Compares the current metric value to historical values to determine a trend.
 * @param {number} currentValue - The most recent p75 value.
 * @param {Array<number>} historicalValues - An array of previous p75 values.
 * @returns {string} - "Improving", "Regressing", or "Stable".
 */
export const getMetricTrend = (currentValue, historicalValues) => {
	if (currentValue === undefined || currentValue === null || !historicalValues || historicalValues.length < 1) {
		return 'Stable';
	}
	const prevValue = historicalValues[historicalValues.length - 1];
	if (prevValue === undefined || prevValue === null) {
		return 'Stable';
	}
	const percentChange = Math.abs((currentValue - prevValue) / prevValue) * 100;
	if (percentChange < 5) return 'Stable';
	if (currentValue < prevValue) return 'Improving';
	if (currentValue > prevValue) return 'Regressing';
	return 'Stable';
};

/**
 * Generates an array of past dates to be queried from the CrUX History API.
 * @param {object} timeframe - The timeframe object defining the historical range.
 * @returns {Array<object|null>} - An array of date objects for the API, or [null] for current data.
 */
export const getHistoryDates = (timeframe) => {
	if (timeframe.days === 0) {
		return [null];
	}
	const dates = [];
	const today = new Date();
	const mostRecentQueryDate = new Date(today);
	mostRecentQueryDate.setUTCDate(today.getUTCDate() - 2);

	for (let i = 0; i < timeframe.historyPoints; i++) {
		const dateToQuery = new Date(mostRecentQueryDate);
		dateToQuery.setUTCDate(mostRecentQueryDate.getUTCDate() - (i * timeframe.interval));
		dates.push({
			year: dateToQuery.getUTCFullYear(),
			month: dateToQuery.getUTCMonth() + 1,
			day: dateToQuery.getUTCDate(),
		});
	}
	return dates.sort((a,b) => {
		const dateA = new Date(Date.UTC(a.year, a.month - 1, a.day));
		const dateB = new Date(Date.UTC(b.year, b.month - 1, b.day));
		return dateA - dateB;
	});
};