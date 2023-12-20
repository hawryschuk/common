import { Trie } from "./Trie";
import { expect } from "chai";

describe('Trie : Prefix Tree', () => {
    const trie = new Trie();
    const entries = [
        { key: 'lie', value: 'a mistruth' },
        { key: 'man', value: 'a human male' },
        { key: 'many', value: 'a lot' },
        { key: 'my', value: 'being mine' }
    ];

    it('can inserts entries', () => {
        for (const { key, value } of entries)
            trie.insert(key, value);
    });

    it('gets entries', () => {
        expect(trie.get('many')).to.equal('a lot');
        expect(trie.get('ma')).to.equal(undefined);
    });
    it('verifies inclusion of entries', () => {
        expect(trie.includes('ma')).to.be.false;
        expect(trie.includes('man')).to.be.true;
        expect(trie.includes('many')).to.be.true;
    });
    it('removes entries', () => {
        expect(trie.remove('man')).to.be.ok;
        expect(trie.remove('ma')).to.not.be.ok;
    });
    it('iterates entries', () => {
        const sortFunc = (a, b) => a.key.localeCompare(b.key);
        expect([...trie].sort(sortFunc)).to.deep.equal(entries.sort(sortFunc));
    });
})
