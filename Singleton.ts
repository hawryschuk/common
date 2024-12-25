export class Singleton {
    static instances = new Map<Function, Map<string, Singleton>>();

    static getInstance<T extends new (...args: any[]) => Singleton>(
        this: T,
        ...args: ConstructorParameters<T>
    ): InstanceType<T> {
        if (!Singleton.instances.has(this)) Singleton.instances.set(this, new Map());
        const instances = Singleton.instances.get(this)!;

        const key = (this as any).key(...args);
        if (!instances.has(key)) instances.set(key, new this(...args));

        return instances.get(key)! as InstanceType<T>;
    }

    static key<T extends new (...args: any[]) => Singleton>(
        this: T,
        ...args: ConstructorParameters<T>
    ): InstanceType<T> {
        return args[0];
    }

    constructor(args: any = {}) { Object.assign(this, args); }
}

