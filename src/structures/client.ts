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

    public async _request(
        method: 'GET'|'POST'|'PATCH'|'DELETE',
        path: string,
        params?: object
    ): Promise<object> {
        if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) throw new Error();

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
                'Content-Type': 'application/json',
                'Authorization': this.auth
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
