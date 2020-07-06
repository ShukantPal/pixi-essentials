# @pixi-essentials/shader-preprocessor

This package provides a minimal runtime shader-generation mechanism based on %macros%. It allows you to use %macros% in your shader code, such that they are replaced when you provide their values when generating the shader in JavaScript.

## Usage

The following example demonstrates the usage of macros in the fragment shader: 

```glsl
// fragmentSrc

varying float vTextureId;
varying vec2 vTextureCoord;

uniform sampler2D uSamplers[%texturesPerBatch%];

void main(void) {
   vec4 color;
   
   // The following will generate an if-else-if chain that will put 
   // texture2D(uSamplers[vTextureId], vTextureCoord) into color.
   // HINT: In shaders you cannot index an array with a variable index (vTextureId is a variable).
   %sampleColor(uSamplers, vTextureId, vTextureCoord, color)%
   
   gl_FragColor = color;
}
```

```ts
import { ShaderPreprocessor } from '@pixi-essentials/shader-preprocessor';
import vertexSrc from './vertexSrc.vert';
import fragmentSrc from './fragmentSrc.frag';

// Get the WebGL context from your renderer
const gl = renderer.gl;

// The generated shader based on the number of textures passed to the shader at once
const shader = ShaderPreprocessor.from(vertexSrc, fragmentSrc, {}, {
  texturesPerBatch: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), 
  someValue(samplerArrayVariable, textureIndexVariable, textureCoordinateVariable, outVariable) {
    // TODO: Generate an if-else-if chain and return it.
  }
);
```

