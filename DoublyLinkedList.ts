import { LinkedList } from './LinkedList';

// Double Linked List -- we track the next and previous
export class DoublyLinkedList<T> extends LinkedList<T>{
    constructor(
        public data: T,
        public previous: DoublyLinkedList<T> = null,
        public next: DoublyLinkedList<T> = null,
    ) {
        super(data);
        if (next) next.previous = this;
        if (previous) previous.next = this;
    }

    /** Add data after position */
    add(data: T, after = this.tail) {
        return new DoublyLinkedList(
            data,
            after as DoublyLinkedList<T>,
            after.next as DoublyLinkedList<T>
        );
    }

    /** Update node.previous.next and node.next.previous  */
    remove(data = undefined as T, node = undefined as DoublyLinkedList<T>) {
        const item = this.search(data) as DoublyLinkedList<T>;
        if (item) {
            const { next, previous } = item;
            if (previous) previous.next = next;
            if (next) next.previous = previous;
            if (item === this && next) { // move item2 overtop of item1
                this.data = next.data;
                this.next = next.next;
            }
        }
    }
}
