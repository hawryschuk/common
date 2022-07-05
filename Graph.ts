import { TreeNode } from './TreeNode';

/** A graph may contain circular connections */
export class Graph<T> extends TreeNode<T>{
    static construct<T>(data: T[]): Graph<T> {
        return Object.assign(
            new Graph(data[0]),
            { children: data.splice(1).map(i => i instanceof Graph ? i : new Graph(i)) }
        );
    }

    constructor(data: T) { super(data) }

    *DFS(visited = [] as Graph<T>[]) {
        if (!visited.includes(this)) {
            visited.push(this);
            yield this;
            for (const c of (this.children as Graph<T>[])) {
                for (const n of c.DFS(visited)) {
                    yield n;
                }
            }
        }
    }

    *BFS() {
        const visited = [];
        const queue: Graph<T>[] = [this];
        let node: Graph<T>;
        while (node = queue.shift()) {
            if (!visited.includes(node)) {
                visited.push(node);
                queue.push(...node.children as Graph<T>[]);
                yield node;
            }
        }
    }

}
