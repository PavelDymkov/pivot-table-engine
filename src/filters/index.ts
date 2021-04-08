import { FilterEqual } from "./equal";
import { Filter } from "./filter";
import { FilterGreaterThen } from "./greater-then";

export * from "./filter";

export function equal(value: any): Filter {
    return new FilterEqual(value);
}

export function greaterThen(value: any): Filter {
    return new FilterGreaterThen(value);
}
