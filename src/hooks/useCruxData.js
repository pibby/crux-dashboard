import { useState, useCallback } from 'react';
import { fetchCruxData } from '../services/cruxApiService';
import { METRIC_CONFIG } from '../utils/constants';

const getOrigin = (url) => {
  try {
    const origin = new URL(url.startsWith('http') ? url : `https://${url}`).origin;
    if (origin === url || `${origin}/` === url) return null;
    return origin;
  } catch (e) {
    return null;
  }
};

const useCruxData = () => {
  const [urlData, setUrlData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrls, setCurrentUrls] = useState([]);
  const [collectionPeriod, setCollectionPeriod] = useState(null);

  const processUrlData = (record, fallbackOrigin = null) => {
    if (!record) return null;
    const currentMetricsDisplay = {};
    Object.keys(METRIC_CONFIG).forEach(apiName => {
      const p75 = record.metrics?.[apiName]?.percentiles?.p75;
      currentMetricsDisplay[apiName] = { p75 };
    });
    
    return {
      current: { metrics: currentMetricsDisplay, date: 'Current' },
      isOriginFallback: !!fallbackOrigin,
      fallbackOrigin: fallbackOrigin,
    };
  };

  // The dependency array is corrected to be empty, as all dependencies are passed as arguments.
  const fetchDataForUrls = useCallback(async (urlsToFetch, formFactor) => {
    setIsLoading(true);
    setCollectionPeriod(null); // Reset on each new fetch
    const newFetchedDataForAllUrls = {};
    
    // Use a local flag to ensure we only set the period once per batch of fetches.
    let periodHasBeenSet = false;

    for (const url of urlsToFetch) {
      try {
        let finalRecord = null;
        let fallbackOrigin = null;

        let apiResponse = await fetchCruxData(url, null, formFactor);

        if (!apiResponse.record) {
          const origin = getOrigin(url);
          if (origin) {
            console.warn(`URL-level data not found for ${url}. Falling back to origin: ${origin}`);
            apiResponse = await fetchCruxData(origin, null, formFactor);
            if (apiResponse.record) {
              fallbackOrigin = origin;
            }
          }
        }
        
        finalRecord = apiResponse.record;

        // If we get a successful record and haven't set the period *in this batch*, store it.
        if (finalRecord && !periodHasBeenSet) {
            setCollectionPeriod(finalRecord.collectionPeriod);
            periodHasBeenSet = true; // Set the flag for this batch
        }

        if (finalRecord) {
          const processedData = processUrlData(finalRecord, fallbackOrigin);
          newFetchedDataForAllUrls[url] = { ...processedData, isLoading: false, error: null };
        } else {
          newFetchedDataForAllUrls[url] = { error: "No CrUX data found for the URL or its origin.", isLoading: false };
        }
      } catch (err) {
        newFetchedDataForAllUrls[url] = { error: err.message, isLoading: false };
      }
    }
    setUrlData(newFetchedDataForAllUrls);
    setIsLoading(false);
  }, []); // Corrected dependency array

  return { urlData, isLoading, collectionPeriod, fetchDataForUrls, currentUrls, setCurrentUrls };
};

export default useCruxData;