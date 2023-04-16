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
    const facts = JSON.parse(
      fs.readFileSync(path.join(dir, "./facts.json"), "utf8")
    );
    const global = JSON.parse(
      fs.readFileSync(path.join(dir, "../Global/facts.json"), "utf8")
    );
    facts.global = global;
    const details = JSON.parse(
      fs.readFileSync(path.join(dir, "./details.json"), "utf8")
    );

    super({
      ...rest,
      facts,
      name: details.name,
      baseSystem: details.baseSystem,
      switches: details.switches,
      modePrompts: details.modes,
      permanentFacts: details.permanentFacts,
    });
  }
}

export default Bartender;
