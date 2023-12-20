import { BinaryTreeNode } from './BinaryTree';

/** Expects the data to be balanced -- the data is in order */
export class BinarySearchTree<T> extends BinaryTreeNode<T>{
    left: BinarySearchTree<T>;
    right: BinarySearchTree<T>;

    static compare = (a, b) => typeof a === 'number' && typeof b === 'number'
        ? a - b
        : `${a}`.localeCompare(`${b}`);

    static construct<T>(items: T[], parent?: BinarySearchTree<T>): BinarySearchTree<T> {
        return super.construct([...items].sort(BinarySearchTree.compare), parent) as BinarySearchTree<T>;
    }

    /** rebalance the tree by just creating a new */
    rebalance() {
        const { data, left, right } = BinarySearchTree.construct([...this].map(i => i.data));
        Object.assign(this, { data, left, right });
    }

    get lowest() {
        let node: BinarySearchTree<T> = this;
        while (node.left) node = node.left;
        return node;
    }

    /** Insert on the side most accomodating */
    insert(data: T) {
        const newNode = new BinarySearchTree(data, this);
        return !BinarySearchTree.compare(data, this.data) && this
            || BinarySearchTree.compare(data, this.data) < 0 && (this.left ? this.left.insert(data) : this.left = newNode)
            || BinarySearchTree.compare(data, this.data) > 0 && (this.right ? this.right.insert(data) : this.right = newNode);
    }

    /** Search for the node with the data -- binary search -- recursive */
    search(data: T) {
        let node: BinarySearchTree<T> = this;
        while (node) {
            if (BinarySearchTree.compare(node.data, data) === 0) {
                return node;
            } else if (BinarySearchTree.compare(node.data, data) > 0) {
                node = node.left;
            } else if (BinarySearchTree.compare(node.data, data) < 0) {
                node = node.right;
            }
        }
    }

    /** Whether the tree contains the data -- binary search -- non-recursive */
    includes(data: T) {
        return !!this.search(data);
    }
}
