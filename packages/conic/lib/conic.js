/*!
 * @pixi-essentials/conic - v1.0.0
 * Compiled Tue, 14 Jul 2020 17:57:17 UTC
 *
 * @pixi-essentials/conic is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixiBatchRenderer = require('pixi-batch-renderer');
var constants = require('@pixi/constants');
var core = require('@pixi/core');
var math = require('@pixi/math');
var display = require('@pixi/display');

var conicVertexSrc = "#version 300 es\n\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nin vec2 aWorldPosition;\nin vec2 aTexturePosition;\nin float aMasterID;\nin float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vWorldCoord;\nout vec2 vTextureCoord;\nout float vMasterID;\nout float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}";

var conicFragmentSrc = "#version 300 es\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nin vec2 vWorldCoord;\nin vec2 vTextureCoord;\nin float vMasterID;\nin float vUniformID;\n\nout vec4 fragmentColor;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) || antialias)\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 1);\n    }\n\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 1);\n    }\n\n    fragmentColor = color;\n}";

var ATTRIBUTE_WORLD_POSITION = new pixiBatchRenderer.AttributeRedirect({
    source: 'worldPositionData',
    attrib: 'aWorldPosition',
    type: 'float32',
    size: 2,
    glType: constants.TYPES.FLOAT,
    glSize: 2,
});
var ATTRIBUTE_TEXTURE_POSITION = new pixiBatchRenderer.AttributeRedirect({
    source: 'texturePositionData',
    attrib: 'aTexturePosition',
    type: 'float32',
    size: 2,
    glType: constants.TYPES.FLOAT,
    glSize: 2,
});
var UNIFORM_K = new pixiBatchRenderer.UniformRedirect({
    source: 'k',
    uniform: 'k',
});
var UNIFORM_L = new pixiBatchRenderer.UniformRedirect({
    source: 'l',
    uniform: 'l',
});
var UNIFORM_M = new pixiBatchRenderer.UniformRedirect({
    source: 'm',
    uniform: 'm',
});
var baseShaderFunction = new pixiBatchRenderer.BatchShaderFactory(conicVertexSrc, conicFragmentSrc, {}).derive();
var shaderFunction = function (crendr) {
    var renderer = crendr.renderer;
    var contextSystem = renderer.context;
    if (contextSystem.webGLVersion === 1 && !contextSystem.extensions.standardDerivatives) {
        contextSystem.extensions.standardDerivatives = renderer.gl.getExtension('OES_standard_derivatives');
    }
    return baseShaderFunction(crendr);
};
var conicRenderer = pixiBatchRenderer.BatchRendererPluginFactory.from({
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
    shaderFunction: shaderFunction,
    BatchFactoryClass: pixiBatchRenderer.AggregateUniformsBatchFactory,
});
core.Renderer.registerPlugin('conicRenderer', conicRenderer);
var ConicRenderer = conicRenderer;

var adjoint_1 = adjoint;

/**
 * Calculates the adjugate of a mat3
 *
 * @alias mat3.adjoint
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];

  out[0] = (a11 * a22 - a12 * a21);
  out[1] = (a02 * a21 - a01 * a22);
  out[2] = (a01 * a12 - a02 * a11);
  out[3] = (a12 * a20 - a10 * a22);
  out[4] = (a00 * a22 - a02 * a20);
  out[5] = (a02 * a10 - a00 * a12);
  out[6] = (a10 * a21 - a11 * a20);
  out[7] = (a01 * a20 - a00 * a21);
  out[8] = (a00 * a11 - a01 * a10);

  return out
}

var clone_1 = clone;

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @alias mat3.clone
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
function clone(a) {
  var out = new Float32Array(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out
}

var copy_1 = copy;

/**
 * Copy the values from one mat3 to another
 *
 * @alias mat3.copy
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out
}

var create_1 = create;

/**
 * Creates a new identity mat3
 *
 * @alias mat3.create
 * @returns {mat3} a new 3x3 matrix
 */
function create() {
  var out = new Float32Array(9);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out
}

