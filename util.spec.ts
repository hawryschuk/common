import { Util } from "./util";
import { expect } from 'chai';

describe('Util', () => {
    it('can generate a random integer within a range', () => {
        expect(Util.random({ min: 1, max: 5 })).to.be.gte(1).and.lte(5);
    });
    it('can create an array of integers within a range', () => {
        expect(Util.range({ min: 3, max: 5 })).to.deep.equal([3, 4, 5]);
    });
    it('rounds a number', () => {
        expect(Util.round(10.2)).to.equal(10);
        expect(Util.round(10.4, 0.5)).to.equal(10.5);
        expect(Util.round(10.6, 0.5)).to.equal(10.5);
        expect(Util.round(10.8, 0.5)).to.equal(11);
    });
    it('gets the unique items in an array', () => {
        expect(Util.unique([11, 11, 2, 3])).to.deep.equal([11, 2, 3]);
        // expect(Util.unique2([11, 11, 2, 3])).to.deep.equal([11, 2, 3]);
    });
    it('plucks keys from an array of objects', () => {
        expect(Util.pluck([{ a: 1, b: 2, c: 3 }, { a: 4, c: 5 }], 'a', 'c')).to.deep.equal([{ a: 1, c: 3 }, { a: 4, c: 5 }]);
    });
    it('deletes props from an object', () => {
        expect(Util.deleteProps({ a: 1, b: 2, c: 3 }, ['b'])).to.deep.equal({ a: 1, c: 3 });
    });
    it('moves an item in array : up/down a specified amount', () => {
        expect(Util.move([5, 6, 7, 8], 6, -1)).to.deep.equal([6, 5, 7, 8]);
        expect(Util.move([5, 6, 7, 8], 7, -2)).to.deep.equal([7, 5, 6, 8]);
        expect(Util.move([5, 6, 7, 8], 6, 1)).to.deep.equal([5, 7, 6, 8]);
        expect(() => Util.move([5, 6, 7, 8], 6, -10)).to.throw();
    });
    it('generates permutations of an array', () => {
        const permutations = [...Util.permute([1, 2, 3])];  // spread to iterate all
        expect(permutations).to.deep.equal([
            [1, 2, 3],
            [2, 1, 3],
            [3, 1, 2],
            [1, 3, 2],
            [2, 3, 1],
            [3, 2, 1]
        ]);
    });
    it('waits until a condition happens', () => {
        let x = 0;
        Util.pause(30).then(() => x = 3);
        Util.waitUntil(() => {
            return x === 3;
        }, { pause: 20 })
    });
    it('removes elements from an array in place', () => {
        const a = [3, 4, 5];
        Util.removeElements(a, 4);
        expect(a).to.deep.equal([3, 5]);
    });
    it('does things while a condition', () => {
        let x = 0;
        Util.while({
            condition: () => x !== 3,
            do: () => x++,
        })
    });
    it('finds an element with specified property values from an array', () => {
        expect(Util.findWhere([{ a: 1, b: 2 }, { a: 3, b: 4 }], { a: 3 })).to.deep.equal({ a: 3, b: 4 });
    });
    it('shuffles an array in place', async () => {
        await Util.waitUntil(() => !Util.equalsDeep(
            Util.shuffle([1, 2, 3]),
            [1, 2, 3]
        ), { pause: 1 });
    });
    it('finds elements in an array where the elements match criteria', () => {
        expect(Util.where(
            [
                { a: 1, b: 4 },
                { a: 2 },
                { a: 1, b: 3 }
            ],
            { a: 1 }
        )).to.deep.equal(
            [
                { a: 1, b: 4 },
                { a: 1, b: 3 }
            ]
        );
    });
    it('without: removes elements from an array', () => {
        expect(Util.without([55, 66, 77], [66])).to.deep.equal([55, 77]);
        expect(Util.without([55, 66, 66, 77], [66], { allOccurrences: true })).to.deep.equal([55, 77]);
    });
    it('checks if two objects equal each other deeply', () => {
        expect(Util.equalsDeep({ a: [1, , 3] }, { a: [1, , 3] })).to.equal(true);
        expect(Util.equalsDeep({ a: [1, , 3] }, { b: [1, , 3] })).to.equal(false);
    });

    it('computes the factorial', async () => {
        expect(Util.factorial(4)).to.equal(4 * 3 * 2);
        expect(Util.factorial(0)).to.equal(1);
    });

    it('computes the binomial coefficient -- C(n,k) -- N choose K', () => {
        expect(Util.binomial(50, 2)).to.equal(1225)
    });

    it('iterates all arrangements of N', () => {
        expect([...Util.arrange([1, 2, 3])]).to.deep.equal([
            [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]
        ]);
        expect(Util.powerset([1, 2, 3])).to.deep.equal([
            [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]
        ])
    });

    it('permutes N choose K', async () => {
        expect([...Util.choose([1, 2, 3], 2)])
            .to.deep.equal([[1, 2], [1, 3], [2, 3]])
    })

    it('does a binary search', () => {
        expect(Util.binarySearch([1, 2, 3, 4, 5], 3)).to.gte(0)
        expect(Util.binarySearch([1, 2, 3, 4, 5], 7)).to.equal(-1)
    });

    it('can synchronize an object with an updated source', () => {
        const nestedRef: any = { a: 1, b: 2 };
        const arrRef: any = [{ id: 1 }, { id: 2 }];
        const target: any = { nested: nestedRef, arr: arrRef };
        Util.syncInto(target, { nested: { a: 99 }, arr: [{ id: 1, x: 5 }] });
        expect(target.nested === nestedRef).true;
        expect(target.arr === arrRef).true;
    });
})
