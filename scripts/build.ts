import { spawnSync } from "child_process";
import { writeFileSync as write } from "fs";
import { join, resolve } from "path";
import { cp, exit, mkdir, pwd, rm, test } from "shelljs";

if (pwd().stdout.trim() !== join(__dirname, "..")) exit(1);

if (test("-d", "package")) rm("-rf", "package");

mkdir("package");

createPackageJSON: {
    const packageJSON = require("../package.json");

    delete packageJSON.scripts;
    delete packageJSON.devDependencies;

    packageJSON.main = "index.js";
    packageJSON.types = ".";

    const path = resolve("package/package.json");
    const file = JSON.stringify(packageJSON, null, "  ");

    write(path, file);
}

copyAssets: {
    cp(["LICENSE", "README.md"], "package");
}

build: {
    const devMode = "DEV_MODE" in process.env;

    if (devMode) execute("webpack -w");
    else {
        execute("webpack --env production");
        execute("npm run test");
        // execute("npm version patch");
        // execute("git push");
    }
}

// service

function execute(command: string): void {
    const [name, ...args] = command.split(/\s+/);

    spawnSync(name, args, { stdio: "inherit" });
}
