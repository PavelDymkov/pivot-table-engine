import { AZ } from "./az";
import { Sorter } from "./sorter";
import { ZA } from "./za";

export * from "./sorter";

export function az(): Sorter {
    return new AZ();
}

export function za(): Sorter {
    return new ZA();
}
