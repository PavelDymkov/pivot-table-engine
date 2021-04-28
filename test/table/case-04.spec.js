const { Table, sort, az, za } = require("../../");
const { assertTable: assert } = require("../tools");
const { rows2, schema2 } = require("./data/2");

it("table/case-04-1", () => {
    const table = Table.create(schema2);

    table.setSort([sort(0, az()), sort(1, za())]);
    table.addRows(rows2);

    assert(table, [
        rows2[7],
        rows2[0],
        rows2[3],
        rows2[5],
        rows2[2],
        rows2[6],
        rows2[1],
        rows2[4],
    ]);
});

it("table/case-04-2", () => {
    const table = Table.create(schema2);

    table.setSort([sort(0, az()), sort(1, az())]);
    table.addRows(rows2);

    assert(table, [
        rows2[2],
        rows2[5],
        rows2[0],
        rows2[3],
        rows2[7],
        rows2[4],
        rows2[1],
        rows2[6],
    ]);
});

it("table/case-04-3", () => {
    const table = Table.create(schema2);

    table.setSort([sort(0, za()), sort(1, az())]);
    table.addRows(rows2);

    assert(table, [
        rows2[4],
        rows2[1],
        rows2[6],
        rows2[2],
        rows2[5],
        rows2[0],
        rows2[3],
        rows2[7],
    ]);
});

it("table/case-04-4", () => {
    const table = Table.create(schema2);

    table.setSort([sort(0, za()), sort(1, za())]);
    table.addRows(rows2);

    assert(table, [
        rows2[6],
        rows2[1],
        rows2[4],
        rows2[7],
        rows2[0],
        rows2[3],
        rows2[5],
        rows2[2],
    ]);
});
