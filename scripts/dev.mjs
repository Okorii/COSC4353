import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const backendDir = path.resolve(rootDir, "backend");

function startProcess(name, cwd, args, color) {
  const child = spawn([npmCommand, ...args].join(" "), {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  const prefix = `\x1b[${color}m[${name}]\x1b[0m`;

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    console.log(`${prefix} exited with code ${code ?? "unknown"}`);
    shutdown(code ?? 0);
  });

  return child;
}

const children = [];
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }
    process.exit(exitCode);
  }, 500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

children.push(
  startProcess("backend", backendDir, ["run", "start"], "36"),
);

children.push(
  startProcess("frontend", rootDir, ["run", "dev:client"], "35"),
);
