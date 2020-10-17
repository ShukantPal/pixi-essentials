# @pixi-essentials/svg

This package exports a scene for drawing SVG DOMs. It is the most feature-rich implementation built on top
of PixiJS.

It will automatically cull the SVG scene if you are using a viewport.

## Installation :package:

```bash
npm install @pixi-essentials/svg
```

## Usage :page_facing_up:

```ts
import { SVGScene } from '@pixi-essentials/svg';

// NOTE: Do not use a newline as the first character, otherwise the source will not be parsed by the browser.
const src = `<svg 
    width="12cm" 
    height="5.25cm" 
    viewBox="0 0 1200 400" 
    xmlns="http://www.w3.org/2000/svg" version="1.1">

    <title>Example arcs01 - arc commands in path data</title>
    <desc>Picture of a pie chart with two pie wedges and a picture of a line with arc blips</desc>
    <rect id="bounding-box" x="1" y="1" width="1198" height="398"
        fill="none" stroke="blue" 
        stroke-width="3"
        stroke-dasharray="15, 8, 2, 8"
        stroke-linecap="round" />

    <defs>
        <circle id="myCircle" cx="60" cy="60" r="50" stroke="blue" stroke-width="10" />
    </defs>

    <path d="M300,200 h-150 a150,150 0 1,0 150,-150 z"
        fill="red" stroke="blue" stroke-width="5" />
    <path d="M 10,30
        A 20,20 0,0,1 50,30
        A 20,20 0,0,1 90,30
        Q 90,60 50,90
        Q 10,60 10,30 z"/>
    <path d="M275,175 v-150 a150,150 0 0,0 -150,150 z"
        fill="yellow" stroke="blue" stroke-width="5" stroke-dasharray="15, 8, 2, 8" />
    <path d="M600,350 l 50,-25
        a25,25 -30 0,1 50,-25 l 50,-25
        a25,50 -30 0,1 50,-25 l 50,-25
        a25,75 -30 0,1 50,-25 l 50,-25
        a25,100 -30 0,1 50,-25 l 50,-25"
        fill="none" stroke="red" stroke-width="5" stroke-dasharray="15, 8, 2, 8" />
    <image 
        xlink:href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png" 
        crossorigin="anonymous" 
        x="20"
        y="100"
        height="150" 
        width="100" />
    <use href="#myCircle" fill="red" x="550" y="10" />
    <use href="#myCircle" fill="green" x="700" y="10" />
</svg>
`;

// Loads the SVG string as a DOM tree.
function loadSVG(src) {
    const div = document.createElement('div');

    div.innerHTML = src;
    const svg = div.firstChild;

    return svg;
}

// Voila, you can now use this scene by adding it to your scene graph!
const scene = new SVGScene(loadSVG(src));
```

## Collaboration

I'd like to thank [Strytegy](strytegy.com) for funding the initial development of this package.

<a href="https://www.strytegy.com"><img src="https://i.imgur.com/3Ns1JJb.png" width="153.3px" /></a>
