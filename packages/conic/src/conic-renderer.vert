#version 300 es

#define SHADER_NAME Conic-Renderer-Shader

precision mediump float;

in vec2 aWorldPosition;
in vec2 aTexturePosition;
in float aMasterID;
in float aUniformID;

uniform mat3 projectionMatrix;

out vec2 vWorldCoord;
out vec2 vTextureCoord;
out float vMasterID;
out float vUniformID;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);

    vWorldCoord = gl_Position.xy;
    vTextureCoord = aTexturePosition;
    vMasterID = aMasterID;
    vUniformID = aUniformID;
}