const path = require("path");
const { spawn, spawnSync } = require("child_process");

const args = process.argv.slice(2);

const yarn = /^win/.test(process.platform) ? "yarn.cmd" : "yarn";

let version = `0.0.${new Date().getTime()}`;
let quick = false;
for (const argv of args) {
  if (argv.startsWith("-v=") || argv.startsWith("--version=")) {
    version = argv.split("=")[1];
    continue;
  }
  if (argv.startsWith("-q=") || argv.startsWith("--quick=")) {
    quick = argv.split("=")[1] === "true";
    continue;
  }
}

function runSync(command, args) {
  return spawnSync(command, args, {
    env: process.env,
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
    stdio: ["pipe", process.stdout, process.stderr],
  });
}

if (!quick) {
  runSync(yarn, ["install:all"]);
  runSync(yarn, ["build:client"]);
}

const command = "docker";
const params = ["build", "-t", `bigmogician/ews-blog:${version}`, "."];

console.log("$ " + command + " " + params.join(" "));

spawn("docker", ["build", "-t", `bigmogician/ews-blog:${version}`, "."], {
  env: process.env,
  cwd: path.resolve(__dirname, ".."),
  stdio: ["pipe", process.stdout, process.stderr],
});
