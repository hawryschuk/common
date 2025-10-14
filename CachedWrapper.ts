export class CachedWrapper<T extends object> {
    static instances = new WeakMap<Object, CachedWrapper<Object>>();
    static getInstance<T extends Object>(o: T): CachedWrapper<T> { if (!this.instances.has(o)) this.instances.set(o, new CachedWrapper(o)); return this.instances.get(o)! as any }
    static proxy<T extends Object>(o: T): T { return this.getInstance(o).proxy as any; }

    constructor(private target: T) { }
    ClearCache() { this.cache.clear(); }
    cache = new Map<PropertyKey, unknown>();
    proxy: T = new Proxy(this.target, {
        get: (obj, prop: string | symbol, receiver: any): any => {
            if (this.cache.has(prop)) {
                return this.cache.get(prop);
            } else {
                const value = Reflect.get(obj, prop, receiver);
                this.cache.set(prop, value);
                return value;
            }
        },
    });
}
