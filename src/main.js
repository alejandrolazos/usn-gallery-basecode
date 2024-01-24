import { 
	Vector2,Vector3,Vector4,Quaternion,Matrix4,Spherical,Box3,Sphere,Raycaster,MathUtils,
	Scene, FogExp2, Color, WebGLRenderer, PerspectiveCamera, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping,
	LoadingManager, Clock, TextureLoader, Object3D
} from 'three';

import CameraControls from 'camera-controls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { getGPUTier } from 'detect-gpu';

import { PostProcessing } from './modules/mod.postprocessing';
import { ObjCoords, Follower } from './modules/mod.tools';
import { Materials } from './modules/mod.materials';
import { Content } from './modules/mod.content';
import { Interaction } from './modules/mod.interaction';


const subTHREE = {
	Vector2   : Vector2, 
	Vector3   : Vector3,
	Vector4   : Vector4,
	Quaternion: Quaternion,
	Matrix4   : Matrix4,
	Spherical : Spherical,
	Box3      : Box3,
	Sphere    : Sphere,
	Raycaster : Raycaster,
	MathUtils : {
		DEG2RAD: MathUtils.DEG2RAD,
		clamp: MathUtils.clamp,
	},
} 

CameraControls.install( { THREE: subTHREE } )



class WGL{

	constructor(params, wglReady){

		const _t = this;
		_t.Screen = {};
		_t.Loaders = {};
		_t.Motion = {};
		_t.Render = {};

		if(!params) params = {};

		_t.params = {
			gpu: (params.gpu ? params.gpu : getGPUTier),
			init_position: (params.init_position ? params.init_position : new Vector3(-2000, 1000, -1000)),
			init_target: (params.init_target ? params.init_target : new Vector3(0, 0, 0)),
			init_zoom: (params.init_zoom ? params.init_zoom : 1),
			fogColor: (params.fogColor ? params.fogColor : 0x040404),
			lightColor1: (params.lightColor1 ? params.lightColor1 : 0xedfffb),
			lightColor2: (params.lightColor2 ? params.lightColor2 : 0x00382b),
			backgroundColor: (params.backgroundColor ? params.backgroundColor : 0x040404),
			parent: (params.parent ? params.parent : document.body),
			assets: (params.assets ? params.assets : './assets/'), // '',
			geometry: (params.geometry ? params.geometry : 'objects/scene.fbx'),
			vortex: (params.vortex ? params.vortex : 'objects/vortex.fbx'),
			htmlObjects: (params.htmlObjects ? params.htmlObjects : document.getElementById('floating_elements')),
			textures: {
				sky: (params.textures && params.textures.sky ? params.textures.sky : 'textures/sky/sky.png'),
				cloud: (params.textures && params.textures.cloud ? params.textures.cloud : 'textures/sky/cloud1.png'),
				video1: (params.textures && params.textures.video1 ? params.textures.video1 : 'textures/videos/video1.mp4'),
			}
		}

		_t.TWEEN = require('./libs/tween.js');

		_t.Motion.MANUAL = new _t.TWEEN.Group();
		_t.Motion.AUTO = new _t.TWEEN.Group();
		_t.Motion.animations = {};
		_t.Motion.animations.auto = ()=>{
			_t.Motion.AUTO.update();
		}

		_t.ObjCoords = new ObjCoords;
		_t.Follow = new Follower(_t);

		_t.Assets = {};
		_t.Assets.textures = {};
		_t.Assets.materials = {};

		_t.Screen.width  = window.innerWidth;
		_t.Screen.height = window.innerHeight;

		_t.Elements = {};
		_t.Elements.scene  = new Scene();
		_t.Elements.scene.fog = new FogExp2( _t.params.fogColor, 0.00014 );
		_t.Elements.scene.background = new Color(_t.params.backgroundColor);
		_t.Elements.intersect = [];
		
		_t.Elements.camera = new PerspectiveCamera( 90, _t.Screen.width / _t.Screen.height, 1, 100000 );
		_t.Elements.camera.position.copy(_t.params.init_position);
		_t.Elements.scene.add(_t.Elements.camera);

		if( _t.params.gpu.isMobile || window.innerWidth < 1024 ){

		} else {
			_t.camOff = -300;
			_t.Elements.camera.setViewOffset( window.innerWidth, window.innerHeight, -300, 0, window.innerWidth, window.innerHeight);
		}
		

		_t.Elements.camera.offsets = {
			left: new Object3D(),
			right: new Object3D(),
			top: new Object3D(),
			bottom: new Object3D(),
			target: new Object3D(),
		}

		_t.Elements.camera.add(_t.Elements.camera.offsets.left);
		_t.Elements.camera.add(_t.Elements.camera.offsets.right);
		_t.Elements.camera.add(_t.Elements.camera.offsets.top);
		_t.Elements.camera.add(_t.Elements.camera.offsets.bottom);
		_t.Elements.camera.add(_t.Elements.camera.offsets.target);
		
		_t.Elements.camera.offsets.left.position.set(10, 0, 0);
		_t.Elements.camera.offsets.right.position.set(-10, 0, 0);
		_t.Elements.camera.offsets.top.position.set(0, 10, 0);
		_t.Elements.camera.offsets.bottom.position.set(0, -10, 0);
		_t.Elements.camera.offsets.target.position.set(0, 0, -30);

		_t.init(wglReady); 

	}

