// Single Linked List : From a head/any-node to a tail node
// All we know is the head, and whats next
export class LinkedList<T> {
    static construct<T>(items: T[]) {
        const first = new this(items.shift());
        while (items.length) first.add(items.shift());
        return first;
    }

    constructor(public data: T) { }

    /** Iterate through the whole linked list */
    *[Symbol.iterator]() {
        let node: LinkedList<T> = this;
        while (node) {
            yield node;
            node = node.next;
        }
    }

    next: LinkedList<T>;

    get tail() { return [...this].pop(); }

    search(data: T) { for (const item of this) if (item.data === data) return item; }
    
    includes(data: T) { return !!this.search(data) }

    add(data: T) { return this.tail.next = new LinkedList(data); }

    /** Removes the node with the data (and returns the node removed) */
    remove(data: T) {
        const item = this.search(data);
        const previous = [...this].find(p => p.next === item);
        if (previous) {                          // p.next = item.next;
            previous.next = item.next;
        } else if (item === this && this.next) { // put n2 into n1 and remove n2 
            this.data = this.next.data;
            this.next = this.next.next;
        } else if (item === this && !this.next) {
            throw new Error('last item remaining');
        }
    }
}
