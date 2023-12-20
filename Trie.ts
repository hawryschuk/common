interface TrieNode<T> {
    key?: string;                               // single character character
    children?: { [char: string]: TrieNode<T> };
    final?: { key: string; value?: T; };
};

/** Trie : Prefix Tree */
export class Trie<T = any> {
    private root: TrieNode<T> = {};

    private getNode(key: string, create = false) {
        let node = this.root;
        for (const k of key.split(''))
            create
                ? node = (node.children ||= {})[k] ||= { key: k }
                : node &&= node.children[k];
        return node;
    }

    /** Iterate with BFS */
    *[Symbol.iterator]() {
        let node: TrieNode<T>;
        const queue = [this.root];
        while (node = queue.shift()) {
            if (node.final) yield node.final;
            queue.push(...(
                (Object.values(node.children || {}) as TrieNode<T>[])
                    .sort((a, b) => a.key.localeCompare(b.key))
            ));
        }
    }

    insert(key: string, value?: T): void {
        this.getNode(key, true).final = (value === undefined ? { key } : { key, value });
    }

    includes(key: string) { return !!this.getNode(key)?.final }

    get(key: string) { return this.getNode(key)?.final?.value }

    remove(key: string) {
        const parent = this.getNode(key.substring(0, key.length - 1));
        const final = key.charAt(key.length - 1);
        const node = parent?.children[final]
        if (node?.final) delete parent[final];
        return !!node?.final;
    }
}