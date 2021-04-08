import { FilterEqual } from "./equal";
import { Filter } from "./filter";
import { FilterGreaterThen } from "./greater-then";
import { FilterGreaterThenOrEqual } from "./greater-then-or-equal";
import { FilterLessThen } from "./less-then";
import { FilterLessThenOrEqual } from "./less-then-or-equal";
import { FilterNotEqual } from "./not-equal";

export * from "./filter";

export function equal(value: any): Filter {
    return new FilterEqual(value);
}

export function greaterThenOrEqual(value: any): Filter {
    return new FilterGreaterThenOrEqual(value);
}

export function greaterThen(value: any): Filter {
    return new FilterGreaterThen(value);
}

export function lessThenOrEqual(value: any): Filter {
    return new FilterLessThenOrEqual(value);
}

export function lessThen(value: any): Filter {
    return new FilterLessThen(value);
}

export function not(value: any): Filter {
    return new FilterNotEqual(value);
}

// aliases

export const gte = greaterThenOrEqual;
export const gt = greaterThen;
export const lte = lessThenOrEqual;
export const lt = lessThen;
