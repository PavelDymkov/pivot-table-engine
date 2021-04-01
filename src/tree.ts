import { not } from "logical-not";

import {
    AggregateFunction,
    AggregateFunctionFactory,
} from "./aggregate-function";

type Node = Map<string | symbol, Node | AggregateFunction>;

const aggregateFunctionLink = Symbol();

export class Tree {
    readonly root: Node = new Map();

    private current: Node = this.root;

    toRootNode(): void {
        this.current = this.root;
    }

    toChild(path: string): void {
        this.touch(path);

        this.current = this.current.get(path) as Node;
    }

    touch(path: string): void {
        if (not(this.current.has(path))) this.current.set(path, new Map());
    }

    finalize(
        pathArray: string[],
        value: any,
        aggregateFunctionFactory: AggregateFunctionFactory,
    ): void {
        const node = pathArray.reduce((node, path) => {
            if (not(node.has(path))) node.set(path, new Map());

            return node.get(path) as Node;
        }, this.current);

        if (not(node.has(aggregateFunctionLink)))
            node.set(aggregateFunctionLink, aggregateFunctionFactory());

        (node.get(aggregateFunctionLink) as AggregateFunction).next(value);
    }

    iterate(callbackLabel: CallbackLabel, callbackValue: CallbackValue): void {
        iterateTree(this.root, callbackLabel, callbackValue, 0);
    }
}

type CallbackLabel = (label: string, level: number) => void;
type CallbackValue = (value: any) => void;

function iterateTree(
    map: Node,
    callbackLabel: (path: string, level: number) => void,
    callbackValue: (value: any) => void,
    level: number,
): void {
    map.forEach((value, path) => {
        if (path === aggregateFunctionLink) {
            const aggregateFunction = value as AggregateFunction;

            callbackValue(aggregateFunction.getSummeryValue());
        } else {
            callbackLabel(path as string, level);

            if (value instanceof Map && value.size > 0) {
                iterateTree(value, callbackLabel, callbackValue, level + 1);
            }
        }
    });
}
