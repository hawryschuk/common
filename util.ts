import equal from 'fast-deep-equal';
import { Point } from './Point';
import { Rectangle } from './Rectangle';
import { Base64 } from './Base64';

export class Util {
    static range(max: number): Array<number>;
    static range(min: number, max: number): Array<number>;
    static range(options: { max: number, min?: number; step?: number; fixed?: number }): Array<number>;
    static range(...options: any[]) {
        if (options.length === 0) throw new Error;
        const [min = 1, max] = (() => {
            if (options.length == 2)
                return options;
            else if (options.length == 1) {
                return typeof options[0] == 'number'
                    ? [1, options[0]]
                    : [options[0].min, options[0].max]
            }
            else
                throw new Error;
        })();

        if (options.length === 1 && 'step' in options) {
            const { step = 1, fixed } = options[0];
            const result: number[] = [];
            for (let i = min; i <= max; i += step) {
                result.push(fixed! >= 0 ? parseFloat(i.toFixed(fixed)) : i);
            }
        }
        return new Array(max - min + 1).fill(0).map((v, i) => i + min)
    }

    static Base64 = Base64;
    static random({ min = 0, max = 1 }) { return min + Math.floor(Math.random() * (max - min + 1)) }
    static round(value: number, step = 0.5) { return Math.round(value / step) * step }
    static warn(stuff: any) { console.warn(JSON.stringify(stuff, null, 2)); }
    static get UUID() { return new Array(32).fill(0).map(i => Math.floor(Math.random() * 0xF).toString(0xF)).join('') }
    static unique<T = any>(arr: T[]): T[] { return Array.from(new Set(arr)); }
    static pushUnique<T>(arr: T[], el: T) { if (arr.includes(el)) { return false; } else { arr.push(el); return true; } }
    static falsy(x: any) { return !x; }
    static truthy(x: any) { return !!x; }
    static between(val: number, from: number, to: number) { return val >= from && val <= to; }
    static deleteProps(obj: any, props: any[]) { for (let prop of props) delete obj[prop]; return obj; }

    /** @example pluck( [{name:'x'},{name:'y'}],'name') will return ['x','y']
     *  @example pluck( [{name:'x'},{name:'y'}],'name','age') will return [{name:'x',age:undefined},{name:'y',age:undefined}]
     * **/
    static pluck<T>(arr: T[], key: keyof T): T[keyof T][];
    static pluck<T = any>(arr: any[], ...keys: (keyof T)[]): Partial<T>[];
    static pluck<T = any>(arr: any[], ...keys: (keyof T)[]): Partial<T>[] { return arr.map(i => keys.length > 1 ? this.pick(i, keys) : i[keys[0]]); }

    static pick<T>(obj: T, props: Array<keyof T>): Partial<T> { return props.reduce((picked, prop) => ({ ...picked, [prop]: obj[prop] }), <any>{}); }
    static unpick<T>(obj: T, props: (keyof T)[]): Partial<T> {
        return Object
            .entries(obj as any)
            .filter(([k]) => !props.includes(k as keyof T))
            .reduce((picked, [k, v]) => ({ ...picked, [k]: v }), <Partial<T>>{});
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

    static totalPermutations(choices: { [key: string]: any[] }): number {
        const keys = Object.keys(choices);
        const lengths = keys.map(key => choices[key].length);
        return lengths.reduce((total, len) => total * len, 1);
    }

    static *permutations<T = any>(choices: { [key: string]: any[] }): Generator<T> {
        const keys = Object.keys(choices).sort();
        const totalPermutations = this.totalPermutations(choices);
        for (let i = 0; i < totalPermutations; i++) {
            const permutation: any = {};
            let remainder = i;
            for (const key of keys) {
                const values = choices[key],
                    valueIndex = remainder % values.length;
                permutation[key] = values[valueIndex],
                    remainder = Math.floor(remainder / values.length);
            }
            yield permutation as T;
        }
    }

    /** @example keys({ a:1, b:2}) returns Array<'a' | 'b'> */
    static keys = <T extends Object>(o: T) => Object.keys(o) as Array<keyof typeof o>;

    /** @example countBy([{name:'x',job:'cleaner'},{name:'y',job:'accountant'}],'job') will return {accountant:1,cleaner:1} */
    static countBy<T = any>(arr: T[], prop: string): { [prop: string]: number; } {
        return arr.reduce((countedBy: any, item: any) => {
            const propValue = item[prop];
            countedBy[propValue] = 1 + (countedBy[propValue] || 0)
            return countedBy;
        }, {});
    }

    static safeStringify = (obj: any, indent = 2) => JSON.stringify(Util.deepClone(obj), null, indent);
    static shallowClone<T = any>(obj: T): T { return obj ? JSON.parse(JSON.stringify(obj)) : obj; }
    static deepDeepClone(
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
            clone[key] = this.deepDeepClone(val, { seen, symbols, circular })
        }
        return clone
    }

