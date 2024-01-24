import { 
	Sprite,
	Plane, 
	Color,
	Group, 
	SpotLight,
	Matrix3,
	Matrix4, 
	SphereGeometry,
	Mesh, 
	PlaneGeometry, 
	HemisphereLight, 
	AdditiveBlending, 
	Vector3, 
	MeshPhongMaterial,
	InstancedMesh, 
	Quaternion,
	Object3D,
	DynamicDrawUsage,
	Euler,
	DoubleSide
} from 'three';

import { Multiverse } from './mod.multiverse'

const Lights = (_t)=>{

	_t.Elements.hemiLight = new HemisphereLight(_t.params.lightColor1,_t.params.lightColor2, 1);
	_t.Elements.scene.add(_t.Elements.hemiLight);

	_t.Elements.spotLightX = new SpotLight(0x00ffc2, 1.0)
	_t.Elements.spotLightX.castShadow = false;
	_t.Elements.spotLightX.shadow.bias = -0.01;
	_t.Elements.spotLightX.shadow.radius = 50;
	_t.Elements.spotLightX.shadow.camera.fov = 30;
	_t.Elements.spotLightX.shadow.mapSize.width = 256;
	_t.Elements.spotLightX.shadow.mapSize.height = 256;
	_t.Elements.spotLightX.position.set(0, 125, -180);

	_t.Elements.spotLightX.distance = 580;
	_t.Elements.spotLightX.angle = Math.PI;
	_t.Elements.spotLightX.penumbra = 0.1;
	_t.Elements.spotLightX.decay = 5;

	_t.Elements.scene.add(_t.Elements.spotLightX)

	_t.Elements.spotLightY = new SpotLight(0xffffff, 1)
	_t.Elements.spotLightY.castShadow = false;
	_t.Elements.spotLightY.shadow.bias = -0.01;
	_t.Elements.spotLightY.shadow.radius = 50;
	_t.Elements.spotLightY.shadow.camera.fov = 30;
	_t.Elements.spotLightY.shadow.mapSize.width = 256;
	_t.Elements.spotLightY.shadow.mapSize.height = 256;
	_t.Elements.spotLightY.position.set(_t.Elements.camera.position.x, _t.Elements.camera.position.y, _t.Elements.camera.position.z * 2);

	_t.Elements.spotLightY.distance = 300 
	_t.Elements.spotLightY.decay = 2 

	_t.Elements.scene.add(_t.Elements.spotLightY)

	_t.Elements.spotLightZ = new SpotLight(0xffffff, 0.06)
	_t.Elements.spotLightZ.castShadow = false;
	_t.Elements.spotLightZ.shadow.bias = -0.01;
	_t.Elements.spotLightZ.shadow.radius = 50;
	_t.Elements.spotLightZ.shadow.camera.fov = 30;
	_t.Elements.spotLightZ.shadow.mapSize.width = 256;
	_t.Elements.spotLightZ.shadow.mapSize.height = 256;
	_t.Elements.spotLightZ.position.set(0, 5, -5);

	_t.Elements.spotLightZ.distance = 145 
	_t.Elements.spotLightZ.decay = 5 

	_t.Elements.scene.add(_t.Elements.spotLightZ);

	_t.Elements.spotLight = [];

	for (let p in [0,1,2]) {

		_t.Elements.spotLight[p] = new SpotLight(0x00ffc2, 0.4)
		_t.Elements.spotLight[p].castShadow = false;
		_t.Elements.spotLight[p].shadow.bias = -0.001;
		_t.Elements.spotLight[p].shadow.mapSize.width = 256;
		_t.Elements.spotLight[p].shadow.mapSize.height = 256;
		_t.Elements.spotLight[p].shadow.radius = 50;
		_t.Elements.spotLight[p].shadow.camera.fov = 30;
		_t.Elements.spotLight[p].lookAt(0,0,0);

		_t.Elements.spotLight[p].distance = 1500 
		_t.Elements.spotLight[p].angle = Math.PI 
		_t.Elements.spotLight[p].penumbra = 0.1  
		_t.Elements.spotLight[p].decay = 5 

		_t.Elements.scene.add(_t.Elements.spotLight[p]);

	}

	_t.Elements.spotLight[0].position.set(-135,65,-270);
	_t.Elements.spotLight[1].position.set(135,65,-270);
	_t.Elements.spotLight[2].position.set(0,65,-325);
}

