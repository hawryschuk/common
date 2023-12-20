import { Mutex } from "./Mutex";
import { Util } from "./Util";

export abstract class IStorage {
    constructor(public data: any = {}) { }

    abstract hasKey(key: string);
    abstract getItem<T = any>(key: string, _default?: any): Promise<T>;
    abstract setItem(key: string, value: any): Promise<void>;
    abstract removeItem(key: string): Promise<void>;
    abstract keys(prefix?: string): AsyncGenerator<string, void, unknown>;

    async clear(prefix?: string) { for await (const key of this.keys(prefix)) await this.removeItem(key) }

    async update<T = any, R = any>(key: string, predicate: (data: T) => Promise<R>, _default = {}, useReturnValue = false) {
        let data: any, exists: any;
        const result = await Mutex.getInstance(key).use({
            block: async () => {
                exists = await this.hasKey(key);
                data = exists ? await this.getItem(key, _default) : _default;
                return await predicate(data)
            }
        })
            .then(success => ({ success }))
            .catch(error => ({ error }));
        if ('success' in result) {
            const updated = data && data instanceof Object && !useReturnValue ? data : result.success;
            if (!exists || !Util.deepEquals(data, updated)) await this.setItem(key, updated);
            return result.success as R;
        } else if ('error' in result)
            throw result.error;
    }
}
