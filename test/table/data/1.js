const { Schema } = require("../../../");

exports.schema1 = [Schema.String, Schema.Number, Schema.String];

exports.rows1 = [
    ["a", 1, "x"],
    ["b", 2, "y"],
    ["a", 3, "y"],
];
