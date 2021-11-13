import { npmPackagr } from "npm-packagr";
import {
    assets,
    badge,
    BadgeType,
    build,
    cleanBadges,
    doIf,
    git,
    packageJSON,
    test,
    version,
} from "npm-packagr/pipelines";

npmPackagr({
    pipelines: [
        doIf({
            env: "publish",
            pipelines: [
                git("check-status"),

                cleanBadges(),

                build(({ exec }) => exec("webpack --env production")),

                badge(BadgeType.Build),

                test(),

                badge(BadgeType.Test),

                version("patch"),
            ],
        }),

        packageJSON(packageJson => {
            delete packageJson.scripts;
            delete packageJson.devDependencies;

            packageJson.main = "index.js";
            packageJson.bin = {
                packagr: "./cli.js",
            };
            packageJson.types = ".";
        }),

        doIf({
            env: "publish",
            pipelines: [
                badge(BadgeType.License),

                git("commit", "pivot-table-engine"),
                git("push"),
            ],
        }),

        assets("LICENSE", "README.md"),

        doIf({
            env: "dev",
            pipeline: build(({ exec }) => {
                exec("tsc --watch");
            }),
        }),
    ],
});
