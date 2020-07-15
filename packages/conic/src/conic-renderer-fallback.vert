#version 100
#define SHADER_NAME Conic-Renderer-Fallback-Shader

precision mediump float;

attribute vec2 aWorldPosition;
attribute vec2 aTexturePosition;
attribute float aMasterID;
attribute float aUniformID;

uniform mat3 projectionMatrix;

varying vec2 vWorldCoord;
varying vec2 vTextureCoord;
varying float vMasterID;
varying float vUniformID;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);

    vWorldCoord = gl_Position.xy;
    vTextureCoord = aTexturePosition;
    vMasterID = aMasterID;
    vUniformID = aUniformID;
}