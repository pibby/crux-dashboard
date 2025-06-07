// src/components/FormFactorSelector.jsx

import React from 'react';

const FORM_FACTORS = [
	{ label: "Desktop", value: "DESKTOP" },
	{ label: "Mobile", value: "PHONE" }, // CrUX API uses "PHONE" for mobile
];

const FormFactorSelector = ({ selectedFormFactor, onFormFactorChange, isLoading }) => {
	return (
		<div className="mb-4">
			<label htmlFor="formFactor" className="block text-sm font-medium text-gray-300">
				Select Device:
			</label>
			<select
				id="formFactor"
				name="formFactor"
				value={selectedFormFactor}
				onChange={(e) => onFormFactorChange(e.target.value)}
				disabled={isLoading}
				className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			>
				{FORM_FACTORS.map(ff => (
					<option key={ff.value} value={ff.value}>
						{ff.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default FormFactorSelector;