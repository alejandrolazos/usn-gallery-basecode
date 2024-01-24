import { 
	Vector3, 
	Object3D, 
	Mesh, 
	PlaneGeometry, 
	SphereGeometry, 
	IcosahedronGeometry,
	ShaderMaterial, 
	CubicBezierCurve3,
	Points, 
	PointsMaterial,
	BufferGeometry,
	BufferAttribute, 
	MeshPhongMaterial, 
	DoubleSide,
	BackSide, 
	MixOperation,
	AddOperation, 
	AdditiveBlending, 
	RepeatWrapping, 
	MeshLambertMaterial,
	Color,
	PointLight,
	Group,
	Sprite,
	Matrix4, 
	InstancedMesh, 
	Quaternion,
	DynamicDrawUsage,
	Euler,
	MeshStandardMaterial,
	Math as _Math
} from 'three';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import { TrailRenderer } from './mod.trails'
import { Particles } from './mod.particles';

const randomizeMatrix = function( matrix, distance, min, _scale ) {

	const position = new Vector3();
	const rotation = new Euler();
	const quaternion = new Quaternion();
	const scale = new Vector3();

	position.x = (Math.random() * distance) - (distance/2);
	position.y = (Math.random() * distance) - (distance/2);
	position.z = (Math.random() * distance) - (distance/2);

	let _distance = position.x + position.y + position.z;

	if(_distance < 0 && _distance > -min){
		position.add(-min)
	} else if(_distance > 0 && _distance < min){
		position.add(min)
	}

	rotation.x = Math.random() * 2 * Math.PI;
	rotation.y = Math.random() * 2 * Math.PI;
	rotation.z = Math.random() * 2 * Math.PI;

	quaternion.setFromEuler( rotation );

	scale.x = scale.y = scale.z = Math.random() * _scale;

	matrix.compose( position, quaternion, scale );

	return matrix;
}

const createRandomInstancedMesh = (trash_count, cluster, obj, scale, distance, min, objScale)=>{

	let instancedTrash = new InstancedMesh( obj.geometry.clone(), obj.material.clone(), trash_count );

	instancedTrash.frustumCulled = false;
	instancedTrash.scale.set(scale,scale,scale);

	let matrix = new Matrix4();

	for (let i = 0; i < trash_count; i++) {
		matrix = randomizeMatrix(matrix, distance, min, objScale);
		matrix.needsUpdate = true;
	    instancedTrash.setMatrixAt(i, matrix);
	}

	instancedTrash.needsUpdate = true;

	if(cluster.orbitsParent){
		cluster.orbitsParent.add(instancedTrash);	
	} else {
		cluster.area.add(instancedTrash);	
	}
	
	return instancedTrash;
}

function getPoint() {
    let u = Math.random();
    let v = Math.random();
    let theta = u * 2.0 * Math.PI;
    let phi = Math.acos(2.0 * v - 1.0);
    let r = Math.cbrt(Math.random());
    let sinTheta = Math.sin(theta);
    let cosTheta = Math.cos(theta);
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);
    let x = r * sinPhi * cosTheta;
    let y = r * sinPhi * sinTheta;
    let z = r * cosPhi;
    return {x: x, y: y, z: z};
}


