#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

varying vec2 fragCoord;

const float NoiseResolution = 8.0; //  0.4
const float Lacunarity = 2.0; // 2.0 // intuitive measure of gappiness / heterogenity or variability
const float Gain = 0.6; // 0.6
const float Ball_roll_spd = 0.0; // 0.5
const float Dark_lava_spd = 0.05; // 0.05
const float Dark_island_spd = 0.5; // 0.5

// Let's get random numbers
vec2 random2D(vec2 p) {
	return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                          dot(p, vec2(269.5, 183.3))))*43758.5453);
}

float random1D(vec2 p) {
    return fract(sin(dot(p.xy,vec2(12.9898,78.233))) * 43758.5453123);
}

// Add a bit of noise
float noise2D(vec2 _pos) {	
    vec2 i = floor(_pos); 		// integer
	vec2 f = fract(_pos); 		// fraction

// define the corners of a tile
	float a = random1D(i);
	float b = random1D(i + vec2(1.0, 0.0));
	float c = random1D(i + vec2(0.0, 1.0));
	float d = random1D(i + vec2(1.0, 1.0));

	// smooth Interpolation
	vec2 u = smoothstep(0.0, 1.0, f);
    
	// lerp between the four corners
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// fractal brownian motion
float fbm(vec2 _pos) {
	_pos.y += time * Ball_roll_spd;
	_pos.x += sin(time * Ball_roll_spd);
	float ts = time * Dark_lava_spd;
	float val = 0.0;
	float amp = 0.4;
    
	// Loop of octaves
	for (int i = 0; i < 4; ++i) // set octave number to 4
	{
		val += amp * noise2D(_pos+ts);
		_pos *= Lacunarity;
		amp *= Gain;
	}
	return val;
}

float voronoiIQ(vec2 _pos) {
	_pos.y += time * Ball_roll_spd;
	_pos.x += sin(time * Ball_roll_spd);
	vec2 p = floor(_pos);
	vec2  f = fract(_pos);
	float res = 0.0; 
	for (int j = -1; j <= 1; j++)
		for (int i = -1; i <= 1; i++)
		{
			vec2 b = vec2(i, j);
			vec2 pnt = random2D(p + b);
			pnt = 0.5 + 0.5*sin((time * Dark_island_spd) + 6.2831*pnt);
			vec2 r = vec2(b) - f + pnt;
			float d = dot(r, r);
			res += exp(-32.0*d); // quickly decaying exponential 
		}
   return -(1.0 / 32.0)*log(res);
}

const float Wave1Height = 1.0;
const float Wave2Height = 1.0;

const float _Height = 50.0;
const float _Width = 50.0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 color = vec3(0.0, 0.0, 0.0);
    
    // Normalized pixel coordinates (from 0 to 1)
	vec2 uv = fragCoord.xy / _Height;  
    vec2 pos = uv.xy * NoiseResolution;
    
    float pixelsIn = uv.x / _Width * 200.0;
    float y = resolution.y - Wave1Height + sin(pixelsIn + time) * Wave1Height;
    y += - Wave2Height + sin(pixelsIn * 1.5 - time) * Wave2Height;
    
    color.rg = vec2(voronoiIQ(pos.xy));
    color.r += 0.25+fbm(pos.xy);
    
    // Output to screen
    if (y > fragCoord.y) {
        fragColor = vec4(color, 1.0);
    } else {
        fragColor = vec4(0.0);
    }
}

void main(void)
{
    mainImage(gl_FragColor, fragCoord.xy);

    if (gl_FragColor.x == 0.0 && gl_FragColor.y == 0.0 && gl_FragColor.z == 0.0)
    {
        gl_FragColor.a = 0.0;
    }
}