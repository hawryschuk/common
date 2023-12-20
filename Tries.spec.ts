import { TrieNode } from './Tries';
import { expect } from 'chai';

describe('Tries', () => {
    const t = new TrieNode('');
    it('inserts keys', () => {
        t.insert('many');
        t.insert('man');
    });
    it('verifies if a key a exists', () => {
        expect(t.includes('ma')).to.not.be.ok;
        expect(t.includes('man')).to.be.ok;
    });
    it('removes keys', () => {
        t.remove('man');
    });
    it('can iterate the entries', () => {
        expect([...t].filter((v: TrieNode) => v.isFinal).map((v: TrieNode) => v.key)).to.deep.equal(['many']);
    });
});