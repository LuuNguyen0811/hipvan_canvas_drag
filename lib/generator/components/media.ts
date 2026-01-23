import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateMediaComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "video":
      return `        <div class="media-container"${styleAttr}>
          <video class="video-player" ${component.controls ? "controls" : ""} ${component.autoplay ? "autoplay" : ""} ${component.poster ? `poster="${component.poster}"` : ""}>
            ${component.src ? `<source src="${component.src}" type="video/mp4" />` : ""}
            Your browser does not support the video tag.
          </video>
        </div>`;

    case "audio":
      return `        <div class="media-container"${styleAttr}>
          <audio class="audio-player" ${component.controls ? "controls" : ""} ${component.autoplay ? "autoplay" : ""}>
            ${component.src ? `<source src="${component.src}" type="audio/mpeg" />` : ""}
            Your browser does not support the audio tag.
          </audio>
        </div>`;

    case "embed":
      return `        <div class="embed-container"${styleAttr}>
          ${component.src ? `<iframe src="${component.src}" class="embed-iframe" frameborder="0" allowfullscreen></iframe>` : '<div class="embed-placeholder">Embed content goes here</div>'}
        </div>`;

    case "icon":
      return `        <span class="icon"${styleAttr}>${component.content || "★"}</span>`;
    
    default:
      return null;
  }
}
