const { Schema } = require("../../../");

exports.schema2 = [Schema.String, Schema.Number, Schema.String];

exports.rows2 = [
    ["a", 4, "x"],
    ["b", 2, "x"],
    ["a", 1, "x"],
    ["a", 4, "y"],
    ["b", 1, "x"],
    ["a", 2, "x"],
    ["b", 3, "x"],
    ["a", 5, "x"],
];
