import reg from './regexparam';
import parser from './url';

export interface Route {
    keys: string[];
    pattern: RegExp;
    method: string;
    handlers: Function[]
}

export interface Opts {
    onError?(err: any, req: any, res: any): void;
    onNoMatch?(req: any, res: any, next: Function): void;
    server?: any;
}

export interface FindResult<T> {
    params: { [k: string]: string; };
    handlers: T[];
}

export type NextHandler = (req: any, res: any, next: Function) => void;
export type EndHandler = (req: any, res: any) => void;
export type Handler = NextHandler | EndHandler | Router
export type Method = (pattern: string | RegExp, ...handlers: Handler[]) => Router;
export type Middleware = (req: any, res: any, next: Function) => void;


export class Router<T = any> {
    all: Method | any; get: Method | any; head: Method | any; patch: Method | any; options: Method | any; connect: Method | any; delete: Method | any; trace: Method | any; post: Method | any; put: Method | any;

    private routes: Route[] = [];
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

    use(...fns: any): this;
    use(route: string | Middleware, ...fns: any) {
        if (typeof route === 'function') {
            this.useI('/', route as Function, ...fns);
        } else if (route === '/') {
            this.useI(route, ...fns);
        } else {
            this.useI(route,
                (req: any, _: any, next: any) => {
                    if (typeof route === 'string') {
                        let len = route.length;
                        route.indexOf('/') === 0 || len++;
                        req.url = req.url.substring(len) || '/';
                        req.path = req.path.substring(len) || '/';
                    } else {
                        req.url = req.url.replace(route, '') || '/';
                        req.path = req.path.replace(route, '') || '/';
                    }
                    next();
                },
                ...fns.map((fn: any) => fn instanceof Router ? fn.attach : fn),
                (req: any, _: any, next: any) => {
                    req.url = req._parsedUrl.href;
                    req.path = req._parsedUrl.pathname;
                    next()
                }
            );
        }

        return this;
    }

    private onErrorI(err: any, req: any, res: any) {
        let code = (res.statusCode = err.code || err.status || 500);
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
        req.query = info.query || {};
        req.search = info.search;

        try {
            let i = 0, arr: any = obj.handlers.concat(this.onNoMatch), len = arr.length;
            let loop = () => res.finished || (i < len) && arr[i++](req, res, next);
            next = next || ((err: any) => err ? this.onError(err, req, res, next) : loop());
            loop(); // init
        } catch (err) {
            this.onError(err, req, res, next);
        }
    }

    private find(method: string, url: string): FindResult<T> {
        let isHEAD = (method === 'HEAD');
        let i = 0, j = 0, k, tmp: Route, arr = this.routes;
        let matches: any = [], params: any = {}, handlers: any = [];
        for (; i < arr.length; i++) {
            tmp = arr[i];
            if (tmp.method.length === 0 || tmp.method === method || isHEAD && tmp.method === 'GET') {
                if (tmp.keys.length == 0) {
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
            }
        }
        return { params, handlers };
    }
}