/*
 * Packs the RGBA input image into a discrete spatial signal x[u,v].
 *
 * Each texel contains the sample for two complex signals (xy, zw).
 *
 * LUMINANCE mode:
 * The default output is a complex signal mapping the luminance of each pixel to the real component
 * of the pixel, and zero for the imaginary component.
 *
 * RGBA mode:
 * This mode will pack the spatial signal [r,g,b,a] into two complex signals [r+jg, b+ja]. The frequency
 * output is then separated to get f(r) = 1/2[]
 */

#define LUMINANCE(color) (0.299*color.r + 0.587*color.g + 0.114*color.b)
#define PACK_MODE %packMode%

uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform vec4 inputPixel;

int modi(int a, int b) {
  int q = a / b;
  return a - q*b;
}

void main(void) {
    int x = int(vTextureCoord.x * inputPixel.x);
    int y = int(vTextureCoord.y * inputPixel.y);
    float multipler = modi(x+y, 2) == 0 ? 1. : -1.;

    vec4 inputSample = texture2D(uSampler, vTextureCoord);

#if PACK_MODE == PACK_LUMINANCE
    float luma = LUMINANCE(inputSample);

    // Shift frequencies by π/2
    luma *= multipler;

    // The first complex-signal is luma + j0.
    // The second complex-signal is always 0 + j1.
    gl_FragColor = vec4(luma, 0, 0, 1);
#endif
}