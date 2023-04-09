import Npc from "./Npc";
import fs from "fs";
import path from "path";

class Bartender extends Npc {
  constructor(dir: string) {
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

    super({ facts, name: details.name, baseSystem: details.baseSystem });
  }
}

export default Bartender;
