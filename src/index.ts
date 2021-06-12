import reg from './regexparam';
import parser from './url';
export interface Opts {
    onError?(err: any, req: any, res: any): void;
    onNoMatch?(req: any, res: any, next: Function): void;
    server?: any;
}

export type NextHandler = (req: any, res: any, next: Function) => void;
export type EndHandler = (req: any, res: any) => void;
export type Handler = NextHandler | EndHandler | Router
export type Method = (pattern: string | RegExp, ...handlers: Handler[]) => Router;

export class Router {
    all: Method | any; get: Method | any; head: Method | any; patch: Method | any; options: Method | any; connect: Method | any; delete: Method | any; trace: Method | any; post: Method | any; put: Method | any;
    private mount = (fn: any) => fn instanceof Router ? fn.attach : fn
    private routes: any = [];
    private parse: Function;
    private onError: any;
    private onNoMatch: any;
    private attach: Function;
    constructor(opts: Opts = {}) {
        this.parse = parser;
        this.handler = this.handler.bind(this);
        this.onError = opts.onError || this.onErrorI;
        this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code: 404 });
        this.attach = (req: any, res: any) => setTimeout(this.handler, 0, req, res);
        this.all = this.add.bind(this, '');
        this.get = this.add.bind(this, 'GET');
        this.head = this.add.bind(this, 'HEAD');
        this.patch = this.add.bind(this, 'PATCH');
        this.options = this.add.bind(this, 'OPTIONS');
        this.connect = this.add.bind(this, 'CONNECT');
        this.delete = this.add.bind(this, 'DELETE');
        this.trace = this.add.bind(this, 'TRACE');
        this.post = this.add.bind(this, 'POST');
        this.put = this.add.bind(this, 'PUT');
    }

    private useI(route: string, ...fns: Function[] | any) {
        let handlers = [].concat.apply([], fns);
        let { keys, pattern } = reg(route, true);
        this.routes.push({ keys, pattern, method: '', handlers });
        return this;
    }

    use(route: any, ...fns: any) {
        if (route === '/') {
            this.useI(route, fns.map(this.mount));
        }
        else if (typeof route === 'function' || route instanceof Router) {
            this.useI('/', [route, ...fns].map(this.mount));
        } else {
            this.useI(route,
                (req: any, _: any, next: any) => {
                    if (typeof route === 'string') {
                        let len = route.length;
                        route.startsWith('/') || len++;
                        req.url = req.url.substring(len) || '/';
                        req.path = req.path.substring(len) || '/';
                    } else {
                        req.url = req.url.replace(route, '') || '/';
                        req.path = req.path.replace(route, '') || '/';
                    }
                    if (req.url.charAt(0) !== '/') {
                        req.url = '/' + req.url;
                    }
                    next();
                },
                ...fns.map(this.mount),
                (req: any, _: any, next: any) => {
                    req.path = req._parsedUrl.pathname;
                    req.url = req.path + req._parsedUrl.search;
                    next()
                }
            );
        }

        return this;
    }

    private onErrorI(err: any, _req: any, res: any) {
        res.end(err.length && err || err.message);
    }

    add(method: string, route?: string, ...fns: Function[] | any) {
        let { keys, pattern } = reg(route);
        let handlers = [].concat.apply([], fns);
        this.routes.push({ keys, pattern, method, handlers });
        return this;
    }

    handler(req: any, res: any, next?: any) {
        let info = this.parse(req, true);
        let obj = this.find(req.method, req.path = info.pathname);

        req.params = obj.params;
        req.originalUrl = req.originalUrl || req.url;
        req.url = info.pathname + info.search;
        req.query = info.query || {};
        req.search = info.search;
        req.routePath = req.originalUrl;
        if (req.params) {
            for (const [key, value] of Object.entries(req.params)) {
                req.routePath = req.routePath.replace(value, `:${key}`)
            }
            req.routePath = req.routePath.replace(req.search, '');
        }
        try {
            let i = 0, arr: any = obj.handlers.concat(this.onNoMatch), len = arr.length;
            let loop = async () => res.finished || (i < len) && arr[i++](req, res, next);
            (next = next || ((err: any) => err ? this.onError(err, req, res, next) : loop().catch(next)))();
        } catch (err) {
            this.onError(err, req, res, next);
        }
    }

    private find(method: string, url: string) {
        let isHEAD = (method === 'HEAD');
        let i = 0, j = 0, k, tmp: any, arr = this.routes;
        let matches: any = [], params: any = {}, handlers: any = [];
        for (; i < arr.length; i++) {
            tmp = arr[i];
            if (tmp.method.length === 0 || tmp.method === method || isHEAD && tmp.method === 'GET') {
                if (tmp.keys === false) {
                    matches = tmp.pattern.exec(url);
                    if (matches === null) continue;
                    if (matches.groups !== void 0) for (k in matches.groups) params[k] = matches.groups[k];
                    tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
                } else if (tmp.keys.length > 0) {
                    matches = tmp.pattern.exec(url);
                    if (matches === null) continue;
                    for (j = 0; j < tmp.keys.length;) params[tmp.keys[j]] = matches[++j];
                    tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
                } else if (tmp.pattern.test(url)) {
                    tmp.handlers.length > 1 ? (handlers = handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
                }
            } // else not a match
        }
        return { params, handlers };
    }
}