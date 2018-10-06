const packager = require("electron-packager");
packager({
    dir: ".",
    ignore: [
        /\.gitignore/,
        /ims-app/,
        /\bdata\b/,
        /print\ sample/,
        /binaries/,
        /\.vscode/,
        /package-lock\.json/,
        /build.js/
    ],
    arch: "ia32",
    platform: "win32",
    executableName: "GCR_Dyeing",
    out: "./binaries",
    name: "GCR Dyeing",
    overwrite: true,
    prune: true,
    asar: true
}).then(appPaths => console.log(appPaths)).catch(error => console.log(error));