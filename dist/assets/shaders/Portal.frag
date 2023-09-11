#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

varying vec2 fragCoord;

void Unity_Twirl(vec2 UV, vec2 Center, float Strength, vec2 Offset, out vec2 Out)
{
    vec2 delta = UV - Center;
    float angle = Strength * length(delta);
    float x = cos(angle) * delta.x - sin(angle) * delta.y;
    float y = sin(angle) * delta.x + cos(angle) * delta.y;
    Out = vec2(x + Center.x + Offset.x, y + Center.y + Offset.y);
}

vec2 unity_voronoi_noise_randomVector(vec2 UV, float offset)
{
    mat2 m = mat2(15.27, 47.63, 99.41, 89.98);
    UV = fract(sin(UV * m) * 46839.32);
    return vec2(sin(UV.y*+offset)*0.5+0.5, cos(UV.x*offset)*0.5+0.5);
}

void Unity_Voronoi(vec2 UV, float AngleOffset, float CellDensity, out float Out, out float Cells)
{
    vec2 g = floor(UV * CellDensity);
    vec2 f = fract(UV * CellDensity);
    float t = 8.0;
    vec3 res = vec3(8.0, 0.0, 0.0);

    for(int y=-1; y<=1; y++)
    {
        for(int x=-1; x<=1; x++)
        {
            vec2 lattice = vec2(x,y);
            vec2 offset = unity_voronoi_noise_randomVector(lattice + g, AngleOffset);
            float d = distance(lattice + offset, f);
            if(d < res.x)
            {
                res = vec3(d, offset.x, offset.y);
                Out = res.x;
                Cells = res.y;
            }
        }
    }
}

const vec3 _Color = vec3(195.0 / 255.0, 84.0 / 255.0, 205.0 / 255.0) * 3.0;
const float _Strength = 10.0;
const float _Speed = 0.2;
const float _Brightness = 1.5;
const float _CellDensity = 6.0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{  
    // Shader.
    
    vec2 twirlResult;
    float voronoiResult;
    float voronoiCells;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/resolution.xy;
    
    float offset = time * _Speed;
 
    Unity_Twirl(uv, vec2(0.5, 0.5), _Strength, vec2(offset), twirlResult);
    Unity_Voronoi(twirlResult, 2.0, _CellDensity, voronoiResult, voronoiCells);
    
    voronoiResult = pow(voronoiResult, _Brightness);
    
    // Output to screen
    fragColor = vec4(voronoiResult * _Color, voronoiResult);
}

void main(void)
{
    mainImage(gl_FragColor, fragCoord.xy);

    if (gl_FragColor.x == 0.0 && gl_FragColor.y == 0.0 && gl_FragColor.z == 0.0)
    {
        gl_FragColor.a = 0.0;
    }
}