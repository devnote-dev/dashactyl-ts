import { Dashactyl } from '..';
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
        .forEach(o => {
            const server = new DashServer(this.client, o);
            this.cache.set(server.uuid, server);
            this.client.servers.cache.set(server.uuid, server);
        });
    }

    public get(id: string): DashServer|null {
        if (!id) throw new Error();
        for (const [key, val] of this.cache) {
            if (key.includes(id)) return val;
        }
        return;
    }

    public find(fn: (value: DashServer, key: string) => boolean): DashServer|null {
        for (const [key, val] of this.cache) {
            if (fn(val, key)) return val;
        }
        return;
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
}

class ResourceManager {
    public client: Dashactyl;
    public user: DashUser;
    public limits: { ram: 0, disk: 0, cpu: 0, servers: 0 };

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
