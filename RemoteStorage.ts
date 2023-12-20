import { MinimalHttpClient } from "./MinimalHttpClient";
import { IStorage } from "../business/IStorage";


export class RemoteStorage extends IStorage {
    constructor(private httpClient: MinimalHttpClient) { super(); }
    async getItem<T = any>(key: string, _default?: any): Promise<T> {
        return await this.httpClient({ method: 'get', url: `data/${key}`, body: { _default } });
    }
    async setItem(key: string, value: any) {
        return await this.httpClient({ method: 'put', url: `data/${key}`, body: { value } });
    }
    async hasKey(key: string) {
        return await this.httpClient({ method: 'head', url: `data/${key}` });
    }
    async removeItem(key: string) {
        return await this.httpClient({ method: 'delete', url: `data/${key}` });
    }
    async *keys(prefix?: string) {
        const keys = await this.httpClient({ method: 'get', url: `data`, body: { prefix } });
        for (const key of keys) yield key;
    }

}
