export const METRIC_THRESHOLDS = {
	LCP: { good: 2500, needsImprovement: 4000 },
	INP: { good: 200, needsImprovement: 500 },
	CLS: { good: 0.1, needsImprovement: 0.25 },
	FCP: { good: 1800, needsImprovement: 3000 },
	TTFB: { good: 800, needsImprovement: 1800 },
};

export const TIMEFRAMES = [
	{ label: "Current (28 days)", days: 0, historyPoints: 1, interval: 0 },
];

export const METRIC_CONFIG = {
	largest_contentful_paint: { name: "LCP", unit: "s", apiName: "largest_contentful_paint" },
	interaction_to_next_paint: { name: "INP", unit: "ms", apiName: "interaction_to_next_paint" },
	cumulative_layout_shift: { name: "CLS", unit: "", apiName: "cumulative_layout_shift" },
	first_contentful_paint: { name: "FCP", unit: "s", apiName: "first_contentful_paint" },
	experimental_time_to_first_byte: { name: "TTFB", unit: "ms", apiName: "experimental_time_to_first_byte" },
};