var determinant_1 = determinant;

/**
 * Calculates the determinant of a mat3
 *
 * @alias mat3.determinant
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];

  return a00 * (a22 * a11 - a12 * a21)
       + a01 * (a12 * a20 - a22 * a10)
       + a02 * (a21 * a10 - a11 * a20)
}

var frob_1 = frob;

/**
 * Returns Frobenius norm of a mat3
 *
 * @alias mat3.frob
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(
      a[0]*a[0]
    + a[1]*a[1]
    + a[2]*a[2]
    + a[3]*a[3]
    + a[4]*a[4]
    + a[5]*a[5]
    + a[6]*a[6]
    + a[7]*a[7]
    + a[8]*a[8]
  )
}

var fromMat2 = fromMat2d;

/**
 * Copies the values from a mat2d into a mat3
 *
 * @alias mat3.fromMat2d
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;

  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;

  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;

  return out
}

var fromMat4_1 = fromMat4;

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @alias mat3.fromMat4
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out
}

var fromQuat_1 = fromQuat;

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @alias mat3.fromQuat
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
function fromQuat(out, q) {
  var x = q[0];
  var y = q[1];
  var z = q[2];
  var w = q[3];

  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;

  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;

  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;

  return out
}

var identity_1 = identity;

/**
 * Set a mat3 to the identity matrix
 *
 * @alias mat3.identity
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out
}

var invert_1 = invert;

/**
 * Inverts a mat3
 *
 * @alias mat3.invert
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];

  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20;

  // Calculate the determinant
  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) return null
  det = 1.0 / det;

  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;

  return out
}

var multiply_1 = multiply;

/**
 * Multiplies two mat3's
 *
 * @alias mat3.multiply
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];

  var b00 = b[0], b01 = b[1], b02 = b[2];
  var b10 = b[3], b11 = b[4], b12 = b[5];
  var b20 = b[6], b21 = b[7], b22 = b[8];

  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;

  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;

  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;

  return out
}

var normalFromMat4_1 = normalFromMat4;

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @alias mat3.normalFromMat4
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
function normalFromMat4(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  var det = b00 * b11
          - b01 * b10
          + b02 * b09
          + b03 * b08
          - b04 * b07
          + b05 * b06;

  if (!det) return null
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

  return out
}

var rotate_1 = rotate;

/**
 * Rotates a mat3 by the given angle
 *
 * @alias mat3.rotate
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function rotate(out, a, rad) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];

  var s = Math.sin(rad);
  var c = Math.cos(rad);

  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;

  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;

  out[6] = a20;
  out[7] = a21;
  out[8] = a22;

  return out
}

var scale_1 = scale;

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @alias mat3.scale
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
function scale(out, a, v) {
  var x = v[0];
  var y = v[1];

  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];

  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];

  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];

  return out
}

var str_1 = str;

/**
 * Returns a string representation of a mat3
 *
 * @alias mat3.str
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' +
                   a[3] + ', ' + a[4] + ', ' + a[5] + ', ' +
                   a[6] + ', ' + a[7] + ', ' + a[8] + ')'
}

var translate_1 = translate;

/**
 * Translate a mat3 by the given vector
 *
 * @alias mat3.translate
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
function translate(out, a, v) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];
  var x = v[0], y = v[1];

  out[0] = a00;
  out[1] = a01;
  out[2] = a02;

  out[3] = a10;
  out[4] = a11;
  out[5] = a12;

  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;

  return out
}

var transpose_1 = transpose;

/**
 * Transpose the values of a mat3
 *
 * @alias mat3.transpose
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1], a02 = a[2], a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out
}

var glMat3 = {
  adjoint: adjoint_1
  , clone: clone_1
  , copy: copy_1
  , create: create_1
  , determinant: determinant_1
  , frob: frob_1
  , fromMat2: fromMat2
  , fromMat4: fromMat4_1
  , fromQuat: fromQuat_1
  , identity: identity_1
  , invert: invert_1
  , multiply: multiply_1
  , normalFromMat4: normalFromMat4_1
  , rotate: rotate_1
  , scale: scale_1
  , str: str_1
  , translate: translate_1
  , transpose: transpose_1
};

/**
 * Describes a conic section
 *
 * A quadric curve can be represented in the form _k<sup>2</sup> - lm_, where, _k_, _l_, _m_
 * are linear functionals. _l_ and _m_ are two lines tangent to the curve, while _k_ is the
 * line connecting the two points of tangency.
 *
 * The curve equation is defined in "design space", and is transformed into texture space using
 * the {@link textureTransform}.
 *
 * @public
 */
