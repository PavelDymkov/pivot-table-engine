const { deepStrictEqual: equal } = require("assert");

exports.assertTable = (table, expected) => {
    const actual = [];

    for (let i = 0, lim = table.rows; i < lim; i++)
        actual.push(table.getRow(i));

    equal(actual, expected);
};
