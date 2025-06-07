// src/utils/recommendations.js

export const RECOMMENDATIONS = {
	LCP: {
		summary: "Largest Contentful Paint measures loading performance. To improve it, you need to make sure the page's main content loads and renders as quickly as possible.",
		causes: [
			{
				cause: "Slow server response times",
				solution: "A slow server directly delays every other request. Improve your Time to First Byte (TTFB) by optimizing your server, using a CDN, and implementing caching.",
				link: "https://web.dev/articles/optimize-lcp#optimize-server-response-time"
			},
			{
				cause: "Render-blocking JavaScript and CSS",
				solution: "Scripts and stylesheets can block the page from rendering. Defer non-critical JavaScript and CSS, inline critical CSS, and reduce the size of your CSS files.",
				link: "https://web.dev/articles/optimize-lcp#eliminate-render-blocking-resources"
			},
			{
				cause: "Slow-loading resources (e.g., images)",
				solution: "Optimize images by compressing them, using modern formats like AVIF or WebP, and using responsive images to serve appropriate sizes. For the LCP element, consider preloading it.",
				link: "https://web.dev/articles/optimize-lcp#optimize-resource-loading"
			}
		]
	},
	INP: {
		summary: "Interaction to Next Paint measures runtime responsiveness. A low INP ensures the page reacts quickly to user interactions like clicks, taps, and key presses.",
		causes: [
			{
				cause: "Long-running JavaScript tasks",
				solution: "Long tasks on the main thread block user interactions. Break up long tasks into smaller chunks using `setTimeout` or `requestIdleCallback` to yield to the main thread.",
				link: "https://web.dev/articles/optimize-inp#break-up-long-tasks"
			},
			{
				cause: "Excessive DOM size",
				solution: "A large and complex DOM tree increases the work needed to process rendering and updates. Aim to create smaller DOM trees to improve rendering performance.",
				link: "https://web.dev/articles/optimize-inp#reduce-dom-size"
			},
			{
				cause: "Inefficient event callbacks",
				solution: "The JavaScript that runs in response to an event (like a click) can be slow. Keep event callbacks lean and defer non-essential work to a later time.",
				link: "https://web.dev/articles/optimize-inp#optimize-event-callbacks"
			}
		]
	},
	CLS: {
		summary: "Cumulative Layout Shift measures visual stability. To improve it, you need to ensure the page layout doesn't unexpectedly shift as content loads.",
		causes: [
			{
				cause: "Images without dimensions",
				solution: "Always include `width` and `height` attributes on your `<img>` and `<video>` elements. This allows the browser to reserve space for the element before it loads.",
				link: "https://web.dev/articles/optimize-cls#images-without-dimensions"
			},
			{
				cause: "Ads, embeds, and iframes without dimensions",
				solution: "Reserve space for ads and embeds by styling the container `div` with a specific `width` and `height` or `aspect-ratio` before the ad library loads.",
				link: "https://web.dev/articles/optimize-cls#ads-embeds-and-iframes-without-dimensions"
			},
			{
				cause: "Web fonts causing layout shifts (FOIT/FOUT)",
				solution: "Prevent layout shifts from custom fonts by preloading the font files or using the `font-display: optional` property combined with a good fallback font.",
				link: "https://web.dev/articles/optimize-cls#web-fonts-causing-foitfout"
			}
		]
	},
	FCP: {
		summary: "First Contentful Paint measures the time it takes for the first piece of DOM content to be rendered. Improving it provides the first sign that the page is loading.",
		causes: [
			{
				cause: "Render-blocking resources",
				solution: "Like LCP, FCP is blocked by scripts and stylesheets. Defer non-critical JS/CSS, inline critical CSS, and remove unused CSS to speed up the initial render.",
				link: "https://web.dev/articles/fcp#how-to-improve-fcp"
			},
			{
				cause: "Slow server response time (TTFB)",
				solution: "Every frontend optimization is limited by how fast the server sends the first byte of HTML. Optimize your backend, use a CDN, and enable caching.",
				link: "https://web.dev/articles/time-to-first-byte/"
			}
		]
	},
	TTFB: {
		summary: "Time to First Byte measures the time between the request for a resource and when the first byte of a response begins to arrive. It is a foundational metric for connection speed and web server responsiveness.",
		causes: [
			{
				cause: "Slow server application logic",
				solution: "Optimize your server's application code, database queries, and API calls to process requests faster.",
				link: "https://web.dev/articles/time-to-first-byte/#optimize-your-servers-application-logic"
			},
			{
				cause: "Network latency between user and server",
				solution: "Use a Content Delivery Network (CDN) to serve your content from a location geographically closer to your users, reducing round-trip time.",
				link: "https://web.dev/articles/time-to-first-byte/#use-a-cdn"
			}
		]
	},
};