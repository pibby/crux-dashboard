import { getFromCache, setToCache } from "../utils/cache";

const API_KEY = import.meta.env.VITE_CRUX_API_KEY;
const API_BASE_URL = `https://chromeuxreport.googleapis.com/v1/records`;

/**
 * A wrapper around fetch that retries the request on failure and handles common API errors.
 * @param {string} url - The URL to fetch.
 * @param {object} options - The options for the fetch request.
 * @param {number} retries - The number of times to retry the request.
 * @param {number} delay - The delay in ms between retries.
 * @returns {Promise<object>} - A promise that resolves to the JSON response or an error object.
 */
const fetchWithRetry = async (url, options, retries = 2, delay = 500) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use statusText
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
        }

        // Handle specific CrUX "not found" error
        if (
          response.status === 404 &&
          errorData.error?.message?.includes("Chrome UX Report data not found")
        ) {
          return {
            record: null,
            error: "No CrUX data available for this URL or timeframe.",
          };
        }
        // General API error from response
        throw new Error(
          `API Error: ${response.status} ${
            errorData.error?.message || response.statusText
          }`
        );
      }
      return response.json(); // Success
    } catch (error) {
      if (i === retries) {
        // If this was the last attempt
        console.error(`Final attempt failed for ${url}:`, error);
        // Return a structured error to be handled by the caller
        return {
          record: null,
          error: error.message || "An unknown error occurred during API call.",
        };
      }
      console.warn(
        `API call attempt ${
          i + 1
        } for ${url} failed. Retrying in ${delay}ms... Error: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

/**
 * Fetches data from the Chrome UX Report API for a given URL, date, and form factor.
 * @param {string} targetUrl - The URL to query (can be a full URL or just an origin).
 * @param {object|null} dateObj - The date object for history queries, or null for current data.
 * @param {string} formFactor - The device type to query for ('ALL', 'DESKTOP', 'PHONE').
 * @returns {Promise<object>} - A promise resolving to the API data or an error object.
 */
export const fetchCruxData = async (targetUrl, dateObj, formFactor) => {
  const metrics = [
    "largest_contentful_paint",
    "interaction_to_next_paint",
    "cumulative_layout_shift",
    "first_contentful_paint",
    "experimental_time_to_first_byte",
  ];

  let queryTarget = {};
  try {
    // Normalize URL to be an origin or a full URL as required by CrUX
    const parsedUrl = new URL(
      targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`
    );
    if (parsedUrl.pathname && parsedUrl.pathname !== "/") {
      queryTarget = { url: parsedUrl.href };
    } else {
      queryTarget = { origin: parsedUrl.origin };
    }
  } catch (e) {
    console.error("Invalid URL format:", targetUrl);
    return { record: null, error: `Invalid URL format: ${targetUrl}` };
  }

  // The cache key now includes the formFactor to store separate results
  const cacheKey = dateObj
    ? `history_${queryTarget.origin || queryTarget.url}_${dateObj.year}${
        dateObj.month
      }${dateObj.day}_${formFactor}`
    : `current_${queryTarget.origin || queryTarget.url}_${formFactor}`;

  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const body = {
    ...queryTarget,
    metrics,
  };

  // *** THIS IS THE CRITICAL LOGIC FOR THE FIX ***
  // Conditionally add the formFactor to the body.
  // If 'ALL', the field is omitted to get aggregate data.
  if (formFactor && formFactor !== "ALL") {
    body.formFactor = formFactor;
  }

  let endpoint = "";
  if (dateObj) {
    body.collectionPeriod = dateObj; // API expects { year, month, day }
    endpoint = `${API_BASE_URL}:queryHistoryRecord?key=${API_KEY}`;
  } else {
    endpoint = `${API_BASE_URL}:queryRecord?key=${API_KEY}`;
  }

  const apiResponse = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  setToCache(cacheKey, apiResponse);
  return apiResponse;
};
