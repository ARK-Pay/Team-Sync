import { PrecacheRouteOptions } from '../_types.js';
import '../_version.js';
/**
 * This function will take the request URL and manipulate it based on the
 * configuration options.
 *
 * @param {string} url
 * @param {Object} options
 * @return {string} Returns the URL in the cache that matches the request,
 * if possible.
 *
 * @private
 */
export declare const getCacheKeyForURL: (url: string, options: PrecacheRouteOptions) => string | void;
nal URL with the addition of a query parameter used for keeping track of
 * the revision info.
 *
 * @param {string} url The URL whose cache key to look up.
 * @return {string} The cache key that corresponds to that URL.
 *
 * @memberof workbox-precaching
 */
declare function getCacheKeyForURL(url: string): string | undefined;
export { getCacheKeyForURL };
