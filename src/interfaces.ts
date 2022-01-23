// dashactyl-ts package interfaces

export type RequestMethod =
    | 'GET'
    | 'POST'
    | 'PATCH'
    | 'PUT'
    | 'DELETE';

export interface APIResponse {
    status:   'success' | 'error';
    message?: string;
    data?:    unknown;
}

export class RequestError extends Error {
    public status: number;
    public url:    string;

    constructor(err: any, status: number, url: string) {
        super(err);
        this.status = status;
        this.url = url;
    }
}

export interface Resource {
    ram:     string;
    disk:    string;
    cpu:     string;
    servers: string;
}

export interface Package extends Resource {
    name:      string;
    isDefault: boolean;
}
