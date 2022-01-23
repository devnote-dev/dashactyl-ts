import type Client from '../client';
import { Resource } from '..';

export interface Coupon extends Resource {
    code:      string;
    coins:     number;
    uses:      number | null;
    expiresAt: Date | null;
    createdAt: Date;
}

export default class CouponManager {
    public readonly client: Client;
    public readonly cache:  Map<string, Coupon>;

    constructor(client: Client) {
        this.client = client;
        this.cache  = new Map<string, Coupon>();
    }

    public _add(data: any): Coupon | Map<string, Coupon> {
        if (Array.isArray(data)) {
            const res = new Map<string, Coupon>();

            for (const o of data) {
                res.set(o.code as string, {
                    code: o.code,
                    ram: o.ram,
                    disk: o.disk,
                    cpu: o.cpu,
                    servers: o.servers,
                    coins: o.coins,
                    uses: o.uses,
                    expiresAt: o.expires_at ? new Date(o.expires_at) : null,
                    createdAt: new Date(o.created_at)
                });
            }

            for (const [k, v] of res.entries()) this.cache.set(k, v);
            return res;
        }

        this.cache.set(data.code, {
            code: data.code,
            ram: data.ram,
            disk: data.disk,
            cpu: data.cpu,
            servers: data.servers,
            coins: data.coins,
            uses: data.uses,
            expiresAt: data.expires_at ? new Date(data.expires_at) : null,
            createdAt: new Date(data.created_at)
        });
        return this.cache.get(data.code);
    }

    public async fetch(code?: string, force: boolean = false) {
        if (code && !force && this.cache.has(code)) return this.cache.get(code);
        const data = await this.client._get(`/coupons${code ? '/'+ code : ''}`);
        return this._add(data);
    }
}
