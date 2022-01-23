import type Client from '../client';
import DashUser from '../structures/user';

export default class DashUserManager {
    public readonly client: Client;
    public readonly cache:  Map<number, DashUser>;

    constructor(client: Client) {
        this.client = client;
        this.cache  = new Map<number, DashUser>();
    }

    public _add(data: any): DashUser | Map<number, DashUser> {
        if (Array.isArray(data)) {
            const res = new Map<number, DashUser>();

            for (const o of data) {
                const u = new DashUser(this.client, o);
                res.set(u.id, u);
            }

            for (const [k, v] of res.entries()) this.cache.set(k, v);
            return res;
        }

        const u = new DashUser(this.client, data);
        this.cache.set(u.id, u);
        return u;
    }
}