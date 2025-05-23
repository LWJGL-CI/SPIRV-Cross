#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct ResType
{
    float4 _m0;
    float4 _m1;
};

struct main0_out
{
    float4 f [[user(locn0)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float4 f2 [[attribute(0)]];
};

vertex void main0(main0_in in [[stage_in]], uint gl_VertexIndex [[vertex_id]], uint gl_BaseVertex [[base_vertex]], uint gl_InstanceIndex [[instance_id]], uint gl_BaseInstance [[base_instance]], device main0_out* spvOut [[buffer(28)]], device uint* spvIndirectParams [[buffer(29)]])
{
    device main0_out& out = spvOut[(gl_InstanceIndex - gl_BaseInstance) * spvIndirectParams[0] + gl_VertexIndex - gl_BaseVertex];
    ResType _22;
    _22._m0 = modf(in.f2, _22._m1);
    out.f = _22._m1;
    out.gl_Position = _22._m0;
}