const Multiverse = (_t, callback)=>{

	const _m = _t.Multiverse = {}

	Particles(_t);

	_m.clusters = {};
	_m.geometries = {
		poster: new PlaneGeometry(2, 2, 1, 1),
		posterHD: new IcosahedronGeometry(900, 18/2),
		complexSphere: new IcosahedronGeometry(1000, 36/2),
		simpleSphere: new IcosahedronGeometry(1, 6),
	}

	_t.Elements.darker_geo = new SphereGeometry(120, 36, 18);
	_t.Elements.darker_mesh = new Mesh(_t.Elements.darker_geo, _t.Assets.materials.darker);
	_t.Elements.darker_mesh.renderOrder = 1000000;
	_t.Elements.darker_mesh.position.z = 0;
	_t.Elements.darker_mesh.rotation.y = Math.PI;
	_t.Elements.camera.add(_t.Elements.darker_mesh);

	_t.Motion.animations.floatingObjs = (time)=>{
		for (_m.tmp in _m.clusters) {
			if(!_m.clusters[_m.tmp].originalPosition){
				_m.clusters[_m.tmp].originalPosition = _m.clusters[_m.tmp].area.position.clone()
				_m.clusters[_m.tmp].animSeed = -1 + (Math.random()*2);
				_m.clusters[_m.tmp].moveDistance = 1;
			}

			if(typeof _m.clusters[_m.tmp].moveDistance === 'undefined'){
				_m.clusters[_m.tmp].area.position.y = _m.clusters[_m.tmp].originalPosition.y + Math.cos( (time/1000)*_m.clusters[_m.tmp].animSeed ) * 100;
				if(_m.clusters[_m.tmp].gas) _m.clusters[_m.tmp].gas.rotation.y += (Math.PI/10000)*_m.clusters[_m.tmp].animSeed;
				if(_m.clusters[_m.tmp].stars) _m.clusters[_m.tmp].stars.mesh.rotation.y += (Math.PI/10000)*_m.clusters[_m.tmp].animSeed;
			} else {
				_m.clusters[_m.tmp].area.position.y = _m.clusters[_m.tmp].originalPosition.y + Math.cos( (time/1000)*_m.clusters[_m.tmp].animSeed ) * 100 * _m.clusters[_m.tmp].moveDistance;
				if(_m.clusters[_m.tmp].gas) _m.clusters[_m.tmp].gas.rotation.y += (Math.PI/10000)*_m.clusters[_m.tmp].animSeed * _m.clusters[_m.tmp].moveDistance;
				if(_m.clusters[_m.tmp].stars) _m.clusters[_m.tmp].stars.mesh.rotation.y += (Math.PI/10000)*_m.clusters[_m.tmp].animSeed * _m.clusters[_m.tmp].moveDistance;
			}
		}
	}

	_m.createCluster = (section)=>{

		let cluster;

		if(section.path && !_m.clusters[section.path]){

			let obj = section['3d'];

			cluster = _m.clusters[section.path] = {};
			cluster.section = section;
			cluster.area = new Object3D();

			if(obj.colors && obj.colors[0]){ obj.colors[0] = new Color(obj.colors[0]) }
			if(obj.colors && obj.colors[1]){ obj.colors[1] = new Color(obj.colors[1]) }

			if(section.path === "home"){

				cluster.area.position.set(0, 0, 0);
				cluster.area.scale.set(0.1,0.1,0.1);
				_t.Elements.scene.add(cluster.area);	

				cluster.originalPosition = cluster.area.position.clone()
				cluster.animSeed = -1 + (Math.random()*2);
				cluster.moveDistance = 1;

				_t.Follow.objects[section.path] = cluster.area;
				_t.Follow.html[section.path] = document.createElement('div');
				_t.Follow.html[section.path].classList.add('follower');
				_t.Follow.html[section.path].id = section.path;


			} else {

				if(obj.colors){
					cluster.light = new PointLight(0xffffff, 0.0)
				} else {
					cluster.light = new PointLight(0xffffff, 0.0)
				}
				cluster.light.distance = 20000;
				cluster.light.decay = 5;

				cluster.area.add(cluster.light);

				obj.coordinates.x = Number(obj.coordinates.x);
				obj.coordinates.y = Number(obj.coordinates.y);
				obj.coordinates.z = Number(obj.coordinates.z);
				obj.position.x = Number(obj.position.x);
				obj.position.y = Number(obj.position.y);
				obj.position.z = Number(obj.position.z);

				cluster.area.position.x = obj.coordinates.x;
				cluster.area.position.y = obj.coordinates.y;
				cluster.area.position.z = obj.coordinates.z;
				cluster.area.scale.set(0.1,0.1,0.1);
				_t.Elements.scene.add(cluster.area);

				cluster.originalPosition = cluster.area.position.clone()
				cluster.animSeed = -1 + (Math.random()*2);
				cluster.moveDistance = 1;

				_t.Follow.objects[section.path] = cluster.area;
				_t.Follow.html[section.path] = document.createElement('div');
				_t.Follow.html[section.path].classList.add('follower');
				_t.Follow.html[section.path].id = section.path;

				section.pointer = "<div class='follower_content'>";

				if(!section.titleArray){
					section.titleArray = section.title.split("#");	
				}

				if(section.exhibitions.length > 0){
					
					if(section.titleArray.length > 2){
						section.pointer += `<a class="link"  href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: '`+section.path+`'}) ); event.preventDefault(); return false;">`;
							section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
						section.pointer += `</a>`;
					} else if(section.titleArray.length > 1){
						section.pointer += `<a class="link"  href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: '`+section.path+`'}) ); event.preventDefault(); return false;">`;
							section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
						section.pointer += `</a>`;
					} else {
						section.pointer += `<a class="link" href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: '`+section.path+`'}) ); event.preventDefault(); return false;">`;
							section.pointer += `<h2>`+section.title+`</h2><span>`+localContent.menu.gallery+`</span>`;
						section.pointer += `</a>`;
					}

				} else {
					if(section.path === 'external'){
						if(section.titleArray.length > 2){
							section.pointer += `<a class="link" href="`+section.titleArray[2]+`" target="_blank">`;
								section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
							section.pointer += `</a>`;
						} else if(section.titleArray.length > 1){
							section.pointer += `<a class="link" href="javascript:;" onclick="event.preventDefault(); return false;">`;
								section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
							section.pointer += `</a>`;
						} else {
							if( section.title.toLowerCase() === "online store"){
								section.pointer += `<a class="link" href="https://shop.ultrasupernew.com/" target="_blank">`;
									section.pointer += `<h2>`+section.title+`</h2><span>Shop</span>`;
								section.pointer += `</a>`;	
							} else {
								section.pointer += `<a class="link" href="javascript:;" onclick="event.preventDefault(); return false;">`;
									section.pointer += `<h2>`+section.title+`</h2><span>Coming soon!</span>`;
								section.pointer += `</a>`;
							}
							
						}
					} else {
						if(section.titleArray.length > 2){
							section.pointer += `<a class="link" href="`+section.titleArray[2]+`" target="_blank">`;
								section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
							section.pointer += `</a>`;
						} else if(section.titleArray.length > 1){
							section.pointer += `<a class="link" href="`+section.path+`" target="_blank">`;
								section.pointer += `<h2>`+section.titleArray[0]+`</h2><span>`+section.titleArray[1]+`</span>`;
							section.pointer += `</a>`;
						} else {
							section.pointer += `<a class="link" href="javascript:;" onclick="event.preventDefault(); return false;">`;
								section.pointer += `<h2>`+section.title+`</h2><span>Coming soon!</span>`;
							section.pointer += `</a>`;
						}
					}
				}

				section.pointer += `</div>`;

				_t.Follow.html[section.path].innerHTML = section.pointer;
				
				_t.params.htmlObjects.appendChild(_t.Follow.html[section.path]);

				if(obj.stars === true){

					section.stars =	_m.createStars(cluster, section);
 
					cluster.particles = _t.Particles.createParticles({
						position: { x: 0,  y: 0, z: 0 }, 
						scale: 200, 
						size: { x: 20 + (Math.random()*20),  y: 20 + (Math.random()*20), z: 20 + (Math.random()*20) }, 
						tex: _t.Assets.textures.particles[0], 
						emitters: 60, 
						maxParticles: 12000, 
						colors: !obj.colors ? false : obj.colors,
						parent: cluster.area,
						particleCount: 200
					});	

				}

				if(obj.gas === true){
					section.gas = _m.createGas(cluster, section)
				}

				if(obj.orbitting){
					section.orbitting = _m.createOrbittingObjects(cluster, section, obj)				
				}

				if(section.exhibitions){
					_m.createExhibitions(cluster, section);
				}

			}

			cluster.show = (done)=>{
				
				if(cluster.particles){
					for(let crPaEm in cluster.particles.emitters){
						cluster.particles.emitters[crPaEm].enable();
					}
				}

				if(!cluster.fromTw) cluster.fromTw = {};
				if(!cluster.toTw) cluster.toTw = {};

				cluster.fromTw.moveDistance = _m.clusters[section.path].moveDistance;
				cluster.toTw.moveDistance = 0;

				if(cluster.stars){
					cluster.fromTw.stars = _t.Assets.materials.pointStar.size;
					cluster.toTw.stars = 0;
				}

				if(cluster.gas && section.path !== 'home'){
					cluster.fromTw.gas = cluster.gas.scale.x;
					cluster.toTw.gas = obj.radius/10;
				}


				if(cluster.orbitsParent){
					if(cluster.orbitsParent.twShow){
						_t.Motion.AUTO.remove(cluster.orbitsParent.twShow);
					}

					cluster.orbitsParent.twShow = new _t.TWEEN.Tween( cluster.orbitsParent.scale,  _t.Motion.AUTO )
					    .to( { x: 1, y: 1, z: 1 }, 600 )
					    .easing( _t.TWEEN.Easing.Exponential.InOut )
					    .start();
				}

				if(cluster.twInt){
					_t.Motion.AUTO.remove(cluster.twInt);
				}

				cluster.twInt = new _t.TWEEN.Tween( cluster.fromTw,  _t.Motion.AUTO )
					.to( cluster.toTw, 800 ).onUpdate((v)=>{
						if(cluster.stars){
							_t.Assets.materials.pointStar.size = v.stars;
							_t.Assets.materials.pointStar.opacity = v.stars/3;
							cluster.stars.mesh.scale.set(v.stars/1.5, v.stars/1.5, v.stars/1.5);
						}
						if(cluster.gas && section.path !== 'home') cluster.gas.scale.set(v.gas, v.gas, v.gas);
						_m.clusters[section.path].moveDistance = v.moveDistance;
					})
					.easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete(()=>{
						if(cluster.transform) cluster.transform( cluster.targets.sphere, 600, cluster.isActive );
						if(done) done();
					})
					.start();
				
			}

			cluster.reduce = (done, duration)=>{

				if(cluster.particles){
					for(let crPaEm in cluster.particles.emitters){
						cluster.particles.emitters[crPaEm].enable();
					}
				}

				if(!cluster.fromTw) cluster.fromTw = {};
				if(!cluster.toTw) cluster.toTw = {};

				cluster.fromTw.moveDistance = _m.clusters[section.path].moveDistance;
				cluster.toTw.moveDistance = 1;

				if(cluster.stars){
					cluster.fromTw.stars = _t.Assets.materials.pointStar.size;
					cluster.toTw.stars = 3;
				}

				if(cluster.gas && section.path !== 'home'){
					cluster.fromTw.gas = cluster.gas.scale.x;
					cluster.toTw.gas = obj.radius/60;
				}

				if(cluster.orbitsParent){

					if(cluster.orbitsParent.twShow){
						_t.Motion.AUTO.remove(cluster.orbitsParent.twShow);
					}

					cluster.orbitsParent.twShow = new _t.TWEEN.Tween( cluster.orbitsParent.scale,  _t.Motion.AUTO )
					    .to( { x: 1, y: 1, z: 1 }, 800 )
					    .easing( _t.TWEEN.Easing.Exponential.InOut )
					    .start();
				}

				if(cluster.twInt){
					_t.Motion.AUTO.remove(cluster.twInt);
				}

				cluster.twInt = new _t.TWEEN.Tween( cluster.fromTw,  _t.Motion.AUTO ).to( cluster.toTw, 600 ).onUpdate((v)=>{
						if(cluster.stars){
							_t.Assets.materials.pointStar.size = v.stars;
							_t.Assets.materials.pointStar.opacity = v.stars/3;
							cluster.stars.mesh.scale.set(v.stars/1.5, v.stars/1.5, v.stars/1.5);
						}
						if(cluster.gas && section.path !== 'home') cluster.gas.scale.set(v.gas, v.gas, v.gas);
						_m.clusters[section.path].moveDistance = v.moveDistance;
					})
					.easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete(()=>{
						if(cluster.objects){
							if(!duration){ duration = 600; }
							for ( let i = 0; i < cluster.objects.length; i ++ ) {

							    let object = cluster.objects[ i ];

							    if(object.tw){
							    	_t.Motion.AUTO.remove(object.tw);
							    }

							    if(object.tw1){
							    	_t.Motion.AUTO.remove(object.tw1);
							    }
							    if(object.tw2){
							    	_t.Motion.AUTO.remove(object.tw2);
							    }
							    object.tw1 = new _t.TWEEN.Tween( object.position,  _t.Motion.AUTO )
							        .to( { x: 0, y: 0, z: 0 }, Math.random() * duration + duration )
							        .easing( _t.TWEEN.Easing.Exponential.InOut )
							        .start();

							    object.tw2 = new _t.TWEEN.Tween( object.scale,  _t.Motion.AUTO )
							        .to( { x: 0, y: 0, z: 0 }, Math.random() * duration + duration )
							        .easing( _t.TWEEN.Easing.Exponential.InOut )
							        .start();
							}
						}
						if(done) done();
					}).start();			
			}

			cluster.hide = (done, duration)=>{

				if(cluster.particles){
					for(let crPaEm in cluster.particles.emitters){
						cluster.particles.emitters[crPaEm].disable();
					}
				}

				if(!cluster.fromTw) cluster.fromTw = {};
				if(!cluster.toTw) cluster.toTw = {};

				cluster.fromTw.moveDistance = _m.clusters[section.path].moveDistance;
				cluster.toTw.moveDistance = 0;

				if(cluster.stars){
					cluster.fromTw.stars = _t.Assets.materials.pointStar.size;
					cluster.toTw.stars = 0;
				}

				if(cluster.gas && section.path !== 'home'){
					cluster.fromTw.gas = cluster.gas.scale.x;
					cluster.toTw.gas = 0;
				}

				if(cluster.orbitsParent){
					if(cluster.orbitsParent.twShow){
						_t.Motion.AUTO.remove(cluster.orbitsParent.twShow);
					}

					cluster.orbitsParent.twShow = new _t.TWEEN.Tween( cluster.orbitsParent.scale,  _t.Motion.AUTO )
					    .to( { x: 0, y: 0, z: 0 }, 600 )
					    .easing( _t.TWEEN.Easing.Exponential.InOut )
					    .start();
				}

				if(cluster.twInt){
					_t.Motion.AUTO.remove(cluster.twInt);
				}

				cluster.twInt = new _t.TWEEN.Tween( cluster.fromTw,  _t.Motion.AUTO )
					.to( cluster.toTw, 600 ).onUpdate((v)=>{
						if(cluster.stars){
							_t.Assets.materials.pointStar.size = v.stars;
							_t.Assets.materials.pointStar.opacity = v.stars/3;
							cluster.stars.mesh.scale.set(v.stars/1.5, v.stars/1.5, v.stars/1.5);
						}
						if(cluster.gas && section.path !== 'home') cluster.gas.scale.set(v.gas, v.gas, v.gas);
						_m.clusters[section.path].moveDistance = v.moveDistance;
					})
					.easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete(()=>{
						
						if(cluster.objects){
							if(!duration){
								duration = 1200;
							}

							for ( let i = 0; i < cluster.objects.length; i ++ ) {

							    let object = cluster.objects[ i ];

							    if(object.tw){
							    	_t.Motion.AUTO.remove(object.tw);
							    }

							    if(object.tw1){
							    	_t.Motion.AUTO.remove(object.tw1);
							    }
							    if(object.tw2){
							    	_t.Motion.AUTO.remove(object.tw2);
							    }
							    
							    object.tw1 = new _t.TWEEN.Tween( object.position,  _t.Motion.AUTO )
							        .to( { x: 0, y: 0, z: 0 }, Math.random() * duration + duration )
							        .easing( _t.TWEEN.Easing.Exponential.InOut )
							        .start();

							    object.tw2 = new _t.TWEEN.Tween( object.scale,  _t.Motion.AUTO )
							        .to( { x: 0, y: 0, z: 0 }, Math.random() * duration + duration )
							        .easing( _t.TWEEN.Easing.Exponential.InOut )
							        .start();

							}
						}

						if(done) done();
					})
					.start();

			}

		}
		
		cluster.hide();

		return cluster;

	}

	_m.createGas = (cluster, section)=>{

		if(!cluster.gas){
			let obj = section['3d'];

			if(section.path === 'tokyo'){
				cluster.gas_data = {
					displacementMap: _t.Assets.textures.gas_alt_displacement,
					map: _t.Assets.textures.universe_gas_alt,
					color: obj.colors[0],
					emissive: 0xffffff,
					displacementScale: Math.abs(obj.displacement)
				}
			} else if(section.path === 'nft'){
				cluster.gas_data = {
					displacementMap: _t.Assets.textures.gas_alt2_displacement,
					map: _t.Assets.textures.universe_gas_alt2,
					color: obj.colors[0],
					emissive: 0xffffff,
					displacementScale: Math.abs(obj.displacement)
				}
			} else if(section.path === 'singapore'){
				cluster.gas_data = {
					displacementMap: _t.Assets.textures.gas_displacement,
					map: _t.Assets.textures.universe_gas,
					color: obj.colors[0],
					emissive: 0xffffff,
					displacementScale: Math.abs(obj.displacement)
				}
			} else {
				cluster.gas_data = {
					displacementMap: _t.Assets.textures.gas_displacement,
					map: _t.Assets.textures.universe_gas,
					color: 0xffffff,
					emissive: 0xffffff,
					displacementScale: Math.abs(obj.displacement)
				}	
			}

			cluster.gas_mat = new MeshStandardMaterial( {
			    color: cluster.gas_data.color,
			    emissive: cluster.gas_data.emissive,
			    fog: false,
			    displacementMap: cluster.gas_data.displacementMap,
			    displacementScale: cluster.gas_data.displacementScale,
			    envMap: _t.Elements.scene.environment,
			    map: cluster.gas_data.map,
			    emissiveMap: cluster.gas_data.map,
			    emissiveIntensity: 2,
			    side: BackSide,
			    roughness: 0.6,
			    metalness: 0.5,
			    transparent: true,
			    blending: AdditiveBlending,
			});
			
			obj.gasDispAnim = new _t.TWEEN.Tween({
				displacementScale: cluster.gas_mat.displacementScale}, _t.Motion.AUTO).to({
				displacementScale: [
					cluster.gas_data.displacementScale,
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale + (Math.random() * 600),
					cluster.gas_data.displacementScale
				]}, 100000).onUpdate(function(v) {

				cluster.gas_mat.displacementScale = v.displacementScale;
				
			}).interpolation(_t.TWEEN.Interpolation.CatmullRom).repeat(Infinity).start();

			cluster.gas = new Mesh(_m.geometries.complexSphere, cluster.gas_mat);
			cluster.gas.renderOrder = -9999 + Object.keys(_m.clusters).length;
			cluster.gas.frustumCulled = false;
			cluster.gas.scale.set(obj.radius*1200, obj.radius*1200, obj.radius*1200);
			cluster.area.add(cluster.gas);	
		}
		return cluster.gas;
	}

	_m.createStars = (cluster, section)=>{
		
		let obj = section['3d'];

		cluster.stars = {
			geo: new BufferGeometry(),
			size: 1000,
			radius: obj.radius * 10,
			arms: obj.arms,
			norm: 0,
			points:[],
		}

		cluster.stars.colors = new Float32Array( (cluster.stars.size * cluster.stars.arms + cluster.stars.size*2) * 3);

		const colorInside = obj.colors[0];
		const colorOutside = obj.colors[1];

		let xi = 0;

		let noise = ImprovedNoise().noise;
		let i3, v, vv;

		for (let a = 0; a < obj.arms; a++) {
			for (let i = 0; i < cluster.stars.size; i++) {
				cluster.stars.norm = i / cluster.stars.size;
				let thetaVariation = _Math.randFloatSpread(0.5)
				let theta = cluster.stars.norm * Math.PI + thetaVariation + (a * Math.PI/(obj.arms/2));
				let phi = _Math.randFloatSpread(0.1)
				const distance = cluster.stars.norm * cluster.stars.radius;
				
				v = new Vector3(
				   (distance * Math.sin(theta) * Math.cos(phi))+ (500 - Math.random()*1000),
				   (distance * Math.sin(theta) * Math.sin(phi))+ (1000 - Math.random()*2000),
				   (distance * Math.cos(theta))+ (500 - Math.random()*1000)
				)

				vv = noise( v.x*cluster.stars.radius, v.y*cluster.stars.radius, v.z*cluster.stars.radius );

				v = v.multiplyScalar((Math.abs(vv)+1));

				cluster.stars.points.push(v)

				let i3 = i * 3;
				xi += 3;
				const mixedColor = colorInside.clone();
				mixedColor.lerp(colorOutside, distance / cluster.stars.radius);
				cluster.stars.colors[xi] = mixedColor.r;
				cluster.stars.colors[xi + 1] = mixedColor.g;
				cluster.stars.colors[xi + 2] = mixedColor.b;
			}
		}

		for (let a = 0; a < cluster.stars.size*2; a++) {

			i3 = xi + (a * 3);
			v = getPoint();
			vv = noise( v.x*cluster.stars.radius, v.y*cluster.stars.radius, v.z*cluster.stars.radius );
			v = new Vector3(v.x*cluster.stars.radius,v.y*cluster.stars.radius,v.z*cluster.stars.radius).multiplyScalar(Math.abs(vv)+1);
			cluster.stars.points.push(v)	

			const mixedColor = colorInside.clone();
			mixedColor.lerp(colorOutside,  ((v.x + v.y + v.z)/3.7));
			cluster.stars.colors[i3] = mixedColor.r;
			cluster.stars.colors[i3 + 1] = mixedColor.g;
			cluster.stars.colors[i3 + 2] = mixedColor.b;
		}

		cluster.stars.geo = new BufferGeometry().setFromPoints( cluster.stars.points );
		cluster.stars.geo.setAttribute("color", new BufferAttribute(cluster.stars.colors, 3));

		cluster.stars.mesh = new Points(cluster.stars.geo, _t.Assets.materials.pointStar);
		cluster.stars.mesh.scale.set(10,10,10);
		cluster.stars.mesh.frustumCulled = false;
		cluster.stars.mesh.renderOrder = 10000;
		cluster.area.add(cluster.stars.mesh);

		return cluster.stars;

	}

	_m.createDust = (colors)=>{
		
		const dust = {
			geo1: false,
			geo2: false,
			size: 50,
			radius: 90,
			points1:[],
			points2:[],
			colors1: new Float32Array( 50 * 3 ),
			colors2: new Float32Array( 50 * 3 )
		}

		dust.noise = ImprovedNoise().noise;

		let i3, v, vv, a, currentColor;
		
		for (a = 0; a < dust.size; a++) {
			i3 = (a * 3);
			v = getPoint();
			vv = dust.noise( v.x*dust.radius, v.y*dust.radius, v.z*dust.radius );
			v = new Vector3(v.x*dust.radius,v.y*dust.radius,v.z*dust.radius).multiplyScalar(Math.abs(vv)+1);
			dust.points1.push(v)	

			vv = dust.noise( v.x*dust.radius, v.y*dust.radius, v.z*dust.radius );
			v = new Vector3(v.x*dust.radius,v.y*dust.radius,v.z*dust.radius).multiplyScalar(Math.abs(vv)+1);
			dust.points2.push(v)
		}
		dust.geo1 = new BufferGeometry().setFromPoints( dust.points1 );
		dust.geo2 = new BufferGeometry().setFromPoints( dust.points2 );
 		
 		dust.reArrange = ()=>{
 			for (a = 0; a < dust.size; a++) {
 				i3 = (a * 3);
 				v = getPoint();
 				vv = dust.noise( v.x*dust.radius, v.y*dust.radius, v.z*dust.radius );
 				dust.points1[a].set(v.x*dust.radius,v.y*dust.radius,v.z*dust.radius).multiplyScalar(Math.abs(vv)+1);

 				v = getPoint();
 				vv = dust.noise( v.x*dust.radius, v.y*dust.radius, v.z*dust.radius );
 				dust.points2[a].set(v.x*dust.radius,v.y*dust.radius,v.z*dust.radius).multiplyScalar(Math.abs(vv)+1);
 			}
 			dust.geo1.setFromPoints( dust.points1 );
 			dust.geo1.needsUpdate = true;
 			dust.geo1.attributes.position.needsUpdate = true;
 			dust.geo2.setFromPoints( dust.points2 );
 			dust.geo2.needsUpdate = true;
 			dust.geo2.attributes.position.needsUpdate = true;
 		}

		dust.setColors = (colors)=>{

			dust.reArrange();

			currentColor = 0;
			for (a = 0; a < dust.size; a++) {
				if(currentColor+1 >= colors.length){
					currentColor = 0;
				} else {
					currentColor += 1;
				}
				i3 = (a * 3);
				dust.colors1[i3] = colors[ currentColor ].r / 255;
				dust.colors1[i3 + 1] = colors[ currentColor ].g / 255;
				dust.colors1[i3 + 2] = colors[ currentColor ].b / 255;
			}
			dust.mesh1.geometry.setAttribute("color", new BufferAttribute(dust.colors1, 3));

			currentColor = 0;
			for (a = 0; a < dust.size; a++) {
				if(currentColor+1 >= colors.length){
					currentColor = 0;
				} else {
					currentColor += 1;
				}
				i3 = (a * 3);
				dust.colors2[i3] = colors[ currentColor ].r / 255;
				dust.colors2[i3 + 1] = colors[ currentColor ].g / 255;
				dust.colors2[i3 + 2] = colors[ currentColor ].b / 255;
			}
			dust.mesh2.geometry.setAttribute("color", new BufferAttribute(dust.colors2, 3));
		}

		dust.mesh1 = new Points(dust.geo1, _t.Assets.materials.dust1);
		dust.mesh1.frustumCulled = false;
		dust.mesh1.renderOrder = 104;

		dust.mesh2 = new Points(dust.geo2, _t.Assets.materials.dust2);
		dust.mesh2.frustumCulled = false;
		dust.mesh2.renderOrder = 104;

		dust.mesh = new Object3D();
		dust.mesh.frustumCulled = false;
		dust.mesh.renderOrder = 104;

		dust.mesh.add(dust.mesh1);
		dust.mesh.add(dust.mesh2);

		dust.setColors(colors);

		dust.toggle = (scale, opacity)=>{
			dust.mesh1.scale.set(scale,scale,scale);
			dust.mesh2.scale.set(scale,scale,scale);
			dust.mesh1.material.opacity = dust.mesh2.material.opacity = opacity;
		}

		_t.Elements.scene.add(dust.mesh);
		
		return dust;

	}

	_m.createOrbittingObjects = (cluster, section, obj)=>{

		cluster.orbits = {};

		cluster.orbitsParent = new Object3D();	
		cluster.area.add(cluster.orbitsParent);

		let _o = 0;
		let _phi, _theta;
		let _vector = new Vector3();
		const _sphere_radius = 6000;

		for(let xtmp of obj.orbitting){

			cluster.orbits[xtmp] = {};
			cluster.orbits[xtmp].parent = new Object3D();	
			cluster.orbitsParent.add(cluster.orbits[xtmp].parent);

			if(!cluster.trash){
				cluster.trash = {}
			}

			if(xtmp.indexOf('confetti') > -1){
				cluster.trash[xtmp] = new createRandomInstancedMesh(20, cluster, _t.Elements.orbitting[xtmp], 10, 3500, 1500, 2);
				cluster.trash[xtmp].instanceMatrix.setUsage( DynamicDrawUsage );
				cluster.trash[xtmp].speed = [1+Math.random()*2,1+Math.random()*2]
				cluster.trash[xtmp].anim = ()=>{
					for(let orbit in cluster.orbits){
						cluster.trash[xtmp].rotation.y += Math.PI / 8000 * cluster.trash[xtmp].speed[0];
						cluster.trash[xtmp].rotation.x += Math.PI / 8000 * cluster.trash[xtmp].speed[1];
					}
				}
			}

			cluster.orbits[xtmp].figure = _t.Elements.orbitting[xtmp];

			_phi = Math.acos( -1 + ( 2 * _o ) / obj.orbitting.length );
			_theta = Math.sqrt( obj.orbitting.length * Math.PI ) * _phi;
			
			_vector.x = _sphere_radius * Math.cos( _theta ) * Math.sin( _phi );
			_vector.z = (_sphere_radius * Math.sin( _theta ) * Math.sin( _phi ));
			_vector.y = _sphere_radius * Math.cos( _phi );
			_vector.multiplyScalar( 1.75 );

			cluster.orbits[xtmp].figure.position.copy(_vector);
			cluster.orbits[xtmp].parent.add(cluster.orbits[xtmp].figure);

			cluster.orbits[xtmp].parent.rotation.z = Math.PI * (Math.random() * 10);
			cluster.orbits[xtmp].speed = [1 + Math.random()*2, 1 + Math.random()*2];

			_o += 1;

		}

		_t.Motion.animations['orbitting'+section+Math.random()] = ()=>{
			for(let orbit in cluster.orbits){
				cluster.orbits[orbit].parent.rotation.z += Math.PI / 8000 * cluster.orbits[orbit].speed[0];
				cluster.orbits[orbit].parent.rotation.x += Math.PI / 8000 * cluster.orbits[orbit].speed[1];

				cluster.orbits[orbit].figure.rotation.z += Math.PI / 5000 * cluster.orbits[orbit].speed[1];
				cluster.orbits[orbit].figure.rotation.x += Math.PI / 5000 * cluster.orbits[orbit].speed[0];
			}
			cluster.orbitsParent.rotation.y += Math.PI/8000;
		}	

		return cluster.orbits;	
	}

	_m.createExhibitions = (cluster, section)=>{

		if(!cluster.exhibitions){
			cluster.exhibitions = [];
		}

		if(!cluster.objects){
			cluster.objects = [];
		}

		if(!cluster.targets){
			cluster.targets = { table: [], sphere: [], helix: [], grid: [] };
		}

		
		cluster.exhibitions_container = new Object3D();
		cluster.area.add(cluster.exhibitions_container);

		let exhibition, _exhibition;

		section.bubbleMat = _t.Assets.materials.bubbleMat.clone();
		section.bubbleMat.color = new Color(section['3d'].colors[1]);
		// _t.Shaders.autoCreate(section.bubbleMat, 'Bubble'+section.path); 

		for(_exhibition in section.exhibitions){

			exhibition = section.exhibitions[_exhibition];

		    exhibition.object = new Object3D();

		    exhibition.cameraPosition = new Object3D();
		    exhibition.object.add(exhibition.cameraPosition)
		    exhibition.cameraPosition.position.z = exhibition.texture.image.height*1.5;

		    exhibition.bubble = new Mesh(_m.geometries.simpleSphere, section.bubbleMat);
		    exhibition.bubble.scale.set(500, 500, 500);
		    exhibition.object.add(exhibition.bubble);
		    exhibition.bubble.renderOrder = 103;

		    exhibition.bubble._parent = exhibition;

		    _t.Elements.intersect.push(exhibition.bubble);

		    exhibition.mesh = new Mesh(_m.geometries.poster, exhibition.material );
		    exhibition.mesh.renderOrder = 102;
		    exhibition.mesh.scale.set(exhibition.texture.image.width / 1.5, exhibition.texture.image.height / 1.5, 1);
		    exhibition.object.add(exhibition.mesh);
		    exhibition.mesh.originalScale = new Vector3(exhibition.texture.image.width / 1.5, exhibition.texture.image.height / 1.5, 1);
		    exhibition.meshHD = new Mesh(_m.geometries.posterHD, exhibition.extrudedMat );
		    exhibition.meshHD.renderOrder = 102;
		    exhibition.ratio = exhibition.texture.image.width/exhibition.texture.image.height;
		   
		    exhibition.meshHD.scale.set(0,0,0);
		    exhibition.object.add(exhibition.meshHD);
		    cluster.exhibitions_container.add(exhibition.object);
		    cluster.objects.push( exhibition.object );
		    cluster.exhibitions[_exhibition] = exhibition;

		}


		cluster.table_cols = 5;
		cluster.table_rows = Math.ceil(section.exhibitions.length/cluster.table_cols);
		cluster.table_cell = 1100;
		cluster.cell_half = cluster.table_cell/2;


		let i, y, x, l, phi, theta = 0;

		// table
		for ( y = cluster.table_rows - 1; y >= 0 ; y-- ) {
		    for ( x = 0; x < cluster.table_cols; x++ ) {
		        let object = new Object3D();
		        object.position.x = -(cluster.cell_half * cluster.table_cols) + (cluster.table_cell * x) + cluster.cell_half;
		        object.position.y = -(cluster.cell_half * cluster.table_rows) + (cluster.table_cell * y) + cluster.cell_half - (cluster.cell_half * cluster.table_rows) / 1.3;
		        object.position.z = (cluster.table_cell * Math.random());
		        cluster.targets.table.push( object );
		    }
		}

		// sphere
		const sphere_radius = 4000;
		for ( i = 0, l = cluster.objects.length; i < l; i ++ ) {
			if(i > 0){
				phi = Math.acos( -1 + ( 2 * (i + 0.4) ) / l );
				theta = Math.sqrt( l * Math.PI ) * phi;
			} else {
				phi = Math.acos( -1 + ( 2 * i ) / l );
				theta = Math.sqrt( l * Math.PI ) * phi;
			}
		    
		    
		    let object = new Object3D();

		    object.position.x = sphere_radius * Math.cos( theta ) * Math.sin( phi );
		    object.position.y = sphere_radius * Math.sin( theta ) * Math.sin( phi );
		    object.position.z = sphere_radius * Math.cos( phi );

		    let vector = new Vector3();
		    vector.copy( object.position ).multiplyScalar( 2 );

		    object.lookAt( new Vector3() );

		    cluster.targets.sphere.push( object );
		}

		// helix
		const helix_radius = 6000;
		const helix_height = 800;
		const row_height = 40;
		for ( i = 0, l = cluster.objects.length; i < l; i ++ ) {

		    phi = (i * 0.180) + Math.PI;
		    let vector = new Vector3();
		    let object = new Object3D();

		    object.position.x = helix_radius * Math.sin( phi );
		    object.position.y = (cluster.objects.length * row_height / 2) - (i * row_height) - (row_height);
		    object.position.z = helix_radius * Math.cos( phi );

		    vector.x = object.position.x - (object.position.x / 2);
		    vector.y = object.position.y;
		    vector.z = object.position.z - (object.position.z / 2);

		    object.lookAt( vector );

		    cluster.targets.helix.push( object );
		}

		// grid
		const grid_size = 3000;
		const grid_size_h = grid_size/2;
		const grid_space = 10;

		for ( i = 0; i < cluster.objects.length; i++ ) {

		    let object = new Object3D();

		    object.position.x = ( ( i % 6 ) * 1200 ) - 2400 - 600;
		    object.position.y = ( -( Math.floor( i / 6 ) % 6 ) * 1200 ) + 2400 + 600;
		    object.position.z = ( Math.floor( i / 36 ) ) * -2400 + 2400;

		    cluster.targets.grid.push( object );
		}


		cluster.transform = ( targets, duration, isActive, _callback )=>{

			if(cluster.particles){
				for(let crPaEm in cluster.particles.emitters){
					cluster.particles.emitters[crPaEm].disable();
				}
			}

			_t.Screen.disableControls()

			cluster.isActive = isActive;

			if(cluster.isActive){
				
			}

			let isComplete = 0;
			let object, target;
			let i = 0;

		    for ( i = 0; i < cluster.objects.length; i ++ ) {

		        object = cluster.objects[ i ];
		        target = targets[ i ];

		        if(object.tw){
		        	_t.Motion.AUTO.remove(object.tw);
		        	delete object.tw;
		        }
		        if(object.tw1){
		        	_t.Motion.AUTO.remove(object.tw1);
		        	delete object.tw1;
		        }
		        if(object.tw2){
		        	_t.Motion.AUTO.remove(object.tw2);
		        	delete object.tw2;
		        }
		        if(object.tw3){
		        	_t.Motion.AUTO.remove(object.tw3);
		        	delete object.tw3;
		        }

		        object.tw1 = new _t.TWEEN.Tween( object.scale,  _t.Motion.AUTO )
		            .to( { x: 1, y: 1, z: 1 }, Math.random() * duration + duration )
		            .easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete( ()=>{
						isComplete++;
						if(isComplete === cluster.objects.length * 3 && _callback){
							_callback()
						}
		            }).start();

		        object.tw2 = new _t.TWEEN.Tween( object.position, _t.Motion.AUTO )
		            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
		            .easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete( ()=>{
						isComplete++;
						if(isComplete === cluster.objects.length * 3 && _callback){
							_callback()
						}
		            }).start();

		        object.tw3 = new _t.TWEEN.Tween( object.rotation, _t.Motion.AUTO )
		            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
		            .easing( _t.TWEEN.Easing.Exponential.InOut ).onComplete( ()=>{
						isComplete++;
						if(isComplete === cluster.objects.length * 3 && _callback){
							_callback()
						}
		            }).start();

		    }

		    _t.Screen.controls.saveState();
		    _t.Interaction.lastPositionSaved = true;

		}

		
	}

	
	if(callback) callback(_m);
}


export { Multiverse }