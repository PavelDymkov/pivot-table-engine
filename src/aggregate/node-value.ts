import { not } from "logical-not";

import { Filter } from "../filters";
import { PivotTableSetup } from "../pivot-table-setup";
import { Table } from "../table";
import { Key, Tree } from "../tree";
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

        for (let row = 0, lim = table.rows; row < lim; row++) {
            tree.toRootNode();

            setup.rows.forEach(column => {
                const label = table.getLabel(column, row);

                tree.toChild(label);
            });

            setup.columns.forEach(column => {
                const label = table.getLabel(column, row);

                tree.toChild(label);
            });

            setup.values.forEach(({ key, index, aggregateFunction }) => {
                tree.aggregate(
                    key,
                    table.getValue(index, row),
                    aggregateFunction,
                );
            });
        }

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

        filtersSetup.columns.forEach(({ column, filter }) => {
            const i = setup.rows.length + setup.columns.indexOf(column);

            filterBy(i, filter);
        });

        filtersSetup.rows.forEach(({ column, filter }) => {
            const i = setup.rows.indexOf(column);

            filterBy(i, filter);
        });

        filtersSetup.values.forEach(({ column, filter }) => {
            const { key } = setup.values.find(item => item.index === column)!;

            if (createGroups) {
                values.groups = values.groups!.filter(group => {
                    const item = group.find(
                        item => item.path[item.path.length - 1] === key,
                    )!;

                    return filter.check(item.value);
                });
            } else {
                values = values.filter(item => {
                    const last = item.path[item.path.length - 1];

                    return last === key ? filter.check(item.value) : true;
                });
            }
        });

        return values;

        function filterBy(i: number, filter: Filter): void {
            if (createGroups)
                values.groups = values.groups!.filter(group =>
                    filter.check(group[0].path[i]),
                );
            else values = values.filter(item => filter.check(item.path[i]));
        }
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
