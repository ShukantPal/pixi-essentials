# Change Log - @pixi-essentials/svg

This log was last generated on Sat, 14 Nov 2020 19:53:46 GMT and should not be manually modified.

## 0.0.20
Sat, 14 Nov 2020 19:53:46 GMT

### Patches

- Fix bug when smooth quadratic command was used after relative command

## 0.0.19
Sat, 14 Nov 2020 19:44:14 GMT

### Patches

- Support opacity on SVG images

## 0.0.18
Sat, 14 Nov 2020 19:14:09 GMT

### Patches

- Add support for smooth quadratic bezier curve commands (t, T)

## 0.0.17
Sun, 08 Nov 2020 20:40:57 GMT

### Patches

- Add SVGSceneContext, sharing a texture atlas amongst SVGImageNodes

## 0.0.16
Sat, 17 Oct 2020 19:45:36 GMT

### Patches

- Fixes bug where <tspan /> attributes where not being applied

## 0.0.15
Sat, 17 Oct 2020 19:38:34 GMT

### Patches

- Build last release

## 0.0.14
Sat, 17 Oct 2020 19:30:26 GMT

### Patches

- Set default font size to 16

## 0.0.13
Sat, 17 Oct 2020 19:19:14 GMT

### Patches

- Letter spacing fix for <tspan />

## 0.0.12
Sat, 17 Oct 2020 19:12:54 GMT

### Patches

- N/A

## 0.0.11
Sat, 17 Oct 2020 19:07:48 GMT

### Patches

- Build last release :), and fallback to letter spacing of <text /> for <tspan /> elements, if not provided

## 0.0.10
Sat, 17 Oct 2020 18:36:10 GMT

### Patches

- Add letterSpacing in the style passed by SVGTextNode.

## 0.0.9
Wed, 14 Oct 2020 21:17:15 GMT

### Patches

- Emit transformdirty event when SVGScene has transform invalidations.

## 0.0.8
Wed, 07 Oct 2020 21:43:57 GMT

### Patches

- Use populateScene instead of populateSceneRecursive to build scene graph at root.

## 0.0.7
Wed, 07 Oct 2020 01:28:54 GMT

### Patches

- Texture-size optimizations for image nodes and linear-gradient paint servers

## 0.0.6
Tue, 06 Oct 2020 19:09:58 GMT

### Patches

- Set _transformDirty to false after updating transform. Invoke updateTransform after updateText in SVGTextEngineImpl

## 0.0.5
Tue, 06 Oct 2020 18:57:40 GMT

### Patches

- Add nodetransformdirty events to allow transform invalidation internally.

## 0.0.4
Tue, 06 Oct 2020 18:38:01 GMT

### Patches

- Internal culling optimization in SVGScene, lazy transform & bounds updates.

## 0.0.3
Mon, 05 Oct 2020 16:11:24 GMT

### Patches

- Async-pattern for SVGTextEngine

## 0.0.2
Sun, 04 Oct 2020 23:25:53 GMT

### Patches

- Export the Paint API and additional SVG nodes

## 0.0.1
Sat, 03 Oct 2020 01:37:43 GMT

### Patches

- First release candidate

