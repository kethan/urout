export interface Route {
    keys: string[];
    pattern: RegExp;
    method: string;
    handlers: Function[];
}
export interface Opts {
    onError?(err: any, req: any, res: any): void;
    onNoMatch?(req: any, res: any, next: Function): void;
    server?: any;
}
export interface FindResult<T> {
    params: {
        [k: string]: string;
    };
    handlers: T[];
}
export declare type NextHandler = (req: any, res: any, next: Function) => void;
export declare type EndHandler = (req: any, res: any) => void;
export declare type Handler = NextHandler | EndHandler | Router;
export declare type Method = (pattern: string | RegExp, ...handlers: Handler[]) => Router;
export declare type Middleware = (req: any, res: any, next: Function) => void;
export declare class Router<T = any> {
    all: Method | any;
    get: Method | any;
    head: Method | any;
    patch: Method | any;
    options: Method | any;
    connect: Method | any;
    delete: Method | any;
    trace: Method | any;
    post: Method | any;
    put: Method | any;
    private routes;
    private parse;
    private onError;
    private onNoMatch;
    private attach;
    constructor(opts?: Opts);
    private useI;
    use(...fns: any): this;
    private onErrorI;
    add(method: string, route?: string, ...fns: Function[] | any): this;
    handler(req: any, res: any, next?: any): void;
    private find;
}
