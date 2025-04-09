/**
 * The `dns.promises` API provides an alternative set of asynchronous DNS methods
 * that return `Promise` objects rather than using callbacks. The API is accessible
 * via `import { promises as dnsPromises } from 'node:dns'` or `import dnsPromises from 'node:dns/promises'`.
 * @since v10.6.0
 */
declare module "dns/promises" {
    import {
        AnyRecord,
        CaaRecord,
        LookupAddress,
        LookupAllOptions,
        LookupOneOptions,
        LookupOptions,
        MxRecord,
        NaptrRecord,
        RecordWithTtl,
        ResolveOptions,
        ResolverOptions,
        ResolveWithTtlOptions,
        SoaRecord,
        SrvRecord,
    } from "node:dns";
    /**
     * Returns an array of IP address strings, formatted according to [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6),
     * that are currently configured for DNS resolution. A string will include a port
     * section if a custom port is used.
     *
     * ```js
     * [
     *   '4.4.4.4',
     *   '2001:4860:4860::8888',
     *   '4.4.4.4:1053',
     *   '[2001:4860:4860::8888]:1053',
     * ]
     * ```
     * @since v10.6.0
     */
    function getServers(): string[];
    /**
     * Resolves a host name (e.g. `'nodejs.org'`) into the first found A (IPv4) or
     * AAAA (IPv6) record. All `option` properties are optional. If `options` is an
     * integer, then it must be `4` or `6` – if `options` is not provided, then IPv4
     * and IPv6 addresses are both returned if found.
     *
     * With the `all` option set to `true`, the `Promise` is resolved with `addresses` being an array of objects with the properties `address` and `family`.
     *
     * On error, the `Promise` is rejected with an [`Error`](https://nodejs.org/docs/latest-v20.x/api/errors.html#class-error) object, where `err.code` is the error code.
     * Keep in mind that `err.code` will be set to `'ENOTFOUND'` not only when
     * the host name does not exist but also when the lookup fails in other ways
     * such as no available file descriptors.
     *
     * [`dnsPromises.lookup()`](https://nodejs.org/docs/latest-v20.x/api/dns.html#dnspromiseslookuphostname-options) does not necessarily have anything to do with the DNS
     * protocol. The implementation uses an operating system facility that can
     * associate names with addresses and vice versa. This implementation can have
     * subtle but important consequences on the behavior of any Node.js program. Please
     * take some time to consult the [Implementation considerations section](https://nodejs.org/docs/latest-v20.x/api/dns.html#implementation-considerations) before
     * using `dnsPromises.lookup()`.
     *
     * Example usage:
     *
     * ```js
     * import dns from 'node:dns';
     * const dnsPromises = dns.promises;
     * const options = {
     *   family: 6,
     *   hints: dns.ADDRCONFIG | dns.V4MAPPED,
     * };
     *
     * dnsPromises.lookup('example.com', options).then((result) => {
     *   console.log('address: %j family: IPv%s', result.address, result.family);
     *   // address: "2606:2800:220:1:248:1893:25c8:1946" family: IPv6
     * });
     *
     * // When options.all is true, the result will be an Array.
     * options.all = true;
     * dnsPromises.lookup('example.com', options).then((result) => {
     *   console.log('addresses: %j', result);
     *   // addresses: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]
     * });
     * ```
     * @since v10.6.0
     */
    function lookup(hostname: string, family: number): Promise<LookupAddress>;
    function lookup(hostname: string, options: LookupOneOptions): Promise<LookupAddress>;
    function lookup(hostname: string, options: LookupAllOptions): Promise<LookupAddress[]>;
    function lookup(hostname: string, options: LookupOptions): Promise<LookupAddress | LookupAddress[]>;
    function lookup(hostname: string): Promise<LookupAddress>;
    /**
     * Resolves the given `address` and `port` into a host name and service using
     * the operating system's underlying `getnameinfo` implementation.
     *
     * If `address` is not a valid IP address, a `TypeError` will be thrown.
     * The `port` will be coerced to a number. If it is not a legal port, a `TypeError` will be thrown.
     *
     * On error, the `Promise` is rejected with an [`Error`](https://nodejs.org/docs/latest-v20.x/api/errors.html#class-error) object, where `err.code` is the error code.
     *
     * ```js
     * import dnsPromises from 'node:dns';
     * dnsPromises.lookupService('127.0.0.1', 22).then((result) => {
     *   console.log(result.hostname, result.service);
     *   // Prints: localhost ssh
     * });
     * ```
     * @since v10.6.0
     */
    function lookupService(
        address: string,
        port: number,
    ): Promise<{
        hostname: string;
        service: string;
    }>;
    /**
     * Uses the DNS protocol to resolve a host name (e.g. `'nodejs.org'`) into an array
     * of the resource records. When successful, the `Promise` is resolved with an
     * array of resource records. The type and structure of individual results vary
     * based on `rrtype`:
     *
     * <omitted>
     *
     * On error, the `Promise` is rejected with an [`Error`](https://nodejs.org/docs/latest-v20.x/api/errors.html#class-error) object, where `err.code`
     * is one of the [DNS error codes](https://nodejs.org/docs/latest-v20.x/api/dns.html#error-codes).
     * @since v10.6.0
     * @param hostname Host name to resolve.
     * @param [rrtype='A'] Resource record type.
     */
    function resolve(hostname: string): Promise<string[]>;
    function resolve(hostname: string, rrtype: "A"): Promise<string[]>;
    function resolve(hostname: string, rrtype: "AAAA"): Promise<string[]>;
    function resolve(hostname: string, rrtype: "ANY"): Promise<AnyRecord[]>;
    function resolve(hostname: string, rrtype: "CAA"): Promise<CaaRecord[]>;
    function resolve(hostname: string, rrtype: "CNAME"): Promise<string[]>;
    function resolve(hostname: string, rrtype: "MX"): Promise<MxRecord[]>;
    function resolve(hostname: string, rrtype: "NAPTR"): Promise<NaptrRecord[]>;
    function resolve(hostname: string, rrtype: "NS"): Promise<string[]>;
    function resolve(hostname: string, rrtype: "PTR"): Promise<string[]>;
    function resolve(hostname: string, rrtype: "SOA"): Promise<SoaRecord>;
    function resolve(hostname: string, rrtype: "SRV"): Promise<SrvRecord[]>;
    function resolve(hostname: string, rrtype: "TXT"): Promise<string[][]>;
    function resolve(
        hostname: string,
        rrtype: string,
    ): Promise<string[] | MxRecord[] | NaptrRecord[] | SoaRecord | SrvRecord[] | string[][] | AnyRecord[]>;
    /**
     * Uses the DNS protocol to resolve IPv4 addresses (`A` records) for the `hostname`. On success, the `Promise` is resolved with an array of IPv4
     * addresses (e.g. `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).
     * @since v10.6.0
     * @param hostname Host name to resolve.
     */
    function resolve4(hostname: string): Promise<string[]>;
    function resolve4(hostname: string, options: ResolveWithTtlOptions): Promise<RecordWithTtl[]>;
    function resolve4(hostname: string, options: ResolveOptions): Promise<string[] | RecordWithTtl[]>;
    /**
     * Uses the DNS protocol to resolve IPv6 addresses (`AAAA` records) for the `hostname`. On success, the `Promise` is resolved with an array of IPv6
     * addresses.
     * @since v10.6.0
     * @param hostname Host name to resolve.
     */
    function resolve6(hostname: string): Promise<string[]>;
    function resolve6(hostname: string, options: ResolveWithTtlOptions): Promise<RecordWithTtl[]>;
    function resolve6(hostname: string, options: ResolveOptions): Promise<string[] | RecordWithTtl[]>;
    /**
     * Uses the DNS protocol to resolve all records (also known as `ANY` or `*` query).
     * On success, the `Promise` is resolved with an array containing various types of
     * records. Each object has a property `type` that indicates the type of the
     * current record. And depending on the `type`, additional properties will be
     * present on the object:
     *
     * <omitted>
     *
     * Here is an example of the result object:
     *
     * ```js
     * [ { type: 'A', address: '127.0.0.1', ttl: 299 },
     *   { type: 'CNAME', value: 'example.com' },
     *   { type: 'MX', exchange: 'alt4.aspmx.l.example.com', priority: 50 },
     *   { type: 'NS', value: 'ns1.example.com' },
     *   { type: 'TXT', entries: [ 'v=spf1 include:_spf.example.com ~all' ] },
     *   { type: 'SOA',
     *     nsname: 'ns1.example.com',
     *     hostmaster: 'admin.example.com',
     *     serial: 156696742,
     *     refresh: 900,
     *     retry: 900,
     *     expire: 1800,
     *     minttl: 60 } ]
     * ```
     * @since v10.6.0
     */
    function resolveAny(hostname: string): Promise<AnyRecord[]>;
    /**
     * Uses the DNS protocol to resolve `CAA` records for the `hostname`. On success,
     * the `Promise` is resolved with an array of objects containing available
     * certification authority authorization records available for the `hostname` (e.g. `[{critical: 0, iodef: 'mailto:pki@example.com'},{critical: 128, issue: 'pki.example.com'}]`).
     * @since v15.0.0, v14.17.0
     */
    function resolveCaa(hostname: string): Promise<CaaRecord[]>;
    /**
     * Uses the DNS protocol to resolve `CNAME` records for the `hostname`. On success,
     * the `Promise` is resolved with an array of canonical name records available for
     * the `hostname` (e.g. `['bar.example.com']`).
     * @since v10.6.0
     */
    function resolveCname(hostname: string): Promise<string[]>;
    /**
     * Uses the DNS protocol to resolve mail exchange records (`MX` records) for the `hostname`. On success, the `Promise` is resolved with an array of objects
     * containing both a `priority` and `exchange` property (e.g.`[{priority: 10, exchange: 'mx.example.com'}, ...]`).
     * @since v10.6.0
     */
    function resolveMx(hostname: string): Promise<MxRecord[]>;
    /**
     * Uses the DNS protocol to resolve regular expression-based records (`NAPTR` records) for the `hostname`. On success, the `Promise` is resolved with an array
     * of objects with the following properties:
     *
     * * `flags`
     * * `service`
     * * `regexp`
     * * `replacement`
     * * `order`
     * * `preference`
     *
     * ```js
     * {
     *   flags: 's',
     *   service: 'SIP+D2U',
     *   regexp: '',
     *   replacement: '_sip._udp.example.com',
     *   order: 30,
     *   preference: 100
     * }
     * ```
     * @since v10.6.0
     */
    function resolveNaptr(hostname: string): Promise<NaptrRecord[]>;
    /**
     * Uses the DNS protocol to resolve name server records (`NS` records) for the `hostname`. On success, the `Promise` is resolved with an array of name server
     * records available for `hostname` (e.g.`['ns1.example.com', 'ns2.example.com']`).
     * @since v10.6.0
     */
    function resolveNs(hostname: string): Promise<string[]>;
    /**
     * Uses the DNS protocol to resolve pointer records (`PTR` records) for the `hostname`. On success, the `Promise` is resolved with an array of strings
     * containing the reply records.
     * @since v10.6.0
     */
    function resolvePtr(hostname: string): Promise<string[]>;
    /**
     * Uses the DNS protocol to resolve a start of authority record (`SOA` record) for
     * the `hostname`. On success, the `Promise` is resolved with an object with the
     * following properties:
     *
     * * `nsname`
     * * `hostmaster`
     * * `serial`
     * * `refresh`
     * * `retry`
     * * `expire`
     * * `minttl`
     *
     * ```js
     * {
     *   nsname: 'ns.example.com',
     *   hostmaster: 'root.example.com',
     *   serial: 2013101809,
     *   refresh: 10000,
     *   retry: 2400,
     *   expire: 604800,
     *   minttl: 3600
     * }
     * ```
     * @since v10.6.0
     */
    function resolveSoa(hostname: string): Promise<SoaRecord>;
    /**
     * Uses the DNS protocol to resolve service records (`SRV` records) for the `hostname`. On success, the `Promise` is resolved with an array of objects with
     * the following properties:
     *
     * * `priority`
     * * `weight`
     * * `port`
     * * `name`
     *
     * ```js
     * {
     *   priority: 10,
     *   weight: 5,
     *   port: 21223,
     *   name: 'service.example.com'
     * }
     * ```
     * @since v10.6.0
     */
    function resolveSrv(hostname: string): Promise<SrvRecord[]>;
    /**
     * Uses the DNS protocol to resolve text queries (`TXT` records) for the `hostname`. On success, the `Promise` is resolved with a two-dimensional array
     * of the text records available for `hostname` (e.g.`[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Each sub-array contains TXT chunks of
     * one record. Depending on the use case, these could be either joined together or
     * treated separately.
     * @since v10.6.0
     */
    function resolveTxt(hostname: string): Promise<string[][]>;
    /**
     * Performs a reverse DNS query that resolves an IPv4 or IPv6 address to an
     * array of host names.
     *
     * On error, the `Promise` is rejected with an [`Error`](https://nodejs.org/docs/latest-v20.x/api/errors.html#class-error) object, where `err.code`
     * is one of the [DNS error codes](https://nodejs.org/docs/latest-v20.x/api/dns.html#error-codes).
     * @since v10.6.0
     */
    function reverse(ip: string): Promise<string[]>;
    /**
     * Get the default value for `verbatim` in {@link lookup} and [dnsPromises.lookup()](https://nodejs.org/docs/latest-v20.x/api/dns.html#dnspromiseslookuphostname-options).
     * The value could be:
     *
     * * `ipv4first`: for `verbatim` defaulting to `false`.
     * * `verbatim`: for `verbatim` defaulting to `true`.
     * @since v20.1.0
     */
    function getDefaultResultOrder(): "ipv4first" | "verbatim";
    /**
     * Sets the IP address and port of servers to be used when performing DNS
     * resolution. The `servers` argument is an array of [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6) formatted
     * addresses. If the port is the IANA default DNS port (53) it can be omitted.
     *
     * ```js
     * dnsPromises.setServers([
     *   '4.4.4.4',
     *   '[2001:4860:4860::8888]',
     *   '4.4.4.4:1053',
     *   '[2001:4860:4860::8888]:1053',
     * ]);
     * ```
     *
     * An error will be thrown if an invalid address is provided.
     *
     * The `dnsPromises.setServers()` method must not be called while a DNS query is in
     * progress.
     *
     * This method works much like [resolve.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html).
     * That is, if attempting to resolve with the first server provided results in a `NOTFOUND` error, the `resolve()` method will _not_ attempt to resolve with
     * subsequent servers provided. Fallback DNS servers will only be used if the
     * earlier ones time out or result in some other error.
     * @since v10.6.0
     * @param servers array of `RFC 5952` formatted addresses
     */
    function setServers(servers: readonly string[]): void;
    /**
     * Set the default value of `order` in `dns.lookup()` and `{@link lookup}`. The value could be:
     *
     * * `ipv4first`: sets default `order` to `ipv4first`.
     * * `ipv6first`: sets default `order` to `ipv6first`.
     * * `verbatim`: sets default `order` to `verbatim`.
     *
     * The default is `verbatim` and [dnsPromises.setDefaultResultOrder()](https://nodejs.org/docs/latest-v20.x/api/dns.html#dnspromisessetdefaultresultorderorder)
     * have higher priority than [`--dns-result-order`](https://nodejs.org/docs/latest-v20.x/api/cli.html#--dns-result-orderorder).
     * When using [worker threads](https://nodejs.org/docs/latest-v20.x/api/worker_threads.html), [`dnsPromises.setDefaultResultOrder()`](https://nodejs.org/docs/latest-v20.x/api/dns.html#dnspromisessetdefaultresultorderorder)
     * from the main thread won't affect the default dns orders in workers.
     * @since v16.4.0, v14.18.0
     * @param order must be `'ipv4first'`, `'ipv6first'` or `'verbatim'`.
     */
    function setDefaultResultOrder(order: "ipv4first" | "ipv6first" | "verbatim"): void;
    // Error codes
    const NODATA: "ENODATA";
    const FORMERR: "EFORMERR";
    const SERVFAIL: "ESERVFAIL";
    const NOTFOUND: "ENOTFOUND";
    const NOTIMP: "ENOTIMP";
    const REFUSED: "EREFUSED";
    const BADQUERY: "EBADQUERY";
    const BADNAME: "EBADNAME";
    const BADFAMILY: "EBADFAMILY";
    const BADRESP: "EBADRESP";
    const CONNREFUSED: "ECONNREFUSED";
    const TIMEOUT: "ETIMEOUT";
    const EOF: "EOF";
    const FILE: "EFILE";
    const NOMEM: "ENOMEM";
    const DESTRUCTION: "EDESTRUCTION";
    const BADSTR: "EBADSTR";
    const BADFLAGS: "EBADFLAGS";
    const NONAME: "ENONAME";
    const BADHINTS: "EBADHINTS";
    const NOTINITIALIZED: "ENOTINITIALIZED";
    const LOADIPHLPAPI: "ELOADIPHLPAPI";
    const ADDRGETNETWORKPARAMS: "EADDRGETNETWORKPARAMS";
    const CANCELLED: "ECANCELLED";

