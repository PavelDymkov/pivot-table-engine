import not from "logical-not";
import { AggregateFunctionFactory } from "./aggregate-function";

export class PivotTableSetup {
    private value: SetupInternal = {
        columns: [],
        rows: [],
        values: [],
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

        this.value = {
            columns: (source.columns || []).filter(inRange).filter(uniq),
            rows: (source.rows || []).filter(inRange).filter(uniq),
            values,
            showValuesLabels,
        };
    }

    getValueLabel(key: symbol): string {
        for (let i = 0, lim = this.values.length; i < lim; i++) {
            const item = this.values[i];

            if (item.key === key) return item.label || "";
        }

        return "";
    }
}

export interface Setup {
    columns: number[];
    rows: number[];
    values: Values[] | ValuesLabeled[];
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
