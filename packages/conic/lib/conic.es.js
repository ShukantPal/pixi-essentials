/* eslint-disable */
 
/*!
 * @pixi-essentials/conic - v1.0.2
 * Compiled Mon, 17 Aug 2020 20:19:04 UTC
 *
 * @pixi-essentials/conic is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
import { AttributeRedirect, UniformRedirect, BatchShaderFactory, BatchRendererPluginFactory, AggregateUniformsBatchFactory } from 'pixi-batch-renderer';
import { TYPES } from '@pixi/constants';
import { Renderer, Texture } from '@pixi/core';
import { Point, Matrix } from '@pixi/math';
import { Container } from '@pixi/display';
import mat3 from 'gl-mat3';

var conicVertexSrc = "#version 300 es\n\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nin vec2 aWorldPosition;\nin vec2 aTexturePosition;\nin float aMasterID;\nin float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vWorldCoord;\nout vec2 vTextureCoord;\nout float vMasterID;\nout float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}";

var conicVertexFallbackSrc = "#version 100\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nattribute vec2 aWorldPosition;\nattribute vec2 aTexturePosition;\nattribute float aMasterID;\nattribute float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}";

var conicFragmentSrc = "#version 300 es\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nin vec2 vWorldCoord;\nin vec2 vTextureCoord;\nin float vMasterID;\nin float vUniformID;\n\nout vec4 fragmentColor;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) || antialias)\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n\n    fragmentColor = color;\n}";

var conicFragmentFallbackSrc = "#version 100\n#ifdef GL_OES_standard_derivatives\n    #extension GL_OES_standard_derivatives : enable\n#endif\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nfloat sampleCurve(vec2 point, vec3 kv, vec3 lv, vec3 mv)\n{\n    float k = dot(vec3(vTextureCoord, 1), kv);\n    float l = dot(vec3(vTextureCoord, 1), lv);\n    float m = dot(vec3(vTextureCoord, 1), mv);\n\n    return k*k - l*m;\n}\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n#ifdef GL_OES_standard_derivatives\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n#endif\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) \n#ifdef GL_OES_standard_derivatives\n            || antialias\n#endif\n    )\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture2D(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n#ifdef GL_OES_standard_derivatives\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n#endif\n\n    gl_FragColor = color;\n}";

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
const shaderFunction = (crendr) => {
    const renderer = crendr.renderer;
    const contextSystem = renderer.context;
    if (contextSystem.webGLVersion === 1 && !contextSystem.extensions.standardDerivatives) {
        contextSystem.extensions.standardDerivatives = renderer.gl.getExtension('OES_standard_derivatives');
    }
    if (contextSystem.webGLVersion === 1) {
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
    inBatchIDAttrib: 'aBatchID',
    shaderFunction,
    BatchFactoryClass: AggregateUniformsBatchFactory,
});
Renderer.registerPlugin('conic', conicRenderer);
const ConicRenderer = conicRenderer;

const SQRT_2 = Math.sqrt(2);
/**
 * Describes a conic section or any quadric curve
 *
 * A quadric curve can be represented in the form _k<sup>2</sup> - lm_, where, _k_, _l_, _m_
 * are linear functionals. _l_ and _m_ are two lines tangent to the curve, while _k_ is the
 * line connecting the two points of tangency.
 *
 * @public
 */
