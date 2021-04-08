import { not } from "logical-not";

import { FilterItem } from "../filter";
import { PivotTableSetup } from "../pivot-table-setup";
import { Table } from "../table";
import { Key, Tree } from "../tree";
import { filter } from "./node-value-filter";

export interface AttachGroups {
    groups?: NodeValue[][];
}

export class NodeValue {
    static createNodeValues(
        table: Table,
        setup: PivotTableSetup,
        filters: FilterItem[],
        createGroups: boolean,
    ): NodeValue[] & AttachGroups {
        return filter(createNodeValues(table, setup), filters, setup);
    }

    constructor(public readonly path: any[], public readonly value: any) {}
}

function createNodeValues(
    table: Table,
    setup: PivotTableSetup,
): NodeValue[] & AttachGroups {
    const values: NodeValue[] = [];
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
            tree.aggregate(key, table.getValue(index, row), aggregateFunction);
        });
    }

    let path = [] as any[];

    tree.iterate(
        (key: Key, i: number) => {
            path[i] = key;
        },
        (value: any) => {
            values.push(new NodeValue(path.slice(), value));
        },
    );

    // if (createGroups) (values as AttachGroups).groups = createGroups(tree);

    return values;
}
