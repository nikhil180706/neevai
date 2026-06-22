import { createFileRoute } from "@tanstack/react-router";
import NeevLanding from "../components/neev/NeevLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeevAI — A clinic in every pocket" },
      {
        name: "description",
        content:
          "Offline-first multimodal Edge-AI that turns any smartphone into a clinical-grade diagnostic tool for India's frontline ASHA healthcare workers.",
      },
      { property: "og:title", content: "NeevAI — A clinic in every pocket" },
      {
        property: "og:description",
        content:
          "Offline-first Edge-AI healthcare for frontline ASHA workers. No internet. No cloud. Just intelligence — in every pocket.",
      },
      { name: "theme-color", content: "#05060A" },
    ],
  }),
  component: NeevLanding,
});
