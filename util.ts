const deepEqual = require('deep-equal');

export class Util {
    static defaults = { timeout: 300000, pause: 1000 };
    static debug = false;

    static round(value: number, step = 0.5) { return Math.round(value / step) * step }

    static warn(stuff: any) { console.warn(JSON.stringify(stuff, null, 2)); }

    static log(stuff: any, { always = false } = {}) { (always || this.debug) && console.log(JSON.stringify(stuff, null, 2)); }

    static get UUID() { return new Array(32).fill(0).map(i => Math.floor(Math.random() * 0xF).toString(0xF)).join('') }

    static unique(arr: any[]) { return Array.from(new Set(arr)); }

    static unique2<T = any>(arr: T[]): T[] {
        return arr.reduce((unique, item) => {
            if (!unique.includes(item)) unique.push(item);
            return unique;
        }, []);
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

    static btoa(obj: any): string { return Buffer.from(obj).toString('base64'); }

    static atob(b64Encoded: string): any { return Buffer.from(b64Encoded, 'base64').toString(); }

    static deleteProps(obj: any, props: any[]) {
        for (let prop of props) delete obj[prop];
        return obj;
    }

    /** @example groupBy([{name:'joe',age:30},{name:'x',age:30},{name:'y',age:31}],'age') will return {30:Array(2),31:Array(1)} */
    static groupBy<T>(arr: T[], prop: string): { [prop: string]: T[]; } {
        return arr.reduce(
            (grouped, item) => {
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
        return arr.reduce((countedBy, item) => {
            const propValue = item[prop];
            countedBy[propValue] = 1 + (countedBy[propValue] || 0)
            return countedBy;
        }, {});
    }

    static safeStringify = (obj: any, indent = 2) => JSON.stringify(Util.deepClone(obj), null, indent);

    static deepClone = (obj: any) => {
        const seen = new WeakSet();
        return obj && JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
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
        return obj1 === obj2 || deepEqual(obj1, obj2);
    }

    static without<T>(arr: T[], values: any[], { allOccurrences = false } = {}): T[] {
        values = [...values];
        return arr.filter(val => {
            const index = values.indexOf(val);
            if (!allOccurrences && index >= 0) values.splice(index, 1);
            return index < 0;
        });
    }

    static str = (count = 0, char = ' ') => new Array(count).fill(char).join('');

    static safely(code: any) { try { return code(); } catch (e) { return undefined; } }

    static matches<T>(el: T, criteria: any): boolean {
        return Object
            .keys(criteria)
            .every(criteriaKey => (el as any)[criteriaKey] === criteria[criteriaKey]);
    }

    static where<T>(arr: T[], criteria: any): T[] {
        return arr.filter(el => this.matches(el, criteria));
    }

    static async pause(ms: number) { await new Promise(resolve => setTimeout(resolve, ms)); }

    static shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static async timeIt({
        block = undefined as () => Promise<any>,
        logger = ({ ms, result }) => console.log(`${ms} ms elapsed`)
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

    static async retry({ block, timeout = this.defaults.timeout, retries = Infinity, pause = this.defaults.pause, onError }) {
        const startTime = new Date(); let failures = 0;
        while (true) {
            let error; const result = await Promise.resolve(1).then(block).catch(e => { error = e });
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

    static async waitUntil(pred: Function, { retries = Infinity, pause = 250 } = {}) {
        while (1) {
            const result = await pred();
            if (result) {
                return result;
            } else {
                retries--;
                if (retries <= 0) { throw new Error(`Util.waitUntil: timeout`); }
                await this.pause(pause);
            }
        }
    }

    static removeElements<T>(arr: T[], ...elements: T[]): T[] {
        const removed = [];
        for (const element of elements) {
            const index = arr.indexOf(element);
            if (index >= 0) removed.push(...arr.splice(index, 1));
        }
        return removed;
    }
}
