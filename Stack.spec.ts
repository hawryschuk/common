import { expect } from 'chai';
import { Util } from "./util";
import { Stack } from './Stack';

describe('Stack', () => {
    const stack = new Stack(4, 5, 6);   // 
    it('can iterate a stack ( LIFO )', () => {
        expect([...stack].map(v => v.data)).to.deep.equal([6, 5, 4])
    });

    it('can peek at the top of the stack', () => {
        expect(stack.peek).to.equal(6);
        expect(stack.top.data).to.equal(6);
    })

    it('pushes an item onto the stack', () => {
        stack.push(7);
        expect(stack.peek).to.equal(7);
    });

    it('pops an item off the stack', () => {
        expect(stack.pop()).to.equal(7)
    });
});