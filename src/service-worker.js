/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

//-----------------------------------------------
// Google Workbox
//-----------------------------------------------
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { CacheFirst } from "workbox-strategies";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
//-----------------------------------------------
// import { DEBUG } from "./shared/constants";
const DEBUG = true
import { wpPrefetch } from "./shared/wpPrefetch";
import {
  URL_CDN, // AWS Cloudfront distribution: https://cdn.lawrencemcdaniel.com
  URL_API, // Wordpress REST apis: https://api.lawrencemcdaniel.com
  URL_SITE, // This site: https://lawrencemcdaniel.com

  // Wordpress REST apis
  // -------------------
  URL_API_SPECIALTIES,
  URL_API_PORTFOLIO,
  URL_API_EDUCATION,
  URL_API_RECOMMENDATIONS,
  URL_API_PROJECTS,
  URL_API_CLIENTS,
} from "./shared/constants";

const CACHE_VERSION = "v1";

// ----------------------------------------
// create-react-app generated Workbox code
// ----------------------------------------
clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith("/_")) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// A potentially better way to skipwaiting would be as follows
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
/*
self.addEventListener('install', function(event) {
    event.waitUntil(() => {
      console.log("the installation has finished.");
      self.skipWaiting();
    }
  );
});
*/

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    if (DEBUG)
      console.log("service-worker.js - SKIP_WAITING message received.");
    self.skipWaiting();
  }
});

/*
  --------------------------------------------------------------------------------
  McDaniel Oct-2021
  Custom caching behavior.
  --------------------------------------------------------------------------------
 */

function isImageFile(url) {
  return (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".tif") ||
    url.pathname.endsWith(".svg")
  );
}

function versioned_cached(name) {
  return name + "-" + CACHE_VERSION;
}

// Cache the app manifest
//
// no max, no expiration.
// docs: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-strategies.StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === URL_SITE + "/manifest.json",
  new StaleWhileRevalidate({
    cacheName: versioned_cached("manifest"),
    plugins: [new ExpirationPlugin({})],
  })
);

// Cache api responses with a stale-while-revalidate strategy
// these are small, as they're only the json response objects.
//
// no max, no expiration.
// docs: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-strategies.StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === URL_API,
  new StaleWhileRevalidate({
    cacheName: versioned_cached("api-responses"),
    plugins: [new ExpirationPlugin({})],
  })
);

// Cache cdn content with a CacheFirst strategy
// Set a high maxEntries so that we hopefully cache everything
// but we keep some kind of reasonable ceiling in order to always
// play nice.
//
// the api responses above have their own cache-busting strategy based
// on the ultimate url routes, thus, we can use an arbitrarily
// long cache life for this.
// These are large files, as they're
// the image objects referenced in the api-responses above.
//
// docs: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-strategies.CacheFirst
// A cache first strategy is useful for assets that have been revisioned,
// such as URLs like /styles/example.a8f5f1.css, since they can be cached for long periods of time.
registerRoute(
  ({ url }) => url.origin === URL_CDN,
  new CacheFirst({
    cacheName: versioned_cached("cdn-responses"),
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 500 }),
    ],
  })
);

// Images that are statically served from the React build itself.
// precache, in this case same-origin .png, jpg, svg requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && isImageFile(url),
  new StaleWhileRevalidate({
    cacheName: versioned_cached("static-images"),
    plugins: [new ExpirationPlugin({})],
  })
);

// Cache Google Fonts with a stale-while-revalidate strategy, with
// a maximum number of entries.
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: versioned_cached("google-fonts"),
    plugins: [new ExpirationPlugin({ maxEntries: 20 })],
  })
);

// CDN IMAGE PRECACHING.
// ---------------------
// invoke each image api and call the imagePreFetcher.
// this should result in all static images getting cached
// via a registerRoute below on the CDN responses.
//wpPrefetch(URL_API_SPECIALTIES);    // do me first!!!
//wpPrefetch(URL_API_CLIENTS);
//wpPrefetch(URL_API_EDUCATION);
//wpPrefetch(URL_API_PORTFOLIO);
//wpPrefetch(URL_API_PROJECTS);
//wpPrefetch(URL_API_RECOMMENDATIONS);