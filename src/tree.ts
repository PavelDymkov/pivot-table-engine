import { not } from "logical-not";

import {
    AggregateFunction,
    AggregateFunctionFactory,
} from "./aggregate-functions";

export type Key = string | symbol;
export type Node = Map<Key, Node | AggregateFunction>;

export class Tree {
    readonly root: Node = new Map();

    private current: Node = this.root;

    toRootNode(): void {
        this.current = this.root;
    }

    toChild(key: Key): void {
        this.touch(key);

        this.current = this.current.get(key) as Node;
    }

    touch(key: Key): void {
        if (not(this.current.has(key))) this.current.set(key, new Map());
    }

    aggregate(
        key: Key,
        value: any,
        aggregateFunctionFactory: AggregateFunctionFactory,
    ): void {
        let aggregateFunction: AggregateFunction;

        if (this.current.has(key)) {
            aggregateFunction = this.current.get(key) as AggregateFunction;
        } else {
            aggregateFunction = aggregateFunctionFactory();

            this.current.set(key, aggregateFunction);
        }

        aggregateFunction.next(value);
    }

    iterate(callbackLabel: CallbackKey, callbackValue: CallbackValue): void {
        iterateTree(this.root, callbackLabel, callbackValue, 0);
    }
}

type CallbackKey = (key: Key, level: number) => void;
type CallbackValue = (value: any) => void;

function iterateTree(
    map: Node,
    callbackKey: (key: Key, level: number) => void,
    callbackValue: (value: any) => void,
    level: number,
): void {
    map.forEach((value, key) => {
        callbackKey(key, level);

        if (value instanceof AggregateFunction)
            callbackValue(value.getSummeryValue());
        else if (value instanceof Map && value.size > 0)
            iterateTree(value, callbackKey, callbackValue, level + 1);
    });
}
