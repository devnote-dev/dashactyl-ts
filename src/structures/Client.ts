import {
    DashUserManager,
    DashServerManager,
    CouponManager
} from '../managers';
import fetch from 'node-fetch';

class Dashactyl {
    public domain: string;
    private auth: string;

    public users: DashUserManager;
    public servers: DashServerManager;
    public coupons: CouponManager;

    constructor(domain: string, auth: string) {
        this.domain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
        this.auth = 'Bearer '+ auth;

        this.users = new DashUserManager(this);
        this.servers = new DashServerManager();
        this.coupons = new CouponManager(this);
    }

    /**
     * ### Not to be used publically.
     * Sends a request to the Dashactyl API with the specified parameters.
     * @param {string} method The request method.
     * @param {string} path The API endpoint path.
     * @param {object} params Any additional parameters (for `POST` and `PATCH` methods).
     * @returns {Promise<object>}
     */
    public async _request(
        method: 'GET'|'POST'|'PATCH'|'DELETE',
        path: string,
        params?: object
    ): Promise<object> {
        if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) throw new Error('Invalid Request Method.');

        path = this.domain + path;
        let body: string | null = null;

        if (params) {
            if (typeof params !== 'object') throw new TypeError('Params must be an object');
            body = JSON.stringify(params);
        }

        const res = await fetch(path, {
            method,
            body,
            headers:{
                'Authorization': this.auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (res.ok) {
            if (res.status === 204) return { status: 'success' };
            return await res.json();
        }
        return {
            status: 'failed',
            code: res.status,
            message: res.statusText
        };
    }

    /**
     * Pings the Dashactyl API.
     * @returns {Promise<number>}
     */
    public async ping(): Promise<number> {
        const start = Date.now();
        await this._request('GET', '/api');
        return Date.now() - start;
    }
}

export { Dashactyl };
export default { Dashactyl };
