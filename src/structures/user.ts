import { Resource } from '..';
import type Client from '../client';

export default class DashUser {
    public readonly client:    Client;
    public readonly panelId:   number;
    public readonly createdAt: Date;
    public username:   string;
    public email:      string;
    public password:   string;
    public referralId: string | null;
    public coins:      number;
    public package:    string;
    public avatar:     string;
    public resources:  Resource;

    constructor(client: Client, data: any) {
        this.client = client;
        this.panelId = data.panel_id;
        this.createdAt = new Date(data.created_at);

        this.resolve(data);
    }

    private resolve(data: any): void {
        if ('username' in data) this.username = data.username;
        if ('email' in data) this.email = data.email;
        if ('password' in data) this.password = data.password;
        if ('ref_id' in data) this.referralId = data.ref_id;
        if ('coins' in data) this.coins = data.coins;
        if ('package' in data) this.package = data.package;
        if ('avatar' in data) this.avatar = data.avatar;
    }
}