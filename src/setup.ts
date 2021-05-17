import { not } from "logical-not";

import { AggregateFunctionFactory } from "./aggregate-functions";
import { Formatter } from "./formatter";

export class PivotTableSetup {
    columns: Setup["columns"] = [];
    rows: Setup["rows"] = [];
    values: ValueSetup[] = [];
    valuesForGroup: number[] = [];
    valuesForAggregate: number[] = [];
    showValuesLabels = false;

    update(source: Partial<Setup>, columns: number): void {
        const inRange = inRangeSource.bind(null, columns);

        this.columns = (source.columns || []).filter(inRange).filter(uniq);
        this.rows = (source.rows || []).filter(inRange).filter(uniq);

        this.values = [];
        this.valuesForGroup = [];
        this.valuesForAggregate = [];

        this.showValuesLabels = true;

        source.values?.forEach((item, i) => {
            try {
                const valueSetup = new ValueSetup(item);

                if (
                    valueSetup.type === ValueSetupType.ValueAggregate ||
                    valueSetup.type === ValueSetupType.ValueGroup
                ) {
                    const { column: index } = valueSetup;

                    if (not(inRange(null, index))) return;

                    if (valueSetup.type === ValueSetupType.ValueAggregate)
                        this.valuesForAggregate[i] = i;
                    else this.valuesForGroup[i] = i;

                    if (this.showValuesLabels)
                        this.showValuesLabels = Boolean(valueSetup.label);
                } else {
                    this.valuesForAggregate[i] = i;
                }

                this.values.push(valueSetup);
            } catch (_) {}
        });
    }
}

export interface Setup {
    columns: number[];
    rows: number[];
    values: Value[] | ValueLabeled[];
    columnsAdvancedSetup: Partial<AdvancedSetup>;
    rowsAdvancedSetup: Partial<AdvancedSetup>;
}

export interface AdvancedSetup {
    // collapsable: boolean;
    // initialExpandLevel: number;
}

export type Value = ValueAggregate | ValueGroup | Aggregate;
export type ValueLabeled = Value & Labeled;

export interface Labeled {
    label: string;
}

export interface ValueAggregate {
    column: number;
    aggregateFunction: AggregateFunctionFactory;
}

export interface ValueGroup {
    column: number;
}

export interface Aggregate {
    aggregateFunction: AggregateFunctionFactory;
    formatter: Formatter;
}

export enum ValueSetupType {
    ValueAggregate = 1,
    ValueGroup,
    Aggregate,
}

type Keys<T> = (keyof T)[];

const valueAggregateKeys: Keys<ValueAggregate> = [
    "column",
    "aggregateFunction",
];
const valueGroupKeys: Keys<ValueGroup> = ["column"];
const aggregateKeys: Keys<Aggregate> = ["aggregateFunction"];

export class ValueSetup {
    readonly type: ValueSetupType;
    readonly column: number;
    readonly aggregateFunction: AggregateFunctionFactory | null;
    readonly label: string;

    constructor(source: Value) {
        const keys = Object.keys(source);

        if (valueAggregateKeys.every(includes, keys))
            this.type = ValueSetupType.ValueAggregate;
        else if (valueGroupKeys.every(includes, keys))
            this.type = ValueSetupType.ValueGroup;
        else if (aggregateKeys.every(includes, keys))
            this.type = ValueSetupType.Aggregate;
        else throw new Error();

        switch (this.type) {
            case ValueSetupType.ValueAggregate:
                this.column = (source as ValueAggregate).column;
                this.aggregateFunction = (source as ValueAggregate).aggregateFunction;
                break;
            case ValueSetupType.ValueGroup:
                this.column = (source as ValueGroup).column;
                this.aggregateFunction = null;
                break;
            case ValueSetupType.Aggregate:
                this.column = -1;
                this.aggregateFunction = (source as Aggregate).aggregateFunction;
                break;
        }

        this.label = (source as ValueLabeled).label || "";
    }
}

function includes(this: string[], key: string): boolean {
    return this.includes(key);
}

function inRangeSource(columns: number, _: any, i: number): boolean {
    return i >= 0 && i < columns;
}

function uniq<T>(item: T, i: number, array: T[]): boolean {
    return array.indexOf(item) === i;
}
