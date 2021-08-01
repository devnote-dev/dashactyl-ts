import { Dashactyl, MetaDashUser } from '..';
import {
    DashUserServerManager,
    CoinsManager,
    ResourceManager
} from '../managers';

class DashUser extends MetaDashUser {
    public servers: DashUserServerManager;
    public resources: ResourceManager;
    public coins: CoinsManager;

    constructor(client: Dashactyl, data: object) {
        super(client, data);

        this.servers = new DashUserServerManager(this.client, this, data['userinfo']['attributes']);
        this.resources = new ResourceManager(this.client, this, data);
        this.coins = new CoinsManager(this.client, this, data);
    }

    /**
     * Removes (or deletes) the user's account.
     * @returns {Promise<void>}
     */
    async remove(): Promise<void> {
        const res = await this.client._request('DELETE', `/api/users/${this.username}`);
        if (res['status'] !== 'success') throw new Error(res['status']);
        this.client.users.cache.delete(this.uuid);
    }
}

export { DashUser };
export default { DashUser };
