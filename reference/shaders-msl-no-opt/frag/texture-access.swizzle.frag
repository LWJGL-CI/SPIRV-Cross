#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

// Returns 2D texture coords corresponding to 1D texel buffer coords
static inline __attribute__((always_inline))
uint2 spvTexelBufferCoord(uint tc)
{
    return uint2(tc % 4096, tc / 4096);
}

enum class spvSwizzle : uint
{
    none = 0,
    zero,
    one,
    red,
    green,
    blue,
    alpha
};

template<typename T>
inline T spvGetSwizzle(vec<T, 4> x, T c, spvSwizzle s)
{
    switch (s)
    {
        case spvSwizzle::none:
            return c;
        case spvSwizzle::zero:
            return 0;
        case spvSwizzle::one:
            return 1;
        case spvSwizzle::red:
            return x.r;
        case spvSwizzle::green:
            return x.g;
        case spvSwizzle::blue:
            return x.b;
        case spvSwizzle::alpha:
            return x.a;
    }
}

// Wrapper function that swizzles texture samples and fetches.
template<typename T>
inline vec<T, 4> spvTextureSwizzle(vec<T, 4> x, uint s)
{
    if (!s)
        return x;
    return vec<T, 4>(spvGetSwizzle(x, x.r, spvSwizzle((s >> 0) & 0xFF)), spvGetSwizzle(x, x.g, spvSwizzle((s >> 8) & 0xFF)), spvGetSwizzle(x, x.b, spvSwizzle((s >> 16) & 0xFF)), spvGetSwizzle(x, x.a, spvSwizzle((s >> 24) & 0xFF)));
}

template<typename T>
inline T spvTextureSwizzle(T x, uint s)
{
    return spvTextureSwizzle(vec<T, 4>(x, 0, 0, 1), s).x;
}

template<typename Tex, typename... Tp>
using spvGatherReturn = decltype(declval<Tex>().gather(declval<sampler>(), declval<Tp>()...));

template<typename Tex, typename... Tp>
using spvGatherCompareReturn = decltype(declval<Tex>().gather_compare(declval<sampler>(), declval<Tp>()...));

// Wrapper function that swizzles texture gathers.
template<typename Tex, typename... Ts>
inline spvGatherReturn<Tex, Ts...> spvGatherSwizzle(const thread Tex& t, sampler s, uint sw, component c, Ts... params) METAL_CONST_ARG(c)
{
    if (sw)
    {
        switch (spvSwizzle((sw >> (uint(c) * 8)) & 0xFF))
        {
            case spvSwizzle::none:
                break;
            case spvSwizzle::zero:
                return spvGatherReturn<Tex, Ts...>(0, 0, 0, 0);
            case spvSwizzle::one:
                return spvGatherReturn<Tex, Ts...>(1, 1, 1, 1);
            case spvSwizzle::red:
                return t.gather(s, params..., component::x);
            case spvSwizzle::green:
                return t.gather(s, params..., component::y);
            case spvSwizzle::blue:
                return t.gather(s, params..., component::z);
            case spvSwizzle::alpha:
                return t.gather(s, params..., component::w);
        }
    }
    switch (c)
    {
        case component::x:
            return t.gather(s, params..., component::x);
        case component::y:
            return t.gather(s, params..., component::y);
        case component::z:
            return t.gather(s, params..., component::z);
        case component::w:
            return t.gather(s, params..., component::w);
    }
}

// Wrapper function that swizzles depth texture gathers.
template<typename Tex, typename... Ts>
inline spvGatherCompareReturn<Tex, Ts...> spvGatherCompareSwizzle(const thread Tex& t, sampler s, uint sw, Ts... params)
{
    if (sw)
    {
        switch (spvSwizzle(sw & 0xFF))
        {
            case spvSwizzle::none:
            case spvSwizzle::red:
                break;
            case spvSwizzle::zero:
            case spvSwizzle::green:
            case spvSwizzle::blue:
            case spvSwizzle::alpha:
                return spvGatherCompareReturn<Tex, Ts...>(0, 0, 0, 0);
            case spvSwizzle::one:
                return spvGatherCompareReturn<Tex, Ts...>(1, 1, 1, 1);
        }
    }
    return t.gather_compare(s, params...);
}

