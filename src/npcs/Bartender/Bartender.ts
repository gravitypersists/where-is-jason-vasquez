import Npc from "../base/Npc";
import fs from "fs";
import path from "path";

const facts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./facts.json"), "utf8")
);
const details = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./details.json"), "utf8")
);

class Bartender extends Npc {
  constructor() {
    super({ facts, name: details.name, baseSystem: details.baseSystem });
  }
}

export default Bartender;
