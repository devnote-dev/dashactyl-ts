import { Dashactyl } from '..';
import {
    DashUserServerManager,
    CoinsManager,
    ResourceManager
} from '../managers';

/**
 * Represents a Pterodactyl user.
 */
class DashUser {
    public client: Dashactyl;
    public id: number;
    public uuid: string;
    public isAdmin: boolean;

    public username: string;
    public email: string;
    public firstname: string;
    public lastname: string;

    public language: string;
    public tfa: boolean;

    public createdAt: Date;
    public createdTimestamp: number;
    public updatedAt: Date | null;
    public updatedTimestamp: number | null;

    public servers: DashUserServerManager;
    public resources: ResourceManager;
    public coins: CoinsManager;

    constructor(client: Dashactyl, data: object) {
        const att = data['userinfo']['attributes'];

        this.client = client;
        this.id = att['id'];
        this.uuid = att['uuid'];
        this.isAdmin = att['root_admin'] || false;
        
        this.username = att['username'];
        this.email = att['email'];
        this.firstname = att['first_name'];
        this.lastname = att['last_name'];

        this.language = att['language'];
        this.tfa = att['2fa'];

        this.createdAt = new Date(att['created_at']);
        this.createdTimestamp = this.createdAt.getTime();
        this.updatedAt = att['updated_at'] !== null ? new Date(att['updated_at']) : null;
        this.updatedTimestamp = this.updatedAt ? this.updatedAt.getTime() : null;

        this.servers = new DashUserServerManager(this.client, this, att);
        this.resources = new ResourceManager(this.client, this, data);
        this.coins = new CoinsManager(this.client, this, data);
    }

    get tag(): string {
        return this.firstname + this.lastname
    }

    /**
     * Removes (or deletes) the user's account.
     * @returns {Promise<void>}
     */
    async remove(): Promise<void> {
        const res = await this.client._request('POST', '/api/removeaccount', { id: this.username });
        if (res['status'] !== 'success') throw new Error(res['status']);
        this.client.users.cache.delete(this.uuid);
    }
}

export { DashUser };
export default { DashUser };
