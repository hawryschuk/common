import { Graph } from './Graph';
import { Util } from './util';
import { expect } from 'chai';

describe('Graph', () => {
    it('can be seen in a diagram', async () => {
        const t = Graph.construct([1, 2, Graph.construct([3, 4])]);
        t.children[1].children[0].children.push(t)

        const h = Graph.construct([0, 1, 4]);
        h.search(1).children.push(h.search(4), new Graph(3), new Graph(2));
        h.search(3).children.push(h.search(2), h.search(4));
    });
});