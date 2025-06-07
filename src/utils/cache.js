const CACHE_PREFIX = 'crux_dashboard_v2_'; // Updated prefix to avoid old cache conflicts
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day

export const getFromCache = (key) => {
	const itemStr = localStorage.getItem(CACHE_PREFIX + key);
	if (!itemStr) {
		return null;
	}
	try {
		const item = JSON.parse(itemStr);
		const now = new Date();
		if (now.getTime() > item.expiry) {
			localStorage.removeItem(CACHE_PREFIX + key);
			return null;
		}
		return item.value; // This is the actual data (API response)
	} catch (error) {
		console.error("Error reading from cache:", error);
		localStorage.removeItem(CACHE_PREFIX + key); // Remove corrupted item
		return null;
	}
};

const clearOldCacheEntriesIfNeeded = () => {
	// Basic strategy: if localStorage is almost full, remove oldest items
	// This is a very simplified check. Real quota management is complex.
	try {
		localStorage.setItem(CACHE_PREFIX + '__test_quota__', 'test');
		localStorage.removeItem(CACHE_PREFIX + '__test_quota__');
	} catch (e) {
		if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
			console.warn("Cache quota likely exceeded. Clearing oldest entries...");
			let items = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(CACHE_PREFIX)) {
					try {
						const itemStr = localStorage.getItem(key);
						if (itemStr) {
							const item = JSON.parse(itemStr);
							items.push({ key, expiry: item.expiry || 0 });
						}
					} catch { /* ignore parse errors for this cleanup */ }
				}
			}
			// Sort by expiry (oldest first) and remove a few (e.g., 20% of cache items)
			items.sort((a, b) => a.expiry - b.expiry);
			const itemsToRemove = Math.max(1, Math.floor(items.length * 0.2));
			for (let i = 0; i < Math.min(items.length, itemsToRemove); i++) {
				console.log("Removing old cache item:", items[i].key);
				localStorage.removeItem(items[i].key);
			}
		}
	}
}

export const setToCache = (key, value) => {
	clearOldCacheEntriesIfNeeded(); // Check and clear before setting new item

	const now = new Date();
	const item = {
		value: value, // Store the actual data (API response)
		expiry: now.getTime() + CACHE_EXPIRY_MS,
	};
	try {
		localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
	} catch (error) {
		console.error("Error setting to cache (key:", key, "):", error);
		// If still failing after cleanup, there's not much more client-side can do simply.
	}
};

export const clearCache = () => {
	let clearedCount = 0;
	Object.keys(localStorage).forEach(key => {
		if (key.startsWith(CACHE_PREFIX)) {
			localStorage.removeItem(key);
			clearedCount++;
		}
	});
	console.log(`Cache cleared. ${clearedCount} items removed.`);
};