    /** Clones an object and all sub-objects as well , named properties only , avoiding cyclical references */
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

    static equalsDeep(obj1: any, obj2: any): boolean { return obj1 === obj2 || equal(obj1, obj2); }
    static equals(obj1: any, obj2: any) {
        return obj1 === obj2 || (() => {
            const json = Util.safely(() => [obj1, obj2].map(v => this.safeStringify(v, 0)));
            return json ? json[0] === json[1] : undefined;
        })();
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

    static matches<T>(el: T, criteria: Partial<T>): boolean {
        return Object
            .keys(criteria)
            .every((criteriaKey: any) => (el as any)[criteriaKey] === (criteria as any)[criteriaKey]);
    }

    static notMatches<T>(el: T, criteria: Partial<T>): string[] {
        return Object
            .keys(criteria)
            .filter((criteriaKey: any) => (el as any)[criteriaKey] !== (criteria as any)[criteriaKey]);
    }

    static where<T>(arr: T[], criteria: Partial<T>): T[] {
        return arr.filter(el => this.matches(el, criteria));
    }

    static async pause(ms: number) { await new Promise(resolve => setTimeout(resolve, ms)); }

    static randomElement<T>(arr: T[]): T { return arr[this.random({ min: 0, max: arr.length - 1 })]; }

    /** Shuffles an array in-place */
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
    }): Promise<{ result: T; ms: number; }> {
        const startTime = new Date();
        const result = await block();
        const ms = new Date().getTime() - startTime.getTime();
        logger && logger({ ms, result });
        return { result, ms };
    }

    static timeItSync<T>({
        block,
        logger = ({ ms, result }) => console.log(`${ms} ms elapsed`)
    }: {
        block: () => T,
        logger?: ({ ms, result }: { ms: number; result: T; }) => any
    }): { result: T; ms: number; } {
        const startTime = new Date();
        const result = block();
        const ms = new Date().getTime() - startTime.getTime();
        logger && logger({ ms, result });
        return { result, ms };
    }

    static findWhere<T>(arr: T[], criteria: Partial<T>): T | undefined { return arr.find(el => this.matches(el, criteria)); }

    static RETRY_DEFAULTS = { timeout: 300000, pause: 1000 };
    static async retry<T>(
        { block, timeout = this.RETRY_DEFAULTS.timeout, retries = Infinity, pause = this.RETRY_DEFAULTS.pause, onError }:
            { block: (failures: number) => Promise<T>; timeout?: number; retries?: number; pause?: number; onError?: Function }
    ): Promise<T> {
        const startTime = new Date(); let failures = 0;
        while (true) {
            const result = await block(failures)
                .then(success => ({ success }))
                .catch(error => ({ error }));
            if (!('error' in result))
                return result.success!;         // SUCCESS: return result
            else {                              // FAILURE: track(#failures, timedout, maximumRetries, logErrors), stop || pause-retry
                failures++;
                const timeElapsed = new Date().getTime() - startTime.getTime();
                const timedout = typeof timeout === 'number' && timeElapsed >= timeout;
                const maximumRetries = typeof retries === 'number' && failures > retries;
                const error = Object.assign(result.error, { failures, timeElapsed, timedout, maximumRetries });
                if (onError)
                    await onError(error)        // onError handling (ie: logging)
                if (timedout || maximumRetries)
                    throw error;                // Stop Retrying : Timedout || Max-Retries
            }
            await Util.pause(pause);            // Continue Retrying : After pausing
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

    /** Will run a block after a delay from now and the last invocation
     * - Replaces last queued block
     * - Executes blocks LIFO */
    static debounce<T>({ block, delay, resource }: { block?: () => Promise<T>; delay: number; resource?: any; }) {
        resource ||= block;
        type STATE = { timeout?: NodeJS.Timeout; busy: boolean; next: { block?: () => Promise<T>, time: number; }; callers: { resolve: (value: T) => void; reject: (reason?: any) => void; }[]; };
        const time = Date.now();
        const debounced: Map<any, STATE> = (this as any)[Symbol.for('debounced')] ||= new Map;
        const state: STATE = debounced.get(resource) || (() => {
            const state: STATE = { timeout: undefined, busy: false, next: { block: undefined, time }, callers: [] };
            debounced.set(resource, state);
            return state;
        })();

        const canRun = state.next.time <= time;
        const promise = new Promise<T>((resolve, reject) => {
            if (block) state.callers.push({ resolve, reject });
            else resolve(undefined as any);
        });

        state.next.time = time + delay;

        if (block) state.next.block = block;

        if (block || !canRun) {
            if (state.timeout) clearTimeout(state.timeout);
            state.timeout = setTimeout(() => this.debounce({ delay, resource }), delay);
        } else if (!state.busy && (block ||= state.next.block)) {
            state.next.block = undefined;
            state.busy = true;
            block()
                .then((success: T) => ({ success }))
                .catch((error: Error) => ({ error }))
                .then((result: { success?: T; error?: Error; }) => {
                    state.busy = false;
                    state.next.time = Date.now() + delay;
                    for (const caller of state.callers.splice(0)) {
                        if ('success' in result) caller.resolve(result.success!);
                        else caller.reject(result.error!);
                    }
                    this.debounce({ delay, resource });
                });
        }
        return promise;
    }

    /** Allow X users to run the resource-block simultaneously, allowing Y resource-block items to be queued , and spacing the calls at a minimum of Z ms apart
     * @example: 2-users, 5s-interval, means 2 calls per 5 seconds
     * - Ignores blocks when the queue is full
     * - Executes blocks LIFO
    */
    static throttle<T>({ resource, block, users = 1, queue = 1, interval = 0, order = 'LIFO' }: { interval?: number; resource?: any; block?: () => Promise<T>; users?: number; queue?: number; order?: 'LIFO' | 'FIFO' }) {
        resource ||= block;
        type STATE = { busy: number; queue: Function[]; callers: { resolve: (value: T) => void; reject: (reason?: any) => void; }[]; calls: number[] };
        const now = Date.now();
        const throttled: Map<any, STATE> = (this as any)[Symbol.for('throttled')] ||= new Map;
        const state: STATE = throttled.get(resource) || (() => {
            const state: STATE = { busy: 0, queue: [], callers: [], calls: [] };
            throttled.set(resource, state);
            return state;
        })();
        const promise = new Promise<T>((resolve, reject) => {
            if (block) state.callers.push({ resolve, reject });
            else resolve(undefined as any);
        })
        if (block && (state.queue.length + state.busy) < queue) {
            state.queue[{ LIFO: 'unshift', FIFO: 'push' }[order] as any](block);
        }
        this.removeElements(state.calls, ...state.calls.filter(time => (now - time) > interval));
        while (state.busy < users && state.queue.length) {
            const task = state.queue.shift()!;
            const delay = state.calls.length >= users ? (state.calls[0] + interval) - now : 0;
            state.busy++;
            state.calls.push(now + delay);
            Util.pause(delay)
                .then(() => task())
                .then((success: T) => ({ success }))
                .catch((error: Error) => ({ error }))
                .then(async (result: { success?: T; error?: Error; }) => {
                    await Util.pause(interval);
                    state.busy--;
                    for (const caller of state.callers.splice(0)) {
                        if ('success' in result) caller.resolve(result.success!);
                        else caller.reject(result.error!);
                    }
                    this.throttle({ resource, users, queue, interval });
                });
        }
        return promise;
    }

    static async waitUntil<T = any>(pred: (o: { elapsed: number; attempt: number; }) => T | Promise<T>, { retries = Infinity, pause = 25, timeElapsed = Infinity } = {}): Promise<T> {
        const startTime = new Date().getTime();
        let attempt = 0;
        let result!: T;
        while (!result) {
            if (!(result = await pred({ elapsed: new Date().getTime() - startTime, attempt: ++attempt }))) {
                retries--;
                if (retries <= 0) { throw new Error(`Util.waitUntil: timeout-retries`); }
                if ((new Date().getTime() - startTime) > timeElapsed) {
                    Error.stackTraceLimit = 100; // or a higher value, e.g., Infinity for unlimited
                    throw new Error('Util.waitUntil: timeout-timeElapsed')
                }
                await this.pause(pause);
            }
        }
        return result
    }

    static removeProperties<T>(obj: T, ...props: (keyof T)[]): T {
        for (const p of props) delete obj[p];
        return obj;
    }

    /** Removes elements from an array in-place */
    static removeElements<T>(arr: T[], ...elements: T[]): T[] {
        const removed = [];
        for (const element of elements) {
            const index = arr.indexOf(element);
            if (index >= 0) removed.push(...arr.splice(index, 1));
        }
        return removed;
    }

    static none<T>(arr: T[], pred: (el: T) => boolean = Boolean) { return arr.every(v => !pred(v)) }

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
        obj = this.shallowClone(obj);
        return JSON.stringify(obj, [...this.getKeys(obj)].sort(), pretty ? 2 : 0)
    }

    static async ArrayFromAsyncGenerator<T = any>(items: AsyncGenerator<T>) {
        const arr: T[] = [];
        for await (const item of await items) arr.push(item);
        return arr;
    }

    static move<T>(arr: Array<T>, item: T, direction: number) {
        const index = arr.indexOf(item);
        if (!this.between(index + direction, 0, arr.length - 1)) throw new Error('invalid-position-' + (index + direction));
        arr.splice(index, 1);
        arr.splice(index + direction, 0, item);
        return arr;
    }

    static clearAllProperties(obj: any, incudeSymbols = true) {
        for (const symbol of Object.getOwnPropertySymbols(obj)) delete obj[symbol];
        for (const name of Object.getOwnPropertyNames(obj)) delete obj[name];
        return obj;
    }

    static getUnrotatedCoordinates(
        { rotatedX, rotatedY, rotationDegrees, rotationPoint }:
            { rotatedX: number; rotatedY: number; rotationDegrees: number; rotationPoint: { x: number; y: number; }; }
    ): { x: number; y: number; } {
        // Convert rotation degrees to radians
        const radians = ((360 - rotationDegrees) * Math.PI) / 180;

        // Translate the rotated coordinates to the origin
        const translatedX = rotatedX - rotationPoint.x;
        const translatedY = rotatedY - rotationPoint.y;

        // Rotate the translated coordinates back to the unrotated position
        const unrotatedX =
            rotationPoint.x + translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
        const unrotatedY =
            rotationPoint.y + translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

        return { x: unrotatedX, y: unrotatedY };
    }

    static getRotatedCoordinates({ x, y, rotationDegrees, rotationPointX, rotationPointY }: { x: number; y: number; rotationDegrees: number; rotationPointX: number; rotationPointY: number; }): { x: number; y: number; } {
        // Convert rotation degrees to radians
        const radians = (rotationDegrees * Math.PI) / 180;

        // Translate the rectangle to the origin
        const translatedX = x - rotationPointX;
        const translatedY = y - rotationPointY;

        // Rotate the translated rectangle
        const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
        const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

        // Translate the rotated rectangle back to its original position
        const rotatedAndTranslatedX = rotatedX + rotationPointX;
        const rotatedAndTranslatedY = rotatedY + rotationPointY;

        return { x: rotatedAndTranslatedX, y: rotatedAndTranslatedY };
    }

    static findOverlappingRectangle(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
        const xOverlap = Math.max(0, Math.min(rect1.x + rect1.w, rect2.x + rect2.w) - Math.max(rect1.x, rect2.x));
        const yOverlap = Math.max(0, Math.min(rect1.y + rect1.h, rect2.y + rect2.h) - Math.max(rect1.y, rect2.y));
        if (xOverlap > 0 && yOverlap > 0) {
            return {
                x: Math.max(rect1.x, rect2.x),
                y: Math.max(rect1.y, rect2.y),
                w: xOverlap,
                h: yOverlap,
            };
        } else {
            return null; // No overlapping area
        }
    }

    static calculateDistance(point1: Point, point2: Point): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static greaterRectangle(rectangles: Rectangle[]) {
        return rectangles.reduce((all, s) => {
            all.x = Math.min(all.x ?? s.x, s.x);
            all.y = Math.min(all.y ?? s.y, s.y);
            all.w = Math.max(all.w, s.x - all.x);
            all.h = Math.max(all.h, s.y - all.y);
            return all;
        }, { w: 0, h: 0 } as { x: number; y: number; w: number; h: number; });
    }

    static isRectangleInside({ outer, inner }: { outer: Rectangle; inner: Rectangle; }) {
        return outer.x <= inner.x
            && outer.y <= inner.y
            && outer.x + outer.w >= inner.x + inner.w
            && outer.y + outer.h >= inner.y + inner.h
    }

    static scaleDownRectangles({ rectangles, scale, pivotPoint, inplace = false }: { rectangles: Rectangle[]; scale: number; pivotPoint: Point; inplace?: boolean; }): Rectangle[] {
        return rectangles.map(rect => {
            const deltaX = rect.x - pivotPoint.x;
            const deltaY = rect.y - pivotPoint.y;

            const scaledX = pivotPoint.x + scale * deltaX;
            const scaledY = pivotPoint.y + scale * deltaY;
            const scaledWidth = scale * rect.w;
            const scaledHeight = scale * rect.h;

            const scaled = {
                x: scaledX,
                y: scaledY,
                w: scaledWidth,
                h: scaledHeight,
            };

            if (inplace) Object.assign(rect, scaled);

            return scaled;
        });
    }

    static CLI = class CLI {
        static get switches() { return process.argv.slice(1).map(a => (/^--([^=]+)$/.exec(a) || [])[1]).filter(Boolean) as string[]; }
        static get params() { return (process.argv.slice(1).map(s => /^--(.+?)=(.+)$/.exec(s)?.slice(1)).filter(Boolean) as string[][]).reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {}) as any; }
    };

    static dateTimeInfo(timeZone: string, date = new Date().getTime()) {
        const locale = 'en-SE'; // YYYY-MM-DD, HH:MM:SS
        const datetime = new Date(date).toLocaleString(locale, { timeZone }).split(', ')
        const yyyymmdd = datetime[0];
        const time = datetime[1];
        const hhmm = time.replace(/:(\d+):\d+$/, (_, min) => `:${min >= 30 ? '30' : '00'}`);
        return { yyyymmdd: yyyymmdd, time, hhmm };
    }

    static score<T>(arr: T[], weights: Partial<Record<keyof T, number>>) {
        const minValues = {} as Record<keyof T, number>;
        const maxValues = {} as Record<keyof T, number>;
        for (const key in weights) {
            minValues[key] = Math.min(...arr.map(item => item[key] as number));
            maxValues[key] = Math.max(...arr.map(item => item[key] as number));
        }

        const calculateScore = (item: T): number => {
            return this.keys(weights).reduce((total, key) => {
                const weight = weights[key]!;
                const min = minValues[key];
                const max = maxValues[key];
                const normalized = (item[key] as number - min) / (max - min || 1); // Avoid division by zero.
                return total + weight * normalized;
            }, 0);
        };

        const scored = arr
            .map(item => ({ item, score: calculateScore(item) }))
            .sort((a, b) => b.score - a.score);

        return {
            highest: scored[0]?.item,
            lowest: scored[scored.length - 1]?.item,
            scored,
        };
    }

    static isUniversallyAcceptedFilename(filename: string) {
        return /^[^\\\/:*?"<>|0-9\s]+[^\\\/:*?"<>|\.]$/.test(filename)
            && !/^(CON|AUX|PRN|NUL|COM\d|LPT\d)$/i.test(filename)
            && !/\s+$/.test(filename)
    }

    static UniverallyAcceptedFilename(filename: string) {
        return this.isUniversallyAcceptedFilename(filename)
            ? filename
            : Base64.encodeSync(filename, { urlsafe: true });
    }

    static async streamToString(stream: ReadableStream) {
        const reader = stream.getReader();
        let result = '', done, value;
        while ({ done, value } = await reader.read(), !done)
            result += new TextDecoder("utf-8").decode(value);
        return result;
    }

    static toString(data: any): string {
        if (typeof data === 'string')
            return data;
        else {
            return data?.toString instanceof Function && data.toString !== Object.prototype.toString
                ? data.toString()
                : Util.toJSON(data)
        }
    };

}

