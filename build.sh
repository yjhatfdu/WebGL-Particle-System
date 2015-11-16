#! /bin/sh
echo 'module Engine{export module GAME{export module PS{export class ShaderLib{' > src/particleSystem/gpuParticleSystemShaders.ts
echo 'static defaultVShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/defaultVShader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`;static particleFShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/particleFshader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`;static particleVShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/particleVshader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`;static positionFShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/positionFShader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`;static velocityFShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/velocityFShader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`;static defaultFShader=`' >> src/particleSystem/gpuParticleSystemShaders.ts
cat src/particleSystem/defaultFShader.glsl|tr -s '\n' >> src/particleSystem/gpuParticleSystemShaders.ts
echo '`}}}}' >> src/particleSystem/gpuParticleSystemShaders.ts
echo 'shaders build done!'

tsc --out build/build.js src/main.ts -sourcemap --module commonjs --target es5
echo tsc