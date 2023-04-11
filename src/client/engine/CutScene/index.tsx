import { useCallback } from "react";
import { useGameState } from "../../State";
import { CutSceneConfig } from "../../scenes";
import Title from "./Title";

export default function CutScene() {
  const { scene, setScene } = useGameState();
  const handleDone = useCallback(() => {
    setScene((scene as CutSceneConfig).config.next);
  }, [scene, setScene]);
  switch ((scene as CutSceneConfig).config.component) {
    case "title":
      return <Title onDone={handleDone} />;
    default:
      return <div>Unknown cutscene</div>;
  }
}
