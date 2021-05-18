import { not } from "logical-not";
import { Sorter } from "../sorters";

export class Tree<T> {
    readonly root = new Node();

    sort: Sorter[][] = [];

    iterate(callback: (value: T) => void): void {
        if (this.root.leaf) callback(this.root.leaf.value);

        iterateTree(this.root, callback, 0, this.sort);
    }

    touchLeaf(path: string[], create: () => T): T {
        let node = this.root;

        for (let i = 0, lim = path.length; i < lim; i++) {
            const key = path[i];

            if (not(node.hasChild(key))) node.setChild(key, new Node());

            node = node.getChild(key);
        }

        if (not(node.leaf)) node.leaf = new Leaf<T>(create());

        return node.leaf!.value;
    }

    getLeaf(path: string[]): T {
        let node = this.root;

        for (let i = 0, lim = path.length; i < lim; i++) {
            const key = path[i];

            if (not(node.hasChild(key))) throw new Error();

            node = node.getChild(path[i]);
        }

        return node.leaf!.value;
    }

    trace(path: string[]): boolean {
        let node = this.root;

        for (let i = 0, lim = path.length; i < lim; i++) {
            let key = path[i];

            if (not(node.hasChild(key))) return false;

            node = node.getChild(key);
        }

        return true;
    }
}

function iterateTree(
    node: Node,
    callbackValue: (value: any) => void,
    level: number,
    sort: Sorter[][],
): void {
    const entries = node.entries;

    if (level in sort) {
        const sorters = sort[level];

        entries.sort(([a], [b]) => {
            for (let i = 0, lim = sorters.length; i < lim; i++) {
                const sorter = sorters[i];
                const compare = sorter.compare(a, b);

                if (compare === 0) continue;

                return compare;
            }

            return 0;
        });
    }

    entries.forEach(([, childNode]) => {
        if (childNode.leaf) callbackValue(childNode.leaf.value);

        iterateTree(childNode, callbackValue, level + 1, sort);
    });
}

export class Node {
    leaf: Leaf<any> | null = null;

    private readonly map: Map<string, Node> = new Map();

    get entries(): [string, Node][] {
        return Array.from(this.map.entries());
    }

    get empty(): boolean {
        return this.map.size === 0 && this.leaf === null;
    }

    hasChild(key: string): boolean {
        return this.map.has(key);
    }

    getChild(key: string): Node {
        return this.map.get(key)!;
    }

    setChild(key: string, value: Node): void {
        this.map.set(key, value);
    }

    deleteChild(key: string): boolean {
        return this.map.delete(key);
    }

    remove(path: string[]): void {
        remove(this, path);
    }

    forEach(callback: (childNode: Node, key: string) => void): void {
        this.map.forEach(callback);
    }
}

function remove(node: Node, path: string[]): boolean {
    if (path.length === 0) {
        node.leaf = null;

        return true;
    }

    const [item, ...rest] = path;
    const child = node.getChild(item);

    if (child instanceof Node && remove(child, rest)) {
        node.deleteChild(item);

        return node.empty;
    }

    return false;
}

export class Leaf<T> {
    constructor(public readonly value: T) {}
}
