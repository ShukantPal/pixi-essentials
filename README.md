<p align="center">
<img src="https://i.imgur.com/apQs3EL.png" alt="Frame-1-12x" width="600"></img>
</p>

[![Node.js CI](https://github.com/SukantPal/pixi-essentials/actions/workflows/node.js.yml/badge.svg)](https://github.com/SukantPal/pixi-essentials/actions/workflows/node.js.yml)

# PixiJS Essentials Kit

:point_right: This project is a collection of essential packages for building performant, enterprise-level applications on top of the PixiJS library. It includes several optimization plugins, frequency-domain filters, display-object libraries, and mixins on the core API.

## General :package:

| Package            | Brief |
| -----------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------|
| [@pixi-essentials/area-allocator](./packages/area-allocator) | 2D area allocator for managing texture space and likes |
| [@pixi-essentials/bounds](./packages/bounds) | axis-aligned, oriented bounding boxes |
| [@pixi-essentials/gradients](./packages/gradients) | generates color-gradient textures |
| @pixi-essentials/plugin-g | (unreleased) This is a plugin containing useful geometry manipulation utilities, The package also contains various types of useful geometries |
| [@pixi-essentials/shader-preprocessor](./packages/shader-preprocessor) | (unreleased) This package provides compile-time %macro% preprocessing. You can dynamically generate shaders based on the macros value set provided & a shader template.|
| [@pixi-essentials/texture-allocator](./packages/texture-allocator) | texture atlas allocator - supports render-texture, multiple image, and canvas-backed atlases |

## Performance Optimizations :racehorse:

| Package                   | Brief          |
| ------------------------- | -------------- |
| [@pixi-essentials/cull](./packages/cull) | prevents rendering of objects outside of the viewable screen |
| [@pixi-essentials/mixin-smart-mask](./packages/mixin-smart-mask) | skips masking objects when do so has no effect    |
| [@pixi-essentials/object-pool](./packages/object-pool) | object-pool for PixiJS applications, with niche features like array-allocation and garbage collection |
| [@pixi-essentials/ooo-renderer](./packages/ooo-renderer) | (unreleased) reorders display object rendering to maximize batching efficiency while preserving local z-order |
| @pixi-essentials/uber | (unreleased) uber-shader support |

## DisplayObject Kits :paintbrush:

| Package                   | Brief          |
| ------------------------- | -------------- |
|[@pixi-essentials/conic](./packages/conic) | resolution-independent filled quadric curve rendering |
|[@pixi-essentials/transformer](./packages/transformer) | interactive interface for editing the transforms in groups |
|[@pixi-essentials/svg](./packages/svg)   | a feature-rich SVG implementation |

## Integrations :atom_symbol:

| Package                   | Brief          |
| ------------------------- | -------------- |
| [@pixi-essentials/react-bindings](./packages/react-bindings) | This contains React components for essential display-objects, with [@pixi/react](https://github.com/pixijs/pixi-react) |
