import {
    AggregateUniformsBatchFactory,
    AttributeRedirect,
    BatchRenderer,
    BatchShaderFactory,
    BatchRendererPluginFactory,
    UniformRedirect,
} from 'pixi-batch-renderer';
import { TYPES } from '@pixi/constants';
import { Renderer, Shader } from '@pixi/core';
import conicVertexSrc from './conic-renderer.vert';
import conicVertexFallbackSrc from './conic-renderer-fallback.vert';
import conicFragmentSrc from './conic-renderer.frag';
import conicFragmentFallbackSrc from './conic-renderer-fallback.frag';

const ATTRIBUTE_WORLD_POSITION = new AttributeRedirect({
    source: 'vertexData',
    attrib: 'aWorldPosition',
    type: 'float32',
    size: 2,
    glType: TYPES.FLOAT,
    glSize: 2,
});

const ATTRIBUTE_TEXTURE_POSITION = new AttributeRedirect({
    source: 'uvData',
    attrib: 'aTexturePosition',
    type: 'float32',
    size: 2,
    glType: TYPES.FLOAT,
    glSize: 2,
});

const UNIFORM_K = new UniformRedirect({
    source: 'k',
    uniform: 'k',
});

const UNIFORM_L = new UniformRedirect({
    source: 'l',
    uniform: 'l',
});

const UNIFORM_M = new UniformRedirect({
    source: 'm',
    uniform: 'm',
});

const webGL1Shader = new BatchShaderFactory(conicVertexFallbackSrc, conicFragmentFallbackSrc, { inside: true }).derive();
const webGL2Shader = new BatchShaderFactory(conicVertexSrc, conicFragmentSrc, { inside: true }).derive();

const shaderFunction = (crendr: BatchRenderer): Shader =>
{
    const renderer = crendr.renderer;
    const contextSystem = renderer.context;

    if (contextSystem.webGLVersion === 1 && !contextSystem.extensions.standardDerivatives)
    {
        contextSystem.extensions.standardDerivatives = renderer.gl.getExtension('OES_standard_derivatives');
    }

    if (contextSystem.webGLVersion === 1)
    {
        return webGL1Shader(crendr);
    }

    return webGL2Shader(crendr);
};

const conicRenderer = BatchRendererPluginFactory.from({
    attribSet: [
        ATTRIBUTE_WORLD_POSITION,
        ATTRIBUTE_TEXTURE_POSITION,
    ],
    uniformSet: [
        UNIFORM_K,
        UNIFORM_L,
        UNIFORM_M,
    ],
    indexProperty: 'indexData',
    textureProperty: '_texture',
    texIDAttrib: 'aMasterID',
    uniformIDAttrib: 'aUniformID',
    inBatchIDAttrib: 'aBatchID', // Remove this: pixi-batch-renderer has a bug where it doesn't work without it (uniform aggregation)
    shaderFunction,
    BatchFactoryClass: AggregateUniformsBatchFactory,
});

Renderer.registerPlugin('conic', conicRenderer);

export const ConicRenderer = conicRenderer;
