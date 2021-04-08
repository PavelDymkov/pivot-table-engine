import { AggregateFunction } from "./aggregate-function";
import { Average } from "./average";
import { Count } from "./count";
import { First } from "./first";
import { Last } from "./last";
import { Maximum } from "./maximum";
import { Median } from "./median";
import { Minimum } from "./minimun";
import { Mode } from "./mode";
import { Range } from "./range";
import { Sum } from "./sum";

export * from "./aggregate-function";

export type AggregateFunctionFactory = () => AggregateFunction;

export const average: AggregateFunctionFactory = () => new Average();
export const count: AggregateFunctionFactory = () => new Count();
export const first: AggregateFunctionFactory = () => new First();
export const last: AggregateFunctionFactory = () => new Last();
export const maximum: AggregateFunctionFactory = () => new Maximum();
export const median: AggregateFunctionFactory = () => new Median();
export const minimum: AggregateFunctionFactory = () => new Minimum();
export const mode: AggregateFunctionFactory = () => new Mode();
export const range: AggregateFunctionFactory = () => new Range();
export const sum: AggregateFunctionFactory = () => new Sum();
