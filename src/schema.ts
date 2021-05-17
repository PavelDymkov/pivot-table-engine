import { defaultFormatter, Formatter } from "./formatter";

export abstract class Column<Value> {
    abstract get defaultFormatter(): Formatter;
    abstract get defaultValue(): Value;

    abstract parse(value: any): Value;
}

class StringType extends Column<string> {
    get defaultFormatter(): Formatter {
        return defaultFormatter;
    }

    get defaultValue(): string {
        return "";
    }

    parse(value: any): string {
        return value ? String(value) : this.defaultValue;
    }
}

class NumberType extends Column<number> {
    get defaultFormatter(): Formatter {
        return defaultFormatter;
    }

    get defaultValue(): number {
        return 0;
    }

    parse(value: any): number {
        return Number(value) || this.defaultValue;
    }
}

export const Schema = {
    String: new StringType() as Column<string>,
    Number: new NumberType() as Column<number>,
} as const;
