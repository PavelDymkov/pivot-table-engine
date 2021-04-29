import { not } from "logical-not";

import {
    AggregateFunction,
    AggregateFunctionFactory,
} from "../aggregate-functions";

export type Key = string | symbol;
export type Node = Map<Key, Node | Leaf>;

export class Leaf {
    private summeryValue: any = null;

    get value(): any {
        if (this.summeryValue === null)
            this.summeryValue = this.aggregateFunction.getSummeryValue();

        return this.summeryValue;
    }

    constructor(public readonly aggregateFunction: AggregateFunction) {}
}

export class Tree {
    readonly root: Node = new Map();

    addValue(
        path: string[],
        key: symbol,
        value: any,
        aggregateFunctionFactory: AggregateFunctionFactory,
    ): void {
        const node: Node = path.reduce((node, item) => {
            if (not(node.has(item))) node.set(item, new Map());

            return node.get(item)! as Node;
        }, this.root);

        if (not(node.has(key)))
            node.set(key, new Leaf(aggregateFunctionFactory()));

        const leaf = node.get(key)! as Leaf;

        leaf.aggregateFunction.next(value);
    }

    getValue(path: string[], key: symbol): any {
        let node = this.root;

        for (let i = 0, lim = path.length; i < lim; i++) {
            const item = path[i];

            node = node.get(item)! as Node;

            if (not(node instanceof Map)) return null;
        }

        const leaf = node.get(key)! as Leaf;

        return leaf instanceof Leaf ? leaf.value : null;
    }

    remove(path: string[]): void {
        remove(this.root, path);
    }

    iterate(callbackLabel: CallbackKey, callbackValue: CallbackValue): void {
        iterateTree(this.root, callbackLabel, callbackValue, 0);
    }
}

function remove(node: Node, path: string[]): boolean {
    if (path.length === 0) return true;

    const [item, ...rest] = path;
    const child = node.get(item);

    if (child instanceof Map && remove(child, rest)) {
        node.delete(item);

        return node.size === 0;
    }

    return false;
}

type CallbackKey = (key: Key, level: number) => void;
type CallbackValue = (value: any) => void;

function iterateTree(
    map: Node,
    callbackKey: (key: Key, level: number) => void,
    callbackValue: (value: any) => void,
    level: number,
): void {
    map.forEach((node, key) => {
        callbackKey(key, level);

        if (node instanceof Leaf) callbackValue(node.value);
        else iterateTree(node, callbackKey, callbackValue, level + 1);
    });
}
