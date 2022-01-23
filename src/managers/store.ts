import type Client from '../client';

export interface StoreItem {
    id:          number;
    name:        string;
    description: string;
    image:       string | null;
    price:       string;
    perItem:     string;
    enabled:     boolean;
}

export default class StoreManager {
    public readonly client: Client;
    public readonly cache:  Map<number, StoreItem>;

    constructor(client: Client) {
        this.client = client;
        this.cache  = new Map<number, StoreItem>();
    }

    _add(data: any): StoreItem | Map<number, StoreItem> {
        if (Array.isArray(data)) {
            const res = new Map<number, StoreItem>();

            for (const o of data) {
                res.set(o.id, {
                    id: o.id,
                    name: o.name,
                    description: o.description,
                    image: o.image || null,
                    price: o.price,
                    perItem: o.per_item,
                    enabled: o.enabled
                });
            }

            for (const [k, v] of res.entries()) this.cache.set(k, v);
            return res;
        }

        this.cache.set(data.id, {
            id: data.id,
            name: data.name,
            description: data.description,
            image: data.image || null,
            price: data.price,
            perItem: data.per_item,
            enabled: data.enabled
        });
        return this.cache.get(data.id);
    }
}
