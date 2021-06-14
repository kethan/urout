import type { Methods } from 'trouter';
import type TRouter from 'trouter';
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

type Pattern = RegExp | string;
export class Router<T extends Request = Request> extends TRouter<Middleware<T>> {
    constructor(opts?: IOptions);
    readonly routes: Middleware<T>[];
    readonly onError: ErrorHandler<T>;
    readonly onNoMatch: Middleware<T>;
    readonly handler: Middleware<T>;
    parse: (req: Request) => ParsedURL;
    use(pattern: RegExp | string, ...handlers: (Router<T> | Middleware<T>)[]): this;
    use(...handlers: (Router<T> | Middleware<T>)[]): this;
}