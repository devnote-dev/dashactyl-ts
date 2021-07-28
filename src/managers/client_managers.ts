import { Dashactyl } from '..';
import { DashUser, DashServer, Coupon } from '../structures';
import { DashUserServerManager, MAX_AMOUNT } from '.';

class DashUserManager {
    public client: Dashactyl;
    public cache: Map<string, DashUser>;

    constructor(client: Dashactyl) {
        this.client = client;
        this.cache = new Map();
    }

    public async fetch(id: string, check=true): Promise<DashUser> {
        if (!id) throw new Error();
        if (check) {
            const u = this.get(id);
            if (u) return u;
        }

        const data = await this.client._request('GET', `/api/userinfo?id=${id}`);
        if (data['status'] != 'success') throw new Error(data['status']);

        const user = new DashUser(this.client, data);
        this.cache.set(user.uuid, user);
        return user;
    }

    public get(id: string): DashUser|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    public find(fn: (value: DashUser, key: string) => boolean): DashUser|null {
        for (const [key, val] of this.cache) if (fn(val, key)) return val;
        return null;
    }

    public async remove(user: string|DashUser): Promise<void> {
        if (user instanceof DashUser) user = user.username;
        const res = await this.client._request('POST', '/api/removeaccount', { id: user });
        if (res['status'] != 'success') throw new Error(res['status']);
        this.cache.delete(user);
    }
}

class DashServerManager {
    public cache: Map<string, DashServer>;

    construtor() {
        this.cache = new Map();
    }

    public get(id: string): DashServer|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    public managerFor(user: DashUser): DashUserServerManager {
        if (!user || !(user instanceof DashUser)) throw new Error();
        return user.servers;
    }
}

class CouponManager {
    public client: Dashactyl;
    public cache: Map<string, Coupon>;

    constructor(client: Dashactyl) {
        this.client = client;
        this.cache = new Map();
    }

    // Will be implemented when API is updated
    private async fetch(code: string) /*: Promise<Coupon|null> */ {}

    public get(code: string): Coupon|null {
        for (const [key, val] of this.cache) if (key === code) return val;
        return null;
    }

    public async create(
        code?: string,
        coins?: number,
        ram?: number,
        disk?: number,
        cpu?: number,
        servers?: number
    ): Promise<Coupon> {
        if (!code && (!coins || !ram || !disk || !cpu || !servers)) throw new Error();
        if (coins < 0 || coins > MAX_AMOUNT) throw new Error();
        if (ram < 0 || ram > MAX_AMOUNT) throw new Error();
        if (disk < 0 || disk > MAX_AMOUNT) throw new Error();
        if (cpu < 0 || cpu > MAX_AMOUNT) throw new Error();
        if (servers < 0 || servers > 10) throw new Error();

        const data = await this.client._request(
            'POST', '/api/createcoupon',
            { code, coins, ram, disk, cpu, servers }
        );
        if (data['status'] != 'success') throw new Error();

        const c = new Coupon(data);
        this.cache.set(c.code, c);
        return c;
    }

    public async revoke(code: string|Coupon): Promise<void> {
        if (code instanceof Coupon) code = code.code;
        const res = await this.client._request('POST', '/api/revokecoupon', { code });
        if (res['status'] != 'success') throw new Error();
        if (this.cache.has(code)) this.cache.delete(code);
    }
}


export {
    DashUserManager,
    DashServerManager,
    CouponManager
};
export default {
    DashUserManager,
    DashServerManager,
    CouponManager
};
