import { not } from "logical-not";

import { PivotTableSetup } from "../pivot-table-setup";
import { FilterItem } from "../filter";
import { Filter } from "../filters";

export class FiltersSetup {
    readonly columns: { [column: number]: FilterItem[] } = {};
    readonly rows: { [column: number]: FilterItem[] } = {};

    readonly values: FilterItem[] = [];

    constructor(filters: FilterItem[], setup: PivotTableSetup) {
        this.columns = [];
        this.rows = [];
        this.values = [];

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
                // case !!setup.values.find(({ index }) => index === column):
                //     this.values.push(item);
                //     break;
                default:
                    setup.values.forEach(({ index }) => {
                        if (index === column) this.values.push(item);
                    });
            }
        });
    }
}
