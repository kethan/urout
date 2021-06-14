import { Methods } from 'trouter';
import TRouter from 'trouter';
import { parse } from './parse';

export type Promisable<T> = Promise<T> | T;
export interface ParsedURL {
    pathname: string;
    search: string;
    query: Record<string, string | string[]> | void;
    raw: string;
}
export interface IError extends Error {
    code?: number;
    status?: number;
    details?: any;
}

export type NextHandler = (err?: string | IError) => Promisable<void>;
export type ErrorHandler<T extends Request = Request> = (err: string | IError | { code: number }, req: T, res: Response, next: NextHandler) => Promisable<void>;
export type Middleware<T = Request> = (req: T & Request, res: Response, next: NextHandler) => Promisable<void>;

export interface IOptions<T extends Request = Request> {
    onNoMatch?: Middleware<T>;
    onError?: ErrorHandler<T>;
}

export type Response = {
    statusCode?: number;
    statusMessage?: string;
    finished?: boolean;
    end(chunk: any, cb?: any): void;
    redirect?(path: string, options?: any): void;
}

export interface Request {
    url: string;
    method: Methods;
    originalUrl?: string;
    params?: Record<string, string>;
    path?: string;
    search?: string;
    query?: Record<string, string | string[]> | void;
    body?: any;
    routePath?: string;
    _decoded?: true;
    _parsedUrl?: ParsedURL;
}

function onError(err: any, _req: Request, res: Response) {
    if (typeof err === 'string') res.end(err);
    else res.end(err.message);
}

const mount = (fn: any) => fn instanceof Router ? fn.attach : fn;
export class Router<T extends Request = Request> extends TRouter<Middleware<T>> {
    parse: (req: Request, toDecode: boolean) => ParsedURL;
    attach: any;
    onError: ErrorHandler<T>;
    onNoMatch: Middleware<T>;
    constructor(opts: IOptions = {}) {
        super();
        this.parse = parse;
        this.handler = this.handler.bind(this);
        this.onError = opts.onError || onError; // catch-all handler
        this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code: 404 });
        this.attach = (req: Request, res: Response) => setTimeout(this.handler, 0, req, res);
    }
    use(base: RegExp | string, ...fns: (Router<T> | Middleware<T>)[]): this;
    use(...handlers: (Router<T> | Middleware<T>)[]): this;
    use(base: any, ...fns: (Router<T> | Middleware<T>)[]): this {
        if (base === '/') {
            super.use(base, ...fns.map(mount));
        } else if (typeof base === 'function' || base instanceof Router) {
            super.use('/', ...[base, ...fns].map(mount));
        } else {
            super.use(base,
                (req, _, next) => {
                    if (typeof base === 'string') {
                        let len = base.length;
                        base.startsWith('/') || len++;
                        req.url = req.url.substring(len) || '/';
                        req.path = (req.path && req.path.substring(len)) || '/';
                    } else {
                        req.url = req.url.replace(base, '') || '/';
                        req.path = (req.path && req.path.replace(base, '')) || '/';
                    }
                    if (req.url.charAt(0) !== '/') {
                        req.url = '/' + req.url;
                    }
                    next();
                },
                ...fns.map(mount),
                (req, _, next) => {
                    req.path = req._parsedUrl?.pathname || '';
                    req.url = req.path + req._parsedUrl?.search || '';
                    next();
                }
            );
        }
        return this;
    }

    handler(req: T, res: Response, next?: any) {
        let info = this.parse(req, true);
        let obj = this.find(req.method, req.path = info.pathname);

        req.params = obj.params;
        req.originalUrl = req.originalUrl || req.url;
        req.url = info.pathname + info.search;
        req.query = info.query || {};
        req.search = info.search;
        req.routePath = '';

        if (req.params) {
            let routePath = req.originalUrl;
            for (const [key, value] of Object.entries(req.params)) {
                routePath = routePath.replace(value, `:${key}`)
            }
            req.routePath = routePath.replace(req.search, '');
        }

        try {
            let i = 0, arr: any = obj.handlers.concat(this.onNoMatch), len = arr.length;
            let loop = async () => res.finished || (i < len) && arr[i++](req, res, next);
            (next = next || ((err: any) => err ? this.onError(err, req, res, next) : loop().catch(next)))();
        } catch (err) {
            this.onError(err, req, res, next);
        }

    }
}