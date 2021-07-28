import { Dashactyl } from '..';
import { MAX_AMOUNT } from '.';
import { DashUser, DashServer } from '../structures';

class DashUserServerManager {
    public client: Dashactyl;
    public user: DashUser;
    public cache: Map<string, DashServer>;

    constructor(client: Dashactyl, user: DashUser, data: object) {
        this.client = client;
        this.user = user;
        this.cache = new Map();
        this._patch(data);
    }

    private _patch(data: object) {
        data['relationships']['servers']['data']
        .forEach((o: object) => {
            const server = new DashServer(this.client, o);
            this.cache.set(server.uuid, server);
            this.client.servers.cache.set(server.uuid, server);
        });
    }

    public get(id: string): DashServer|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    public find(fn: (value: DashServer, key: string) => boolean): DashServer|null {
        for (const [key, val] of this.cache) if (fn(val, key)) return val;
        return null;
    }
}

class CoinsManager {
    public client: Dashactyl;
    public user: DashUser;
    public amount: number;

    constructor(client: Dashactyl, user: DashUser, data: object) {
        this.client = client;
        this.user = user;
        this.amount = data['coins'] || 0;
    }

    public async add(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new Error();

        const res = await this.client._request('POST', '/api/addcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error(res['status']);

        this.amount += amount;
        return this.amount;
    }

    public async remove(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new Error();

        amount = this.amount - amount;
        if (amount < 0) amount = 0;

        const res = await this.client._request('POST', '/api/setcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error();

        this.amount = amount;
        return this.amount;
    }

    public async set(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new Error();

        const res = await this.client._request('POST', '/api/setcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error(res['status']);

        this.amount = amount;
        return this.amount;
    }
}

class ResourceManager {
    public client: Dashactyl;
    public user: DashUser;
    public limits: {
        ram: number;
        disk: number;
        cpu: number;
        servers: number;
    };

    constructor(client: Dashactyl, user: DashUser, data: object) {
        this.client = client;
        this.user = user;
        this._patch(data);
    }

    private _patch(data: object) {
        this.limits.ram = data['package']['ram'];
        this.limits.disk = data['package']['disk'];
        this.limits.cpu = data['package']['cpu'];
        this.limits.servers = data['package']['servers'];

        if (data['extra']) {
            this.limits.ram += data['extra']['ram'];
            this.limits.disk += data['extra']['disk'];
            this.limits.cpu += data['extra']['cpu'];
            this.limits.servers += data['extra']['servers'];
        }
    }

    public async set(
        ram?: number,
        disk?: number,
        cpu?: number,
        servers?: number
    ): Promise<object> {
        if (!ram && !disk && !cpu && !servers) throw new Error();
        if (ram < 0 || ram > MAX_AMOUNT) throw new Error();
        if (disk < 0 || disk > MAX_AMOUNT) throw new Error();
        if (cpu < 0 || cpu > MAX_AMOUNT) throw new Error();
        if (servers < 0 || servers > 10) throw new Error();

        const res = await this.client._request(
            'POST', '/api/setresources',
            { id: this.user.username, ram, disk, cpu, servers }
        );
        if (res['status'] != 'success') throw new Error(res['status']);

        this.limits = { ram, disk, cpu, servers };
        return this.limits;
    }

    public async setPlan(plan?: string): Promise<boolean> {
        const res = await this.client._request('POST', '/api/setplan', { id: this.user.username, package: plan });
        if (res['status'] != 'success') throw new Error(res['status']);
        return true;
    }
}


export {
    CoinsManager,
    ResourceManager,
    DashUserServerManager
};
export default {
    CoinsManager,
    ResourceManager,
    DashUserServerManager
};
