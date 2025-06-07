import React, { useState } from 'react';

const URLInputForm = ({ onSubmit, isLoading }) => {
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const urls = urlInput
      .split(/[\n,]+/) // Split by newline or comma
      .map(url => url.trim())
      .filter(Boolean); // Remove empty strings

    if (urls.length > 0) {
      onSubmit(urls);
      // setUrlInput(''); // Optionally clear input after submission
    } else {
      alert("Please enter at least one URL.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md">
      <label htmlFor="urlInput" className="block text-sm font-medium text-gray-300 mb-1">
        Enter URLs (one per line or comma-separated):
      </label>
      <textarea
        id="urlInput"
        name="urlInput" // Good practice
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        rows="4"
        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
        placeholder="https://example.com&#x0a;https://another.com" // &#x0a; is newline
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Get Core Web Vitals'}
      </button>
    </form>
  );
};

export default URLInputForm;