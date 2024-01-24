import { Object3D,Vector3,Matrix4,InstancedMesh, DynamicDrawUsage } from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const DrawCircle = (radius, numberOfPoints) => {
	const angleStep = (Math.PI * 2) / numberOfPoints
	const points = []
	for (let i = 1; i <= numberOfPoints; i++) {
		const x = Math.cos(i * angleStep) * radius
		const y = Math.sin(i * angleStep) * radius
		points.push({ x, y })
	}
	
	return points
}

const Scatter = (scene, surface, drop1, drop2, size, count)=>{

	if(!size){ size = 1 }
	if(!count){ count = 100 }

	const _s = {};
	_s.api = {
		count: count,
		distribution: 'random',
		resample: true,
	};

	_s.count = _s.api.count;
	_s.ages = new Float32Array( _s.count );
	_s.scales = new Float32Array( _s.count );
	_s.distances = new Float32Array( _s.count );
	_s.dummy1 = new Object3D();
	_s.dummy2 = new Object3D();

	_s._position1 = new Vector3();
	_s._position2 = new Vector3();
	_s._normal = new Vector3();
	_s._scale = new Vector3();

	_s.easeOutCubic = function ( t ) {
		return ( -- t ) * t * t + 1;
	};
	_s.scaleCurve = function ( t ) {
		return Math.abs( _s.easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );
	};


	_s.resample = ()=>{

		_s.vertexCount = surface.geometry.getAttribute( 'position' ).count;
		_s.sampler = new MeshSurfaceSampler( surface ).setWeightAttribute( _s.api.distribution === 'weighted' ? 'uv' : null ).build();
		for ( let i = 0; i < _s.count; i ++ ) {
			_s.ages[ i ] = Math.random();
			_s.scales[ i ] = _s.scaleCurve( _s.ages[ i ] );
			_s.distances[ i ] = _s.scaleCurve( _s.ages[ i ] );
			_s.resampleParticle( i );
		}
		_s.dropMesh1.instanceMatrix.needsUpdate = true;
		_s.dropMesh2.instanceMatrix.needsUpdate = true;

	}

	_s.resampleParticle = ( i )=>{

		_s.sampler.sample( _s._position1, _s._normal );
		_s._normal.add( _s._position1 );

		_s.dummy1.position.copy( _s._position1 );
		_s.dummy1.scale.set( _s.scales[ i ], _s.scales[ i ], _s.scales[ i ] );
		_s.dummy1.lookAt( _s._normal );
		_s.dummy1.updateMatrix();

		_s.dropMesh1.setMatrixAt( i, _s.dummy1.matrix );
		_s.dropMesh1.instanceMatrix.needsUpdate = true;



		_s.sampler.sample( _s._position2, _s._normal );
		_s._normal.add( _s._position2 )

		_s.dummy2.position.copy( _s._position2 );
		_s.dummy2.scale.set( _s.scales[ i ] * 2, _s.scales[ i ] * 2, _s.scales[ i ] * 2 );
		_s.dummy2.lookAt( _s._normal );
		_s.dummy2.updateMatrix();

		_s.dropMesh2.setMatrixAt( i, _s.dummy2.matrix );
		_s.dropMesh2.instanceMatrix.needsUpdate = true;

	}

	_s.updateParticle = ( i )=>{

		_s.ages[ i ] += 0.00005;

		if ( _s.ages[ i ] >= 1 ) {

			_s.ages[ i ] = 0.00001;
			_s.scales[ i ] = _s.scaleCurve( _s.ages[ i ] );
			_s.distances[ i ] = _s.scaleCurve( _s.ages[ i ] );

			_s.resampleParticle( i );

			return;

		}

		_s.prevScale = _s.scales[ i ];
		_s.scales[ i ] = _s.scaleCurve( _s.ages[ i ] );
		_s._scale.set( _s.scales[ i ] / _s.prevScale, _s.scales[ i ] / _s.prevScale, _s.scales[ i ] / _s.prevScale );
		
		_s.dropMesh1.getMatrixAt( i, _s.dummy1.matrix );
		_s.dummy1.matrix.scale( _s._scale );
		_s.dropMesh1.setMatrixAt( i, _s.dummy1.matrix );
		_s.dropMesh1.instanceMatrix.needsUpdate = true;


		_s.dropMesh2.getMatrixAt( i, _s.dummy2.matrix );
		_s.dummy2.matrix.scale( _s._scale );
		_s.dropMesh2.setMatrixAt( i, _s.dummy2.matrix );
		_s.dropMesh2.instanceMatrix.needsUpdate = true;

	}

	_s.dropGeometry1 = drop1.geometry.clone();
	_s.dropGeometry2 = drop2.geometry.clone();

	_s.defaultTransform = new Matrix4().makeRotationX( Math.PI ).multiply( new Matrix4().makeScale( size, size, size ) );

	_s.dropGeometry1.applyMatrix4( _s.defaultTransform );
	_s.dropGeometry2.applyMatrix4( _s.defaultTransform );

	_s.dropMaterial1 = drop1.material;
	_s.dropMaterial2 = drop2.material;

	_s.dropMesh1 = new InstancedMesh( _s.dropGeometry1, _s.dropMaterial1, _s.count );
	_s.dropMesh2 = new InstancedMesh( _s.dropGeometry2, _s.dropMaterial2, _s.count );

	_s.dropMesh1.instanceMatrix.setUsage( DynamicDrawUsage );
	_s.dropMesh2.instanceMatrix.setUsage( DynamicDrawUsage );

	_s.resample();

	scene.add( _s.dropMesh1 );
	scene.add( _s.dropMesh2 );

	_s.update = ()=>{
		for ( _s.loop = 0; _s.loop < _s.count; _s.loop++ ) {
			_s.updateParticle( _s.loop );
		}
	}

	return _s;
}

