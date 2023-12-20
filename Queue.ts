/** Queue [FIFO] */
class Queue_JS<T> {
    private items: T[] = [];
    queue(d: T) { this.items.push(d); }
    dequeue() { return this.items.shift(); }
    get isEmpty() { return !this.items.length; }
    get peek() { return this.items[0]; }

    /** Iterates the queue from the first-item to the last-item (FIFO) */
    *[Symbol.iterator]() {
        for (const item of this.items)
            yield item;
    }
}

export class QueueNode<T>{
    next: QueueNode<T>;
    constructor(public data: T) { }
}

/** First In First Out : Queue, DeQueue */
export class Queue<T>{
    first: QueueNode<T>;
    last: QueueNode<T>;

    constructor(...items: T[]) {
        for (const i of items) this.queue(i);
    }

    get isEmpty() { return !this.first; }

    get peek() { return this.first && this.first.data; }

    queue(d: T): void {
        const last = new QueueNode(d);
        this.first ||= last;
        if (this.last) this.last.next = last;
        this.last = last;
    }

    dequeue(): T {
        if (this.first) {
            const dequeued = this.first;
            this.first = this.first.next;
            if (!this.first) delete this.last;
            return dequeued.data;
        }
    }

    /** Iterates the queue from the first-item to the last-item (FIFO) */
    *[Symbol.iterator]() {
        let node = this.first;
        while (node) {
            yield node;
            node = node.next;
        }
    }
}