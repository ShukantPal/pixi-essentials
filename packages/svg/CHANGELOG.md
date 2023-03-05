# Change Log - @pixi-essentials/svg

This log was last generated on Sun, 05 Mar 2023 04:30:27 GMT and should not be manually modified.

## 2.0.2
Sun, 05 Mar 2023 04:30:27 GMT

### Patches

- Fix errors in PixiJS 7 type-check

## 2.0.1
Sun, 05 Mar 2023 03:31:22 GMT

### Patches

- Proper destruction of SVGScene content when destroy() is called to avoid memory leaks. (thanks @DanoTheNerd)

## 2.0.0
Sun, 05 Mar 2023 03:28:18 GMT

### Breaking changes

- Upgrade to PixiJS 7

## 1.1.7
Wed, 09 Mar 2022 03:58:56 GMT

_Version update only_

## 1.1.6
Sun, 11 Jul 2021 20:57:07 GMT

### Patches

- Fix SVGTextNode bounds not updating after the text renders.

## 1.1.5
Sun, 11 Jul 2021 02:39:04 GMT

### Patches

- Fix SVGTextNode shifting upwards when you re-embed a text element. This only pops when manipulating the scene tree manually.

## 1.1.4
Sat, 10 Jul 2021 23:35:25 GMT

### Patches

- Fix error when <text /> element does not have (x, y) attributes

## 1.1.3
Sat, 10 Jul 2021 23:20:42 GMT

### Patches

- Fix SVGTextNode not respecting (x, y) attributes of <text /> elements.

## 1.1.2
Sun, 20 Jun 2021 02:05:05 GMT

### Patches

- Add support for external hrefs in SVG use elements
- Fix issues with dash-array in stroked geometries

## 1.1.1
Thu, 17 Jun 2021 02:36:40 GMT

_Version update only_

## 1.1.0
Sun, 28 Mar 2021 17:05:18 GMT

### Minor changes

- Upgrade to PixiJS 6

## 1.0.7
Sat, 27 Feb 2021 19:23:00 GMT

### Patches

- Add proper hit-testing support for paths, in SVGPathNode.

## 1.0.5
Tue, 16 Feb 2021 00:55:07 GMT

### Patches

- Fix build regression for the UMD variant.

## 1.0.4
Tue, 16 Feb 2021 00:41:50 GMT

### Patches

- Fix no-stroke when color is #000 but stroke-width not explicitly specified. Fix error with url(#id) fill gradient references (without the single quotes, i.e. url('#id')

## 1.0.3
Sun, 31 Jan 2021 04:22:28 GMT

### Patches

- Fix incorrect reference to @pixi/filter-color-matrix in browser build

## 1.0.2
Sun, 31 Jan 2021 04:07:26 GMT

### Patches

- Fix dependency namespaces in browser build

## 1.0.1
Sun, 31 Jan 2021 03:42:33 GMT

### Patches

- Upgrade build to fix wrong namespace in dependencies (gradients and texture-allocator)

## 0.2.5
Sat, 02 Jan 2021 00:21:47 GMT

### Patches

- Remove redundant logs in SVGTextEngineImpl

## 0.2.3
Sat, 26 Dec 2020 22:47:29 GMT

### Patches

- Upgrade to PixiJS 5.4.0 RC and generate a index.d.ts file.

## 0.2.2
Sat, 19 Dec 2020 18:41:11 GMT

### Patches

- Fix spikes in stroking of smaller subpaths; add support for &lt;ellipse /&gt; elements.

## 0.2.1
Sun, 13 Dec 2020 19:25:27 GMT

### Patches

- Fix bounds calculation of SVGScene when applying custom width and height.

## 0.2.0
Sat, 05 Dec 2020 19:57:34 GMT

### Minor changes

- Fix text layout algorithm by making it recursive, so it will work on nested &lt;tspan /&gt; elements. Add proper support for s/S smooth cubic bezier path commands, instead of treating them as quadratic bezier curves.

## 0.1.1
Sun, 29 Nov 2020 20:04:09 GMT

### Patches

- Fix incorrect current point after closepath command

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

