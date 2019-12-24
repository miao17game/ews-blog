const path = require("path");
const { spawn } = require("child_process");

const args = process.argv.slice(2);

let version = `0.0.${new Date().getTime()}`;
for (const argv of args) {
  if (argv.startsWith("-v=") || argv.startsWith("--version=")) {
    version = argv.split("=")[1];
  }
}

const command = "docker";
const params = ["build", "-t", `bigmogician/ews-core:${version}`, "."];

console.log("$ " + command + " " + params.join(" "));

spawn("docker", ["build", "-t", `bigmogician/ews-core:${version}`, "."], {
  env: process.env,
  cwd: path.resolve(__dirname, ".."),
  stdio: ["pipe", process.stdout, process.stderr],
});