    /**
     * An independent resolver for DNS requests.
     *
     * Creating a new resolver uses the default server settings. Setting
     * the servers used for a resolver using [`resolver.setServers()`](https://nodejs.org/docs/latest-v20.x/api/dns.html#dnspromisessetserversservers) does not affect
     * other resolvers:
     *
     * ```js
     * import { promises } from 'node:dns';
     * const resolver = new promises.Resolver();
     * resolver.setServers(['4.4.4.4']);
     *
     * // This request will use the server at 4.4.4.4, independent of global settings.
     * resolver.resolve4('example.org').then((addresses) => {
     *   // ...
     * });
     *
     * // Alternatively, the same code can be written using async-await style.
     * (async function() {
     *   const addresses = await resolver.resolve4('example.org');
     * })();
     * ```
     *
     * The following methods from the `dnsPromises` API are available:
     *
     * * `resolver.getServers()`
     * * `resolver.resolve()`
     * * `resolver.resolve4()`
     * * `resolver.resolve6()`
     * * `resolver.resolveAny()`
     * * `resolver.resolveCaa()`
     * * `resolver.resolveCname()`
     * * `resolver.resolveMx()`
     * * `resolver.resolveNaptr()`
     * * `resolver.resolveNs()`
     * * `resolver.resolvePtr()`
     * * `resolver.resolveSoa()`
     * * `resolver.resolveSrv()`
     * * `resolver.resolveTxt()`
     * * `resolver.reverse()`
     * * `resolver.setServers()`
     * @since v10.6.0
     */
    class Resolver {
        constructor(options?: ResolverOptions);
        /**
         * Cancel all outstanding DNS queries made by this resolver. The corresponding
         * callbacks will be called with an error with code `ECANCELLED`.
         * @since v8.3.0
         */
        cancel(): void;
        getServers: typeof getServers;
        resolve: typeof resolve;
        resolve4: typeof resolve4;
        resolve6: typeof resolve6;
        resolveAny: typeof resolveAny;
        resolveCaa: typeof resolveCaa;
        resolveCname: typeof resolveCname;
        resolveMx: typeof resolveMx;
        resolveNaptr: typeof resolveNaptr;
        resolveNs: typeof resolveNs;
        resolvePtr: typeof resolvePtr;
        resolveSoa: typeof resolveSoa;
        resolveSrv: typeof resolveSrv;
        resolveTxt: typeof resolveTxt;
        reverse: typeof reverse;
        /**
         * The resolver instance will send its requests from the specified IP address.
         * This allows programs to specify outbound interfaces when used on multi-homed
         * systems.
         *
         * If a v4 or v6 address is not specified, it is set to the default and the
         * operating system will choose a local address automatically.
         *
         * The resolver will use the v4 local address when making requests to IPv4 DNS
         * servers, and the v6 local address when making requests to IPv6 DNS servers.
         * The `rrtype` of resolution requests has no impact on the local address used.
         * @since v15.1.0, v14.17.0
         * @param [ipv4='0.0.0.0'] A string representation of an IPv4 address.
         * @param [ipv6='::0'] A string representation of an IPv6 address.
         */
        setLocalAddress(ipv4?: string, ipv6?: string): void;
        setServers: typeof setServers;
    }
}
declare module "node:dns/promises" {
    export * from "dns/promises";
}
taining two properties:
         */
        readv(buffers: readonly NodeJS.ArrayBufferView[], position?: number): Promise<ReadVResult>;
        /**
         * Closes the file handle after waiting for any pending operation on the handle to
         * complete.
         *
         * ```js
         * import { open } from 'node:fs/promises';
         *
         * let filehandle;
         * try {
         *   filehandle = await open('thefile.txt', 'r');
         * } finally {
         *   await filehandle?.close();
         * }
         * ```
         * @since v10.0.0
         * @return Fulfills with `undefined` upon success.
         */
        close(): Promise<void>;
        /**
         * An alias for {@link FileHandle.close()}.
         * @since v20.4.0
         */
        [Symbol.asyncDispose](): Promise<void>;
    }
    const constants: typeof fsConstants;
    /**
     * Tests a user's permissions for the file or directory specified by `path`.
     * The `mode` argument is an optional integer that specifies the accessibility
     * checks to be performed. `mode` should be either the value `fs.constants.F_OK` or a mask consisting of the bitwise OR of any of `fs.constants.R_OK`, `fs.constants.W_OK`, and `fs.constants.X_OK`
     * (e.g.`fs.constants.W_OK | fs.constants.R_OK`). Check `File access constants` for
     * possible values of `mode`.
     *
     * If the accessibility check is successful, the promise is fulfilled with no
     * value. If any of the accessibility checks fail, the promise is rejected
     * with an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object. The following example checks if the file`/etc/passwd` can be read and
     * written by the current process.
     *
     * ```js
     * import { access, constants } from 'node:fs/promises';
     *
     * try {
     *   await access('/etc/passwd', constants.R_OK | constants.W_OK);
     *   console.log('can access');
     * } catch {
     *   console.error('cannot access');
     * }
     * ```
     *
     * Using `fsPromises.access()` to check for the accessibility of a file before
     * calling `fsPromises.open()` is not recommended. Doing so introduces a race
     * condition, since other processes may change the file's state between the two
     * calls. Instead, user code should open/read/write the file directly and handle
     * the error raised if the file is not accessible.
     * @since v10.0.0
     * @param [mode=fs.constants.F_OK]
     * @return Fulfills with `undefined` upon success.
     */
    function access(path: PathLike, mode?: number): Promise<void>;
    /**
     * Asynchronously copies `src` to `dest`. By default, `dest` is overwritten if it
     * already exists.
     *
     * No guarantees are made about the atomicity of the copy operation. If an
     * error occurs after the destination file has been opened for writing, an attempt
     * will be made to remove the destination.
     *
     * ```js
     * import { copyFile, constants } from 'node:fs/promises';
     *
     * try {
     *   await copyFile('source.txt', 'destination.txt');
     *   console.log('source.txt was copied to destination.txt');
     * } catch {
     *   console.error('The file could not be copied');
     * }
     *
     * // By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
     * try {
     *   await copyFile('source.txt', 'destination.txt', constants.COPYFILE_EXCL);
     *   console.log('source.txt was copied to destination.txt');
     * } catch {
     *   console.error('The file could not be copied');
     * }
     * ```
     * @since v10.0.0
     * @param src source filename to copy
     * @param dest destination filename of the copy operation
     * @param [mode=0] Optional modifiers that specify the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g.
     * `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`)
     * @return Fulfills with `undefined` upon success.
     */
    function copyFile(src: PathLike, dest: PathLike, mode?: number): Promise<void>;
    /**
     * Opens a `FileHandle`.
     *
     * Refer to the POSIX [`open(2)`](http://man7.org/linux/man-pages/man2/open.2.html) documentation for more detail.
     *
     * Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented
     * by [Naming Files, Paths, and Namespaces](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file). Under NTFS, if the filename contains
     * a colon, Node.js will open a file system stream, as described by [this MSDN page](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).
     * @since v10.0.0
     * @param [flags='r'] See `support of file system `flags``.
     * @param [mode=0o666] Sets the file mode (permission and sticky bits) if the file is created.
     * @return Fulfills with a {FileHandle} object.
     */
    function open(path: PathLike, flags?: string | number, mode?: Mode): Promise<FileHandle>;
    /**
     * Renames `oldPath` to `newPath`.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function rename(oldPath: PathLike, newPath: PathLike): Promise<void>;
    /**
     * Truncates (shortens or extends the length) of the content at `path` to `len` bytes.
     * @since v10.0.0
     * @param [len=0]
     * @return Fulfills with `undefined` upon success.
     */
    function truncate(path: PathLike, len?: number): Promise<void>;
    /**
     * Removes the directory identified by `path`.
     *
     * Using `fsPromises.rmdir()` on a file (not a directory) results in the
     * promise being rejected with an `ENOENT` error on Windows and an `ENOTDIR` error on POSIX.
     *
     * To get a behavior similar to the `rm -rf` Unix command, use `fsPromises.rm()` with options `{ recursive: true, force: true }`.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function rmdir(path: PathLike, options?: RmDirOptions): Promise<void>;
    /**
     * Removes files and directories (modeled on the standard POSIX `rm` utility).
     * @since v14.14.0
     * @return Fulfills with `undefined` upon success.
     */
    function rm(path: PathLike, options?: RmOptions): Promise<void>;
    /**
     * Asynchronously creates a directory.
     *
     * The optional `options` argument can be an integer specifying `mode` (permission
     * and sticky bits), or an object with a `mode` property and a `recursive` property indicating whether parent directories should be created. Calling `fsPromises.mkdir()` when `path` is a directory
     * that exists results in a
     * rejection only when `recursive` is false.
     *
     * ```js
     * import { mkdir } from 'node:fs/promises';
     *
     * try {
     *   const projectFolder = new URL('./test/project/', import.meta.url);
     *   const createDir = await mkdir(projectFolder, { recursive: true });
     *
     *   console.log(`created ${createDir}`);
     * } catch (err) {
     *   console.error(err.message);
     * }
     * ```
     * @since v10.0.0
     * @return Upon success, fulfills with `undefined` if `recursive` is `false`, or the first directory path created if `recursive` is `true`.
     */
    function mkdir(
        path: PathLike,
        options: MakeDirectoryOptions & {
            recursive: true;
        },
    ): Promise<string | undefined>;
    /**
     * Asynchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    function mkdir(
        path: PathLike,
        options?:
            | Mode
            | (MakeDirectoryOptions & {
                recursive?: false | undefined;
            })
            | null,
    ): Promise<void>;
    /**
     * Asynchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    function mkdir(path: PathLike, options?: Mode | MakeDirectoryOptions | null): Promise<string | undefined>;
    /**
     * Reads the contents of a directory.
     *
     * The optional `options` argument can be a string specifying an encoding, or an
     * object with an `encoding` property specifying the character encoding to use for
     * the filenames. If the `encoding` is set to `'buffer'`, the filenames returned
     * will be passed as `Buffer` objects.
     *
     * If `options.withFileTypes` is set to `true`, the returned array will contain `fs.Dirent` objects.
     *
     * ```js
     * import { readdir } from 'node:fs/promises';
     *
     * try {
     *   const files = await readdir(path);
     *   for (const file of files)
     *     console.log(file);
     * } catch (err) {
     *   console.error(err);
     * }
     * ```
     * @since v10.0.0
     * @return Fulfills with an array of the names of the files in the directory excluding `'.'` and `'..'`.
     */
    function readdir(
        path: PathLike,
        options?:
            | (ObjectEncodingOptions & {
                withFileTypes?: false | undefined;
                recursive?: boolean | undefined;
            })
            | BufferEncoding
            | null,
    ): Promise<string[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function readdir(
        path: PathLike,
        options:
            | {
                encoding: "buffer";
                withFileTypes?: false | undefined;
                recursive?: boolean | undefined;
            }
            | "buffer",
    ): Promise<Buffer[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function readdir(
        path: PathLike,
        options?:
            | (ObjectEncodingOptions & {
                withFileTypes?: false | undefined;
                recursive?: boolean | undefined;
            })
            | BufferEncoding
            | null,
    ): Promise<string[] | Buffer[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options If called with `withFileTypes: true` the result data will be an array of Dirent.
     */
    function readdir(
        path: PathLike,
        options: ObjectEncodingOptions & {
            withFileTypes: true;
            recursive?: boolean | undefined;
        },
    ): Promise<Dirent[]>;
    /**
     * Reads the contents of the symbolic link referred to by `path`. See the POSIX [`readlink(2)`](http://man7.org/linux/man-pages/man2/readlink.2.html) documentation for more detail. The promise is
     * fulfilled with the`linkString` upon success.
     *
     * The optional `options` argument can be a string specifying an encoding, or an
     * object with an `encoding` property specifying the character encoding to use for
     * the link path returned. If the `encoding` is set to `'buffer'`, the link path
     * returned will be passed as a `Buffer` object.
     * @since v10.0.0
     * @return Fulfills with the `linkString` upon success.
     */
    function readlink(path: PathLike, options?: ObjectEncodingOptions | BufferEncoding | null): Promise<string>;
    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function readlink(path: PathLike, options: BufferEncodingOption): Promise<Buffer>;
    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function readlink(path: PathLike, options?: ObjectEncodingOptions | string | null): Promise<string | Buffer>;
    /**
     * Creates a symbolic link.
     *
     * The `type` argument is only used on Windows platforms and can be one of `'dir'`, `'file'`, or `'junction'`. If the `type` argument is not a string, Node.js will
     * autodetect `target` type and use `'file'` or `'dir'`. If the `target` does not
     * exist, `'file'` will be used. Windows junction points require the destination
     * path to be absolute. When using `'junction'`, the `target` argument will
     * automatically be normalized to absolute path. Junction points on NTFS volumes
     * can only point to directories.
     * @since v10.0.0
     * @param [type='null']
     * @return Fulfills with `undefined` upon success.
     */
    function symlink(target: PathLike, path: PathLike, type?: string | null): Promise<void>;
    /**
     * Equivalent to `fsPromises.stat()` unless `path` refers to a symbolic link,
     * in which case the link itself is stat-ed, not the file that it refers to.
     * Refer to the POSIX [`lstat(2)`](http://man7.org/linux/man-pages/man2/lstat.2.html) document for more detail.
     * @since v10.0.0
     * @return Fulfills with the {fs.Stats} object for the given symbolic link `path`.
     */
    function lstat(
        path: PathLike,
        opts?: StatOptions & {
            bigint?: false | undefined;
        },
    ): Promise<Stats>;
    function lstat(
        path: PathLike,
        opts: StatOptions & {
            bigint: true;
        },
    ): Promise<BigIntStats>;
    function lstat(path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>;
    /**
     * @since v10.0.0
     * @return Fulfills with the {fs.Stats} object for the given `path`.
     */
    function stat(
        path: PathLike,
        opts?: StatOptions & {
            bigint?: false | undefined;
        },
    ): Promise<Stats>;
    function stat(
        path: PathLike,
        opts: StatOptions & {
            bigint: true;
        },
    ): Promise<BigIntStats>;
    function stat(path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>;
    /**
     * @since v19.6.0, v18.15.0
     * @return Fulfills with the {fs.StatFs} object for the given `path`.
     */
    function statfs(
        path: PathLike,
        opts?: StatFsOptions & {
            bigint?: false | undefined;
        },
    ): Promise<StatsFs>;
    function statfs(
        path: PathLike,
        opts: StatFsOptions & {
            bigint: true;
        },
    ): Promise<BigIntStatsFs>;
    function statfs(path: PathLike, opts?: StatFsOptions): Promise<StatsFs | BigIntStatsFs>;
    /**
     * Creates a new link from the `existingPath` to the `newPath`. See the POSIX [`link(2)`](http://man7.org/linux/man-pages/man2/link.2.html) documentation for more detail.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function link(existingPath: PathLike, newPath: PathLike): Promise<void>;
    /**
     * If `path` refers to a symbolic link, then the link is removed without affecting
     * the file or directory to which that link refers. If the `path` refers to a file
     * path that is not a symbolic link, the file is deleted. See the POSIX [`unlink(2)`](http://man7.org/linux/man-pages/man2/unlink.2.html) documentation for more detail.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function unlink(path: PathLike): Promise<void>;
    /**
     * Changes the permissions of a file.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function chmod(path: PathLike, mode: Mode): Promise<void>;
    /**
     * Changes the permissions on a symbolic link.
     *
     * This method is only implemented on macOS.
     * @deprecated Since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function lchmod(path: PathLike, mode: Mode): Promise<void>;
    /**
     * Changes the ownership on a symbolic link.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function lchown(path: PathLike, uid: number, gid: number): Promise<void>;
    /**
     * Changes the access and modification times of a file in the same way as `fsPromises.utimes()`, with the difference that if the path refers to a
     * symbolic link, then the link is not dereferenced: instead, the timestamps of
     * the symbolic link itself are changed.
     * @since v14.5.0, v12.19.0
     * @return Fulfills with `undefined` upon success.
     */
    function lutimes(path: PathLike, atime: TimeLike, mtime: TimeLike): Promise<void>;
    /**
     * Changes the ownership of a file.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function chown(path: PathLike, uid: number, gid: number): Promise<void>;
    /**
     * Change the file system timestamps of the object referenced by `path`.
     *
     * The `atime` and `mtime` arguments follow these rules:
     *
     * * Values can be either numbers representing Unix epoch time, `Date`s, or a
     * numeric string like `'123456789.0'`.
     * * If the value can not be converted to a number, or is `NaN`, `Infinity`, or `-Infinity`, an `Error` will be thrown.
     * @since v10.0.0
     * @return Fulfills with `undefined` upon success.
     */
    function utimes(path: PathLike, atime: TimeLike, mtime: TimeLike): Promise<void>;
    /**
     * Determines the actual location of `path` using the same semantics as the `fs.realpath.native()` function.
     *
     * Only paths that can be converted to UTF8 strings are supported.
     *
     * The optional `options` argument can be a string specifying an encoding, or an
     * object with an `encoding` property specifying the character encoding to use for
     * the path. If the `encoding` is set to `'buffer'`, the path returned will be
     * passed as a `Buffer` object.
     *
     * On Linux, when Node.js is linked against musl libc, the procfs file system must
     * be mounted on `/proc` in order for this function to work. Glibc does not have
     * this restriction.
     * @since v10.0.0
     * @return Fulfills with the resolved path upon success.
     */
    function realpath(path: PathLike, options?: ObjectEncodingOptions | BufferEncoding | null): Promise<string>;
    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function realpath(path: PathLike, options: BufferEncodingOption): Promise<Buffer>;
    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function realpath(
        path: PathLike,
        options?: ObjectEncodingOptions | BufferEncoding | null,
    ): Promise<string | Buffer>;
    /**
     * Creates a unique temporary directory. A unique directory name is generated by
     * appending six random characters to the end of the provided `prefix`. Due to
     * platform inconsistencies, avoid trailing `X` characters in `prefix`. Some
     * platforms, notably the BSDs, can return more than six random characters, and
     * replace trailing `X` characters in `prefix` with random characters.
     *
     * The optional `options` argument can be a string specifying an encoding, or an
     * object with an `encoding` property specifying the character encoding to use.
     *
     * ```js
     * import { mkdtemp } from 'node:fs/promises';
     * import { join } from 'node:path';
     * import { tmpdir } from 'node:os';
     *
     * try {
     *   await mkdtemp(join(tmpdir(), 'foo-'));
     * } catch (err) {
     *   console.error(err);
     * }
     * ```
     *
     * The `fsPromises.mkdtemp()` method will append the six randomly selected
     * characters directly to the `prefix` string. For instance, given a directory `/tmp`, if the intention is to create a temporary directory _within_ `/tmp`, the `prefix` must end with a trailing
     * platform-specific path separator
     * (`import { sep } from 'node:path'`).
     * @since v10.0.0
     * @return Fulfills with a string containing the file system path of the newly created temporary directory.
     */
    function mkdtemp(prefix: string, options?: ObjectEncodingOptions | BufferEncoding | null): Promise<string>;
    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required `prefix` to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function mkdtemp(prefix: string, options: BufferEncodingOption): Promise<Buffer>;
    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required `prefix` to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    function mkdtemp(prefix: string, options?: ObjectEncodingOptions | BufferEncoding | null): Promise<string | Buffer>;
    /**
     * Asynchronously writes data to a file, replacing the file if it already exists. `data` can be a string, a buffer, an
     * [AsyncIterable](https://tc39.github.io/ecma262/#sec-asynciterable-interface), or an
     * [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) object.
     *
     * The `encoding` option is ignored if `data` is a buffer.
     *
     * If `options` is a string, then it specifies the encoding.
     *
     * The `mode` option only affects the newly created file. See `fs.open()` for more details.
     *
     * Any specified `FileHandle` has to support writing.
     *
     * It is unsafe to use `fsPromises.writeFile()` multiple times on the same file
     * without waiting for the promise to be settled.
     *
     * Similarly to `fsPromises.readFile` \- `fsPromises.writeFile` is a convenience
     * method that performs multiple `write` calls internally to write the buffer
     * passed to it. For performance sensitive code consider using `fs.createWriteStream()` or `filehandle.createWriteStream()`.
     *
     * It is possible to use an `AbortSignal` to cancel an `fsPromises.writeFile()`.
     * Cancelation is "best effort", and some amount of data is likely still
     * to be written.
     *
     * ```js
     * import { writeFile } from 'node:fs/promises';
     * import { Buffer } from 'node:buffer';
     *
     * try {
     *   const controller = new AbortController();
     *   const { signal } = controller;
     *   const data = new Uint8Array(Buffer.from('Hello Node.js'));
     *   const promise = writeFile('message.txt', data, { signal });
     *
     *   // Abort the request before the promise settles.
     *   controller.abort();
     *
     *   await promise;
     * } catch (err) {
     *   // When a request is aborted - err is an AbortError
     *   console.error(err);
     * }
     * ```
     *
     * Aborting an ongoing request does not abort individual operating
     * system requests but rather the internal buffering `fs.writeFile` performs.
     * @since v10.0.0
     * @param file filename or `FileHandle`
     * @return Fulfills with `undefined` upon success.
     */
    function writeFile(
        file: PathLike | FileHandle,
        data:
            | string
            | NodeJS.ArrayBufferView
            | Iterable<string | NodeJS.ArrayBufferView>
            | AsyncIterable<string | NodeJS.ArrayBufferView>
            | Stream,
        options?:
            | (ObjectEncodingOptions & {
                mode?: Mode | undefined;
                flag?: OpenMode | undefined;
                /**
                 * If all data is successfully written to the file, and `flush`
                 * is `true`, `filehandle.sync()` is used to flush the data.
                 * @default false
                 */
                flush?: boolean | undefined;
            } & Abortable)
            | BufferEncoding
            | null,
    ): Promise<void>;
    /**
     * Asynchronously append data to a file, creating the file if it does not yet
     * exist. `data` can be a string or a `Buffer`.
     *
     * If `options` is a string, then it specifies the `encoding`.
     *
     * The `mode` option only affects the newly created file. See `fs.open()` for more details.
     *
     * The `path` may be specified as a `FileHandle` that has been opened
     * for appending (using `fsPromises.open()`).
     * @since v10.0.0
     * @param path filename or {FileHandle}
     * @return Fulfills with `undefined` upon success.
     */
    function appendFile(
        path: PathLike | FileHandle,
        data: string | Uint8Array,
        options?: (ObjectEncodingOptions & FlagAndOpenMode & { flush?: boolean | undefined }) | BufferEncoding | null,
    ): Promise<void>;
    /**
     * Asynchronously reads the entire contents of a file.
     *
     * If no encoding is specified (using `options.encoding`), the data is returned
     * as a `Buffer` object. Otherwise, the data will be a string.
     *
     * If `options` is a string, then it specifies the encoding.
     *
     * When the `path` is a directory, the behavior of `fsPromises.readFile()` is
     * platform-specific. On macOS, Linux, and Windows, the promise will be rejected
     * with an error. On FreeBSD, a representation of the directory's contents will be
     * returned.
     *
     * An example of reading a `package.json` file located in the same directory of the
     * running code:
     *
     * ```js
     * import { readFile } from 'node:fs/promises';
     * try {
     *   const filePath = new URL('./package.json', import.meta.url);
     *   const contents = await readFile(filePath, { encoding: 'utf8' });
     *   console.log(contents);
     * } catch (err) {
     *   console.error(err.message);
     * }
     * ```
     *
     * It is possible to abort an ongoing `readFile` using an `AbortSignal`. If a
     * request is aborted the promise returned is rejected with an `AbortError`:
     *
     * ```js
     * import { readFile } from 'node:fs/promises';
     *
     * try {
     *   const controller = new AbortController();
     *   const { signal } = controller;
     *   const promise = readFile(fileName, { signal });
     *
     *   // Abort the request before the promise settles.
     *   controller.abort();
     *
     *   await promise;
     * } catch (err) {
     *   // When a request is aborted - err is an AbortError
     *   console.error(err);
     * }
     * ```
     *
     * Aborting an ongoing request does not abort individual operating
     * system requests but rather the internal buffering `fs.readFile` performs.
     *
     * Any specified `FileHandle` has to support reading.
     * @since v10.0.0
     * @param path filename or `FileHandle`
     * @return Fulfills with the contents of the file.
     */
    function readFile(
        path: PathLike | FileHandle,
        options?:
            | ({
                encoding?: null | undefined;
                flag?: OpenMode | undefined;
            } & Abortable)
            | null,
    ): Promise<Buffer>;
    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * If a `FileHandle` is provided, the underlying file will _not_ be closed automatically.
     * @param options An object that may contain an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    function readFile(
        path: PathLike | FileHandle,
        options:
            | ({
                encoding: BufferEncoding;
                flag?: OpenMode | undefined;
            } & Abortable)
            | BufferEncoding,
    ): Promise<string>;
    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * If a `FileHandle` is provided, the underlying file will _not_ be closed automatically.
     * @param options An object that may contain an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    function readFile(
        path: PathLike | FileHandle,
        options?:
            | (
                & ObjectEncodingOptions
                & Abortable
                & {
                    flag?: OpenMode | undefined;
                }
            )
            | BufferEncoding
            | null,
    ): Promise<string | Buffer>;
    /**
     * Asynchronously open a directory for iterative scanning. See the POSIX [`opendir(3)`](http://man7.org/linux/man-pages/man3/opendir.3.html) documentation for more detail.
     *
     * Creates an `fs.Dir`, which contains all further functions for reading from
     * and cleaning up the directory.
     *
     * The `encoding` option sets the encoding for the `path` while opening the
     * directory and subsequent read operations.
     *
     * Example using async iteration:
     *
     * ```js
     * import { opendir } from 'node:fs/promises';
     *
     * try {
     *   const dir = await opendir('./');
     *   for await (const dirent of dir)
     *     console.log(dirent.name);
     * } catch (err) {
     *   console.error(err);
     * }
     * ```
     *
     * When using the async iterator, the `fs.Dir` object will be automatically
     * closed after the iterator exits.
     * @since v12.12.0
     * @return Fulfills with an {fs.Dir}.
     */
    function opendir(path: PathLike, options?: OpenDirOptions): Promise<Dir>;
    /**
     * Returns an async iterator that watches for changes on `filename`, where `filename`is either a file or a directory.
     *
     * ```js
     * import { watch } from 'node:fs/promises';
     *
     * const ac = new AbortController();
     * const { signal } = ac;
     * setTimeout(() => ac.abort(), 10000);
     *
     * (async () => {
     *   try {
     *     const watcher = watch(__filename, { signal });
     *     for await (const event of watcher)
     *       console.log(event);
     *   } catch (err) {
     *     if (err.name === 'AbortError')
     *       return;
     *     throw err;
     *   }
     * })();
     * ```
     *
     * On most platforms, `'rename'` is emitted whenever a filename appears or
     * disappears in the directory.
     *
     * All the `caveats` for `fs.watch()` also apply to `fsPromises.watch()`.
     * @since v15.9.0, v14.18.0
     * @return of objects with the properties:
     */
    function watch(
        filename: PathLike,
        options:
            | (WatchOptions & {
                encoding: "buffer";
            })
            | "buffer",
    ): AsyncIterable<FileChangeInfo<Buffer>>;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    function watch(filename: PathLike, options?: WatchOptions | BufferEncoding): AsyncIterable<FileChangeInfo<string>>;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    function watch(
        filename: PathLike,
        options: WatchOptions | string,
    ): AsyncIterable<FileChangeInfo<string>> | AsyncIterable<FileChangeInfo<Buffer>>;
    /**
     * Asynchronously copies the entire directory structure from `src` to `dest`,
     * including subdirectories and files.
     *
     * When copying a directory to another directory, globs are not supported and
     * behavior is similar to `cp dir1/ dir2/`.
     * @since v16.7.0
     * @experimental
     * @param src source path to copy.
     * @param dest destination path to copy to.
     * @return Fulfills with `undefined` upon success.
     */
    function cp(source: string | URL, destination: string | URL, opts?: CopyOptions): Promise<void>;
    /**
     * Retrieves the files matching the specified pattern.
     */
    function glob(pattern: string | string[]): NodeJS.AsyncIterator<string>;
    function glob(
        pattern: string | string[],
        opt: GlobOptionsWithFileTypes,
    ): NodeJS.AsyncIterator<Dirent>;
    function glob(
        pattern: string | string[],
        opt: GlobOptionsWithoutFileTypes,
    ): NodeJS.AsyncIterator<string>;
    function glob(
        pattern: string | string[],
        opt: GlobOptions,
    ): NodeJS.AsyncIterator<Dirent | string>;
}
declare module "node:fs/promises" {
    export * from "fs/promises";
}
