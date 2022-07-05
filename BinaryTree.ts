import { TreeNode } from './TreeNode';

/** A Binary Tree is a data-structure of nodes where each node may have up to two child-nodes [left and right] */
export class BinaryTreeNode<T> extends TreeNode<T>{
    /** Convert an array of items into a binary-tree -- root being at the midpoint */
    static construct<T>(items: T[], parent?: BinaryTreeNode<T>): BinaryTreeNode<T> {
        if (items.length) {
            const mid = Math.floor(items.length / 2);
            const left = items.slice(0, mid);
            const right = items.slice(mid + 1);
            const node = new this(items[mid], parent);
            return Object.assign(node, {
                left: this.construct(left, node),
                right: this.construct(right, node)
            });
        }
    }

    constructor(public data: T, parent: BinaryTreeNode<T>) {
        super(data, parent);
    }

    left: BinaryTreeNode<T>;
    right: BinaryTreeNode<T>;

    /** Override children */
    get children() {
        return [this.left, this.right].filter(Boolean);
    }

    set children(children: any[]) {
        const [left, right] = children.map(val => new BinaryTreeNode(val, this));
        Object.assign(this, { left, right });
    }

    /** Inserts data into a free position (left, right), keep going down the tree */
    insert(data: T): BinaryTreeNode<T> {
        for (const node of this.BFS()) {
            const freeSide = ['left', 'right'].find(side => !node[side]);
            if (freeSide) return node[freeSide] = new BinaryTreeNode(data, node as any);
        }
    }
}