class Conic {
    constructor() {
        /**
         * The chord connecting the points of tangency on _l_ and _m_.
         */
        this.k = [1, 0, 0];
        /**
         * A line tangent to the curve.
         */
        this.l = [0, 1, 0];
        /**
         * A line tangent to the curve.
         */
        this.m = [0, 0, 1];
        /**
         * The control points in design space. The control points allow you to map design space points to the local space
         * points when creating a graphic.
         *
         * By default, the conic is a quadratic bezier curve.
         */
        this.controlPoints = [
            new Point(0, 0),
            new Point(0.5, 0),
            new Point(1, 1),
        ];
        /**
         * Flags changes in the shape data
         */
        this._dirtyID = 0;
    }
    /**
     * Sets the equation of the "k" line to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setk(a, b, c) {
        this.k[0] = a;
        this.k[1] = b;
        this.k[2] = c;
        this._dirtyID++;
        return this;
    }
    /**
     * Sets the equation of the "l" line to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setl(a, b, c) {
        this.l[0] = a;
        this.l[1] = b;
        this.l[2] = c;
        this._dirtyID++;
        return this;
    }
    /**
     * Sets the equation of the line "m" to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setm(a, b, c) {
        this.m[0] = a;
        this.m[1] = b;
        this.m[2] = c;
        this._dirtyID++;
        return this;
    }
    /**
     * Set control points in texture space
     * @param c0
     * @param c1
     * @param c2
     */
    setControlPoints(c0, c1, c2) {
        this.controlPoints[0] = c0;
        this.controlPoints[1] = c1;
        this.controlPoints[2] = c2;
    }
    /**
     * Flag the shape as dirty after you have modified the data directly.
     */
    update() {
        this._dirtyID++;
        return this;
    }
    /**
     * Creates a circular conic of the given {@code radius} that is in the bounding box
     * (0,0,2_r_,2_r_).
     *
     * Implicit form:
     * (_x_/√2 + _y_/√2 - _r_/√2)<sup>2</sup> - _xy_ = _0_
     *
     * Simplified form:
     * (_x_ - _r_)<sup>2</sup> - (_y_ - _r_)<sup>2</sup> - r<sup>2</sup> = _0_
     *
     * @param radius - the radius of the circle
     * @return the conic shape
     */
    static createCircle(radius) {
        const conic = new Conic();
        conic.setk(1 / SQRT_2, 1 / SQRT_2, -radius / SQRT_2);
        conic.setl(1, 0, 0);
        conic.setm(0, 1, 0);
        return conic;
    }
    /**
     * Creates an ellipse with the given major & minor semi-axes that is located in the
     * bounding box (0,0,2_a_,2_b_).
     *
     * Implicit form:
     * (_x_/_a_ + _y_/_b_ - 1)<sup>2</sup> - 2_xy_/_ab_ = 0
     *
     * Simplified form:
     * (_x_/_a_ - 1)<sup>2</sup> + (_y_/_b_ -  1)<sup>2</sup> - 1 = 0
     *
     * @param a - major semi-axis length
     * @param b - minor semi-axis length
     */
    static createEllipse(a, b) {
        const conic = new Conic();
        conic.setk(1 / a, 1 / b, -1);
        conic.setl(2 / a, 0, 0);
        conic.setm(0, 1 / b, 0);
        return conic;
    }
    /**
     * Creates a parabola that opens upward (for _a_ > 0); since parabolas are not closed
     * curves, they do not have a bounding box.
     *
     * The standard bezier curve is the parabola _x_<sup>2</sup> - _y_, with the control
     * points (0,0), (1/2,0), (1,1).
     *
     * Equation:
     * x<sup>2 - 4_ay_ = 0
     *
     * @param a - distance of directrix, focus from the vertex of the parabola (0,0)
     */
    static createParabola(a) {
        const conic = new Conic();
        conic.setk(1, 0, 0);
        conic.setl(0, 4 * a, 0);
        conic.setm(0, 0, 1);
        return conic;
    }
    /**
     * Creates a hyperbola that opens up and down; since hyperbolas are not closed curves,
     * they do not have a bounding box.
     *
     * Implicit form:
     * 1<sup>2</sup> - (_y_/_b_ - _x_/_a_)(_y_/_b_ + _x_/_a_) = 0
     *
     * Simplified form:
     * (y/b)<sup>2</sup> - (x/a)<sup>2</sup> = 1
     *
     * @param a - major semi-axis
     * @param b - minor semi-axis
     */
    static createHyperbola(a, b) {
        const conic = new Conic();
        conic.setk(0, 0, 1);
        conic.setl(-1 / a, 1 / b, 0);
        conic.setm(1 / a, 1 / b, 0);
        return conic;
    }
}

