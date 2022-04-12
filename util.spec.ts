import { Util } from "./util";
import { expect } from 'chai';

describe('Util', () => {
    it('without: removes elements from an array', () => {
        expect(Util.without([55, 66, 77], [66])).to.deep.equal([55, 77]);
        expect(Util.without([55, 66, 66, 77], [66], { allOccurrences: true })).to.deep.equal([55, 77]);
    });
    it('checks if two objects equal each other deeply', () => {
        expect(Util.equalsDeep({ a: [1, , 3] }, { a: [1, , 3] })).to.equal(true);
        expect(Util.equalsDeep({ a: [1, , 3] }, { b: [1, , 3] })).to.equal(false);
    });
})
