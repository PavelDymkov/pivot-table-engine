import { not } from "logical-not";

import { AggregateFunctionFactory } from "./aggregate-functions";

export class PivotTableSetup {
    private value: SetupInternal = {
        columns: [],
        rows: [],
        values: [],
        groupColumnsBy: [],
        groupRowsBy: [],
        showValuesLabels: false,
    };

    get showValuesLabels(): SetupInternal["showValuesLabels"] {
        return this.value.showValuesLabels;
    }

    get columns(): SetupInternal["columns"] {
        return this.value.columns;
    }

    get rows(): SetupInternal["rows"] {
        return this.value.rows;
    }

    get values(): SetupInternal["values"] {
        return this.value.values;
    }

    update(source: Partial<Setup>, columns: number): void {
        const values: ValuesInternal[] = [];
        const inRange = inRangeSource.bind(null, columns);

        let showValuesLabels = true;

        source.values?.forEach(item => {
            const value: ValuesInternal = {
                key: Symbol(),
                label: (item as ValuesLabeled).label || "",
                index: item.index,
                aggregateFunction: item.aggregateFunction,
            };

            const { index } = value;

            if (not(inRange(null, index))) return;

            const isUniq = not(values.find(item => item.index === index));

            if (isUniq) {
                values.push(value);

                if (showValuesLabels)
                    showValuesLabels = Boolean((item as ValuesLabeled).label);
            }
        });

        scope: {
            const columns = (source.columns || []).filter(inRange).filter(uniq);
            const groupColumnsBy = (source.groupColumnsBy || []).filter(n =>
                columns.includes(n),
            );

            if (groupColumnsBy.length === 0 && columns.length > 0)
                groupColumnsBy[0] = columns[0];

            const rows = (source.rows || []).filter(inRange).filter(uniq);
            const groupRowsBy = (source.groupRowsBy || []).filter(n =>
                rows.includes(n),
            );

            if (groupRowsBy.length === 0 && rows.length > 0)
                groupRowsBy[0] = rows[0];

            this.value = {
                columns,
                rows,
                values,
                showValuesLabels,
                groupColumnsBy,
                groupRowsBy,
            };
        }
    }

    getValueLabel(key: symbol): string {
        for (let i = 0, lim = this.values.length; i < lim; i++) {
            const item = this.values[i];

            if (item.key === key) return item.label || "";
        }

        return "";
    }

    getColumnByKey(key: symbol): number {
        for (let i = 0, lim = this.values.length; i < lim; i++) {
            const item = this.values[i];

            if (item.key === key) return item.index;
        }

        return -1;
    }
}

export interface Setup {
    columns: number[];
    rows: number[];
    values: Values[] | ValuesLabeled[];
    groupColumnsBy: number[];
    groupRowsBy: number[];
}

export interface Values {
    index: number;
    aggregateFunction: AggregateFunctionFactory;
}

export interface ValuesLabeled extends Values {
    label: string;
}

export type SetupInternal = Omit<Setup, "values"> & {
    values: ValuesInternal[];
    showValuesLabels: boolean;
};

export interface ValuesInternal {
    key: symbol;
    label: string;
    index: number;
    aggregateFunction: AggregateFunctionFactory;
}

function inRangeSource(columns: number, _: any, i: number): boolean {
    return i >= 0 && i < columns;
}

function uniq<T>(item: T, i: number, array: T[]): boolean {
    return array.indexOf(item) === i;
}
