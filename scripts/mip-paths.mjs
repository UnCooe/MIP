import { homedir } from "node:os";
import { resolve } from "node:path";

export function getMipHome() {
  return resolve(homedir(), ".mip");
}

export function getMipPath(...segments) {
  return resolve(getMipHome(), ...segments);
}

