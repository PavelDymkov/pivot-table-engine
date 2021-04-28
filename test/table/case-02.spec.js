const { Table, filter, equal } = require("../../");
const { assertTable: assert } = require("../tools");
const { rows1, schema1 } = require("./data/1");

it("table/case-02-1", () => {
    const table = Table.create(schema1);

    table.setFilters([filter(0, equal("a"))]);
    table.addRows(rows1);

    assert(table, [rows1[0], rows1[2]]);
});

it("table/case-02-2", () => {
    const table = Table.create(schema1);

    table.addRows(rows1);
    table.setFilters([filter(0, equal("a"))]);

    assert(table, [rows1[0], rows1[2]]);
});
