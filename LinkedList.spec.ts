import { Util } from "./util";
import { LinkedList } from './LinkedList';
import { expect } from "chai";

describe('LinkedList', () => {
    const list = LinkedList.construct([4, 5, 6]);
    it('can iterate the list', () => {
        expect([...list].map(v => v.data)).to.deep.equal([4, 5, 6])
    });

    it('knows the tail end of the list', () => {
        expect(list.tail.data).to.equal(6);
    });

    it('adds an item to the tail-end of the list', () => {
        list.add(7);
        expect(list.tail.data).to.equal(7);
    });

    it('can check if data is included in the list', () => {
        expect(list.includes(4)).to.equal(true);
    });

    it('can search the list for an item with data', () => {
        expect(list.search(5)).to.equal(list.next);
    });

    it('removes an item from a list', () => {
        list.remove(6);
        expect(list.includes(6)).to.equal(false);
    });
});