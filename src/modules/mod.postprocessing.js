import { Vector2, ShaderMaterial, WebGLRenderTarget,Camera,Scene,Mesh,PlaneGeometry, Color } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const PostProcessing = (_t, callback)=>{

	let _p = _t.PostProcessing = {};

	_p.ShaderPass = ShaderPass;
	_p.renderPass = new RenderPass( _t.Elements.scene, _t.Elements.camera );

	_p.bloomPass = new UnrealBloomPass( new Vector2( _t.Screen.width, _t.Screen.height));

	_p.bloomPass.threshold = 0.99;
	_p.bloomPass.strength = 0.3;
	_p.bloomPass.radius = 1;

	_p.smaaPass = new SMAAPass( new Vector2( _t.Screen.width*1.5, _t.Screen.height*1.5) );
	_p.ssaoPass = new SSAOPass( _t.Elements.scene, _t.Elements.camera, _t.Screen.width, _t.Screen.height );
	_p.ssaoPass.kernelRadius = 16;
	_p.ssaoPass.minDistance = 0.02; 
	_p.ssaoPass.maxDistance = 0.3; 

	_t.Screen.focusDistance = 8000;

	_p.dofParams = {
		focus: _t.Screen.focusDistance,
		aperture: 0.00000015,
		maxblur: 0.001,
		width: _t.Screen.width,
		height: _t.Screen.height
	};
	_p.bokehPass = new BokehPass( _t.Elements.scene, _t.Elements.camera, _p.dofParams);

	_p.noiseVertShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;
	_p.noiseFragShader = `
		uniform float amount;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		float random( vec2 p ){
		  vec2 K1 = vec2(
		    23.14069263277926, // e^pi (Gelfond's constant)
		    2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
		  );
		  return fract( cos( dot(p,K1) ) * 12345.6789 );
		}

		void main(){
		  vec4 color = texture2D( tDiffuse, vUv );
		  vec2 uvRandom = vUv;
		  uvRandom.y *= random(vec2(uvRandom.y,amount));
		  color.rgb -= random(uvRandom)/20.0;
		  gl_FragColor = vec4( color  );
		}
	`;
	_p.noiseCounter = 0.0;
	_p.noiseShader = {
	  uniforms: {
	    "tDiffuse": { value: null },
	    "amount": { value: _p.noiseCounter }
	  },
	  vertexShader: _p.noiseVertShader,
	  fragmentShader: _p.noiseFragShader
	}

	_p.noisePass = new _p.ShaderPass(_p.noiseShader);
	_p.noisePass.renderToScreen = true;

	_p.composer = new EffectComposer(_t.Screen.renderer);
	_p.composer.addPass(_p.renderPass);
	
	_p.composer.addPass(_p.bloomPass);
	_p.composer.addPass(_p.smaaPass);
	
	_p.composer.setSize(_t.Screen.width,_t.Screen.height);

	_t.Screen.resize.postprocessing = ()=>{
		_p.renderPass.setSize(_t.Screen.width,_t.Screen.height);
		_p.bloomPass.setSize(_t.Screen.width,_t.Screen.height);
		_p.smaaPass.setSize(_t.Screen.width*1.5,_t.Screen.height*1.5);
		_p.noisePass.setSize(_t.Screen.width,_t.Screen.height);
		_p.ssaoPass.setSize(_t.Screen.width,_t.Screen.height);
		_p.bokehPass.setSize(_t.Screen.width,_t.Screen.height);
		_p.composer.setSize(_t.Screen.width,_t.Screen.height);
	}

	_p.focus = ()=>{
		if(_t.Screen.focusDistance){
			_t.PostProcessing.bokehPass.uniforms['focus'].value = _t.Screen.focusDistance;
			_t.PostProcessing.bokehPass.uniforms['maxblur'].value = _t.Screen.focusBlur;
			_t.PostProcessing.bokehPass.needsUpdate = true;	
		}
	}

	_t.Render.passes.main = ()=>{
		if(_t.PostProcessing.noisePass){
			_t.PostProcessing.noiseCounter += 0.01;
			_t.PostProcessing.noisePass.uniforms["amount"].value = _t.PostProcessing.noiseCounter;	
		}
		_p.composer.render();
	}
	
	_t.Motion.animations.autoFocus = ()=>{
		_p.bokehPass.uniforms['focus'].value = _t.Screen.focusDistance;
		_p.bokehPass.needsUpdate = true;
	}

	if(callback) callback();

}

export { PostProcessing };