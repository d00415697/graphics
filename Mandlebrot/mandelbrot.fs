//
// uniforms for interactions
//

uniform float uZoom;
uniform float uOffsetX;
uniform float uOffsetY;

// 
// Screen resolution
//

uniform vec2 uResolution;
#define MAX_ITER = 100

int MandelbrotTest(float cr, float ci)
{
    int count = 0;

    float zr = 0.;
    float zi = 0.;
    float zrsqr = 0.;
    float zisqr = 0.;

    for (int i=0; i<MAX_ITER; i++){
      zi = zr * zi;
      zi += zi;
      zi += ci;
      zr = zrsqr - zisqr + cr;
      zrsqr = zr * zr;
      zisqr = zi * zi;
		
      //the fewer iterations it takes to diverge, the farther from the set
      if (zrsqr + zisqr > 4.0) 
        break;
      count++;
    }

    return count;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec2 c = uv * uZoom + vec2(uOffsetX, uOffsetY);
  int iteration = MandelbrotTest(c.x, c.y);
  float norm = float(iteration) / float(MAX_ITER);

  vec3 color = vec3(0.5 + 0.5 * cos(6.2831 * norm), 0.5 + 0.5 * sin(6.2831 * norm), 0.5 - 0.5 * cos(6.2831 * norm));
  gl_FragColor = vec4(color, 1.0);
}
