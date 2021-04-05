import { FilterEqual } from "./equal";
import { Filter } from "./filter";

export function equal(value: any): Filter {
    const filter = new FilterEqual();

    filter.init(value);

    return filter;
}
