import Npc, { NpcOptions } from "./Npc";
import fs from "fs";
import path from "path";

class Bartender extends Npc {
  constructor({
    dir,
    ...rest
  }: { dir: string } & Omit<
    NpcOptions,
    "name" | "baseSystem" | "facts" | "switches" | "modePrompts"
  >) {
    const config = JSON.parse(
      fs.readFileSync(path.join(dir, "./config.json"), "utf8")
    );
    const global = JSON.parse(
      fs.readFileSync(path.join(dir, "../Global/config.json"), "utf8")
    );
    config.facts.global = global.facts;

    super({
      ...rest,
      facts: config.facts,
      name: config.name,
      baseSystem: config.baseSystem,
      switches: config.switches,
      modePrompts: config.modes,
      permanentFacts: config.permanentFacts,
    });
  }
}

export default Bartender;