	init(wglReady){

		const _t = this;

		_t.initScreen(()=>{
			_t.initRender(()=>{
				_t.initLoaders(()=>{
					_t.loadContent( ()=>{

						let preloaderContainer = document.getElementById('preloader');
						if(preloaderContainer){
							preloaderContainer.classList.add('hidden')
							setTimeout(()=>{
								preloaderContainer.parentNode.removeChild(preloaderContainer);	
								document.body.classList.add('_intro');
								_t.Follow.show()
							}, 2300)
						}

						setTimeout( ()=>{

							let times = 0;
							for(let cluster in _t.Multiverse.clusters){
								if( cluster !== 'home'){
									times += 1;
									setTimeout(()=>{
										_t.Multiverse.clusters[cluster].reduce();
									}, 300 * times)
								}
							}

							setTimeout( ()=>{
								if(window.location.href.indexOf('home') < 0){
									_t.Interaction.checkURL(window.location.href);	
								}
							}, 280 * times + 300)

						}, 2000);

					});

				}, wglReady);
 			});
		});

	}

	loadContent(wglReady){

		const _t = this;

		_t.sections = {}

		for(_t.tmpSection in appData){
			_t.sections[_t.tmpSection] = appData[_t.tmpSection];
		}
		
		Materials(_t, ()=>{
			Content(_t, ()=>{
				PostProcessing(_t, ()=>{							
					Interaction(_t, ()=>{

						_t.Render.rendering();
						_t.Screen.enableControls();
						
						if(wglReady) wglReady(_t);

					})
				})
			})
		})
	}

