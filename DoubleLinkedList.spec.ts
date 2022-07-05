import { Util } from "./util";
import { DoublyLinkedList } from './DoublyLinkedList';
import { expect } from "chai";

describe('DoublyLinkedList', () => {
    const list = DoublyLinkedList.construct([7, 8, 9]) as DoublyLinkedList<number>;
    it('knows the previous and the next', () => {
        const item1 = [...list][1] as DoublyLinkedList<number>;
        expect(item1.previous.data).to.equal(7)
        expect(item1.next.data).to.equal(9)
    });
    it('an item is added to the end of the list', () => {
        list.add(10);
        expect(list.tail.data).to.equal(10);
    });
    it('an item is added to the middle of the list', () => {
        list.add(5, list.search(8));
        expect(list.search(8).next.data).to.equal(5);
    });
    it('an item is removed', () => {
        list.remove(8);
        expect(list.includes(8)).to.not.be.ok;
    });
});