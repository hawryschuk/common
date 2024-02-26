import { MemoryStorage } from "../business/MemoryStorage";
import { Util } from "../business/Util";
import { IStorage } from "../business/IStorage";


export class StorageCache extends MemoryStorage {
    private expiry: { [key: string]: number; } = {};
    constructor(private storage: IStorage) { super(); }

    invalidate() {
        this.expiry = {};
        this.data = [];
    }

    private invalidationCheck(key: string) {
        let exists = key in this.expiry;
        if (exists) {
            const expires = this.expiry[key];
            if (expires && expires < new Date().getTime()) {
                exists = false;
                delete this.expiry[key];
                delete this.data[key];
            }
        }
        return !!exists;
    }

    EXPIRY = -1;
    async getItem<T = any>(key: string, _default?: any): Promise<T> {
        if (this.invalidationCheck(key)) {
            return await super.getItem(key, _default);
        } else {
            const item = await this.storage.getItem(key, _default);
            await super.setItem(key, item);
            this.expiry[key] = new Date().getTime() + this.EXPIRY;
            return item;
        }
    }

    async setItem(key: string, value: any) {
        await this.storage.setItem(key, value);
        await super.setItem(key, value);
    }

    async hasKey(key: string) {
        return await super.hasKey(key) || await this.storage.hasKey(key);
    }

    async removeItem(key: string) {
        await this.storage.removeItem(key);
        delete this.expiry[key];
        delete this.data[key];
    }

    async *keys(prefix?: string) {
        const keys = await Util.ArrayFromAsyncGenerator(await this.storage.keys(prefix));
        for (const key of keys) yield key;
    }
}