	initScreen(callback){

		const _t = this;

		_t.Screen.renderer = new WebGLRenderer({
			powerPreference: "high-performance",
			antialias: false,
			stencil: false,
			depth: false,
			preserveDrawingBuffer: true
		});

		
		_t.Screen.renderer.setSize( _t.Screen.width, _t.Screen.height );
		_t.Screen.renderer.toneMapping = ReinhardToneMapping; // ReinhardToneMapping;
		_t.Screen.renderer.toneMappingExposure = 2.5;
		_t.Screen.renderer.shadowMap.enabled = false;

		_t.Screen.controls = new CameraControls( _t.Elements.camera, _t.Screen.renderer.domElement );
		_t.Screen.controls.setPosition(_t.params.init_position.x,_t.params.init_position.y,_t.params.init_position.z);
		_t.Screen.controls.setTarget(_t.params.init_target.x,_t.params.init_target.y,_t.params.init_target.z);
		_t.Screen.controls.zoomTo(_t.params.init_zoom, false);
		_t.Screen.controls.minZoom = 0.7;
		_t.Screen.controls.maxZoom = 1.8;
		_t.Screen.controls.azimuthRotateSpeed = 1;
		_t.Screen.controls.polarRotateSpeed = 1;

		_t.Screen.controls.mouseButtons.left = CameraControls.ACTION.NONE;
		_t.Screen.controls.mouseButtons.right = CameraControls.ACTION.NONE;
		_t.Screen.controls.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
		_t.Screen.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
		_t.Screen.controls.mouseButtons.middle = CameraControls.ACTION.NONE;
		_t.Screen.controls.touches.one = CameraControls.ACTION.NONE;
		_t.Screen.controls.touches.two = CameraControls.ACTION.NONE;
		_t.Screen.controls.touches.three = CameraControls.ACTION.NONE;

		_t.Screen.focusDistance = _t.Screen.controls.getPosition().distanceTo(_t.Screen.controls.getTarget());
		_t.Screen.focusBlur = 0;

		_t.Screen.resize = {
			windowResize: ()=>{
				_t.Screen.width  = window.innerWidth;
				_t.Screen.height = window.innerHeight;
				_t.Screen.renderer.setSize( _t.Screen.width, _t.Screen.height );
				_t.Elements.camera.aspect = _t.Screen.width / _t.Screen.height;
				_t.Elements.camera.updateProjectionMatrix();
				_t.Elements.camera.updateMatrix();
			}
		}

		window.addEventListener( 'resize', ()=>{
			for (_t.Screen.resizeScript in _t.Screen.resize) {
				_t.Screen.resize[_t.Screen.resizeScript]();
			}
		});

		_t.params.parent.appendChild( _t.Screen.renderer.domElement );

		//////////////////////// GPU CHECK //////////////////////// 

		_t.params.gpu({glContext: _t.Screen.renderer.getContext() }).then((g)=>{
			_t.Screen.client = g;
			if(callback)callback();
		})
		
		_t.Screen.client_update = ()=>{
			_t.params.gpu({glContext: _t.Screen.renderer.getContext() }).then((g)=>{
				_t.Screen.client = g;
			})
		}

		_t.Screen.disableControls = ()=>{

			_t.Screen.controls.mouseButtons.left = CameraControls.ACTION.NONE;
			_t.Screen.controls.mouseButtons.right = CameraControls.ACTION.NONE;
			_t.Screen.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
			_t.Screen.controls.touches.one = CameraControls.ACTION.NONE;
			_t.Screen.controls.touches.two = CameraControls.ACTION.NONE;
			_t.Screen.controls.maxDistance = Infinity;
		}
		_t.Screen.enableControls = ()=>{

			_t.Screen.controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
			_t.Screen.controls.mouseButtons.right = CameraControls.ACTION.NONE;
			_t.Screen.controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
			_t.Screen.controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
			_t.Screen.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_ROTATE;
			_t.Screen.controls.maxDistance = 800;
		}
		_t.Screen.changeControls = (type)=>{

			if(type === 'drag'){
				_t.Screen.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
				_t.Screen.controls.mouseButtons.right = CameraControls.ACTION.NONE;
				_t.Screen.controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
				_t.Screen.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
				_t.Screen.controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
				_t.Screen.controls.maxDistance = 800;

			} else {
				_t.Screen.controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
				_t.Screen.controls.mouseButtons.right = CameraControls.ACTION.NONE;
				_t.Screen.controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
				_t.Screen.controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
				_t.Screen.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_ROTATE;
				_t.Screen.controls.maxDistance = 800;
			}
			
		}

		//////////////////////// GPU CHECK //////////////////////// 
	}
	initLoaders(callback, wglReady){

		const _t = this;

		_t.Loaders.loaded = 0;
		
		_t.internal = ['home', 'menu', 'about','events','contact','access'];

		_t.Loaders.totalElements = 34;
		for(let galaxy in appData){
			if(_t.internal.indexOf(galaxy) < 0){
				if(appData[galaxy].exhibitions && appData[galaxy].exhibitions.length > 0){
					_t.Loaders.totalElements += appData[galaxy].exhibitions.length * 3;
				}
			} 
		}

		_t.Loaders.totalUpdate = (type, end)=>{

		};
		
		_t.Loaders.loadManager = new LoadingManager();
		_t.Loaders.texLoader = new TextureLoader(_t.Loaders.loadManager);
		_t.Loaders.fbxLoader = new FBXLoader(_t.Loaders.loadManager);

		_t.Loaders.loadManager.onStart = ( url, itemsLoaded, itemsTotal )=>{
			_t.Loaders.timer = (Math.round(+new Date()/100)/6);
		}

		_t.Loaders.loadManager.onLoad = ()=>{
			if(_t.Loaders.tmt){
				clearTimeout(_t.Loaders.tmt);
			}
			_t.Loaders.tmt = setTimeout(()=>{
				console.log( 'Loading complete in: '+(Math.round(_t.Loaders.timer*60)/60)+' seconds');

				if(_t.Loaders.loaded < _t.Loaders.totalElements){
					console.warn("///// Elements Missing: "+(_t.Loaders.totalElements - _t.Loaders.loaded), _t.Loaders.loaded)
				}

			}, 5000)
		}

		_t.Loaders.loadManager.onProgress = ( url, itemsLoaded, itemsTotal )=>{

		}

		_t.Loaders.loadManager.onError = ( url )=>{

		}

		_t.Loaders.loadCheck = ()=>{
			window.loaded = Math.round(_t.Loaders.loaded / _t.Loaders.totalElements * 100);
			window.dispatchEvent( new CustomEvent('scene_loading', { detail: window.loaded }) );
			if(_t.Loaders.loaded > _t.Loaders.totalElements){
				console.warn("///// Elements Added: "+(_t.Loaders.loaded - _t.Loaders.totalElements), _t.Loaders.loaded)
			}

			if(window.loaded >= 100 && !window.isLoaded){
				
				window.isLoaded = true;
				window.dispatchEvent( new Event('scene_loaded') );
				_t.Loaders.timer = (Math.round(+new Date()/100)/6) - _t.Loaders.timer;
				if(wglReady) wglReady(_t)
			}
		}
		
		_t.Loaders.add = (cnt)=>{
			if(cnt){
				_t.Loaders.loaded += cnt;
			} else {
				_t.Loaders.loaded += 1;	
			}
			_t.Loaders.loadCheck();
		}

		if(callback) callback()

		
	}
	initRender(callback){
		const _t = this;
		const _r = _t.Render;
		_t.Render.passes = {};
		_r.clock = new Clock();

		_r.rendering = (time)=>{
			
			_r.delta = _r.clock.getDelta();
			_t.Screen.controls.update( _r.delta );

			if ( _t.Interaction && _t.Interaction.switches.autoRotate ) {
				_t.Screen.controls.azimuthAngle += 2 * _r.delta * MathUtils.DEG2RAD;
			}

			for (_r.anim in _t.Motion.animations) {
				_t.Motion.animations[_r.anim](time)
			}
			for (_r.pass in _t.Render.passes) {
				_t.Render.passes[_r.pass](time)
			}

			requestAnimationFrame( _r.rendering ); 
		}

		if(callback) callback();
	}
	
}

window.wgl = new WGL({
	gpu: getGPUTier,
	parent: document.getElementById("webgl"),
	init_position: new Vector3(parseFloat(appData.home['3d'].coordinates.x), parseFloat(appData.home['3d'].coordinates.y), parseFloat(appData.home['3d'].coordinates.z)),
	init_target: new Vector3(parseFloat(appData.home['3d'].position.x), parseFloat(appData.home['3d'].position.y), parseFloat(appData.home['3d'].position.z))
}, (_t)=>{
	console.log('Website ready...');
})

export { WGL }

