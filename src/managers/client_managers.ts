import { Dashactyl } from '..';
import { DashUser, DashServer, Coupon } from '../structures';
import { DashUserServerManager, MAX_AMOUNT } from '.';

/**
 * Manages all the users received by the client.
 */
class DashUserManager {
    public client: Dashactyl;
    public cache: Map<string, DashUser>;

    constructor(client: Dashactyl) {
        this.client = client;
        /**
         * The internal cache for user servers.
         * @type {Map<string, DashUser>}
         */
        this.cache = new Map();
    }

    /**
     * Fetches a user from the API, with an optional check from the cache (default true).
     * @param {string} id The ID of the user.
     * @param {?boolean} check Whether to check the cache first before fetching.
     * @returns {Promise<DashUser>}
     */
    public async fetch(id: string, check: boolean = true): Promise<DashUser> {
        if (typeof id != 'string') throw new TypeError('User ID must be a string.');
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

    /**
     * Gets a user from the cache, returns `null` if unavailable.
     * @param {string} id The ID of the user.
     * @returns {DashUser|null}
     */
    public get(id: string): DashUser|null {
        if (typeof id != 'string') throw new TypeError('User ID must be a string.');
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    /**
     * Searches the cache and returns the first user that fufills the function.
     * @param {Function} fn The function to apply to the value.
     * @returns {DashUser|null}
     */
    public find(fn: (value: DashUser, key: string) => boolean): DashUser|null {
        if (typeof fn != 'function') throw new TypeError('Search parameter must be a function');
        for (const [key, val] of this.cache) if (fn(val, key)) return val;
        return null;
    }

    /**
     * Removes (or deletes) the account of a specified user.
     * @param {string|DashUser} user The user or ID of the user to remove.
     * @returns {Promise<void>}
     */
    public async remove(user: string|DashUser): Promise<void> {
        if (typeof user != 'string' && !(user instanceof DashUser)) throw new TypeError('User must be a string or DashUser object.');
        if (user instanceof DashUser) user = user.username;
        const res = await this.client._request('POST', '/api/removeaccount', { id: user });
        if (res['status'] != 'success') throw new Error(res['status']);
        this.cache.delete(user);
    }
}

/**
 * Manages all the servers received by the client.
 * Does not manage servers directly but can be accessed via the helper method
 * #managerFor(DashUser): {@link DashUserServerManager}.
 */
class DashServerManager {
    public cache: Map<string, DashServer>;

    construtor() {
        /**
         * The internal cache for user servers.
         * @type {Map<string, DashServer>}
         */
        this.cache = new Map();
    }

    /**
     * Gets a server from the cache, returns `null` if unavailable.
     * @param {string} id The ID of the server.
     * @returns {DashServer|null}
     */
    public get(id: string): DashServer|null {
        if (typeof id != 'string') throw new TypeError('User ID must be a string.');
        for (const [key, val] of this.cache) if (key.includes(id)) return val;
        return null;
    }

    /**
     * Returns the user server manager for the specified user.
     * @param {DashUser} user The user to get the manager for.
     * @returns {DashUserServerManager}
     */
    public managerFor(user: DashUser): DashUserServerManager {
        if (!user || !(user instanceof DashUser)) throw new TypeError('User must be a DashUser object.');
        return user.servers;
    }
}

/**
 * Manages all the coupons received by the client.
 */
class CouponManager {
    public client: Dashactyl;
    public cache: Map<string, Coupon>;

    constructor(client: Dashactyl) {
        this.client = client;
        /**
         * The internal cache for user servers.
         * @type {Map<string, Coupon>}
         */
        this.cache = new Map();
    }

    /**
     * Fetches a coupon by its code, or all existing coupons if no code is specified.
     * Returns `null` if there are no existing coupons.
     * TODO: will be implemented when the API is updated.
     * @param {?string} code The code for the coupon.
     * @returns {Promise<Coupon|Map<string, Coupon>|null>}
     * @private
     */
    private async fetch(code?: string) /*: Promise<Coupon|null> */ {}

    /**
     * Gets a coupon from the cache, returns `null` if unavailable.
     * @param {string} code The code for the coupon.
     * @returns {Coupon|null}
     */
    public get(code: string): Coupon|null {
        if (typeof code != 'string') throw new TypeError('Code must be a string.');
        for (const [key, val] of this.cache) if (key === code) return val;
        return null;
    }

    /**
     * Creates a new coupon with the specified options.
     * @param {?string} code The name of the code for the coupon.
     * @param {?number} coins The amount of coins to give when redeemed.
     * @param {?number} ram The amount of RAM to give when redeemed.
     * @param {?number} disk The amount of Disk to give when redeemed.
     * @param {?number} cpu The amount of CPU to give when redeemed.
     * @param {?number} servers THe number of servers to give when redeemed.
     * @returns {Promise<Coupon>}
     */
    public async create(
        code?: string,
        coins?: number,
        ram?: number,
        disk?: number,
        cpu?: number,
        servers?: number
    ): Promise<Coupon> {
        if (!code && (!coins || !ram || !disk || !cpu || !servers)) throw new Error('At least 1 option is required for new coupons.');
        if (coins < 0 || coins > MAX_AMOUNT) throw new RangeError('Coins must be between 0 and 9 hundred-trillion.');
        if (ram < 0 || ram > MAX_AMOUNT) throw new RangeError('RAM must be between 0 and 9 hundred-trillion.');
        if (disk < 0 || disk > MAX_AMOUNT) throw new RangeError('Disk must be between 0 and 9 hundred-trillion.');
        if (cpu < 0 || cpu > MAX_AMOUNT) throw new RangeError('CPU must be between 0 and 9 hundred-trillion.');
        if (servers < 0 || servers > 10) throw new RangeError('Servers must be between 0 and 10.');

        const data = await this.client._request(
            'POST', '/api/createcoupon',
            { code, coins, ram, disk, cpu, servers }
        );
        if (data['status'] != 'success') throw new Error(data['status']);

        const c = new Coupon(data);
        this.cache.set(c.code, c);
        return c;
    }

    /**
     * Revokes a specified coupon.
     * @param {string} code The code for the coupon.
     * @returns {Promise<void>}
     */
    public async revoke(code: string|Coupon): Promise<void> {
        if (typeof code != 'string' && !(code instanceof Coupon)) throw new TypeError('Code must be a string or Coupon object.');
        if (code instanceof Coupon) code = code.code;
        const res = await this.client._request('POST', '/api/revokecoupon', { code });
        if (res['status'] != 'success') throw new Error(res['status']);
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