fragment void main0(constant uint* spvSwizzleConstants [[buffer(30)]], texture1d<float> tex1d [[texture(0)]], texture2d<float> tex2d [[texture(1)]], texture3d<float> tex3d [[texture(2)]], texturecube<float> texCube [[texture(3)]], texture2d_array<float> tex2dArray [[texture(4)]], texturecube_array<float> texCubeArray [[texture(5)]], depth2d<float> depth2d [[texture(6)]], depthcube<float> depthCube [[texture(7)]], depth2d_array<float> depth2dArray [[texture(8)]], depthcube_array<float> depthCubeArray [[texture(9)]], texture2d<float> texBuffer [[texture(10)]], sampler tex1dSmplr [[sampler(0)]], sampler tex2dSmplr [[sampler(1)]], sampler tex3dSmplr [[sampler(2)]], sampler texCubeSmplr [[sampler(3)]], sampler tex2dArraySmplr [[sampler(4)]], sampler texCubeArraySmplr [[sampler(5)]], sampler depth2dSmplr [[sampler(6)]], sampler depthCubeSmplr [[sampler(7)]], sampler depth2dArraySmplr [[sampler(8)]], sampler depthCubeArraySmplr [[sampler(9)]])
{
    constant uint& tex1dSwzl = spvSwizzleConstants[0];
    constant uint& tex2dSwzl = spvSwizzleConstants[1];
    constant uint& tex3dSwzl = spvSwizzleConstants[2];
    constant uint& texCubeSwzl = spvSwizzleConstants[3];
    constant uint& tex2dArraySwzl = spvSwizzleConstants[4];
    constant uint& texCubeArraySwzl = spvSwizzleConstants[5];
    constant uint& depth2dSwzl = spvSwizzleConstants[6];
    constant uint& depthCubeSwzl = spvSwizzleConstants[7];
    constant uint& depth2dArraySwzl = spvSwizzleConstants[8];
    constant uint& depthCubeArraySwzl = spvSwizzleConstants[9];
    float4 c = spvTextureSwizzle(tex1d.sample(tex1dSmplr, 0.0), tex1dSwzl);
    c = spvTextureSwizzle(tex2d.sample(tex2dSmplr, float2(0.0)), tex2dSwzl);
    c = spvTextureSwizzle(tex3d.sample(tex3dSmplr, float3(0.0)), tex3dSwzl);
    c = spvTextureSwizzle(texCube.sample(texCubeSmplr, float3(0.0)), texCubeSwzl);
    c = spvTextureSwizzle(tex2dArray.sample(tex2dArraySmplr, float3(0.0).xy, uint(rint(float3(0.0).z))), tex2dArraySwzl);
    c = spvTextureSwizzle(texCubeArray.sample(texCubeArraySmplr, float4(0.0).xyz, uint(rint(float4(0.0).w))), texCubeArraySwzl);
    c.x = spvTextureSwizzle(depth2d.sample_compare(depth2dSmplr, float3(0.0, 0.0, 1.0).xy, 1.0), depth2dSwzl);
    c.x = spvTextureSwizzle(depthCube.sample_compare(depthCubeSmplr, float4(0.0, 0.0, 0.0, 1.0).xyz, 1.0), depthCubeSwzl);
    c.x = spvTextureSwizzle(depth2dArray.sample_compare(depth2dArraySmplr, float4(0.0, 0.0, 0.0, 1.0).xy, uint(rint(float4(0.0, 0.0, 0.0, 1.0).z)), 1.0), depth2dArraySwzl);
    c.x = spvTextureSwizzle(depthCubeArray.sample_compare(depthCubeArraySmplr, float4(0.0).xyz, uint(rint(float4(0.0).w)), 1.0), depthCubeArraySwzl);
    c = spvTextureSwizzle(tex1d.sample(tex1dSmplr, float2(0.0, 1.0).x / float2(0.0, 1.0).y), tex1dSwzl);
    c = spvTextureSwizzle(tex2d.sample(tex2dSmplr, float3(0.0, 0.0, 1.0).xy / float3(0.0, 0.0, 1.0).z), tex2dSwzl);
    c = spvTextureSwizzle(tex3d.sample(tex3dSmplr, float4(0.0, 0.0, 0.0, 1.0).xyz / float4(0.0, 0.0, 0.0, 1.0).w), tex3dSwzl);
    float4 _100 = float4(0.0, 0.0, 1.0, 1.0);
    _100.z = 1.0;
    c.x = spvTextureSwizzle(depth2d.sample_compare(depth2dSmplr, _100.xy / _100.z, 1.0 / _100.z), depth2dSwzl);
    c = spvTextureSwizzle(tex1d.sample(tex1dSmplr, 0.0), tex1dSwzl);
    c = spvTextureSwizzle(tex2d.sample(tex2dSmplr, float2(0.0), level(0.0)), tex2dSwzl);
    c = spvTextureSwizzle(tex3d.sample(tex3dSmplr, float3(0.0), level(0.0)), tex3dSwzl);
    c = spvTextureSwizzle(texCube.sample(texCubeSmplr, float3(0.0), level(0.0)), texCubeSwzl);
    c = spvTextureSwizzle(tex2dArray.sample(tex2dArraySmplr, float3(0.0).xy, uint(rint(float3(0.0).z)), level(0.0)), tex2dArraySwzl);
    c = spvTextureSwizzle(texCubeArray.sample(texCubeArraySmplr, float4(0.0).xyz, uint(rint(float4(0.0).w)), level(0.0)), texCubeArraySwzl);
    c.x = spvTextureSwizzle(depth2d.sample_compare(depth2dSmplr, float3(0.0, 0.0, 1.0).xy, 1.0, level(0.0)), depth2dSwzl);
    c = spvTextureSwizzle(tex1d.sample(tex1dSmplr, float2(0.0, 1.0).x / float2(0.0, 1.0).y), tex1dSwzl);
    c = spvTextureSwizzle(tex2d.sample(tex2dSmplr, float3(0.0, 0.0, 1.0).xy / float3(0.0, 0.0, 1.0).z, level(0.0)), tex2dSwzl);
    c = spvTextureSwizzle(tex3d.sample(tex3dSmplr, float4(0.0, 0.0, 0.0, 1.0).xyz / float4(0.0, 0.0, 0.0, 1.0).w, level(0.0)), tex3dSwzl);
    float4 _128 = float4(0.0, 0.0, 1.0, 1.0);
    _128.z = 1.0;
    c.x = spvTextureSwizzle(depth2d.sample_compare(depth2dSmplr, _128.xy / _128.z, 1.0 / _128.z, level(0.0)), depth2dSwzl);
    c = spvTextureSwizzle(tex1d.read(uint(0)), tex1dSwzl);
    c = spvTextureSwizzle(tex2d.read(uint2(int2(0)), 0), tex2dSwzl);
    c = spvTextureSwizzle(tex3d.read(uint3(int3(0)), 0), tex3dSwzl);
    c = spvTextureSwizzle(tex2dArray.read(uint2(int3(0).xy), uint(int3(0).z), 0), tex2dArraySwzl);
    c = texBuffer.read(spvTexelBufferCoord(0));
    c = spvGatherSwizzle(tex2d, tex2dSmplr, tex2dSwzl, component::x, float2(0.0), int2(0));
    c = spvGatherSwizzle(texCube, texCubeSmplr, texCubeSwzl, component::y, float3(0.0));
    c = spvGatherSwizzle(tex2dArray, tex2dArraySmplr, tex2dArraySwzl, component::z, float3(0.0).xy, uint(rint(float3(0.0).z)), int2(0));
    c = spvGatherSwizzle(texCubeArray, texCubeArraySmplr, texCubeArraySwzl, component::w, float4(0.0).xyz, uint(rint(float4(0.0).w)));
    c = spvGatherCompareSwizzle(depth2d, depth2dSmplr, depth2dSwzl, float2(0.0), 1.0);
    c = spvGatherCompareSwizzle(depthCube, depthCubeSmplr, depthCubeSwzl, float3(0.0), 1.0);
    c = spvGatherCompareSwizzle(depth2dArray, depth2dArraySmplr, depth2dArraySwzl, float3(0.0).xy, uint(rint(float3(0.0).z)), 1.0);
    c = spvGatherCompareSwizzle(depthCubeArray, depthCubeArraySmplr, depthCubeArraySwzl, float4(0.0).xyz, uint(rint(float4(0.0).w)), 1.0);
}