const tempMatrix = new Matrix();
/**
 * Draws a segment of conic section represented by the equation _k_<sup>2</sup>- _lm = 0_, where k, l, m are lines.
 *
 * This display-object shades the inside/outside of a conic section within a mesh.
 *
 * A conic curve can be represented in the form: _k_<sup>2</sup> - _lm = 0_, where k, l, m are lines described in
 * the form _ax + by + c = 0_. _l_ and _m_ are the tangents to the curve, and _k_ is a chord connecting the points
 * of tangency.
 */
class ConicDisplay extends Container {
    constructor(conic = new Conic(), texture) {
        super();
        /**
         * The conic curve drawn by this graphic.
         */
        this.shape = conic;
        /**
         * Flags whether the geometry data needs to be updated.
         */
        this._dirtyID = 0;
        /**
         * The world transform ID last when the geometry was updated.
         */
        this._transformID = 0;
        /**
         * Last {@link _dirtyID} when the geometry was updated.
         */
        this._updateID = -1;
        /**
         * World positions of the vertices
         */
        this.vertexData = [];
        /**
         * Texture positions of the vertices.
         */
        this.uvData = [];
        this._texture = texture || Texture.WHITE;
    }
    /**
     * @see Conic#k
     */
    get k() {
        return this.shape.k;
    }
    set k(line) {
        this.shape.setk(...line);
    }
    /**
     * @see Conic#l
     */
    get l() {
        return this.shape.l;
    }
    set l(line) {
        this.shape.setl(...line);
    }
    /**
     * @see Conic#m
     */
    get m() {
        return this.shape.m;
    }
    set m(line) {
        this.shape.setm(...line);
    }
    get texture() {
        return this._texture;
    }
    set texture(tex) {
        this._texture = tex || Texture.WHITE;
    }
    _calculateBounds() {
        this._bounds.addVertexData(this.vertexData, 0, this.vertexData.length);
    }
    _render(renderer) {
        if (!renderer.plugins.conic) {
            renderer.plugins.conic = new ConicRenderer(renderer, null);
        }
        renderer.batch.setObjectRenderer(renderer.plugins.conic);
        renderer.plugins.conic.render(this);
    }
    /**
     * Draws the triangle formed by the control points of the shape.
     */
    drawControlPoints() {
        const controlPoints = this.shape.controlPoints;
        this.drawTriangle(controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, controlPoints[2].x, controlPoints[2].y);
        return this;
    }
    /**
     * Draw a triangle defined in texture space transformed into local space. Generally, you would want to draw the triangle
     * formed by the shape's control points.
     *
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    drawTriangle(x0, y0, x1, y1, x2, y2) {
        const data = this.uvData;
        const i = data.length;
        data.length += 6;
        data[i] = x0;
        data[i + 1] = y0;
        data[i + 2] = x1;
        data[i + 3] = y1;
        data[i + 4] = x2;
        data[i + 5] = y2;
        return this;
    }
    /**
     * @param x
     * @param y
     * @param width
     * @param height
     */
    drawRect(x, y, width, height) {
        const data = this.uvData;
        const i = data.length;
        data.length += 12;
        data[i] = x;
        data[i + 1] = y;
        data[i + 2] = x + width;
        data[i + 3] = y;
        data[i + 4] = x + width;
        data[i + 5] = y + height;
        data[i + 6] = x;
        data[i + 7] = y;
        data[i + 8] = x + width;
        data[i + 9] = y + height;
        data[i + 10] = x;
        data[i + 11] = y + height;
        return this;
    }
    /**
     * Updates the geometry data for this conic.
     */
    updateConic() {
        const vertexData = this.vertexData;
        const uvData = this.uvData;
        vertexData.length = uvData.length;
        const matrix = tempMatrix.copyFrom(this.worldTransform);
        const { a, b, c, d, tx, ty } = matrix;
        for (let i = 0, j = vertexData.length / 2; i < j; i++) {
            const x = uvData[(i * 2)];
            const y = uvData[(i * 2) + 1];
            vertexData[(i * 2)] = (a * x) + (c * y) + tx;
            vertexData[(i * 2) + 1] = (b * x) + (d * y) + ty;
        }
        this._updateID = this._dirtyID;
        const indexData = this.indexData = new Array(vertexData.length / 2);
        // TODO: Remove indexData, pixi-batch-renderer might have a problem with it
        for (let i = 0, j = indexData.length; i < j; i++) {
            indexData[i] = i;
        }
    }
    /**
     * Sets the local-space control points of the curve.
     * @param c0
     * @param c1
     * @param c2
     */
    setControlPoints(c0, c1, c2) {
        const texturePoints = this.shape.controlPoints;
        this.setTransform(texturePoints[0], texturePoints[1], texturePoints[2], c0, c1, c2);
    }
    setTransform(...args) {
        const transform = this.transform;
        const localTransform = transform.localTransform;
        transform._localID++;
        if (args.length === 1) {
            localTransform.copyFrom(args[0]);
            return this;
        }
        if (args.length === 9) {
            super.setTransform(...args);
        }
        localTransform.identity();
        // Design space
        let ax0;
        let ay0;
        let bx0;
        let by0;
        let cx0;
        let cy0;
        // Texture space
        let ax1;
        let ay1;
        let bx1;
        let by1;
        let cx1;
        let cy1;
        if (args.length === 6) {
            const points = args;
            ax0 = points[0].x;
            ay0 = points[0].y;
            bx0 = points[1].x;
            by0 = points[1].y;
            cx0 = points[2].x;
            cy0 = points[2].y;
            ax1 = points[3].x;
            ay1 = points[3].y;
            bx1 = points[4].x;
            by1 = points[4].y;
            cx1 = points[5].x;
            cy1 = points[5].y;
        }
        else {
            const coords = args;
            ax0 = coords[0];
            ay0 = coords[1];
            bx0 = coords[2];
            by0 = coords[3];
            cx0 = coords[4];
            cy0 = coords[5];
            ax1 = coords[6];
            ay1 = coords[7];
            bx1 = coords[8];
            by1 = coords[9];
            cx1 = coords[10];
            cy1 = coords[11];
        }
        const input = [
            ax0, bx0, cx0,
            ay0, by0, cy0,
            1, 1, 1,
        ];
        const inverse = mat3.invert(input, input);
        // input * textureTransform = output
        // textureTransform = inverse(input) * output
        localTransform.a = (inverse[0] * ax1) + (inverse[3] * bx1) + (inverse[6] * cx1);
        localTransform.c = (inverse[1] * ax1) + (inverse[4] * bx1) + (inverse[7] * cx1);
        localTransform.tx = (inverse[2] * ax1) + (inverse[5] * bx1) + (inverse[8] * cx1);
        localTransform.b = (inverse[0] * ay1) + (inverse[3] * by1) + (inverse[6] * cy1);
        localTransform.d = (inverse[1] * ay1) + (inverse[4] * by1) + (inverse[7] * cy1);
        localTransform.ty = (inverse[2] * ay1) + (inverse[5] * by1) + (inverse[8] * cy1);
        transform.setFromMatrix(localTransform);
        return this;
    }
    /**
     * Updates the transform of the conic, and if changed updates the geometry data.
     *
     * @override
     */
    updateTransform() {
        const ret = super.updateTransform();
        if (this._transformID !== this.transform._worldID) {
            this.updateConic();
            this._transformID = this.transform._worldID;
        }
        return ret;
    }
}

export { Conic, ConicDisplay };
//# sourceMappingURL=conic.es.js.map
