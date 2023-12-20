import { Util } from './util';
import { Queue } from './Queue';
import { expect } from 'chai';

describe('Queue: FIFO', () => {
    const q = new Queue<number>(5, 2, 3);
    it('can iterate the queue', () => {
        expect([...q].map(v => v.data)).to.deep.equal([5, 2, 3])
    })
    it('knows the first item', () => {
        expect(q.first.data).to.equal(5);
    });
    it('knows the last item', () => {
        expect(q.last.data).to.equal(3);
    });
    it('can queue a value 22', () => {
        q.queue(22);
        expect(q.last.data).to.equal(22);
    });
    it('can peek at the first item in queue', () => {
        expect(q.peek).to.equal(5)
    });
    it('can dequeue a value', () => {
        expect(q.dequeue()).to.equal(5);
    });
    it('knows when the queue is empty', () => {
        while (!q.isEmpty) q.dequeue();
    });
});
