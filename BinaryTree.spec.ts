import { expect } from 'chai';
import { BinaryTreeNode } from './BinaryTree';
import { Util } from './util';

describe('BinaryTree', () => {
    let t: BinaryTreeNode<number>;

    before(() => {
        t = BinaryTreeNode.construct([4, 2, 3].sort());
    });

    it('inserts data in the most accomodating place (BFS)', () => {
        const node = t.insert(40);
        expect(t.left.left).to.equal(node)
        const node2 = t.insert(50);
        expect(t.left.right).to.equal(node2)
        const node3 = t.insert(60);
        expect(t.right.left).to.equal(node3)
    });
});
