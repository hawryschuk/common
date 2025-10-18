import { Util } from "./util";

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

    Recompute({ poison, excluded = [], included, levels }: {
        poison?: boolean;
        excluded?: Array<keyof T | Function>;
        included?: Array<keyof T | Function>;
        levels?: number;
    } = {}) {
        const previous = [...this.cache.entries()];
        this.cache.clear();
        for (const [key, value] of previous) {
            const recomputed = this.proxy[key as keyof T];
            if (recomputed instanceof Object && value instanceof Object && !(recomputed instanceof Promise)
                && !(excluded.includes(key as keyof T) || excluded.some(klass => klass instanceof Function && recomputed instanceof klass))
                && (!included || (included.includes(key as keyof T) || included.some(klass => klass instanceof Function && recomputed instanceof klass)))
            ) {
                Util.syncInto({
                    target: value,
                    source: recomputed as any,
                    levels,
                    included: included?.filter(i => i instanceof Function),
                    excluded: excluded?.filter(i => i instanceof Function)
                });
                this.cache.set(key, value);
            } else if (value instanceof Object && !(recomputed instanceof Object) && poison) {
                Object.setPrototypeOf(value, Object.getPrototypeOf(new Proxy(value, {
                    get() { throw new Error(`Attempted to access property of invalidated cached object for key '${String(key)}'`); },
                    set() { throw new Error(`Attempted to modify invalidated cached object for key '${String(key)}'`); },
                })));
            }
        }
    }
}
