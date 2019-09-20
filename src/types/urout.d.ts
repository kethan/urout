import { Router } from "../urout";


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