const Content = (_t, callback)=>{
	
	Lights(_t);

	_t.Elements.orbitting = {};

	_t.Loaders.fbxLoader.load( _t.params.assets + _t.params.geometry, (_object)=>{
		
		_object.traverse((_m)=>{

			if(_m.type === "Mesh"){

				switch(_m.name){
					case "vortex":
						_m.material = new MeshPhongMaterial();
						_m.geometry.computeBoundingBox();
						_m.material = _t.Assets.materials.debry;
					break;
					case "confetti1":
						_m.material.emissiveIntensity = 0.6;
						_m.material.emissive = new Color(0xff029c);
						_m.material.color = new Color(0xff029c);
						_m.material.wireframe = true;
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "confetti2":
						_m.material.wireframe = true;
						_m.material.emissiveIntensity = 0.6;
						_m.material.color = new Color(0xff05ff);
						_m.material.emissive = new Color(0xff05ff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "confetti3":
						_m.material.wireframe = true;
						_m.material.emissiveIntensity = 0.6;
						_m.material.color = new Color(0xD000D0);
						_m.material.emissive = new Color(0xD000D0);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "confetti4":
						_m.material = new MeshPhongMaterial();
						_m.material.wireframe = true;
						_m.material.emissiveIntensity = 0.6;
						_m.material.color = new Color(0x00d2ff);
						_m.material.emissive = new Color(0x00d2ff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "confetti5":
						_m.material.wireframe = true;
						_m.material.emissiveIntensity = 0.6;
						_m.material.color = new Color(0x00ffbe);
						_m.material.emissive = new Color(0x00ffbe);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "confetti6":
						_m.material.wireframe = true;
						_m.material.emissiveIntensity = 0.6;
						_m.material.color = new Color(0x0057ff);
						_m.material.emissive = new Color(0x0057ff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;

					
					case "wheel":
						_m.material = new MeshPhongMaterial();
						_m.material.emissiveMap =_m.material.map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/wheel.png', _m.addTexture);
						_m.material.emissiveIntensity = 0.3;
						_m.material.emissive = new Color(0xD000D0);
						_m.material.color = new Color(0xffffff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(40,40,40);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "lamp":
						_m.material.emissiveMap =_m.material.map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/lamp.png', _m.addTexture);
						_m.material.emissiveIntensity = 0.3;
						_m.material.emissive = new Color(0xff029c);
						_m.material.color = new Color(0xffffff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "tori":
						_m.material = new MeshPhongMaterial();
						_m.material.emissiveMap =_m.material.map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/tori.png', _m.addTexture);
						_m.material.emissiveIntensity = 0.3;
						_m.material.emissive = new Color(0xff029c);
						_m.material.color = new Color(0xffffff);
						_m.material.side = DoubleSide;
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "sneaker":
						_m.material.emissiveMap =_m.material.map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/sneaker.png', _m.addTexture);
						_m.material.emissiveIntensity = 0.3;
						_m.material.emissive = new Color(0x00ffe9);
						_m.material.color = new Color(0xffffff);
						_m.material.side = DoubleSide;
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "cube":
						_m.material.emissiveMap =_m.material.map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/cube.png', _m.addTexture);
						_m.material.side = DoubleSide;
						_m.material.emissiveIntensity = 0.3;
						_m.material.emissive = new Color(0x00ffc3);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "icecream":
						_m.material[0].emissiveIntensity = _m.material[1].emissiveIntensity = _m.material[2].emissiveIntensity = 0.3;
						_m.material[0].emissive = _m.material[1].emissive = _m.material[2].emissive = new Color(0xD000D0);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "origami":
						_m.material.emissive = _m.material.color;
						_m.material.emissiveIntensity = 0.3;
						_m.material.side = DoubleSide;
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(40,40,40);
						_t.Elements.orbitting[_m.name] = _m;
					break;
					case "statue":
						_m.material.emissive = new Color(0xff029c);
						_m.material.color = new Color(0xffffff);
						_m.material.emissiveIntensity = 0.3;
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(30,30,30);
						_t.Elements.orbitting[_m.name] = _m;
					break;


					case "mushroom_big":
						_m.material[0].emissiveMap =_m.material[0].map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/mushroom_red.png', _m.addTexture);
						_m.material[0].emissiveIntensity = 0.1;
						_m.material[0].color = new Color(0xffffff);
						_m.material[0].emissive = new Color(0xff008a);
						_m.material[1].emissiveMap =_m.material[1].map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/helmet.png', _m.addTexture);
						_m.material[1].emissiveIntensity = 0.1;
						_m.material[1].color = new Color(0xffffff);
						_m.material[1].emissive = new Color(0xffffff);
						_m.material[2].emissiveMap =_m.material[2].map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/monkey.png', _m.addTexture);
						_m.material[2].emissiveIntensity = 0.1;
						_m.material[2].color = new Color(0xffffff);
						_m.material[2].emissive = new Color(0xc98859);
						_m.material[3].emissiveMap =_m.material[3].map = _t.Loaders.texLoader.load( _t.params.assets+'textures/elements/mushroom_blue.png', _m.addTexture);
						_m.material[3].emissiveIntensity = 0.1;
						_m.material[3].color = new Color(0xffffff);
						_m.material[3].emissive = new Color(0x00d2ff);
						_m.position.set(500 + Math.random() * 500, 500 + Math.random() * 500,0);
						_m.scale.set(40,40,40);
						_t.Elements.orbitting[_m.name] = _m;
					break;
				}
				_t.Loaders.add()

			} else if((_m.type === "Group" || _m.type === "Object3D") && _m.name === "monkey"){

			}

		})

		_t.Loaders.add()

		Multiverse(_t, (_m)=>{
			for(let section in _t.sections){
				if(_t.sections[section]['3d'] && _t.sections[section]['3d'].render){
					_m.createCluster(_t.sections[section]);
				}
			}
			_t.Elements.dust = _m.createDust([new Color(0x0)]);
			if(callback) callback();
		});
		
	});
		
}



export { Content }