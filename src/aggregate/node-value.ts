import { not } from "logical-not";
import { AggregateFunction } from "../aggregate-functions";

import { Filter } from "../filters";
import { PivotTableSetup } from "../pivot-table-setup";
import { Table } from "../table";
import { Key, Node, Tree } from "../tree";
import { FiltersSetup } from "./filters-setup";

export interface AttachGroups {
    groups?: NodeValue[][];
}

export class NodeValue {
    static createNodeValues(
        table: Table,
        setup: PivotTableSetup,
        filtersSetup: FiltersSetup,
        createGroups: boolean,
    ): NodeValue[] & AttachGroups {
        const tree = new Tree();

        interface ValueFilter {
            key: symbol;
            path: string[];
            filter: Filter;
        }

        const valueFilters: ValueFilter[] = [];

        iterating: for (let row = 0, lim = table.rows; row < lim; row++) {
            tree.toRootNode();

            const path: string[] = [];

            for (let i = 0, lim = setup.rows.length; i < lim; i++) {
                const column = setup.rows[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.rows[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                path.push(label);
            }

            for (let i = 0, lim = setup.columns.length; i < lim; i++) {
                const column = setup.columns[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.columns[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                path.push(label);
            }

            path.forEach(label => tree.toChild(label));

            setup.values.forEach(({ key, index, aggregateFunction }) => {
                tree.aggregate(
                    key,
                    table.getValue(index, row),
                    aggregateFunction,
                );

                filtersSetup.values.forEach(({ column, filter }) => {
                    if (index === column)
                        valueFilters.push({
                            key,
                            path,
                            filter,
                        });
                });
            });
        }

        valueFilters.forEach(({ key, path, filter }) => {
            const deleteStack: [Node, Key][] = [];

            let node = tree.root;

            for (let i = 0, lim = path.length; i < lim; i++) {
                const key = path[i];

                deleteStack.unshift([node, key]);

                if (node.has(key)) node = node.get(key)! as Node;
                else return;
            }

            if (node.has(key)) {
                const aggregateFunction = node.get(key)! as AggregateFunction;
                const value = aggregateFunction.getSummeryValue();

                if (not(filter.check(value))) {
                    for (let i = 0, lim = deleteStack.length; i < lim; i++) {
                        const [node, key] = deleteStack[i];

                        node.delete(key);

                        if (node.size > 0) break;
                    }
                }
            }
        });

        let values: NodeValue[] & AttachGroups = [];
        let path = [] as any[];

        const attachGroupsMap = {} as any;

        tree.iterate(
            (key: Key, i: number) => {
                path[i] = key;
            },
            (value: any) => {
                const node = new NodeValue(path.slice(), value);

                if (createGroups) {
                    let current = attachGroupsMap;

                    path.forEach((key: Key) => {
                        if (typeof key === "string") {
                            if (not(key in current)) current[key] = {};

                            current = current[key];
                        } else {
                            if (not(keysProperty in current))
                                current[keysProperty] = [];

                            current[keysProperty].push(node);
                        }
                    });
                } else {
                    values.push(node);
                }
            },
        );

        if (createGroups) values.groups = createAttachGroups(attachGroupsMap);

        return values;
    }

    static ungroup(
        source: NodeValue[] & AttachGroups,
    ): NodeValue[] & AttachGroups {
        if (source.groups) {
            source.length = 0;

            source.groups.forEach(group =>
                group.forEach(item => source.push(item)),
            );
        }

        return source;
    }

    constructor(public readonly path: any[], public readonly value: any) {}
}

function getLabel(table: Table, column: number, row: number): any {
    return table.getSchema(column).toString(table.getValue(column, row));
}

const keysProperty = Symbol();

function createAttachGroups(attachGroupsMap: any): NodeValue[][] {
    const values: NodeValue[][] = [];

    fillAttachGroups(attachGroupsMap, [], values);

    return values;
}

function fillAttachGroups(
    map: any,
    path: string[],
    attachGroups: NodeValue[][],
): void {
    Object.keys(map).forEach(key => {
        fillAttachGroups(map[key], path.concat(key), attachGroups);
    });

    Object.getOwnPropertySymbols(map).forEach(key => {
        if (key === keysProperty) {
            attachGroups.push(map[keysProperty] as NodeValue[]);
        }
    });
}
