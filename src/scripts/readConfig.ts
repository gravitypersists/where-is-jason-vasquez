import * as fs from "fs";
import * as path from "path";

export type ConfigFile = {
  name: string;
  baseSystem: string;
  facts: { [key: string]: string[] };
  switches: { [key: string]: string[] };
  modes: { [key: string]: string[] };
  permanentFacts: { [key: string]: string[] };
  actions: { [key: string]: string[] };
  contexts: { [key: string]: (string | { modeSwitch: string[] })[] };
};

export default function readConfig(dir: string) {
  const configFile = fs.readFileSync(
    path.join(__dirname, dir, "./config.json"),
    "utf8"
  );
  const config = JSON.parse(configFile) as ConfigFile;
  return config;
}
