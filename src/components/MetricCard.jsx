import React, { useState } from 'react';
import { getMetricRating, formatMetricValue } from '../utils/cwvHelpers';
import { METRIC_CONFIG } from '../utils/constants';
import { RECOMMENDATIONS } from '../utils/recommendations';

const MetricCard = ({ metricApiName, p75 }) => {
	const [showRecs, setShowRecs] = useState(false);

	const config = Object.values(METRIC_CONFIG).find(m => m.apiName === metricApiName);
	if (!config) return null;

	const { name: metricName, unit } = config;
	const formattedValue = formatMetricValue(metricApiName, p75);
	const rating = getMetricRating(metricName, p75);

	let ratingColor = 'text-gray-400';
	if (rating === 'Good') ratingColor = 'text-green-400';
	else if (rating === 'Needs Improvement') ratingColor = 'text-yellow-400';
	else if (rating === 'Poor') ratingColor = 'text-red-400';

	const recs = RECOMMENDATIONS[metricName];

	return (
		<div className="bg-gray-800 p-4 rounded-lg shadow-md text-center flex flex-col justify-between">
			<div>
				<h3 className="text-lg font-semibold text-gray-200">{metricName}</h3>
				{formattedValue !== 'N/A' && p75 !== undefined ? (
					<>
						<p className={`text-3xl font-bold my-2 ${ratingColor}`}>
							{formattedValue}
							<span className="text-sm align-top">{unit}</span>
						</p>
						<p className={`text-sm font-semibold ${ratingColor}`}>{rating}</p>
					</>
				) : (
					<p className="text-2xl font-bold my-2 text-gray-500">N/A</p>
				)}
				<p className="text-xs text-gray-500 mt-1">(p75)</p>
			</div>

			<div className="mt-4">
				{rating !== 'Good' && rating !== 'N/A' && recs && (
					<button
						onClick={() => setShowRecs(!showRecs)}
						className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
					>
						{showRecs ? 'Hide Advice' : 'Show Advice'}
					</button>
				)}
				
				{showRecs && (
					<div className="text-left mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
						<p className="text-sm text-gray-300 mb-3">{recs.summary}</p>
						<ul className="space-y-3">
							{recs.causes.map((item) => (
								<li key={item.cause} className="text-xs">
									<strong className="block text-gray-200">{item.cause}</strong>
									<p className="text-gray-400">{item.solution}
										<a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block ml-1 text-indigo-400 hover:underline">
											Learn more
										</a>
									</p>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default MetricCard;