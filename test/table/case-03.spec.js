const { Table, sort, az } = require("../../");
const { assertTable: assert } = require("../tools");
const { rows1, schema1 } = require("./data/1");

it("table/case-03-1", () => {
    const table = Table.create(schema1);

    table.setSort([sort(0, az())]);
    table.addRows(rows1);

    assert(table, [rows1[0], rows1[2], rows1[1]]);
});

it("table/case-03-2", () => {
    const table = Table.create(schema1);

    table.addRows(rows1);
    table.setSort([sort(0, az())]);

    assert(table, [rows1[0], rows1[2], rows1[1]]);
});
