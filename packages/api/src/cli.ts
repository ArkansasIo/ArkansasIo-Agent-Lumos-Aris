#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const home = process.env.LUMOS_ARIS_HOME || join(process.env.LOCALAPPDATA || process.env.HOME || process.cwd(), "LumosAris");
const root = home;
const opencode = join(root, "packages", "opencode");
const apiExe = join(root, "packages", "api", "dist", "lumos-aris-api.exe");

function run(command, args = []) {
  try { execFileSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" }); return true }
  catch { return false }
}
function info() {
  console.log("Lumos Aris");
  console.log("Home: " + root);
  console.log("Platform: " + process.platform + "/" + process.arch);
  console.log("Repository: " + (existsSync(join(root, ".git")) ? "OK" : "missing"));
  console.log("Agent runtime: " + (existsSync(join(opencode, "src", "index.ts")) ? "OK" : "missing"));
  console.log("API EXE: " + (existsSync(apiExe) ? "OK" : "not built"));
  console.log("Bun: " + (run("bun", ["--version"]) ? "OK" : "missing"));
}
const command = process.argv[2] || "start";
switch (command) {
  case "version": console.log("Lumos Aris CLI 0.1.0"); break;
  case "doctor":
  case "status": info(); break;
  case "update":
    if (!run("git", ["pull", "--ff-only"])) process.exit(1);
    if (!run("bun", ["install"])) process.exit(1);
    console.log("Lumos Aris updated.");
    break;
  case "repair":
    if (!run("bun", ["install", "--force"])) process.exit(1);
    console.log("Dependencies repaired. Re-run doctor to verify.");
    break;
  case "start":
  default:
    if (!existsSync(join(opencode, "src", "index.ts"))) {
      console.error("Lumos Aris is not installed. Run the platform installer first.");
      process.exit(1);
    }
    if (!run("bun", ["--cwd", opencode, "--conditions=browser", "src/index.ts", ...process.argv.slice(2)])) process.exit(1);
}
