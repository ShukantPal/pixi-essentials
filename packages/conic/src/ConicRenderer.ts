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
import conicFragmentSrc from './conic-renderer.frag';

const ATTRIBUTE_WORLD_POSITION = new AttributeRedirect({
    source: 'worldPositionData',
    attrib: 'aWorldPosition',
    type: 'float32',
    size: 2,
    glType: TYPES.FLOAT,
    glSize: 2,
});

const ATTRIBUTE_TEXTURE_POSITION = new AttributeRedirect({
    source: 'texturePositionData',
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

const baseShaderFunction = new BatchShaderFactory(conicVertexSrc, conicFragmentSrc, {}).derive();

const shaderFunction = (crendr: BatchRenderer): Shader =>
{
    const renderer = crendr.renderer;
    const contextSystem = renderer.context;

    if (contextSystem.webGLVersion === 1 && !contextSystem.extensions.standardDerivatives)
    {
        contextSystem.extensions.standardDerivatives = renderer.gl.getExtension('OES_standard_derivatives');
    }

    return baseShaderFunction(crendr);
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

Renderer.registerPlugin('conicRenderer', conicRenderer);

export const ConicRenderer = conicRenderer;
