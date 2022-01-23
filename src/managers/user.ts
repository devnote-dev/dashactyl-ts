import type Client from '../client';
import { Resource } from '..';

export class DashUser {
    public readonly client:    Client;
    public readonly panelId:   number;
    public readonly createdAt: Date;
    public username:   string;
    public email:      string;
    public password:   string;
    public referralId: string | null;
    public coins:      number;
    public package:    string;
    public avatar:     string;
    public resources:  Resource;

    constructor(client: Client, data: any) {
        this.client = client;
        this.panelId = data.panel_id;
        this.createdAt = new Date(data.created_at);

        this.resolve(data);
    }

    private resolve(data: any): void {
        if ('username' in data) this.username = data.username;
        if ('email' in data) this.email = data.email;
        if ('password' in data) this.password = data.password;
        if ('ref_id' in data) this.referralId = data.ref_id;
        if ('coins' in data) this.coins = data.coins;
        if ('package' in data) this.package = data.package;
        if ('avatar' in data) this.avatar = data.avatar;
    }
}

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
                res.set(u.panelId, u);
            }

            for (const [k, v] of res.entries()) this.cache.set(k, v);
            return res;
        }

        const u = new DashUser(this.client, data);
        this.cache.set(u.panelId, u);
        return u;
    }

    public async fetch(id?: number, force: boolean = false) {
        if (id && !force && this.cache.has(id)) return this.cache.get(id);
        const data = await this.client._get(`/users${id ? '/'+ id : ''}`);
        return this._add(data);
    }
}
