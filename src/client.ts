import fetch from 'node-fetch';
import DashUserManager from './managers/user';
import CouponManager from './managers/coupon';
import StoreManager from './managers/store';
import {
    RequestMethod,
    APIResponse,
    RequestError
} from './interfaces';

export default class Client {
    public domain!: string;
    private auth!:  string;
    public ping:    number;
    public readonly users:   DashUserManager;
    public readonly coupons: CouponManager;
    public readonly store:   StoreManager;

    constructor(domain: string, auth: string) {
        this.domain = domain;
        this.auth   = `Bearer ${auth}`;
        this.ping   = -1;

        this.users   = new DashUserManager(this);
        this.coupons = new CouponManager(this);
        this.store   = new StoreManager(this);
    }

    public async _request(method: RequestMethod, path: string, data?: object) {
        if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method))
            throw new SyntaxError('Invalid API request method.');

        path = this.domain + path;
        const body = data ? JSON.stringify(data) : undefined;

        const res = await fetch(path, {
            method, body,
            headers:{ 'Authorization': this.auth }
        });

        if (res.status >= 500) throw new RequestError(res.statusText, res.status, path);
        const json: APIResponse = await res.json();
        if (json.status !== 'success') throw new RequestError(json.message, res.status, path);

        return json.data;
    }

    public async _get(path: string) {
        return this._request('GET', path);
    }

    public async _post(path: string, data: object) {
        return this._request('POST', path, data);
    }

    public async _patch(path: string, data: object) {
        return this._request('PATCH', path, data);
    }

    public async _put(path: string, data: object) {
        return this._request('PUT', path, data);
    }

    public async _delete(path: string): Promise<void> {
        this._request('DELETE', path);
    }

    public async getPing() {
        const start = Date.now();
        await this._get('/api');

        this.ping = Date.now() - start;
        return this.ping;
    }
}
