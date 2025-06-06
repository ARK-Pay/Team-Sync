'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var module$1 = require('module');
var url = require('url');
var path = require('path');

/**
 * @fileoverview Universal module importer
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('module-importer.cjs', document.baseURI).href)));
const __dirname$1 = path.dirname(__filename$1);
const require$1 = module$1.createRequire(__dirname$1 + "/");
const { ModuleImporter } = require$1("./module-importer.cjs");

exports.ModuleImporter = ModuleImporter;
,
 * then it will start the search in /user/nzakas/foo.
 * @param {string} directory The directory to check. 
 * @returns {string} The normalized directory.
 */
function normalizeDirectory(directory) {
    if (!SLASHES.has(directory[directory.length-1])) {
        return directory + "/";
    }

    return directory;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Class for importing both CommonJS and ESM modules in Node.js.
 */
exports.ModuleImporter = class ModuleImporter {

    /**
     * Creates a new instance.
     * @param {string} [cwd] The current working directory to resolve from. 
     */
    constructor(cwd = process.cwd()) {

        /**
         * The base directory from which paths should be resolved.
         * @type {string}
         */
        this.cwd = normalizeDirectory(cwd);
    }

    /**
     * Resolves a module based on its name or location.
     * @param {string} specifier Either an npm package name or
     *      relative file path.
     * @returns {string|undefined} The location of the import.
     * @throws {Error} If specifier cannot be located.
     */
    resolve(specifier) {
        const require = createRequire(this.cwd);
        return require.resolve(specifier);
    }

    /**
     * Imports a module based on its name or location.
     * @param {string} specifier Either an npm package name or
     *      relative file path.
     * @returns {Promise<object>} The module's object.
     */
    import(specifier) {
        const location = this.resolve(specifier);
        return import(pathToFileURL(location).href);
    }

}
