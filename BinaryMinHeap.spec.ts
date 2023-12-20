import { expect } from 'chai';
import { BinaryMinHeap } from './BinaryMinHeap';
import { Util } from './util';

describe('BinaryMinHeap', () => {

    const items = [10, 15, 20, 5, 25, 30, 35];
    const h = BinaryMinHeap.construct(items);

    it('is optimized to know the minimum value', () => {
        expect(h.data).to.equal(5);
    });

    it('can insert new values', () => {
        h.insert(2);
        expect(h.data).to.equal(2);
    });

    it('can remove the minimum value', () => {
        expect(h.extract_minimum()).to.equal(2);
        expect(h.data).to.equal(5);
    });
});
