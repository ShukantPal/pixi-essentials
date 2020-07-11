#define NLIM 2048
#define TAU 6.28318530718 

precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 inputPixel;
uniform vec4 outputFrame;

uniform float length;

// Aesthetic complex ctor
vec2 complex(float r, float i) {
  return vec2(r, i);
}
// Calculate e^jp
vec2 expo(float p) {
  return complex(cos(p), sin(p));
}

#define HORIZONTAL %horizontal%

int modi(int a, int b) {
  int q = a / b;
  return a - q*b;
}
float luma(vec4 rgba) {
  return (rgba.r + rgba.g + rgba.b) / 3.;
}

float luma2D(vec2 coord) {
  return luma(texture2D(uSampler, coord));
}
vec2 texCoord(vec2 pos) {
  return inputPixel.zw * (pos.xy + vec2(.5, .5));
}
vec2 texCoord(int x, int y) {
  return texCoord(vec2(float(x), float(y)));
}
vec4 gray(float lum) {
  return vec4(
    lum,
    lum,
    lum,
    1
  );
}
vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec4 complexToColor(vec2 compl) {
  return vec4(compl.xy, 0, 1);
}

vec2 colorToComplex(vec4 color) {
  return vec2(
    color.x,
    color.y
  );
}

  vec2 complex2D(vec2 coord) {
    return vec2(texture2D(uSampler, coord).xy);
  }

  void main(void) {
    // (x,y) absolute coordinates (e.g. .5, 1.5, 2.5)
    float x = vTextureCoord.x * inputPixel.x;
    float y = vTextureCoord.y * inputPixel.y;

    int width = int(inputPixel.x);
    int height = int(inputPixel.y);

    float widthf = float(width);

    // Pixel index divided by no. of pixels in each dimensions
    float tx = floor(x) / outputFrame.z;
    float ty = floor(y) / outputFrame.w;

    float area = float(outputFrame.z * outputFrame.w);

#if HORIZONTAL == 0
    int r = int(x);
    float k = float(r);

    float stride = widthf / length;
    float N = length;

    float indexOfDFT = mod(k, stride);
    float indexInDFT = mod(floor(k / stride), (N / 2.));

    float evenIndex = (indexOfDFT + indexInDFT * 2. * stride);
    float oddIndex = evenIndex + stride;
    vec2 aCoord = texCoord(int(evenIndex), int(y));
    vec2 bCoord = texCoord(int(oddIndex), int(y));

    vec2 a = complex2D(aCoord);
    vec2 b = complex2D(bCoord);

    vec2 twiddle = expo(-TAU * (floor(k/stride) / N));
    vec2 result;

    result = a + cmul(twiddle, b);
#endif

#if HORIZONTAL == 0
    vec4 color = complexToColor(result);
    gl_FragColor = color;
#elif HORIZONTAL == 1
#endif
}