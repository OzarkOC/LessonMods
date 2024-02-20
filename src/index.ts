"use strict";
import { greetUser } from "$utils/greet";

window.Webflow ||= [];
window.Webflow.push(() => {
  // DETECT if progress bar store in Array...
  const progressSet = [];
  const progressBars = document.querySelectorAll("[Modal='progressBar']");
  const progressContainers = document.querySelectorAll("[Modal='progressContainer']");
  if (progressContainers) {
    // console.log(progressContainers);

    progressContainers.forEach((container) => {
      container.style.transform = "rotate(-90deg)";
      defaultSVG(container);
    });
  }
  if (progressBars) {
    progressBars.forEach((progress) => {
      const att = progress.attributes;
      const def = att?.def.value; // default initial value
      const setTo = att?.setto.value; // sets dasharry count
      progress.style.strokeDasharray = 450;
      progress.style.strokeDashoffset = 200;
      progressSet.push({
        setTo,
        def,
        selector: progress,
      });
    });
  }
  // console.log(progressSet);
});

function defaultSVG(container) {
  const [...atArray] = container.attributes;
  const att = new Map();
  atArray.forEach((attrabute) => {
    att.set(attrabute.name, attrabute.value);
  });

  const defSet = 60 - (att.get("def") * 60) / 100;
  const ns = "http://www.w3.org/2000/svg";
  //Create SVG
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("height", "100%");
  svg.setAttribute("width", "100%");
  svg.style.position = "absolute";
  svg.style.top = 0;
  svg.style.left = 0;
  container.appendChild(svg);
  // Create Circle in SVG
  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "50%");
  circle.setAttribute("cy", "50%");
  circle.setAttribute("r", 9.5);
  att.has("progresscolor") &&
    circle.setAttribute(
      "style",
      `fill: none; 
      stroke: ${att.get(`progresscolor`)}; 
      stroke-width:0.27em;
      stroke-dasharray: ${att.get("dasharray")};
    stroke-dashoffset: ${defSet};
    animation: anim 2s linear forwards;
      `
    );
  svg.appendChild(circle);
  // IF gradient property exist create defs... ect.
  const colors =
    att.has("gradientcolor1") &&
    att.has("gradientcolor2") &&
    Array.from(att.keys()).filter((key) => key.startsWith("gradientcolor")); // ^ - means starts with * means anywhere in the attribute name
  const stops =
    att.has("stopoffset1") &&
    att.has("stopoffset2") &&
    Array.from(att.keys()).filter((key) => key.startsWith("stopoffset"));
  if (!colors) return;
  for (let i = 0; i < colors.length; i++) {
    att.set(`Color${i + 1}`, {
      color: att.get(colors[i]), // Store in map as an object
      stopOffset: `${att.get(stops[i])}%`,
    });
    const del = colors[i];
    att.delete(colors[i]);
    att.delete(stops[i]);
  }
  console.log(att);

  // Create def in circle
  const def = document.createElementNS(ns, "defs");
  svg.appendChild(def);
  // Create gradient in def
  const gradient = document.createElementNS(ns, "linearGradient");
  gradient.id = "GradientColor";
  def.appendChild(gradient);
  // create and sotre object array for gradients
  for (let i = 0; i < colors.length; i++) {
    const colorAtt = att.get(`Color${i + 1}`);
    const stop = document.createElementNS(ns, "stop");
    stop.setAttribute("offset", colorAtt.stopOffset);
    stop.setAttribute("stop-color", colorAtt.color);
    // Add stops to gradient
    gradient.appendChild(stop);
  }

  // NOW SET THE GRADIENT TO CIRLCE AND APPEND
  circle.setAttribute(
    "style",
    `fill: none; 
    stroke: url(#GradientColor); 
    stroke-width:0.27em;
    stroke-dasharray: 60;
    stroke-dashoffset: ${defSet};
    animation: anim 2s linear forwards;
    `
  );

  const keyFrames = `
    \
    @webkit-keyframes anim {\
      100% {\
        -webkit-stroke-dashoffset: (A_DYNAMIC_VALUE)
      }\
    }`;

  circle.innerHTML = keyFrames.replace(/A_DYNAMIC_VALUE/g, def);
  svg.appendChild(circle);
}
