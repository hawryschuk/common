const childrenSymbol = Symbol.for('children')

/** A tree contains children and its nodes may be iterated */
export class TreeNode<T>{
    static construct<T>(data: T[], parent?: TreeNode<T>): TreeNode<T> {
        const node = new this(data[0], parent);
        return Object.assign(node, {
            children: data.splice(1).map((i: any) => {
                if (!(i instanceof this)) i = new this(i, node);
                i.parent = node;
                return i;
            })
        });
    }

    get parent() { return this[Symbol.for('parent')] }
    set parent(parent: TreeNode<T>) { this[Symbol.for('parent')] = parent; }

    constructor(public data: T, parent?: TreeNode<T>) {
        this.parent = parent;
    }

    private [childrenSymbol]: TreeNode<T>[] = [];
    public get children(): TreeNode<T>[] { return this[childrenSymbol]; }
    public set children(value: TreeNode<T>[]) { this[childrenSymbol] = value; }

    /** Iterate the object using the DFS algorithm by default */
    *[Symbol.iterator]() {
        for (const n of this.DFS())
            yield n;
    }

    /** DFS */
    *DFS() {
        const queue: TreeNode<T>[] = [this];
        let node: TreeNode<T>;
        while (node = queue.shift()) {
            yield node;
            queue.unshift(...node.children);
        }
    }

    /** BFS */
    *BFS() {
        const queue: TreeNode<T>[] = [this];
        let node: TreeNode<T>;
        while (node = queue.shift()) {
            yield node;
            queue.push(...node.children);
        }
    }

    /** Insert data directly as a child */
    insert(data: T) {
        const node = data instanceof TreeNode && data || new (this.constructor as any)(data, this);
        this.children.push(node);
        return node;
    }

    /** Whether the tree contains the data */
    search(data: T, iterator = 'BFS' as 'DFS' | 'BFS'): TreeNode<T> {
        for (const node of this[iterator]())
            if (node.data === data)
                return node;
    }

}
