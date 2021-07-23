import { Dashactyl } from '..';
import { DashUser, DashServer, Coupon } from '../structures';
import { DashUserServerManager } from '.';

class DashUserManager {
    public client: Dashactyl;
    public cache: Map<string, DashUser>;

    constructor(client: Dashactyl) {
        this.client = client;
        this.cache = new Map();
    }

    public async fetch(id: string, check=true): Promise<DashUser|null> {
        if (!id) throw new Error();
        if (check) {
            const u = this.get(id);
            if (u) return u;
        }

        const data = await this.client._request('GET', `/api/userinfo/${id}`);
        if (data['status'] != 'success') throw new Error();
        const user = new DashUser(this.client, data);
        this.cache.set(user.uuid, user);
        return user;
    }

    public get(id: string): DashUser|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) {
            if (key.includes(id)) return val;
        }
        return;
    }

    public find(fn: Function): DashUser|null {
        for (const [key, val] of this.cache) {
            if (fn(val, key)) return val;
        }
        return;
    }

    public async remove(user: string|DashUser): Promise<void> {
        if (user instanceof DashUser) user = user.username;

        const res = await this.client._request('DELETE', `/api/removeaccount/${user}`);
        if (res['status'] != 'success') throw new Error();
        this.cache.delete(user);
    }
}

class DashServerManager {
    public client: Dashactyl;
    public cache: Map<string, DashServer>;

    construtor(client: Dashactyl) {
        this.client = client;
        this.cache = new Map();
    }

    public get(id: string): DashServer|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) {
            if (key.includes(id)) return val;
        }
        return;
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
