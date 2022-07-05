import { BinaryTreeNode } from './BinaryTree';

export class BinaryMinHeap<T> extends BinaryTreeNode<T>{
    left: BinaryMinHeap<T>;
    right: BinaryMinHeap<T>;

    /** Convert an array of items into a binary-tree -- root being at the midpoint */
    static construct<T>(items: T[], parent?: BinaryMinHeap<T>): BinaryMinHeap<T> {
        const [min, ...right] = items.sort((a: any, b: any) => a - b);
        const left = right.splice(0, right.length / 2);
        const node = new BinaryMinHeap(min, parent);
        return Object.assign(
            node,
            {
                left: left.length && this.construct(left, node),
                right: right.length && this.construct(right, node)
            }
        );
    }

    /** Remove the top : move left up */
    extract_minimum() {
        const { data } = this;
        let node: BinaryMinHeap<T> = this;
        while (node) {
            const [lower] = node.children.sort((a, b) => a.data - b.data);
            if (lower) {
                node.data = lower.data;
                lower.data = null;
                if (!lower.children.length) {
                    const side = ['left', 'right'].find(side => node[side] === lower);
                    node[side] = null;
                }
            }
            node = lower;
        }
        return data;
    }

    /** Insert at bottom right */
    /** Swap node with parent */
    insert(data: T): BinaryMinHeap<T> {
        let newNode = (() => {
            let parent: BinaryMinHeap<T> = this;
            while (parent.right) { parent = parent.right; }
            return parent.right = new BinaryMinHeap(data, parent);
        })();
        const getParent = () => [...this as any].find(p => p.children.includes(newNode));
        do {
            const parent = getParent();
            const swap = parent && parent.data > newNode.data;
            if (swap) {
                const temp = parent.data;
                parent.data = newNode.data;
                newNode.data = temp;
            }
            newNode = swap && parent;
        } while (getParent());
        return newNode;
    }
}
