import { BinarySearchTree } from "./BinarySearchTree";
import { Util } from "./util";
import { expect } from 'chai';

describe('BinarySearchTree', () => {

    const t3 = BinarySearchTree.construct([33, 4, 5.2, 56, 66, 76, 43]);

    it('the children on the left side are less than this nodes data', () => {
        expect([...t3.left].every(val => val.data < t3.data));
    });

    it('the children on the right side are greater than this nodes data', () => {
        expect([...t3.right].every(val => val.data > t3.data));
    });

    it('can insert a new value', () => {
        t3.insert(1);
        expect(1).to.equal(t3.left.left.left.data);
        t3.insert(2);
        expect(2).to.equal(t3.left.left.left.right.data);
        t3.insert(3);
        expect(3).to.equal(t3.left.left.left.right.right.data);
    });

    it('can rebalance', () => {
        const depths = () => [...t3].map(node => {
            let depth = 0;
            while (node.parent) { depth++; node = node.parent }
            return depth;
        });
        const depth = () => Math.max(...depths());
        const depthBefore = depth();
        t3.rebalance();
        expect(depth()).to.be.lessThan(depthBefore);
    });

    it('identifies the lowest value', () => {
        expect(t3.lowest.data).to.equal(1);
    });

    it('can search for a node', () => {
        expect(t3.search(66)).to.be.ok;
    })

});