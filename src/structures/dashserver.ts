import { Dashactyl } from '..';
import { DashUser } from './dashuser';

class DashServer {
    public client: Dashactyl;
    public id: number;
    public uuid: string;
    public identifier: string;

    public name: string;
    public description: string;
    public status: string | null;
    public isSuspended: boolean;
    public limits: object;
    public featureLimits: object;
    public userid: number;
    public owner: DashUser | null;

    public node: number;
    public allocation: number;
    public nest: number;
    public egg: number;
    public container: object;

    public createdAt: Date;
    public createdTimestamp: number;
    public updatedAt: Date | null;
    public updatedTimestamp: number | null;

    constructor(client: Dashactyl, data: object) {
        data = data['attributes'];
        this.client = client;
        this.id = data['id'];
        this.uuid = data['uuid'];
        this.identifier = data['identifier'];

        this.name = data['name'];
        this.description = data['description'];
        this.status = data['status'];
        this.isSuspended = data['suspended'];
        this.limits = data['limits'];
        this.featureLimits = data['feature_limits'];
        this.userid = data['user'];
        this.owner = null;

        this.node = data['node'];
        this.allocation = data['allocation'];
        this.nest = data['nest'];
        this.egg = data['egg'];
        this.container = data['container'];

        this.createdAt = new Date(data['created_at']);
        this.createdTimestamp = this.createdAt.getTime();
        this.updatedAt = data['updated_at'] != null ? new Date(data['updated_at']) : null;
        this.updatedTimestamp = this.updatedAt ? this.updatedAt.getTime() : null;
    }

    public getOwner(): DashUser|null {
        if (!this.owner) {
            const u = this.client.users.find(u => u.id === this.id);
            if (u) this.owner = u;
        }
        return this.owner;
    }

    /*
    Removed until umplemented in the Dashactyl API

    public async delete(): Promise<void> {
        if (!this.owner) {
            const u = this.getOwner();
            if (!u) throw new Error('Server owner could not be resolved.');
        }
        const res = await this.client._request('DELETE', `/api/deleteserver/${this.owner.id}/${this.id}`);
        if (res['status'] != 'success') throw new Error();
    }
    */
}

export { DashServer };
export default { DashServer };