const ObjCoords = ()=>{

	const _this = {
		worldPosition: null,
		screenPosition: null,
		cssPosition: null,
		convertWorldToScreenSpace: null,
		VisiblePlaneHeight: null,
		VisiblePlaneWidth: null,
	};

	_this.worldPosition = (object3d)=>{
		object3d.updateMatrixWorld();
		let worldMatrix	= object3d.matrixWorld;
		let worldPos	= new Vector3().setFromMatrixPosition(worldMatrix);
		return worldPos;
	}

	_this.screenPosition = (object3d, camera)=>{
		let position	= _this.worldPosition(object3d)
		return _this.convertWorldToScreenSpace(position, camera)
	}

	_this.cssPosition = (object3d, camera, renderer)=>{
		let position = _this.screenPosition(object3d, camera);
		position.x	= (  (position.x/2 + 0.5)) * renderer.domElement.width / renderer.getPixelRatio();
		position.y	= (1-(position.y/2 + 0.5)) * renderer.domElement.height/ renderer.getPixelRatio();
		return position;
	}

	_this.convertWorldToScreenSpace = (worldPosition, camera)=>{
		let projector	= new Vector3();
		_this.projector	= projector
		let screenPos	= worldPosition.clone().project( camera );
		return screenPos;
	}

	_this.VisiblePlaneHeight = (camera, distanceToCamera)=>{
		let vFOV = camera.fov * Math.PI / 180;		
		let planeHeight	= 2 * Math.tan( vFOV / 2 ) * distanceToCamera;
		return planeHeight
	}

	_this.VisiblePlaneWidth	= (camera, renderer, distanceToCamera)=>{
		let planeHeight	= this.VisiblePlaneHeight(camera, distanceToCamera)
		let aspect	= renderer.domElement.width / renderer.domElement.height;
		let planeWidth	= planeHeight * aspect; 
		return planeWidth
	}

	return _this;
}

const Follower = (_t)=>{

	let _f = {};

	_f.objects = {};
	_f.html = {};
	_f.isActive = true;

	_f.show = ()=>{

		_f.isActive = true;
		_f.floatingElements = document.getElementById('floating_elements');
		_f.floatingElements.style.display = 'block';

		_f.tmpCnt = 0;
		_f.elements = _f.floatingElements.querySelectorAll('.follower');

		for (let _tmp in _f.elements) {
			_f.tmpCnt += 1;
			let __tmp = _f.elements[_tmp];
			setTimeout(()=>{
				if(__tmp.classList){
					__tmp.classList.add('active');
				}
			}, 150 * _f.tmpCnt)
		}
	}

	_f.hide = ()=>{
		
		_f.isActive = true;
		_f.tmpCnt = 0;
		_f.floatingElements = document.getElementById('floating_elements');
		_f.floatingElements.style.display = 'block';

		_f.elements = _f.floatingElements.querySelectorAll('.follower');

		for (let _tmp in _f.elements) {
			_f.tmpCnt += 1;
			let __tmp = _f.elements[_tmp];
			setTimeout(()=>{
				if(__tmp.classList){
					__tmp.classList.remove('active');
				}
			}, 150 * _f.tmpCnt)
		}

		setTimeout(()=>{
			_f.isActive = false;
			_f.floatingElements.style.display = 'none';
		}, 150 * _f.elements.length)
	}
	 
	_t.Motion.animations.followElements = ()=>{
		if(_f.isActive){
			for (_f.tmp in _f.objects) {
				_f.pos = _t.ObjCoords.cssPosition( _f.objects[_f.tmp], _t.Elements.camera, _t.Screen.renderer);
				_f.html[_f.tmp].style.transform = `perspective(`+window.innerWidth+`px) translate3d(`+_f.pos.x+`px,`+_f.pos.y+`px,`+_f.pos.z+`px)`;
			}	
		}
		
	}

	return _f;
}

export { Scatter, DrawCircle, ObjCoords, Follower }