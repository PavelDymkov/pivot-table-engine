const { join } = require("path");

module.exports = env => ({
    mode: env.production ? "production" : "development",

    target: "web",

    entry: "./src/index.ts",
    output: {
        path: __dirname,
        filename: "index.js",
        library: {
            type: "commonjs",
        },
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader" }],
    },

    devtool: "inline-source-map",
});
