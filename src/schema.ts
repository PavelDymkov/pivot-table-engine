export abstract class Column {
    abstract get defaultValue(): any;

    abstract parse(value: any): any;
    abstract toString(value: any): string;
}

class BaseType extends Column {
    get defaultValue(): any {
        return null;
    }

    parse(value: any): any {
        return value;
    }

    toString(value: any): string {
        return String(value);
    }
}

class StringType extends BaseType {
    get defaultValue(): string {
        return "";
    }

    parse(value: any): string {
        return value ? String(value) : this.defaultValue;
    }
}
class NumberType extends BaseType {
    get defaultValue(): number {
        return 0;
    }

    parse(value: any): number {
        return Number(value) || this.defaultValue;
    }
}

export const Schema: Record<"String" | "Number", Column> = {
    String: new StringType(),
    Number: new NumberType(),
};
