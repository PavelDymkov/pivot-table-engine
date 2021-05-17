import { not } from "logical-not";

import { PivotTableSetup, ValueSetupType } from "../setup";
import { FilterItem } from "../filter";
import { Filter } from "../filters";

export class FiltersSetup {
    readonly columns: { [column: number]: FilterItem[] } = {};
    readonly rows: { [column: number]: FilterItem[] } = {};

    readonly valuesGroup: { [column: number]: FilterItem[] } = {};
    readonly valuesAggregates: { i: number; filter: Filter }[] = [];

    constructor(filters: FilterItem[], setup: PivotTableSetup) {
        filters.forEach(item => {
            const { column } = item;

            switch (true) {
                case setup.columns.includes(column):
                    if (not(this.columns[column])) this.columns[column] = [];

                    this.columns[column].push(item);
                    break;
                case setup.rows.includes(column):
                    if (not(this.rows[column])) this.rows[column] = [];

                    this.rows[column].push(item);
                    break;
                case Boolean(
                    setup.values.find(
                        ({ type, column: index }) =>
                            type === ValueSetupType.ValueGroup &&
                            index === column,
                    ),
                ):
                    if (not(this.valuesGroup[column]))
                        this.valuesGroup[column] = [];

                    this.valuesGroup[column].push(item);
                    break;
                default:
                    const i = setup.values.findIndex(
                        ({ type, column: index }) =>
                            type === ValueSetupType.ValueAggregate &&
                            index === column,
                    );

                    if (i !== -1)
                        this.valuesAggregates.push({
                            i,
                            filter: item.filter,
                        });
                    break;
            }
        });
    }
}
