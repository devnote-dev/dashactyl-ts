import { Dashactyl } from '..';
import { DashUserServerManager } from '../managers';

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

    constructor(client: Dashactyl, data: object) {
        if (typeof data !== 'object') throw new TypeError();

        this.client = client;
        this.id = data['id'];
        this.uuid = data['uuid'];
        this.isAdmin = data['root_admin'] || false;
        
        this.username = data['username'];
        this.email = data['email'];
        this.firstname = data['first_name'];
        this.lastname = data['last_name'];
        
        this.language = data['language'];
        this.tfa = data['2fa'];
        
        this.createdAt = new Date(data['created_at']);
        this.createdTimestamp = this.createdAt.getTime();
        this.updatedAt = data['updated_at'] != null ? new Date(data['updated_at']) : null;
        this.updatedTimestamp = this.updatedAt ? this.updatedAt.getTime() : null;

        this.servers = new DashUserServerManager(this.client, this, [data]);
    }

    get tag(): string {
        return this.firstname + this.lastname
    }

    async remove(): Promise<void> {
        const res = await this.client._request('DELETE', `/api/removeaccount/${this.id}`);
        if (res['status'] != 'success') throw new Error();
        // TODO: also remove user from client cache
    }
}

export { DashUser };
export default { DashUser };
