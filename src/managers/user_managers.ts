import { Dashactyl } from '..';
import { MAX_AMOUNT } from '.';
import { DashUser, DashServer } from '../structures';

/**
 * Manages servers directly for Dashactyl users.
 */
class DashUserServerManager {
    public client: Dashactyl;
    public user: DashUser;
    public cache: Map<string, DashServer>;

    constructor(client: Dashactyl, user: DashUser, data: object) {
        this.client = client;
        this.user = user;
        /**
         * The internal cache for user servers.
         * @type {Map<string, DashServer>}
         */
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

    /**
     * Gets a server from the cache, returns `null` if unavailable.
     * @param {string} id The ID of the server.
     * @returns {DashServer|null}
     */
    public get(id: string): DashServer|null {
        if (typeof id != 'string') throw new TypeError('Server ID must be a string.');
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    /**
     * Searches the cache and returns the first server that fufills the function.
     * @param {Function} fn The function to apply to the value.
     * @returns {DashServer|null}
     */
    public find(fn: (value: DashServer, key: string) => boolean): DashServer|null {
        if (typeof fn != 'function') throw new TypeError('Search parameter must be a function');
        for (const [key, val] of this.cache) if (fn(val, key)) return val;
        return null;
    }
}

/**
 * Manages Dashactyl user coins.
 */
class CoinsManager {
    public client: Dashactyl;
    public user: DashUser;
    public amount: number;

    constructor(client: Dashactyl, user: DashUser, data: object) {
        this.client = client;
        this.user = user;
        this.amount = data['coins'] || 0;
    }

    /**
     * Adds a specified number of coins to the user's account.
     * Returns the added amount on success.
     * @param {number} amount The amount of coins to add.
     * @returns {Promise<number>}
     */
    public async add(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new RangeError('Amount must be between 0 and 9 hundred-trillion.');

        const res = await this.client._request('POST', '/api/addcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error(res['status']);

        this.amount += amount;
        return this.amount;
    }

    /**
     * Removes a specified number of coins from the user's account.
     * Returns the removed amount on success.
     * @param {number} amount The amount of coins to remove.
     * @returns {Promise<number>}
     */
    public async remove(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new RangeError('Amount must be between 0 and 9 hundred-trillion.');

        amount = this.amount - amount;
        if (amount < 0) amount = 0;

        const res = await this.client._request('POST', '/api/setcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error();

        this.amount = amount;
        return this.amount;
    }

    /**
     * Sets a specified number of coins to the user's account.
     * Returns the set amount on success.
     * @param {number} amount The amount to set.
     * @returns {Promise<number>}
     */
    public async set(amount: number): Promise<number> {
        if (amount < 0 || amount > MAX_AMOUNT) throw new RangeError('Amount must be between 0 and 9 hundred-trillion.');

        const res = await this.client._request('POST', '/api/setcoins', { id: this.user.username, amount });
        if (res['status'] != 'success') throw new Error(res['status']);

        this.amount = amount;
        return this.amount;
    }
}

/**
 * Manages the Dashactyl user resources for servers.
 */
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

    /**
     * Sets the resources for a user.
     * @param {?number} ram The amount of RAM to set.
     * @param {?number} disk The amount of Disk to set.
     * @param {?number} cpu The amount of CPU to set.
     * @param {?number} servers The number of servers to set.
     * @returns {Promise<object>}
     */
    public async set(
        ram?: number,
        disk?: number,
        cpu?: number,
        servers?: number
    ): Promise<object> {
        if (!ram && !disk && !cpu && !servers) throw new Error('At least 1 option is required for resources.');
        if (ram < 0 || ram > MAX_AMOUNT) throw new RangeError('RAM must be between 0 and 9 hundred-trillion.');
        if (disk < 0 || disk > MAX_AMOUNT) throw new RangeError('Disk must be between 0 and 9 hundred-trillion.');
        if (cpu < 0 || cpu > MAX_AMOUNT) throw new RangeError('CPU must be between 0 and 9 hundred-trillion.');
        if (servers < 0 || servers > 10) throw new RangeError('Servers must be between 0 and 10.');

        const res = await this.client._request(
            'POST', '/api/setresources',
            { id: this.user.username, ram, disk, cpu, servers }
        );
        if (res['status'] != 'success') throw new Error(res['status']);

        this.limits = { ram, disk, cpu, servers };
        return this.limits;
    }

    /**
     * Changes the user package to the specified plan.
     * @param {?string} plan The plan/package to set.
     * @returns {Promise<boolean>}
     */
    public async setPlan(plan?: string): Promise<boolean> {
        const res = await this.client._request('POST', '/api/setplan', { id: this.user.username, package: plan ?? null });
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
