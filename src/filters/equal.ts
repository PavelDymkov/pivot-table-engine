import { Filter } from "./filter";

export class FilterEqual extends Filter {
    private value: any;

    init(value: any): void {
        this.value = value;
    }

    check(value: any): boolean {
        return value === this.value;
    }
}
