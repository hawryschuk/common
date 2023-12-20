import { TreeNode } from './TreeNode';
import { Util } from './util';
import { expect } from 'chai';
describe('TreeNode', () => {
    const t = TreeNode.construct([                  //     A
        'A',                                        //  B     C
        TreeNode.construct(['B', 'D', 'E']),        // D E   F G
        TreeNode.construct(['C', 'F', 'G'])
    ]);

    it('BFS node order', () => {
        expect(Util.pluck([...t.BFS()], 'data')).to.deep.equal(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    });

    it('DFS node order [default]', () =>
        expect(Util.pluck([...t.DFS()], 'data')).to.deep.equal(['A', 'B', 'D', 'E', 'C', 'F', 'G'])
    );

    it('can search for a node with a value', () =>
        expect(t.search('C')).to.be.ok);
});
