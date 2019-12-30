const path = require("path");
const fs = require("fs-extra");

const dist = path.resolve(__dirname, "..", "dist");
scanfolder(dist);

function scanfolder(folder) {
  const files = fs.readdirSync(folder);
  for (const p of files) {
    const newP = path.join(folder, p);
    const lst = fs.lstatSync(newP);
    const isFolder = lst.isDirectory();
    if (isFolder) {
      scanfolder(newP);
    } else if (lst.isFile()) {
      if (newP.endsWith(".js")) {
        const file = fs.readFileSync(newP, { encoding: "utf8" });
        const newFile = file.replace(/require\(("|')(.+)([A-Z]{1}:\\\\.+)("|')\);/g, (_, rel, __, win, ___) => {
          const newPath = path.resolve(rel, win.replace(/\\\\/g, "/")).replace("\\server\\src", "\\server\\dist");
          let final = path.relative(path.resolve(newP, ".."), newPath).replace(/\\/g, "/");
          console.log("matched -> " + _);
          if (!final.startsWith(".")) final = "./" + final;
          const resolved = `require("${final}");`;
          console.log("resolve -> " + resolved);
          return resolved;
        });
        fs.writeFileSync(newP, newFile, { flag: "w+", encoding: "utf8" });
      }
    }
  }
}
