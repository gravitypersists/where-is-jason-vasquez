import { useGameState } from "../../State";
import { CutSceneConfig } from "../../scenes";
import Title from "./Title";

export default function CutScene() {
  const { scene } = useGameState();
  switch ((scene as CutSceneConfig).config.component) {
    case "title":
      return <Title />;
    default:
      return <div>Unknown cutscene</div>;
  }
}
