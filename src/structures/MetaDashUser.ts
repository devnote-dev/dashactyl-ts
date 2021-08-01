import { Dashactyl, DashUser } from '..';

/**
 * Represents a meta Pterodactyl user.
 * This should be resolved to a full user to be used
 * via {@link MetaDashUser.resolve}.
 */
class MetaDashUser {
    public client: Dashactyl;
    public id: number;
    public uuid: number;
    public isAdmin: boolean;

    public username: string;
    public email: string;
    public firstname: string;
    public lastname: string;

    public language: string;
    public tfa: boolean;
    public metaResource?: string;
    public resolved?: boolean;

    public createdAt: Date;
    public createdTimestamp: number;
    public updatedAt: Date | null;
    public updatedTimestamp: number | null;

    constructor(client: Dashactyl, data: object) {
        const att: object = data['data']['attributes'];

        this.client = client;
        this.id = att['id'];
        this.uuid = att['uuid'];
        this.isAdmin = att['root_admin'] ?? false;

        this.username = att['username'];
        this.email = att['email'];
        this.firstname = att['first_name'];
        this.lastname = att['last_name'];

        this.language = att['language'];
        this.tfa = att['2fa'];
        this.metaResource = data['meta']['resource'];

        this.createdAt = new Date(att['created_at']);
        this.createdTimestamp = this.createdAt.getTime();
        this.updatedAt = att['updated_at'] !== null ? new Date(att['updated_at']) : null;
        this.updatedTimestamp = this.updatedAt ? this.updatedAt.getTime() : null;
    }

    get tag(): string {
        return this.firstname + this.lastname;
    }

    /**
     * Resolves a DashUser from the meta class.
     * @returns {Promise<DashUser>}
     */
    public async resolve(): Promise<DashUser> {
        if (this instanceof DashUser) throw new Error('Only meta user objects can be resolved.');
        if (this.resolved) throw new Error('Meta user has already been resolved.');

        const data = await this.client._request('GET', `/api/users/${this.username}`);
        if (data['status'] !== 'success') throw new Error(data['status']);

        const user = new DashUser(this.client, data);
        this.client.users.cache.set(user.uuid, user);
        this.resolved = true;
        return user;
    }
}

export { MetaDashUser };
export default { MetaDashUser };
