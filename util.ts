import equal from 'fast-deep-equal';
// const deepEqual = require('deep-equal');

export class Util {
    static defaults = { timeout: 300000, pause: 1000 };
    static debug = false;

    static range({ min = 1, max = 10 }) {
        return new Array(max - min + 1).fill(0).map((v, i) => i + min)
    }

    static random({ min = 0, max = 1 }) {
        return min + Math.floor(Math.random() * (max - min + 1))
    }

    static round(value: number, step = 0.5) { return Math.round(value / step) * step }

    static warn(stuff: any) { console.warn(JSON.stringify(stuff, null, 2)); }

    static log(stuff: any, { always = false } = {}) { (always || this.debug) && console.log(JSON.stringify(stuff, null, 2)); }

    static get UUID() { return new Array(32).fill(0).map(i => Math.floor(Math.random() * 0xF).toString(0xF)).join('') }

    static unique<T = any>(arr: T[]): T[] { return Array.from(new Set(arr)); }

    static unique2<T = any>(arr: T[]): T[] {
        return arr.reduce((unique: T[], item: T) => {
            if (!unique.includes(item)) unique.push(item);
            return unique;
        }, [] as T[]);
    }

    static falsy(x: any) { return !x; }

    static truthy(x: any) { return !!x; }

    /** @example pluck( [{name:'x'},{name:'y'}],'name') will return ['x','y']
     *  @example pluck( [{name:'x'},{name:'y'}],'name','age') will return [{name:'x',age:undefined},{name:'y',age:undefined}]
     * **/
    static pluck<T = any>(arr: any[], ...keys: string[]): T[] {
        return arr.map(i =>
            keys.length > 1
                ? keys.reduce((plucked, key) => ({ ...plucked, [key]: i[key] }), {})
                : i[keys[0]]
        );
    }

    static pick<T>(obj: T, props: (keyof T)[]): Partial<T> {
        return props.reduce((picked, prop) => ({ ...picked, [prop]: obj[prop] }), <any>{});
    }

    static unpick<T>(obj: T, props: (keyof T)[]): Partial<T> {
        return Object
            .entries(obj as any)
            .filter(([k]) => !props.includes(k as keyof T))
            .reduce((picked, [k, v]) => ({ ...picked, [k]: v }), <Partial<T>>{});
    }

    static btoa(obj: any): string { return Buffer.from(obj).toString('base64'); }

    static atob(b64Encoded: string): any { return Buffer.from(b64Encoded, 'base64').toString(); }

    static deleteProps(obj: any, props: any[]) {
        for (let prop of props) delete obj[prop];
        return obj;
    }

    /** @example groupBy([{name:'joe',age:30},{name:'x',age:30},{name:'y',age:31}],'age') will return {30:Array(2),31:Array(1)} */
    static groupBy<T>(arr: T[], prop: string): { [prop: string]: T[]; } {
        return arr.reduce(
            (grouped: any, item: any) => {
                const propValue = item[prop];
                const arr = grouped[propValue] = grouped[propValue] || [];
                arr.push(item);
                return grouped;
            },
            {}
        )
    }

