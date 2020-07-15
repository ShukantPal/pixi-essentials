#version 100
#ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
#endif
#define SHADER_NAME Conic-Renderer-Fallback-Shader

precision mediump float;

uniform sampler2D uSamplers[%texturesPerBatch%];

varying vec2 vWorldCoord;
varying vec2 vTextureCoord;
varying float vMasterID;
varying float vUniformID;

uniform vec3 k[%uniformsPerBatch%];
uniform vec3 l[%uniformsPerBatch%];
uniform vec3 m[%uniformsPerBatch%];
uniform bool inside;

float sampleCurve(vec2 point, vec3 kv, vec3 lv, vec3 mv)
{
    float k = dot(vec3(vTextureCoord, 1), kv);
    float l = dot(vec3(vTextureCoord, 1), lv);
    float m = dot(vec3(vTextureCoord, 1), mv);

    return k*k - l*m;
}

void main(void)
{
    vec3 kv, lv, mv;

    for (int i = 0; i < %uniformsPerBatch%; i++)
    {
        if (float(i) > vUniformID - 0.5) 
        {
            kv = k[i];
            lv = l[i];
            mv = m[i];
            break;
        }
    }

    float k_ = dot(vec3(vTextureCoord, 1), kv);
    float l_ = dot(vec3(vTextureCoord, 1), lv);
    float m_ = dot(vec3(vTextureCoord, 1), mv);

    float cv = k_ * k_ - l_ * m_;

#ifdef GL_OES_standard_derivatives
    float cvdx = dFdx(cv);
    float cvdy = dFdy(cv);
    vec2 gradientTangent = vec2(cvdx, cvdy);

    float signedDistance = cv / length(gradientTangent);
    bool antialias = signedDistance > -1. && signedDistance < 1.;
#endif

    vec4 color;

    if ((inside && cv < 0.) || (!inside && cv >= 0.) 
#ifdef GL_OES_standard_derivatives
            || antialias
#endif
    )
    {
        for (int i = 0; i < %texturesPerBatch%; i++)
        {
            if (float(i) > vMasterID - 0.5)
            {
                color = texture2D(uSamplers[i], vTextureCoord);
                break;
            }
        }
    }
    else
    {
        color = vec4(0, 0, 0, 0);
    }

#ifdef GL_OES_standard_derivatives
    if (antialias)
    {
        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;
        
        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);
    }
#endif

    gl_FragColor = color;
}