var Conic = /** @class */ (function () {
    function Conic() {
        /**
         * The chord connecting the points of tangency on _l_ and _m_.
         */
        this.k = [0, 1, -1];
        /**
         * A line tangent to the curve.
         */
        this.l = [2, -1, -1];
        /**
         * A line tangent to the curve.
         */
        this.m = [-2, -1, -1];
        /**
         * The transformation matrix from design space to texture space.
         */
        this.textureTransform = new math.Matrix();
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
    Conic.prototype.setk = function (a, b, c) {
        this.k[0] = a;
        this.k[1] = b;
        this.k[2] = c;
        this._dirtyID++;
        return this;
    };
    /**
     * Sets the equation of the "l" line to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    Conic.prototype.setl = function (a, b, c) {
        this.l[0] = a;
        this.l[1] = b;
        this.l[2] = c;
        this._dirtyID++;
        return this;
    };
    /**
     * Sets the equation of the line "m" to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    Conic.prototype.setm = function (a, b, c) {
        this.m[0] = a;
        this.m[1] = b;
        this.m[2] = c;
        this._dirtyID++;
        return this;
    };
    Conic.prototype.setTransform = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 1) {
            this.textureTransform.copyFrom(args[0]);
            return this;
        }
        this.textureTransform.identity();
        // Design space
        var ax0;
        var ay0;
        var bx0;
        var by0;
        var cx0;
        var cy0;
        // Texture space
        var ax1;
        var ay1;
        var bx1;
        var by1;
        var cx1;
        var cy1;
        if (args.length === 6) {
            var points = args;
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
            var coords = args;
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
        var input = [
            ax0, bx0, cx0,
            ay0, by0, cy0,
            1, 1, 1,
        ];
        var inverse = glMat3.invert(input, input);
        // input * textureTransform = output
        // textureTransform = inverse(input) * output
        this.textureTransform.a = (inverse[0] * ax1) + (inverse[3] * bx1) + (inverse[6] * cx1);
        this.textureTransform.c = (inverse[1] * ax1) + (inverse[4] * bx1) + (inverse[7] * cx1);
        this.textureTransform.tx = (inverse[2] * ax1) + (inverse[5] * bx1) + (inverse[8] * cx1);
        this.textureTransform.b = (inverse[0] * ay1) + (inverse[3] * by1) + (inverse[6] * cy1);
        this.textureTransform.d = (inverse[1] * ay1) + (inverse[4] * by1) + (inverse[7] * cy1);
        this.textureTransform.ty = (inverse[2] * ay1) + (inverse[5] * by1) + (inverse[8] * cy1);
        return this;
    };
    /**
     * Flag the shape as dirty after you have modified the data directly.
     */
    Conic.prototype.update = function () {
        this._dirtyID++;
        return this;
    };
    return Conic;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var tempMatrix = new math.Matrix();
/**
 * Draws a segment of conic section represented by the equation _k_<sup>2</sup>- _lm = 0_, where k, l, m are lines.
 *
 * This display-object shades the inside/outside of a conic section within a mesh.
 *
 * A conic curve can be represented in the form: _k_<sup>2</sup> - _lm = 0_, where k, l, m are lines described in
 * the form _ax + by + c = 0_. _l_ and _m_ are the tangents to the curve, and _k_ is a chord connecting the points
 * of tangency.
 */
var ConicGraphic = /** @class */ (function (_super) {
    __extends(ConicGraphic, _super);
    function ConicGraphic(conic) {
        if (conic === void 0) { conic = new Conic(); }
        var _this = _super.call(this) || this;
        /**
         * The conic curve drawn by this graphic.
         */
        _this.shape = conic;
        /**
         * Flags whether the geometry data needs to be updated.
         */
        _this._dirtyID = 0;
        /**
         * The world transform ID last when the geometry was updated.
         */
        _this._transformID = 0;
        /**
         * Last {@link _dirtyID} when the geometry was updated.
         */
        _this._updateID = -1;
        /**
         * World positions of the vertices
         */
        _this.worldPositionData = [];
        /**
         * Texture positions of the vertices.
         */
        _this.texturePositionData = [];
        _this._texture = core.Texture.WHITE;
        return _this;
    }
    Object.defineProperty(ConicGraphic.prototype, "k", {
        /**
         * @see Conic#k
         */
        get: function () {
            return this.shape.k;
        },
        set: function (line) {
            var _a;
            (_a = this.shape).setk.apply(_a, line);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConicGraphic.prototype, "l", {
        /**
         * @see Conic#l
         */
        get: function () {
            return this.shape.l;
        },
        set: function (line) {
            var _a;
            (_a = this.shape).setl.apply(_a, line);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConicGraphic.prototype, "m", {
        /**
         * @see Conic#m
         */
        get: function () {
            return this.shape.m;
        },
        set: function (line) {
            var _a;
            (_a = this.shape).setm.apply(_a, line);
        },
        enumerable: true,
        configurable: true
    });
    ConicGraphic.prototype._render = function (renderer) {
        if (!renderer.plugins.conicRenderer) {
            renderer.plugins.conicRenderer = new ConicRenderer(renderer, null);
        }
        renderer.batch.setObjectRenderer(renderer.plugins.conicRenderer);
        renderer.plugins.conicRenderer.render(this);
    };
    ConicGraphic.prototype.drawTriangle = function (x0, y0, x1, y1, x2, y2) {
        var data = this.texturePositionData;
        var i = data.length;
        data.length += 6;
        data[i] = x0;
        data[i + 1] = y0;
        data[i + 2] = x1;
        data[i + 3] = y1;
        data[i + 4] = x2;
        data[i + 5] = y2;
    };
    /**
     * @param x
     * @param y
     * @param width
     * @param height
     */
    ConicGraphic.prototype.drawRect = function (x, y, width, height) {
        var data = this.texturePositionData;
        var i = data.length;
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
    };
    /**
     * Updates the geometry data for this conic.
     */
    ConicGraphic.prototype.updateConic = function () {
        var worldPositionData = this.worldPositionData;
        var texturePositionData = this.texturePositionData;
        worldPositionData.length = texturePositionData.length;
        var matrix = tempMatrix.copyFrom(this.shape.textureTransform).prepend(this.worldTransform);
        var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
        for (var i = 0, j = worldPositionData.length / 2; i < j; i++) {
            var x = texturePositionData[(i * 2)];
            var y = texturePositionData[(i * 2) + 1];
            worldPositionData[(i * 2)] = (a * x) + (c * y) + tx;
            worldPositionData[(i * 2) + 1] = (b * x) + (d * y) + ty;
        }
        this._updateID = this._dirtyID;
        var indexData = this.indexData = new Array(worldPositionData.length / 2);
        // TODO: Remove indexData, pixi-batch-renderer might have a problem with it
        for (var i = 0, j = indexData.length; i < j; i++) {
            indexData[i] = i;
        }
    };
    /**
     * Updates the transform of the conic, and if changed updates the geometry data.
     *
     * @override
     */
    ConicGraphic.prototype.updateTransform = function () {
        var ret = _super.prototype.updateTransform.call(this);
        if (this._transformID !== this.transform._worldID) {
            this.updateConic();
            this._transformID = this.transform._worldID;
        }
        return ret;
    };
    return ConicGraphic;
}(display.Container));

exports.Conic = Conic;
exports.ConicGraphic = ConicGraphic;
//# sourceMappingURL=conic.js.map