    /** Generates the permutations of a given array */
    static *permute<T>(items: T[]) {
        const c = new Array(items.length).fill(0);
        let i = 1, k, p;
        yield items.slice();
        while (i < items.length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = items[i];
                items[i] = items[k];
                items[k] = p;
                ++c[i];
                i = 1;
                yield items.slice();
            } else {
                c[i] = 0;
                ++i;
            }
        }
    }

    /** @example countBy([{name:'x',job:'cleaner'},{name:'y',job:'accountant'}],'job') will return {accountant:1,cleaner:1} */
    static countBy<T = any>(arr: T[], prop: string): { [prop: string]: number; } {
        return arr.reduce((countedBy: any, item: any) => {
            const propValue = item[prop];
            countedBy[propValue] = 1 + (countedBy[propValue] || 0)
            return countedBy;
        }, {});
    }

    static safeStringify = (obj: any, indent = 2) => JSON.stringify(Util.deepClone(obj), null, indent);

    static shallowClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    /** Clone an object deeply optionally including symbols, undefined, and circular structures */
    static deepClone2(
        obj: any,
        { keys = new Set<string>, seen = new WeakMap, symbols = true, circular = true }: {
            keys?: Set<string>; seen?: WeakMap<any, any>; symbols?: boolean; circular?: boolean;
        } = {}
    ) {
        if (!obj || typeof obj !== "object") return obj;
        if (seen.has(obj)) return circular ? seen.get(obj) : undefined;
        const clone: any = obj instanceof Array ? [] : {};
        seen.set(obj, clone);
        for (const key of [...(symbols ? Object.getOwnPropertySymbols(obj) : []), ...Object.getOwnPropertyNames(obj)]) {
            const val = obj[key];
            clone[key] = this.deepClone2(val, { seen, symbols, circular })
        }
        return clone
    }

    static deepClone = (obj: any) => {
        const seen = new WeakSet();
        return obj && JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value ?? null;
        }));
    }


    static equals(obj1: any, obj2: any) {
        const values = [obj1, obj2].map(v =>
            this.safely(() => JSON.stringify(v))
            || this.safely(() => JSON.stringify(v.POJO()))
            || v);
        return values[0] === values[1];
    }

    static equalsDeep(obj1: any, obj2: any): boolean {
        return obj1 === obj2 || equal(obj1, obj2);
    }

    static deepEquals(a: any, b: any) { return this.equalsDeep(a, b) } // TODO: REFACTOR


    static without<T>(arr: T[], values: any[], { allOccurrences = false } = {}): T[] {
        values = [...values];
        return arr.filter(val => {
            const index = values.indexOf(val);
            if (!allOccurrences && index >= 0) values.splice(index, 1);
            return index < 0;
        });
    }

    static str = (count = 0, char = ' ') => new Array(count).fill(char).join('');

    static safely<T>(code: () => T): T;
    static safely<T>(code: () => T, details: true): { result: T; error: Error; success: boolean; };
    static safely<T>(code: () => T, details = false): T | { result: T; error: Error; success: boolean; } {
        let result, error, success;
        try { result = code(); success = true; }
        catch (e) { error = e; success = false; }
        return <any>(
            details
                ? { result, error, success }
                : result
        )
    }

    static async safelyAsync<T>(code: () => Promise<T>): Promise<T>;
    static async safelyAsync<T>(code: () => Promise<T>, details: true): Promise<{ result: T; error: Error; success: boolean; }>;
    static async safelyAsync<T>(code: () => Promise<T>, details = false): Promise<T | { result: T; error: Error; success: boolean; }> {
        const response: any = await code().then(result => ({ result })).catch(error => ({ error }));
        return details
            ? Object.assign(response, { success: 'result' in response })
            : response.result
    }

    static matches<T>(el: T, criteria: any): boolean {
        return Object
            .keys(criteria)
            .every(criteriaKey => (el as any)[criteriaKey] === criteria[criteriaKey]);
    }

    static where<T>(arr: T[], criteria: any): T[] {
        return arr.filter(el => this.matches(el, criteria));
    }

    static async pause(ms: number) { await new Promise(resolve => setTimeout(resolve, ms)); }

    static shuffle<T = any>(array: T[]): T[] {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static async timeIt<T>({
        block,
        logger = ({ ms, result }) => console.log(`${ms} ms elapsed`)
    }: {
        block: () => Promise<T>,
        logger?: ({ ms, result }: { ms: number; result: T; }) => any
    }): Promise<{ result: any; ms: number; }> {
        const startTime = new Date();
        const result = await block();
        const ms = new Date().getTime() - startTime.getTime();
        logger && logger({ ms, result });
        return { result, ms };
    }

    static findWhere<T>(arr: T[], criteria: any): T | undefined {
        return arr.find(el => this.matches(el, criteria));
    }

    static async retry(
        { block, timeout = this.defaults.timeout, retries = Infinity, pause = this.defaults.pause, onError }: {
            block: Function; timeout: number; retries: number; pause: number; onError?: Function
        }
    ) {
        const startTime = new Date(); let failures = 0;
        while (true) {
            let error; const result = await Promise.resolve(1).then(() => block()).catch(e => { error = e });
            if (!error) return result;        // SUCCESS: return result
            else {                            // FAILURE: track(#failures, timedout, maximumRetries, logErrors), stop || pause-retry
                failures++;
                const timeElapsed = new Date().getTime() - startTime.getTime();
                const timedout = typeof timeout === 'number' && timeElapsed >= timeout;
                const maximumRetries = typeof retries === 'number' && failures > retries;
                Object.assign(error, { failures, timeElapsed, timedout, maximumRetries });
                if (onError) onError(error)                   // onError handling (ie: logging)
                if (timedout || maximumRetries) {
                    throw error;  // Stop     Retrying : Timedout || Max-Retries
                }
                await Util.pause(pause);                      // Continue Retrying : After pausing
            }
        }
    }

    static async while({
        condition,
        do: _do,
        pause = 1000,
        ignoreErrors = false
    } = {} as {
        condition: Function;
        do: Function;
        pause?: number;
        ignoreErrors?: boolean;
    }) {
        while (!await condition()) {
            await Util.pause(pause);
            await _do().catch((e: any) => { if (!ignoreErrors) throw e });
        }
    }

    static async waitUntil<T = any>(pred: () => T | Promise<T>, { retries = Infinity, pause = 250, timeElapsed = Infinity } = {}): Promise<T> {
        const startTime = new Date().getTime();
        let result!: T;
        while (!result) {
            if (!(result = await pred())) {
                retries--;
                if (retries <= 0) { throw new Error(`Util.waitUntil: timeout-retries`); }
                if ((new Date().getTime() - startTime) > timeElapsed) throw new Error('Util.waitUntil: timeout-timeElapsed')
                await this.pause(pause);
            }
        }
        return result
    }

    static removeElements<T>(arr: T[], ...elements: T[]): T[] {
        const removed = [];
        for (const element of elements) {
            const index = arr.indexOf(element);
            if (index >= 0) removed.push(...arr.splice(index, 1));
        }
        return removed;
    }

    static factorial(num: number): number {
        if (num <= 1) return 1;
        return ((this as any)['cachedFactorials'] ||= {})[num] = (() => {
            return this.factorial(num - 1) * num;
        })();
    }

    /** C(n , k) = n! / [ (n-k)! k! ] */
    static binomial(n: number, k: number): number {
        return this.factorial(n) / (this.factorial(n - k) * this.factorial(k))
    }

    /** C(n:T[],k) : T[binomial(n,k)][k | 0..k] */
    static * choose<T>(array: T[], n: number): Generator<T[]> {
        for (let i = 0; i <= array.length - n; i++)
            if (n === 1)
                yield [array[i]];
            else
                for (const c of this.choose(array.slice(i + 1), n - 1))
                    yield [array[i], ...c];
    }

    static powerset<T = any>(a: T[]): T[][] {
        return a
            .reduce((a: T[][], v: T) => a.concat(a.map(r => r.concat(v))), [[]])
            .slice(1);
    }

    /** Gets all arrangements of n[] for sizes [ k | 1 to n.length ] */
    static * arrange<T>(array: T[]): Generator<T[]> {
        if (array.length === 1) {
            return yield array;
        } else {
            yield [array[0]];
            for (const c of this.arrange(array.slice(1))) {
                yield c;
                yield [array[0], ...c];
            }
        }
    }

    static binarySearch(nums: number[], val: number, start = 0, end?: number) {
        end ??= nums.length - 1;
        while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            if (nums[mid] === val) return mid;
            else {
                if (nums[mid] < val) start = mid + 1;
                else end = mid - 1;
            }
        }
        return -1;
    }

    /** Get all keys found deeply in an object */
    static getKeys(obj: any, keys = new Set<string>, seen = new WeakSet) {
        if (!seen.has(obj) && obj !== undefined) {
            const _keys: any[] = Object.getOwnPropertyNames(obj);
            for (const key of _keys) {
                const val = obj[key];
                keys.add(key);
                if (val instanceof Object) this.getKeys(val, keys, seen);
            }
        }
        return keys
    }

    /** Convert an object to JSON with sorted keys and pretty printing */
    static toJSON<T = any>(obj: T, pretty = false): string {
        return JSON.stringify(obj, [...this.getKeys(obj)].sort(), pretty ? 2 : 0)
    }

    static async ArrayFromAsyncGenerator<T = any>(items: AsyncGenerator<T>) {
        const arr: T[] = [];
        for await (const item of items) arr.push(item);
        return arr;
    }

    static toBase64(binary: Object): string;
    static toBase64(binary: string): string;
    static toBase64(binary: string | Object) { return Buffer.from(typeof binary === 'string' ? binary : JSON.stringify(binary), 'binary').toString('base64') }
    static fromBase64(base64: string) { return Buffer.from(base64, 'base64').toString('binary') }

    static clearAllProperties(obj: any, incudeSymbols = true) {
        for (const symbol of Object.getOwnPropertySymbols(obj)) delete obj[symbol];
        for (const name of Object.getOwnPropertyNames(obj)) delete obj[name];
        return obj;
    }
}