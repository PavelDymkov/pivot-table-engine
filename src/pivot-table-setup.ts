import not from "logical-not";

export class PivotTableSetup {
    private value: Setup = {
        columns: [],
        rows: [],
        values: [],
    };

    get columns(): Setup["columns"] {
        return this.value.columns;
    }

    get rows(): Setup["rows"] {
        return this.value.rows;
    }

    get values(): Setup["values"] {
        return this.value.values;
    }

    update(source: Partial<Setup>, columns: number): void {
        const range = {
            start: 0,
            end: columns,
        };

        let values: number | Values[] = [];

        if (
            typeof source.values === "number" &&
            inRange.call(range, null, source.values)
        ) {
            values = source.values;
        } else if (Array.isArray(source.values)) {
            source.values.forEach(item => {
                const { index } = item;

                if (not(inRange.call(range, null, index))) return;

                const isUniq = not(
                    (values as Values[]).find(item => item.index === index),
                );

                if (isUniq) (values as Values[]).push(item);
            });
        }

        this.value = {
            columns: (source.columns || []).filter(inRange, range).filter(uniq),
            rows: (source.rows || []).filter(inRange, range).filter(uniq),
            values,
        };
    }
}

export interface Setup {
    columns: number[];
    rows: number[];
    values: number | Values[];
}

export interface Values {
    label: string;
    index: number;
}

function inRange(
    this: { start: number; end: number },
    _: any,
    i: number,
): boolean {
    return i >= this.start && i < this.end;
}

function uniq<T>(item: T, i: number, array: T[]): boolean {
    return array.indexOf(item) === i;
}
