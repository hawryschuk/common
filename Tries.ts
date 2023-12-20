import { TreeNode } from './TreeNode';

/**- A trie can insert new words into its memory
 * - A trie performs a quick validation of whether words are in it
 * - A Word of N characters creates N levels of depth in the Trie 
*/
export class TrieNode extends TreeNode<any>{

    constructor(
        public key = '',
        public isFinal = false,
    ) {
        super(key);
    }

    get finalKey() { return this.key.charAt(this.key.length - 1); }

    includes(key: string) {
        const node = this.getNode(key, false);
        return node?.isFinal && !!node;
    }

    remove(key: string) {
        const node = this.getNode(key);
        if (node) node.isFinal = false;
        return !!node;
    }

    insert(key: string) {
        return Object.assign(
            this.getNode(key, true),
            { isFinal: true }
        );
    }

    /** All final words in the structure */
    get words() { return [...this].filter((v: TrieNode) => v.isFinal).map((v: TrieNode) => v.key); }

    /** Get a node : @example getNode('test'); this. */
    private getNode(key: string, autocreate = false) {
        let node: any = this;
        for (const k of key.split('')) {
            let child = node.children.find(c => c.finalKey === k);
            if (!child) {
                if (autocreate) {
                    node.children.push(child = new TrieNode(node.key + k));
                    node[k] = child;
                }
                else return null;
            }
            node = child;
        }
        return node;
    }
}
