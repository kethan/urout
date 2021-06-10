type Promisable<T> = Promise<T> | T;

export interface IError extends Error {
    code?: number;
    status?: number;
    details?: any;
    length?: number;
}

export type NextHandler = (err?: string | IError) => Promisable<void>;
export type ErrorHandler<T extends Request = Request> = (err: string | IError, req: T, res: Response, next: NextHandler) => Promisable<void>;
export type Middleware<T extends Request> = (req: T & Request, res: Response, next: NextHandler) => Promisable<void>;
export type MiddlewareOptionalNext<T extends Request> = (req: T & Request, res: Response, next?: NextHandler) => Promisable<void>;

export interface Route {
    keys: string[];
    pattern: RegExp;
    method: string;
    handlers: Function[]
}
export interface Request {
    method: string;
    url: string;
    path?: string;
    params?: Record<string, string>;
    originalUrl?: string;
    query?: Record<string, string>;
    search?: string;
    body?: any;
    _decoded?: boolean;
    _parsedUrl?: {
        path: string;
        href: string;
        pathname: string;
        query: Record<string, string | string[]> | void;
        search: string;
        _raw: string;
    }
}

export interface Response {
    statusCode?: number;
    finished?: boolean;
    end(chunk: any, cb?: any): void;
}

export interface Opts<T extends Request = Request> {
    server?: any;
    onNoMatch?: Middleware<T>;
    onError?: ErrorHandler<T>;
}

type Pattern = RegExp | string;

export class Router<T extends Request = Request> {
    readonly server: any;
    readonly routes: Middleware<T>[];
    readonly onError: ErrorHandler<T>;
    readonly onNoMatch: Middleware<T>;
    add(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', pattern: Pattern, ...handlers: T[]): this;
    get(pattern: Pattern, ...handlers: Middleware<T>[]): this;
    post(pattern: Pattern, ...handlers: Middleware<T>[]): this;
    put(pattern: Pattern, ...handlers: Middleware<T>[]): this;
    patch(pattern: Pattern, ...handlers: Middleware<T>[]): this;
    delete(pattern: Pattern, ...handlers: Middleware<T>[]): this;
    constructor(opts?: Opts);
    readonly handler: MiddlewareOptionalNext<T>;
    use(pattern: RegExp | string, ...handlers: (Router<T> | Middleware<T>)[]): this;
    use(...handlers: (Router<T> | Middleware<T>)[]): this;
}