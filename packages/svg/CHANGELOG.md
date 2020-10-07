# Change Log - @pixi-essentials/svg

This log was last generated on Wed, 07 Oct 2020 21:43:57 GMT and should not be manually modified.

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

