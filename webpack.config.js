const { resolve } = require("path");

module.exports = env => ({
    mode: env.production ? "production" : "development",

    target: "web",

    entry: "./src/index.ts",
    output: {
        path: resolve("package"),
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

    devtool: env.production ? false : "inline-source-map",
});
