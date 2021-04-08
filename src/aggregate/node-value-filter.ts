import { not } from "logical-not";

import { PivotTableSetup } from "../pivot-table-setup";
import { FilterItem } from "../filter";
import { Filter } from "../filters";
import { NodeValue } from "./node-value";

export function filter(
    values: NodeValue[],
    filters: FilterItem[],
    setup: PivotTableSetup,
): NodeValue[] {
    filters.forEach(({ column, filter }) => {
        filterByRowsOrColumns(column, filter) || filterByValues(column, filter);
    });

    return values;

    function filterByRowsOrColumns(column: number, filter: Filter): boolean {
        const i = indexInRowsOrColumns(column);

        if (i === -1) return false;

        values = values.filter(item => filter.check(item.path[i]));

        return true;
    }

    function indexInRowsOrColumns(column: number): number {
        for (let i = 0, lim = setup.rows.length; i < lim; i++)
            if (setup.rows[i] === column) return i;

        for (let i = 0, lim = setup.columns.length; i < lim; i++)
            if (setup.columns[i] === column) return setup.rows.length + i;

        return -1;
    }

    function filterByValues(column: number, filter: Filter): boolean {
        let currentKey: symbol;
        let restKeys: symbol[] = [];

        setup.values.forEach(({ key, index }) => {
            if (index === column) currentKey = key;
            else restKeys.push(key);
        });

        values.forEach(item => {
            const last = item.path[item.path.length - 1] as symbol;

            if (last === currentKey && not(filter.check(item.value))) {
                const path = item.path.slice(0, -1);

                values = values.filter(item =>
                    not(path.every((value, i) => item.path[i] === value)),
                );
            }
        });

        return true;
    }
}
