precision highp float;
uniform vec4 uColor;
varying vec2 fragPosition;

const int MAX_ITER = 1000;

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

void main()
{
    int count = MandelbrotTest(fragPosition[0], fragPosition[1]);
    if (count == MAX_ITER)
        gl_FragColor = vec4(0.,0.,0.,1.);
    else
        gl_FragColor = vec4(0.,0.,1., 1.);
}
