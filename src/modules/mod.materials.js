import { 
	SpriteMaterial,
	MeshBasicMaterial,
	MeshLambertMaterial,
	SphereBufferGeometry,
	MeshStandardMaterial,
	MeshPhongMaterial,
	PointsMaterial,
	AdditiveBlending,
	RepeatWrapping,
	NormalBlending,
	DoubleSide,
	FrontSide,
	BackSide,
	VideoTexture,
	EquirectangularRefractionMapping,
	EquirectangularReflectionMapping,
	PMREMGenerator,
	CubeTextureLoader,
	AddOperation,
	MixOperation,
	MirroredRepeatWrapping,
	sRGBEncoding,
	SRGBColorSpace
} from 'three';

const Materials = (_t, callback)=>{

	const _m = _t.Mats = {}
	const _s = _t.Shaders = { store: {} };

	_m.count = 0;

	_m.max = 18;

	for(let galaxy in appData){
		if(_t.internal.indexOf(galaxy) < 0){
			if(appData[galaxy].exhibitions && appData[galaxy].exhibitions.length > 0){
				_m.max += appData[galaxy].exhibitions.length * 3;
			}
		} 
	}

	_m.addTexture = (tex)=>{
		_m.count = _m.count+1;
		_t.Loaders.add()
		if(_m.max === _m.count){
			if(callback) callback()
		} else if(_m.max < _m.count){
			console.log('exceded by', _m.count-_m.max)
		}
		return tex;
	}

	_t.Elements.scene.background = _t.Assets.textures.universe = new CubeTextureLoader().setPath( _t.params.assets+'textures/universe/cube/' ).load( [ 
		'usnverse_RT.png', 
		'usnverse_LF.png', 
		'usnverse_UP.png', 
		'usnverse_DN.png', 
		'usnverse_FT.png', 
		'usnverse_BK.png' 
	], _m.addTexture);

	_t.Elements.pmr = new PMREMGenerator( _t.Screen.renderer );
	_t.Elements.scene.environment = _t.Elements.pmr.fromCubemap(_t.Assets.textures.universe).texture;
	_t.Elements.scene.environment.encoding = sRGBEncoding;

	_t.Assets.textures.debry = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/debry.png', _m.addTexture);
	_t.Assets.textures.debry.encoding = sRGBEncoding;
	_t.Assets.textures.debry.wrapS = _t.Assets.textures.debry.wrapT = RepeatWrapping;
	_t.Assets.textures.debry.repeat.set(1000,10);
		
	_t.Assets.materials.debry = new MeshLambertMaterial( {
	    color: 0xffffff,
	    fog: true,
	    map: _t.Assets.textures.debry,
	    side: DoubleSide,
	    transparent: true,
	    opacity: 1,
	    blending: AdditiveBlending,
	});

	_t.Assets.materials.debryAnim = new _t.TWEEN.Tween({offset: 0}, _t.Motion.AUTO).to({offset: 1}, 7000).onUpdate(function(v) {

		_t.Assets.textures.debry.offset.set(0, v.offset);
		
	}).repeat(Infinity).start();


	_t.Assets.textures.universe_gas = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_1.png', _m.addTexture);
	_t.Assets.textures.universe_gas.wrapS = RepeatWrapping;
	_t.Assets.textures.universe_gas.wrapT = MirroredRepeatWrapping;
	_t.Assets.textures.universe_gas.needsUpdate = true;

	_t.Assets.textures.gas_displacement = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_displacement.png', _m.addTexture);
	_t.Assets.textures.gas_displacement.wrapS = RepeatWrapping;
	_t.Assets.textures.gas_displacement.wrapT = MirroredRepeatWrapping;
	_t.Assets.textures.gas_displacement.needsUpdate = true;

	_t.Assets.textures.universe_gas_alt = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_2.png', _m.addTexture);
	_t.Assets.textures.universe_gas_alt.wrapS = _t.Assets.textures.universe_gas_alt.wrapT = RepeatWrapping;
	
	_t.Assets.textures.gas_alt_displacement = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_alt_displacement.png', _m.addTexture);
	_t.Assets.textures.gas_alt_displacement.wrapS = _t.Assets.textures.gas_alt_displacement.wrapT = RepeatWrapping;



	_t.Assets.textures.universe_gas_alt2 = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_3.png', _m.addTexture);
	_t.Assets.textures.universe_gas_alt2.wrapS = _t.Assets.textures.universe_gas_alt2.wrapT = RepeatWrapping;
	
	_t.Assets.textures.gas_alt2_displacement = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/gas_alt2_displacement.png', _m.addTexture);
	_t.Assets.textures.gas_alt2_displacement.wrapS = _t.Assets.textures.gas_alt2_displacement.wrapT = RepeatWrapping;


	_t.Assets.materials.gasDispAnim = new _t.TWEEN.Tween({offset: 0 }, _t.Motion.AUTO).to({offset: 1 }, 100000).onUpdate(function(v) {

		_t.Assets.textures.universe_gas.offset.set(v.offset, 0);
		_t.Assets.textures.universe_gas_alt.offset.set(v.offset, 0);
		_t.Assets.textures.universe_gas_alt2.offset.set(-v.offset, 0);
			
	}).interpolation(_t.TWEEN.Interpolation.CatmullRom).repeat(Infinity).start();

	_t.Assets.textures.stars = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/stars.png', _m.addTexture);
	_t.Assets.textures.stars.wrapS = _t.Assets.textures.stars.wrapT = RepeatWrapping;
	
	_t.Assets.materials.stars = new MeshLambertMaterial( {
	    color: 0x0,
	    fog: false,
	    map: _t.Assets.textures.stars,
	    emissiveMap: _t.Assets.textures.stars,
	    emissiveIntensity: 1.5,
	    emissive: 0xffffff,
	    side: BackSide,
	    transparent: true,
	    blending: AdditiveBlending,
	    depthTest: true,
	    depthWrite: true,
	    stencilWrite: true,
	});

	_t.Assets.textures.big_stars = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/big_stars.png', _m.addTexture);
	_t.Assets.textures.big_stars.encoding = sRGBEncoding;
	_t.Assets.textures.big_stars.wrapS = _t.Assets.textures.big_stars.wrapT = RepeatWrapping;

	_t.Assets.materials.big_stars = new MeshLambertMaterial( {
	    color: 0x0,
	    fog: false,
	    map: _t.Assets.textures.big_stars,
	    emissiveMap: _t.Assets.textures.big_stars,
	    emissiveIntensity: 1,
	    emissive: 0xffffff,
	    side: DoubleSide,
	    transparent: true,
	    blending: AdditiveBlending,
	    depthTest: true,
	    depthWrite: true,
	    stencilWrite: true,
	});

	_t.Assets.textures.small_stars = _t.Loaders.texLoader.load( _t.params.assets+'textures/universe/small_stars.png', _m.addTexture);
	_t.Assets.textures.small_stars.encoding = sRGBEncoding;
	_t.Assets.textures.small_stars.wrapS = _t.Assets.textures.small_stars.wrapT = RepeatWrapping;

	_t.Assets.materials.small_stars = new MeshLambertMaterial( {
	    color: 0x0,
	    fog: false,
	    map: _t.Assets.textures.small_stars,
	    emissiveMap: _t.Assets.textures.small_stars,
	    emissiveIntensity: 4,
	    emissive: 0xffffff,
	    side: DoubleSide,
	    transparent: true,
	    blending: AdditiveBlending,
	    depthTest: true,
	    depthWrite: true,
	    stencilWrite: true,
	});

	_t.Assets.textures.particles = []; 
	_t.Assets.textures.particles[0] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/1.png', _m.addTexture);
	_t.Assets.textures.particles[1] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/3.png', _m.addTexture);
	_t.Assets.textures.particles[2] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/4.png', _m.addTexture);
	_t.Assets.textures.particles[3] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/6.png', _m.addTexture);
	_t.Assets.textures.particles[4] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/8.png', _m.addTexture);
	_t.Assets.textures.particles[5] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/9.png', _m.addTexture);
	_t.Assets.textures.particles[6] = _t.Loaders.texLoader.load( _t.params.assets+'textures/particles/splat.png', _m.addTexture);

	
	for(let section in _t.sections){
		if(_t.sections[section].exhibitions){
			for(let exhibition in _t.sections[section].exhibitions){

				const _tx = _t.sections[section].exhibitions[exhibition];

				if(_tx.poster && _tx.poster.hero && _tx.poster.thumbnail){

					_tx.texture = _t.Loaders.texLoader.load( _tx.poster.thumbnail, _m.addTexture);
					_tx.texture.encoding = sRGBEncoding;
					_tx.texture.colorSpace = SRGBColorSpace;
					_tx.texture.wrapS = _tx.texture.wrapT = RepeatWrapping;

					_tx.material = new MeshLambertMaterial( {
					    color: 0xffffff,
					    fog: false,
					    emissive: 0xffffff,
					    side: DoubleSide,
					    emissiveIntensity: 1.1,
					    map: _tx.texture,
					    emissiveMap: _tx.texture,
					});

					_tx.extrudeTx = _t.Loaders.texLoader.load( _tx.poster.blur, _m.addTexture);
					
					_tx.extrudeTx.encoding = sRGBEncoding;
					_tx.extrudeTx.wrapS = _tx.extrudeTx.wrapT = MirroredRepeatWrapping;
					_tx.extrudeTx.offset.x = -1.0;
					_tx.extrudeTx.repeat.set(2,1);
					_tx.extrudeTx.needsUpdate = true;

					_tx.extrudeTxC = _t.Loaders.texLoader.load( _tx.poster.bw, _m.addTexture);
					_tx.extrudeTxC.wrapS = _tx.extrudeTxC.wrapT = MirroredRepeatWrapping;
					_tx.extrudeTxC.offset.x = -1.0;
					_tx.extrudeTxC.repeat.set(2,1);
					_tx.extrudeTxC.needsUpdate = true;	

					_tx.extrudedMat = new MeshStandardMaterial( {
					    color: 0x0,
					    emissive: 0xffffff,
					    fog: false,
					    transparent: true,
					    side: BackSide,
					    map: _tx.extrudeTx,
					    emissiveMap: _tx.extrudeTx,
					    displacementMap: _tx.extrudeTxC,
					    displacementScale: 0,
					    emissiveIntensity: 0.3,
					    opacity: 0
					});

					_tx.extrudedMat.needsUpdate = true;

				}

			}	
		}
	}

	_t.Assets.materials.bubbleMat = new MeshPhongMaterial({
	    color: 0xffffff,
	    side: FrontSide,
	    envMap: _t.Assets.textures.stars,
	    opacity: 1,
	    specular:0xffffff,
	    transparent: true,
	    combine: MixOperation,
	    blending: AdditiveBlending,
	});



	_t.Assets.materials.hoverIn = new MeshPhongMaterial({
	    color: 0xffffff,
	    side: FrontSide,
	    envMap: _t.Assets.textures.stars,
	    opacity: 1,
	    specular:0xffffff,
	    transparent: true,
	    combine: MixOperation,
	    blending: AdditiveBlending,
	});

	_t.Assets.materials.hoverOut = new MeshPhongMaterial({
	    color: 0xffffff,
	    side: FrontSide,
	    envMap: _t.Assets.textures.stars,
	    opacity: 1,
	    specular:0xffffff,
	    transparent: true,
	    combine: MixOperation,
	    blending: AdditiveBlending,
	});

	_t.Assets.materials.pointStar = new PointsMaterial({ 
		color: 0xffffff, 
		fog: false, 
		transparent: true, 
		alphaMap: _t.Assets.textures.particles[0], 
		blending: AdditiveBlending, 
		alphaTest: 0.1,
		vertexColors: true, 
		sizeAttenuation: true, 
		size: 30
	});

	_t.Assets.materials.pointStarBig = new PointsMaterial({ 
		color: 0xffffff, 
		fog: false, 
		transparent: true, 
		alphaMap: _t.Assets.textures.particles[0], 
		blending: AdditiveBlending, 
		alphaTest: 0.1,
		vertexColors: true, 
		sizeAttenuation: true, 
		size: 0.9
	});

	_t.Assets.materials.dust1 = new PointsMaterial({ 
		color: 0xffffff, 
		fog: false, 
		transparent: true, 
		alphaMap: _t.Assets.textures.particles[6],
		alphaTest: 0.01,
		vertexColors: true, 
		sizeAttenuation: true, 
		size: 0.99
	});

	_t.Assets.materials.dust2 = new PointsMaterial({ 
		color: 0xffffff, 
		fog: false, 
		transparent: true, 
		alphaMap: _t.Assets.textures.particles[1],
		alphaTest: 0.1,
		vertexColors: true, 
		sizeAttenuation: true, 
		size: 0.9
	});

	_t.Assets.materials.darker = new MeshBasicMaterial({
		color:0x0, 
		transparent: true, 
		opacity: 0,
		side: DoubleSide
	})
}

export { Materials }

 

	

