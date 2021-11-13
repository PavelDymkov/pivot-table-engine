const { Table } = require("../../package/index");
const { assertTable: assert } = require("../tools");
const { rows1, schema1 } = require("./data/1");

it("table/case-01", () => {
    const table = Table.create(schema1);

    table.addRows(rows1);

    assert(table, rows1);
});
