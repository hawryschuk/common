/** Stack [LIFO] */
class Stack_JS<T> {
    constructor(public items: T[] = []) { }
    push(data: T) { this.items.push(data); }
    pop(): T { return this.items.pop(); }
    get peek() { return this.items[this.items.length - 1] }
    get isEmpty() { return this.items.length === 0; }

    /** Iterates the stack from the top to the bottom */
    *[Symbol.iterator]() {
        for (const item of this.items.reverse())
            yield item;
    }
}

export class StackNode<T> {
    constructor(
        public data: T,
        public previous: StackNode<T>
    ) { }
}

export class Stack<T> {
    top: StackNode<T>;

    constructor(...items: T[]) {
        for (const item of items)
            this.push(item)
    }

    get peek(): T { return this.top?.data }

    get isEmpty() { return !this.top; }

    push(data: T) { this.top = new StackNode(data, this.top); }

    pop(): T {
        const popped = this.top;
        this.top &&= this.top.previous;
        return popped.data;
    }

    /** Iterates the stack from the top item to the bottom item (LIFO) */
    *[Symbol.iterator]() {
        let node = this.top;
        while (node) {
            yield node;
            node = node.previous;
        }
    }
}

