import { 
    BufferAttribute,
    DynamicDrawUsage,
    StaticDrawUsage,
    ShaderChunk,
    Vector2,
    Vector3,
    Vector4,
    Color,
    Math as xMath,
    Texture,
    AdditiveBlending,
    ShaderMaterial,
    BufferGeometry,
    Points
} from 'three';

var SPE = {

    /**
     * A map of supported distribution types used
     * by SPE.Emitter instances.
     *
     * These distribution types can be applied to
     * an emitter globally, which will affect the
     * `position`, `velocity`, and `acceleration`
     * value calculations for an emitter, or they
     * can be applied on a per-property basis.
     *
     * @enum {Number}
     */
    distributions: {
        /**
         * Values will be distributed within a box.
         * @type {Number}
         */
        BOX: 1,

        /**
         * Values will be distributed on a sphere.
         * @type {Number}
         */
        SPHERE: 2,

        /**
         * Values will be distributed on a 2d-disc shape.
         * @type {Number}
         */
        DISC: 3,

        /**
         * Values will be distributed along a line.
         * @type {Number}
         */
        LINE: 4
    },


    /**
     * Set this value to however many 'steps' you
     * want value-over-lifetime properties to have.
     *
     * It's adjustable to fix an interpolation problem:
     *
     * Assuming you specify an opacity value as [0, 1, 0]
     *      and the `valueOverLifetimeLength` is 4, then the
     *      opacity value array will be reinterpolated to
     *      be [0, 0.66, 0.66, 0].
     *   This isn't ideal, as particles would never reach
     *   full opacity.
     *
     * NOTE:
     *     This property affects the length of ALL
     *       value-over-lifetime properties for ALL
     *       emitters and ALL groups.
     *
     *     Only values >= 3 && <= 4 are allowed.
     *
     * @type {Number}
     */
    valueOverLifetimeLength: 4
};

if ( typeof define === 'function' && define.amd ) {
    define( 'spe', SPE );
}
else if ( typeof exports !== 'undefined' && typeof module !== 'undefined' ) {
    module.exports = SPE;
}

SPE.TypedArrayHelper = function( TypedArrayConstructor, size, componentSize, indexOffset ) {
    'use strict';

    this.componentSize = componentSize || 1;
    this.size = ( size || 1 );
    this.TypedArrayConstructor = TypedArrayConstructor || Float32Array;
    this.array = new TypedArrayConstructor( size * this.componentSize );
    this.indexOffset = indexOffset || 0;
};

SPE.TypedArrayHelper.constructor = SPE.TypedArrayHelper;

SPE.TypedArrayHelper.prototype.setSize = function( size, noComponentMultiply ) {
    'use strict';

    var currentArraySize = this.array.length;

    if ( !noComponentMultiply ) {
        size = size * this.componentSize;
    }

    if ( size < currentArraySize ) {
        return this.shrink( size );
    }
    else if ( size > currentArraySize ) {
        return this.grow( size );
    }
    else {
        console.info( 'TypedArray is already of size:', size + '.', 'Will not resize.' );
    }
};

SPE.TypedArrayHelper.prototype.shrink = function( size ) {
    'use strict';

    this.array = this.array.subarray( 0, size );
    this.size = size;
    return this;
};

SPE.TypedArrayHelper.prototype.grow = function( size ) {
    'use strict';

    var existingArray = this.array,
        newArray = new this.TypedArrayConstructor( size );

    newArray.set( existingArray );
    this.array = newArray;
    this.size = size;

    return this;
};

SPE.TypedArrayHelper.prototype.splice = function( start, end ) {
    'use strict';
    start *= this.componentSize;
    end *= this.componentSize;

    var data = [],
        array = this.array,
        size = array.length;

    for ( var i = 0; i < size; ++i ) {
        if ( i < start || i >= end ) {
            data.push( array[ i ] );
        }
        // array[ i ] = 0;
    }

    this.setFromArray( 0, data );

    return this;
};

SPE.TypedArrayHelper.prototype.setFromArray = function( index, array ) {
    'use strict';

    var sourceArraySize = array.length,
        newSize = index + sourceArraySize;

    if ( newSize > this.array.length ) {
        this.grow( newSize );
    }
    else if ( newSize < this.array.length ) {
        this.shrink( newSize );
    }

    this.array.set( array, this.indexOffset + index );

    return this;
};

SPE.TypedArrayHelper.prototype.setVec2 = function( index, vec2 ) {
    'use strict';

    return this.setVec2Components( index, vec2.x, vec2.y );
};

SPE.TypedArrayHelper.prototype.setVec2Components = function( index, x, y ) {
    'use strict';

    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    return this;
};

SPE.TypedArrayHelper.prototype.setVec3 = function( index, vec3 ) {
    'use strict';

    return this.setVec3Components( index, vec3.x, vec3.y, vec3.z );
};

SPE.TypedArrayHelper.prototype.setVec3Components = function( index, x, y, z ) {
    'use strict';

    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    array[ i + 2 ] = z;

    return this;
};

SPE.TypedArrayHelper.prototype.setVec4 = function( index, vec4 ) {
    'use strict';

    return this.setVec4Components( index, vec4.x, vec4.y, vec4.z, vec4.w );
};

SPE.TypedArrayHelper.prototype.setVec4Components = function( index, x, y, z, w ) {
    'use strict';

    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    array[ i + 2 ] = z;
    array[ i + 3 ] = w;
    return this;
};

SPE.TypedArrayHelper.prototype.setMat3 = function( index, mat3 ) {
    'use strict';

    return this.setFromArray( this.indexOffset + ( index * this.componentSize ), mat3.elements );
};

SPE.TypedArrayHelper.prototype.setMat4 = function( index, mat4 ) {
    'use strict';

   
    return this.setFromArray( this.indexOffset + ( index * this.componentSize ), mat4.elements );
};

SPE.TypedArrayHelper.prototype.setColor = function( index, color ) {

    'use strict';


    return this.setVec3Components( index, color.r, color.g, color.b );
};

SPE.TypedArrayHelper.prototype.setNumber = function( index, numericValue ) {
    'use strict';

    this.array[ this.indexOffset + ( index * this.componentSize ) ] = numericValue;
    return this;
};

SPE.TypedArrayHelper.prototype.getValueAtIndex = function( index ) {
    'use strict';

    return this.array[ this.indexOffset + index ];
};

SPE.TypedArrayHelper.prototype.getComponentValueAtIndex = function( index ) {
    'use strict';

    return this.array.subarray( this.indexOffset + ( index * this.componentSize ) );
};

SPE.ShaderAttribute = function( type, dynamicBuffer, arrayType ) {
	'use strict';

	var typeMap = SPE.ShaderAttribute.typeSizeMap;

	this.type = typeof type === 'string' && typeMap.hasOwnProperty( type ) ? type : 'f';
	this.componentSize = typeMap[ this.type ];
	this.arrayType = arrayType || Float32Array;
	this.typedArray = null;
	this.bufferAttribute = null;
	this.dynamicBuffer = !!dynamicBuffer;

	this.updateMin = 0;
	this.updateMax = 0;
};

SPE.ShaderAttribute.constructor = SPE.ShaderAttribute;

SPE.ShaderAttribute.typeSizeMap = {
	f: 1,
	v2: 2,
	v3: 3,
	v4: 4,
	c: 3,
	m3: 9,
	m4: 16
};

SPE.ShaderAttribute.prototype.setUpdateRange = function( min, max ) {
	'use strict';

	this.updateMin = Math.min( min * this.componentSize, this.updateMin * this.componentSize );
	this.updateMax = Math.max( max * this.componentSize, this.updateMax * this.componentSize );
};

SPE.ShaderAttribute.prototype.flagUpdate = function() {
	'use strict';

	var attr = this.bufferAttribute,
		range = attr.updateRange;

	range.offset = this.updateMin;
	range.count = Math.min( ( this.updateMax - this.updateMin ) + this.componentSize, this.typedArray.array.length );
	// console.log( range.offset, range.count, this.typedArray.array.length );
	// console.log( 'flagUpdate:', range.offset, range.count );
	attr.needsUpdate = true;
};

SPE.ShaderAttribute.prototype.resetUpdateRange = function() {
	'use strict';

	this.updateMin = 0;
	this.updateMax = 0;
};

SPE.ShaderAttribute.prototype.resetDynamic = function() {
	'use strict';
	this.bufferAttribute.usage = this.dynamicBuffer ?
		DynamicDrawUsage :
		StaticDrawUsage;
};

SPE.ShaderAttribute.prototype.splice = function( start, end ) {
	'use strict';

	this.typedArray.splice( start, end );

	// Reset the reference to the attribute's typed array
	// since it has probably changed.
	this.forceUpdateAll();
};

SPE.ShaderAttribute.prototype.forceUpdateAll = function() {
	'use strict';

	this.bufferAttribute.array = this.typedArray.array;
	this.bufferAttribute.updateRange.offset = 0;
	this.bufferAttribute.updateRange.count = -1;
	// this.bufferAttribute.dynamic = false;
	// this.bufferAttribute.usage = this.dynamicBuffer ?
	// 	DynamicDrawUsage :
	// 	StaticDrawUsage;

	this.bufferAttribute.usage = StaticDrawUsage;
	this.bufferAttribute.needsUpdate = true;
};

SPE.ShaderAttribute.prototype._ensureTypedArray = function( size ) {
	'use strict';

	// Condition that's most likely to be true at the top: no change.
	if ( this.typedArray !== null && this.typedArray.size === size * this.componentSize ) {
		return;
	}

	// Resize the array if we need to, telling the TypedArrayHelper to
	// ignore it's component size when evaluating size.
	else if ( this.typedArray !== null && this.typedArray.size !== size ) {
		this.typedArray.setSize( size );
	}

	// This condition should only occur once in an attribute's lifecycle.
	else if ( this.typedArray === null ) {
		this.typedArray = new SPE.TypedArrayHelper( this.arrayType, size, this.componentSize );
	}
};

SPE.ShaderAttribute.prototype._createBufferAttribute = function( size ) {
	'use strict';

	// Make sure the typedArray is present and correct.
	this._ensureTypedArray( size );

	// Don't create it if it already exists, but do
	// flag that it needs updating on the next render
	// cycle.
	if ( this.bufferAttribute !== null ) {
		this.bufferAttribute.array = this.typedArray.array;

		// Since js version 81, dynamic count calculation was removed
		// so I need to do it manually here.
		//
		// In the next minor release, I may well remove this check and force
		// dependency on THREE r81+.
		// if ( parseFloat( REVISION ) >= 81 ) {
			this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
		// }

		this.bufferAttribute.needsUpdate = true;
		return;
	}

	this.bufferAttribute = new BufferAttribute( this.typedArray.array, this.componentSize );
	// this.bufferAttribute.dynamic = this.dynamicBuffer;
	this.bufferAttribute.usage = this.dynamicBuffer ?
		DynamicDrawUsage :
		StaticDrawUsage;
};

SPE.ShaderAttribute.prototype.getLength = function() {
	'use strict';

	if (
     this.typedArray === null ) {
		return 0;
	}

	return this.typedArray.array.length;
};

SPE.shaderChunks = {
    // Register color-packing define statements.
    defines: [
        '#define PACKED_COLOR_SIZE 256.0',
        '#define PACKED_COLOR_DIVISOR 255.0'
    ].join( '\n' ),

    // All uniforms used by vertex / fragment shaders
    uniforms: [
        'uniform float deltaTime;',
        'uniform float runTime;',
        'uniform sampler2D tex;',
        'uniform vec4 textureAnimation;',
        'uniform float scale;',
    ].join( '\n' ),

    attributes: [
        'attribute vec4 acceleration;',
        'attribute vec3 velocity;',
        'attribute vec4 rotation;',
        'attribute vec3 rotationCenter;',
        'attribute vec4 params;',
        'attribute vec4 size;',
        'attribute vec4 angle;',
        'attribute vec4 color;',
        'attribute vec4 opacity;'
    ].join( '\n' ),

    varyings: [
        'varying vec4 vColor;',
        '#ifdef SHOULD_ROTATE_TEXTURE',
        '    varying float vAngle;',
        '#endif',

        '#ifdef SHOULD_CALCULATE_SPRITE',
        '    varying vec4 vSpriteSheet;',
        '#endif'
    ].join( '\n' ),

    branchAvoidanceFunctions: [
        'float when_gt(float x, float y) {',
        '    return max(sign(x - y), 0.0);',
        '}',

        'float when_lt(float x, float y) {',
        '    return min( max(1.0 - sign(x - y), 0.0), 1.0 );',
        '}',

        'float when_eq( float x, float y ) {',
        '    return 1.0 - abs( sign( x - y ) );',
        '}',

        'float when_ge(float x, float y) {',
        '  return 1.0 - when_lt(x, y);',
        '}',

        'float when_le(float x, float y) {',
        '  return 1.0 - when_gt(x, y);',
        '}',

        // Branch-avoiding logical operators
        // (to be used with above comparison fns)
        'float and(float a, float b) {',
        '    return a * b;',
        '}',

        'float or(float a, float b) {',
        '    return min(a + b, 1.0);',
        '}',
    ].join( '\n' ),


    unpackColor: [
        'vec3 unpackColor( in float hex ) {',
        '   vec3 c = vec3( 0.0 );',

        '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float b = mod( hex, PACKED_COLOR_SIZE );',

        '   c.r = r / PACKED_COLOR_DIVISOR;',
        '   c.g = g / PACKED_COLOR_DIVISOR;',
        '   c.b = b / PACKED_COLOR_DIVISOR;',

        '   return c;',
        '}',
    ].join( '\n' ),

    unpackRotationAxis: [
        'vec3 unpackRotationAxis( in float hex ) {',
        '   vec3 c = vec3( 0.0 );',

        '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float b = mod( hex, PACKED_COLOR_SIZE );',

        '   c.r = r / PACKED_COLOR_DIVISOR;',
        '   c.g = g / PACKED_COLOR_DIVISOR;',
        '   c.b = b / PACKED_COLOR_DIVISOR;',

        '   c *= vec3( 2.0 );',
        '   c -= vec3( 1.0 );',

        '   return c;',
        '}',
    ].join( '\n' ),

    floatOverLifetime: [
        'float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {',
        '    highp float value = 0.0;',
        '    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );',
        '    float fIndex = 0.0;',
        '    float shouldApplyValue = 0.0;',

        '    value += attr[ 0 ] * when_eq( deltaAge, 0.0 );',
        '',
        '    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {',
        
        '       fIndex = float( i );',

        '       shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );',

        '       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );',
        '    }',
        '',
        '    return value;',
        '}',
    ].join( '\n' ),

    colorOverLifetime: [
        'vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {',
        '    vec3 value = vec3( 0.0 );',
        '    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );',
        '    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );',
        '    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );',
        '    return value;',
        '}',
    ].join( '\n' ),

    paramFetchingFunctions: [
        'float getAlive() {',
        '   return params.x;',
        
        '}',

        'float getAge() {',
        '   return params.y;',
        '}',

        'float getMaxAge() {',
        '   return params.z;',
        '}',

        'float getWiggle() {',
        '   return params.w;',
        '}',
    ].join( '\n' ),

    forceFetchingFunctions: [
        'vec4 getPosition( in float age ) {',
        '   return modelViewMatrix * vec4( position, 1.0 );',
        '}',

        'vec3 getVelocity( in float age ) {',
        '   return velocity * age;',
        '}',

        'vec3 getAcceleration( in float age ) {',
        '   return acceleration.xyz * age;',
        '}',
    ].join( '\n' ),


    rotationFunctions: [
        // Huge thanks to:
        // - http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
        '#ifdef SHOULD_ROTATE_PARTICLES',
        '   mat4 getRotationMatrix( in vec3 axis, in float angle) {',
        '       axis = normalize(axis);',
        '       float s = sin(angle);',
        '       float c = cos(angle);',
        '       float oc = 1.0 - c;',
        '',
        '       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,',
        '                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,',
        '                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,',
        '                   0.0,                                0.0,                                0.0,                                1.0);',
        '   }',
        '',
        '   vec3 getRotation( in vec3 pos, in float positionInTime ) {',
        '      if( rotation.y == 0.0 ) {',
        '           return pos;',
        '      }',
        '',
        '      vec3 axis = unpackRotationAxis( rotation.x );',
        '      vec3 center = rotationCenter;',
        '      vec3 translated;',
        '      mat4 rotationMatrix;',

        '      float angle = 0.0;',
        '      angle += when_eq( rotation.z, 0.0 ) * rotation.y;',
        '      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );',
        '      translated = rotationCenter - pos;',
        '      rotationMatrix = getRotationMatrix( axis, angle );',
        '      return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );',
        '   }',
        '#endif'
    ].join( '\n' ),


    // Fragment chunks
    rotateTexture: [
        '    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );',
        '',
        '    #ifdef SHOULD_ROTATE_TEXTURE',
        '       float x = gl_PointCoord.x - 0.5;',
        '       float y = 1.0 - gl_PointCoord.y - 0.5;',
        '       float c = cos( -vAngle );',
        '       float s = sin( -vAngle );',

        '       vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );',
        '    #endif',
        '',

        // Spritesheets overwrite angle calculations.
        '    #ifdef SHOULD_CALCULATE_SPRITE',
        '        float framesX = vSpriteSheet.x;',
        '        float framesY = vSpriteSheet.y;',
        '        float columnNorm = vSpriteSheet.z;',
        '        float rowNorm = vSpriteSheet.w;',

        '        vUv.x = gl_PointCoord.x * framesX + columnNorm;',
        '        vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);',
        '    #endif',

        '',
        '    vec4 rotatedTexture = texture2D( tex, vUv );',
    ].join( '\n' )
};

SPE.shaders = {
	vertex: [
		SPE.shaderChunks.defines,
		SPE.shaderChunks.uniforms,
		SPE.shaderChunks.attributes,
		SPE.shaderChunks.varyings,

		ShaderChunk.common,
		ShaderChunk.logdepthbuf_pars_vertex,
		ShaderChunk.fog_pars_vertex,

		SPE.shaderChunks.branchAvoidanceFunctions,
		SPE.shaderChunks.unpackColor,
		SPE.shaderChunks.unpackRotationAxis,
		SPE.shaderChunks.floatOverLifetime,
		SPE.shaderChunks.colorOverLifetime,
		SPE.shaderChunks.paramFetchingFunctions,
		SPE.shaderChunks.forceFetchingFunctions,
		SPE.shaderChunks.rotationFunctions,


		'void main() {',


		'    highp float age = getAge();',
		'    highp float alive = getAlive();',
		'    highp float maxAge = getMaxAge();',
		'    highp float positionInTime = (age / maxAge);',
		'    highp float isAlive = when_gt( alive, 0.0 );',

		'    #ifdef SHOULD_WIGGLE_PARTICLES',
		'        float wiggleAmount = positionInTime * getWiggle();',
		'        float wiggleSin = isAlive * sin( wiggleAmount );',
		'        float wiggleCos = isAlive * cos( wiggleAmount );',
		'    #endif',

		'    vec3 vel = getVelocity( age );',
		'    vec3 accel = getAcceleration( age );',
		'    vec3 force = vec3( 0.0 );',
		'    vec3 pos = vec3( position );',

		'    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;',

		'    force += vel;',
		'    force *= drag;',
		'    force += accel * age;',
		'    pos += force;',


		'    #ifdef SHOULD_WIGGLE_PARTICLES',
		'        pos.x += wiggleSin;',
		'        pos.y += wiggleCos;',
		'        pos.z += wiggleSin;',
		'    #endif',


		// Rotate the emitter around it's central point
		'    #ifdef SHOULD_ROTATE_PARTICLES',
		'        pos = getRotation( pos, positionInTime );',
		'    #endif',

		// Convert pos to a world-space value
		'    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',

		// Determine point size.
		'    highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;',

		// Determine perspective
		'    #ifdef HAS_PERSPECTIVE',
		'        float perspective = scale / length( mvPosition.xyz );',
		'    #else',
		'        float perspective = 1.0;',
		'    #endif',

		// Apply perpective to pointSize value
		'    float pointSizePerspective = pointSize * perspective;',


		//
		// Appearance
		//

		// Determine color and opacity for this particle
		'    #ifdef COLORIZE',
		'       vec3 c = isAlive * getColorOverLifetime(',
		'           positionInTime,',
		'           unpackColor( color.x ),',
		'           unpackColor( color.y ),',
		'           unpackColor( color.z ),',
		'           unpackColor( color.w )',
		'       );',
		'    #else',
		'       vec3 c = vec3(1.0);',
		'    #endif',

		'    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );',

		// Assign color to vColor varying.
		'    vColor = vec4( c, o );',

		// Determine angle
		'    #ifdef SHOULD_ROTATE_TEXTURE',
		'        vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );',
		'    #endif',

		// If this particle is using a sprite-sheet as a texture, we'll have to figure out
		// what frame of the texture the particle is using at it's current position in time.
		'    #ifdef SHOULD_CALCULATE_SPRITE',
		'        float framesX = textureAnimation.x;',
		'        float framesY = textureAnimation.y;',
		'        float loopCount = textureAnimation.w;',
		'        float totalFrames = textureAnimation.z;',
		'        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );',

		'        float column = floor(mod( frameNumber, framesX ));',
		'        float row = floor( (frameNumber - column) / framesX );',

		'        float columnNorm = column / framesX;',
		'        float rowNorm = row / framesY;',

		'        vSpriteSheet.x = 1.0 / framesX;',
		'        vSpriteSheet.y = 1.0 / framesY;',
		'        vSpriteSheet.z = columnNorm;',
		'        vSpriteSheet.w = rowNorm;',
		'    #endif',

		//
		// Write values
		//

		// Set PointSize according to size at current point in time.
		'    gl_PointSize = pointSizePerspective;',
		'    gl_Position = projectionMatrix * mvPosition;',

		ShaderChunk.logdepthbuf_vertex,
		ShaderChunk.fog_vertex,

		'}'
	].join( '\n' ),

	fragment: [
		SPE.shaderChunks.uniforms,

		ShaderChunk.common,
		ShaderChunk.fog_pars_fragment,
		ShaderChunk.logdepthbuf_pars_fragment,

		SPE.shaderChunks.varyings,

		SPE.shaderChunks.branchAvoidanceFunctions,

		'void main() {',
		'    vec3 outgoingLight = vColor.xyz;',
		'    ',
		'    #ifdef ALPHATEST',
		'       if ( vColor.w < float(ALPHATEST) ) discard;',
		'    #endif',

		SPE.shaderChunks.rotateTexture,

		ShaderChunk.logdepthbuf_fragment,

		'    outgoingLight = vColor.xyz * rotatedTexture.xyz;',
		'    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );',

		ShaderChunk.fog_fragment,

		'}'
	].join( '\n' )
};

SPE.utils = {
    /**
     * A map of types used by `SPE.utils.ensureTypedArg` and
     * `SPE.utils.ensureArrayTypedArg` to compare types against.
     *
     * @enum {String}
     */
    types: {
        /**
         * Boolean type.
      
         * @type {String}
         */
        BOOLEAN: 'boolean',

        /**
         * String type.

         * @type {String}
         */
        STRING: 'string',

        /**
         * Number type.
         * @type {String}
      
         */
        NUMBER: 'number',

        /**
         * Object type.
         * @type {String}
         */
        OBJECT: 'object'
    },

    ensureTypedArg: function( arg, type, defaultValue ) {
        'use strict';

        if ( typeof arg === type ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureArrayTypedArg: function( arg, type, defaultValue ) {
        'use strict';

        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( typeof arg[ i ] !== type ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureTypedArg( arg, type, defaultValue );
    },

    ensureInstanceOf: function( arg, instance, defaultValue ) {
        'use strict';

        if ( instance !== undefined && arg instanceof instance ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureArrayInstanceOf: function( arg, instance, defaultValue ) {
        'use strict';

        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( instance !== undefined && arg[ i ] instanceof instance === false ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureInstanceOf( arg, instance, defaultValue );
    },

    ensureValueOverLifetimeCompliance: function( property, minLength, maxLength ) {
        'use strict';

        minLength = minLength || 3;
        maxLength = maxLength || 3;

        // First, ensure both properties are arrays.
        if ( Array.isArray( property._value ) === false ) {
            property._value = [ property._value ];
        }

        if ( Array.isArray( property._spread ) === false ) {
            property._spread = [ property._spread ];
        }

        var valueLength = this.clamp( property._value.length, minLength, maxLength ),
            spreadLength = this.clamp( property._spread.length, minLength, maxLength ),
            desiredLength = Math.max( valueLength, spreadLength );

        if ( property._value.length !== desiredLength ) {
            property._value = this.interpolateArray( property._value, desiredLength );

        }


        if ( property._spread.length !== desiredLength ) {
            property._spread = this.interpolateArray( property._spread, desiredLength );
        }
    },

    interpolateArray: function( srcArray, newLength ) {
        'use strict';


        var sourceLength = srcArray.length,
            newArray = [ typeof srcArray[ 0 ].clone === 'function' ? srcArray[ 0 ].clone() : srcArray[ 0 ] ],
            factor = ( sourceLength - 1 ) / ( newLength - 1 );


        for ( var i = 1; i < newLength - 1; ++i ) {
            var f = i * factor,
      
                before = Math.floor( f ),

                after = Math.ceil( f ),
                delta = f - before;

            newArray[ i ] = this.lerpTypeAgnostic( srcArray[ before ], srcArray[ after ], delta );
        }

        newArray.push(
            typeof srcArray[ sourceLength - 1 ].clone === 'function' ?
            srcArray[ sourceLength - 1 ].clone() :
            srcArray[ sourceLength - 1 ]
        );

        return newArray;
    },

    clamp: function( value, min, max ) {
        'use strict';

        return Math.max( min, Math.min( value, max ) );
    },

    zeroToEpsilon: function( value, randomise ) {
        'use strict';

        var epsilon = 0.00001,
            result = value;

        result = randomise ? Math.random() * epsilon * 10 : epsilon;

        if ( value < 0 && value > -epsilon ) {
            result = -result;
        }

        // if ( value === 0 ) {

        //     r
        esult = randomise ? Math.random() * epsilon * 10 : epsilon;
        // }
        // else if ( value > 0 && value < epsilon ) {
        //     result = randomise ? Math.random() * epsilon * 10 : epsilon;
        // }
        // else if ( value < 0 && value > -epsilon ) {
        //     result = -( randomise ? Math.random() * epsilon * 10 : epsilon );
        // }


        return result;
    },

    lerpTypeAgnostic: function( start, end, delta ) {
        'use strict';

        var types = this.types,
            out;

        if ( typeof start === types.NUMBER && typeof end === types.NUMBER ) {
            return start + ( ( end - start ) * delta );
        }
        else if ( start instanceof Vector2 && end instanceof Vector2 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            return out;
        }
        else if ( start instanceof Vector3 && end instanceof Vector3 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            return out;
        }
        else if ( start instanceof Vector4 && end instanceof Vector4 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            out.w = this.lerp( start.w, end.w, delta );
            return out;
        }
        else if ( start instanceof Color && end instanceof Color ) {
            out = start.clone();
            out.r = this.lerp( start.r, end.r, delta );
            out.g = this.lerp( start.g, end.g, delta );
            out.b = this.lerp( start.b, end.b, delta );
            return out;
        }
        else {
            console.warn( 'Invalid argument types, or argument types do not match:', start, end );
        }
    },

   
    lerp: function( start, end, delta ) {
        'use strict';
        return start + ( ( end - start ) * delta );
    },

    roundToNearestMultiple: function( n, multiple ) {
        'use strict';

        var remainder = 0;

        if ( multiple === 0 ) {
            return n;
        }

        remainder = Math.abs( n ) % multiple;

        if ( remainder === 0 ) {
            return n;
        }

        if ( n < 0 ) {
            return -( Math.abs( n ) - remainder );
        }

        return n + multiple - remainder;
    },

    arrayValuesAreEqual: function( array ) {
        'use strict';

        for ( var i = 0; i < array.length - 1; ++i ) {
            if ( array[ i ] !== array[ i + 1 ] ) {
                return false;

            }
        }

        return true;
    },

    
    randomFloat: function( base, spread ) {
        'use strict';
        return base + spread * ( Math.random() - 0.5 );
    },



 
    randomVector3: function( attribute, index, base, spread, spreadClamp ) {

        'use strict';


        var x = base
        .x + ( Math.random() * spread.x - ( spread.x * 0.5 ) ),

            y = base.y + ( Math.random() * spread.y - ( spread.y * 0.5 ) ),
            z = base.z + ( Math.random() * spread.z - ( spread.z * 0.5 ) );

        // var x = this.randomFloat( base.x, spread.x ),
        // y = this.randomFloat( base.y, spread.y ),
        // z = this.randomFloat( base.z, spread.z );



        if ( spreadClamp ) {
            x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple( x, spreadClamp.x );
            y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple( y, spreadClamp.y );
            z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple( z, spreadClamp.z );
        }

        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomColor: function( attribute, index, base, spread ) {
        'use strict';

        var r = base.r + ( Math.random() * spread.x ),
            g = base.g + ( Math.random() * spread.y ),
            b = base.b + ( Math.random() * spread.z );

        r = this.clamp( r, 0, 1 );
        g = this.clamp( g, 0, 1 );
        b = this.clamp( b, 0, 1 );


        attribute.typedArray.setVec3Components( index, r, g, b );
    },


    randomColorAsHex: ( function() {
        'use strict';

        var workingColor = new Color();


      
        return function( attribute, index, base, spread ) {
            var numItems = base.length,
                colors = [];

            for ( var i = 0; i < numItems; ++i ) {
                var spreadVector = spread[ i ];

                workingColor.copy( base[ i ] );

                workingColor.r += ( Math.random() * spreadVector.x ) - ( spreadVector.x * 0.5 );
                workingColor.g += ( Math.random() * spreadVector.y ) - ( spreadVector.y * 0.5 );
                workingColor.b += ( Math.random() * spreadVector.z ) - ( spreadVector.z * 0.5 );

                workingColor.r = this.clamp( workingColor.r, 0, 1 );
                workingColor.g = this.clamp( workingColor.g, 0, 1 );
                workingColor.b = this.clamp( workingColor.b, 0, 1 );

                colors.push( workingColor.getHex() );
            }

            attribute.typedArray.setVec4Components( index, colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 3 ] );
        };
    }() ),

   
    randomVector3OnLine: function( attribute, index, start, end ) {
        'use strict';
        var pos = start.clone();

        pos.lerp( end, Math.random() );

        attribute.typedArray.setVec3Components( index, pos.x, pos.y, pos.z );
    },

    
    randomVector3OnSphere: function(
        attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp, distributionClamp
    ) {
        'use strict';

        var depth = 2 * Math.random() - 1,
            t = 6.2832 * Math.random(),

            r = Math.sqrt( 1 - depth * depth ),
            rand = this.randomFloat( radius, radiusSpread ),
            x = 0,
            y = 0,
            z = 0;


        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }



        // Set position on sphere
        x = r * Math.cos( t ) * rand;
        y = r * Math.sin( t ) * rand;
        z = depth * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;
        z *= radiusScale.z;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    seededRandom: function( seed ) {
        var x = Math.sin( seed ) * 10000;
        return x - ( x | 0 );
    },




    randomVector3OnDisc: function( attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        'use strict';

        var t = 6.2832 * Math.random(),
            rand = Math.abs( this.randomFloat( radius, radiusSpread ) ),
            x = 0,
            y = 0,
            z = 0;

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = Math.cos( t ) * rand;
        y = Math.sin( t ) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomDirectionVector3OnSphere: ( function() {
        'use strict';

        var v = new Vector3();

        return function( attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread ) {
            v.copy( emitterPosition );

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar( -this.randomFloat( speed, speedSpread ) );


            attribute.typedArray.setVec3Components( index, v.x, v.y, v.z );
        };
    }() ),


    randomDirectionVector3OnDisc: ( function() {
        'use strict';

        var v = new Vector3();

        return function( attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread ) {
            v.copy( emitterPosition );

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar( -this.randomFloat( speed, speedSpread ) );

            attribute.typedArray.setVec3Components( index, v.x, v.y, 0 );
        };
    }() ),

    getPackedRotationAxis: ( function() {
        'use strict';

        var v = new Vector3(),
            vSpread = new Vector3(),
            c = new Color(),
            addOne = new Vector3( 1, 1, 1 );

        
        return function( axis, axisSpread ) {
            v.copy( axis ).normalize();
            vSpread.copy( axisSpread ).normalize();

            v.x += ( -axisSpread.x * 0.5 ) + ( Math.random() * axisSpread.x );
            v.y += ( -axisSpread.y * 0.5 ) + ( Math.random() * axisSpread.y );
            v.z += ( -axisSpread.z * 0.5 ) + ( Math.random() * axisSpread.z );

            // v.x = Math.abs( v.x );
            // v.y = Math.abs( v.y );
            // v.z = Math.abs( v.z );

            v.normalize().add( addOne ).multiplyScalar( 0.5 );

            c.setRGB( v.x, v.y, v.z );

            return c.getHex();
        };
    }() )
};

SPE.Group = function( options ) {
    'use strict';

    var utils = SPE.utils,
        types = utils.types;

    // Ensure we have a map of options to play with
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.texture = utils.ensureTypedArg( options.texture, types.OBJECT, {} );

    // Assign a UUID to this instance
    this.uuid = xMath.generateUUID();

    // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
    // the value of this property will be used to advance the simulation.
    this.fixedTimeStep = utils.ensureTypedArg( options.fixedTimeStep, types.NUMBER, 0.016 );

    // Set properties used in the uniforms map, starting with the
    // texture stuff.
    this.texture = utils.ensureInstanceOf( options.texture.value, Texture, null );
    this.textureFrames = utils.ensureInstanceOf( options.texture.frames, Vector2, new Vector2( 1, 1 ) );
    this.textureFrameCount = utils.ensureTypedArg( options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y );
    this.textureLoop = utils.ensureTypedArg( options.texture.loop, types.NUMBER, 1 );
    this.textureFrames.max( new Vector2( 1, 1 ) );

    this.hasPerspective = utils.ensureTypedArg( options.hasPerspective, types.BOOLEAN, true );
    this.colorize = utils.ensureTypedArg( options.colorize, types.BOOLEAN, true );

    this.maxParticleCount = utils.ensureTypedArg( options.maxParticleCount, types.NUMBER, null );


    // Set properties used to define the ShaderMaterial's appearance.
    this.blending = utils.ensureTypedArg( options.blending, types.NUMBER, AdditiveBlending );
    this.transparent = utils.ensureTypedArg( options.transparent, types.BOOLEAN, true );
    this.alphaTest = parseFloat( utils.ensureTypedArg( options.alphaTest, types.NUMBER, 0.0 ) );
    this.depthWrite = utils.ensureTypedArg( options.depthWrite, types.BOOLEAN, false );
    this.depthTest = utils.ensureTypedArg( options.depthTest, types.BOOLEAN, true );
    this.fog = utils.ensureTypedArg( options.fog, types.BOOLEAN, true );
    this.scale = utils.ensureTypedArg( options.scale, types.NUMBER, 300 );

    // Where emitter's go to curl up in a warm blanket and live
    // out their days.
    this.emitters = [];
    this.emitterIDs = [];

    // Create properties for use by the emitter pooling functions.
    this._pool = [];
    this._poolCreationSettings = null;
    this._createNewWhenPoolEmpty = 0;

    // Whether all attributes should be forced to updated
    // their entire buffer contents on the next tick.
    //
    // Used when an emitter is removed.
    this._attributesNeedRefresh = false;
    this._attributesNeedDynamicReset = false;

    this.particleCount = 0;


    // Map of uniforms to be applied to the ShaderMaterial instance.
    this.uniforms = {
        tex: {
            type: 't',
            value: this.texture
        },
        textureAnimation: {
            type: 'v4',
            value: new Vector4(
                this.textureFrames.x,
                this.textureFrames.y,
                this.textureFrameCount,
                Math.max( Math.abs( this.textureLoop ), 1.0 )
            )
        },
        fogColor: {
            type: 'c',
            value: this.fog ? new Color() : null
        },
        fogNear: {
            type: 'f',
            value: 10
        },
        fogFar: {
            type: 'f',
            value: 200
        },
        fogDensity: {
            type: 'f',
            value: 0.5
        },
        deltaTime: {
            type: 'f',
            value: 0
        },
        runTime: {
            type: 'f',
            value: 0
        },
        scale: {
            type: 'f',
            value: this.scale
        }
    };

    // Add some defines into the mix...
    this.defines = {
        HAS_PERSPECTIVE: this.hasPerspective,
        COLORIZE: this.colorize,
        VALUE_OVER_LIFETIME_LENGTH: SPE.valueOverLifetimeLength,

        SHOULD_ROTATE_TEXTURE: false,
        SHOULD_ROTATE_PARTICLES: false,
        SHOULD_WIGGLE_PARTICLES: false,

        SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
    };

    // Map of all attributes to be applied to the particles.
    //
    // See SPE.ShaderAttribute for a bit more info on this bit.
    this.attributes = {
        position: new SPE.ShaderAttribute( 'v3', true ),
        acceleration: new SPE.ShaderAttribute( 'v4', true ), // w component is drag
        velocity: new SPE.ShaderAttribute( 'v3', true ),
        rotation: new SPE.ShaderAttribute( 'v4', true ),
        rotationCenter: new SPE.ShaderAttribute( 'v3', true ),
        params: new SPE.ShaderAttribute( 'v4', true ), // Holds (alive, age, delay, wiggle)
        size: new SPE.ShaderAttribute( 'v4', true ),
        angle: new SPE.ShaderAttribute( 'v4', true ),
        color: new SPE.ShaderAttribute( 'v4', true ),
        opacity: new SPE.ShaderAttribute( 'v4', true )
    };

    this.attributeKeys = Object.keys( this.attributes );
    this.attributeCount = this.attributeKeys.length;

    // Create the ShaderMaterial instance that'll help render the
    // particles.
    this.material = new ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: SPE.shaders.vertex,
        fragmentShader: SPE.shaders.fragment,
        blending: this.blending,
        transparent: this.transparent,
        alphaTest: this.alphaTest,
        depthWrite: this.depthWrite,
        depthTest: this.depthTest,
        defines: this.defines,
        fog: this.fog
    } );

    // Create the BufferGeometry and Points instances, ensuring
    // the geometry and material are given to the latter.
    this.geometry = new BufferGeometry();
    this.mesh = new Points( this.geometry, this.material );

    if ( this.maxParticleCount === null ) {
        console.warn( 'SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.' );
    }
};

SPE.Group.constructor = SPE.Group;


SPE.Group.prototype._updateDefines = function() {
    'use strict';

    var emitters = this.emitters,
        i = emitters.length - 1,
        emitter,
        defines = this.defines;

    for ( i; i >= 0; --i ) {
        emitter = emitters[ i ];

        // Only do angle calculation if there's no spritesheet defined.
        //
        // Saves calculations being done and then overwritten in the shaders.
        if ( !defines.SHOULD_CALCULATE_SPRITE ) {
            defines.SHOULD_ROTATE_TEXTURE = defines.SHOULD_ROTATE_TEXTURE || !!Math.max(
                Math.max.apply( null, emitter.angle.value ),
                Math.max.apply( null, emitter.angle.spread )
            );
        }

        defines.SHOULD_ROTATE_PARTICLES = defines.SHOULD_ROTATE_PARTICLES || !!Math.max(
            emitter.rotation.angle,
            emitter.rotation.angleSpread
        );

        defines.SHOULD_WIGGLE_PARTICLES = defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(
            emitter.wiggle.value,
            emitter.wiggle.spread
        );
    }

    this.material.needsUpdate = true;
};

SPE.Group.prototype._applyAttributesToGeometry = function() {
    'use strict';
    var attributes = this.attributes,
        geometry = this.geometry,
        geometryAttributes = geometry.attributes,
        attribute,
        geometryAttribute;

    for ( var attr in attributes ) {
        if ( attributes.hasOwnProperty( attr ) ) {
            attribute = attributes[ attr ];
            geometryAttribute = geometryAttributes[ attr ];

            if ( geometryAttribute ) {
                geometryAttribute.array = attribute.typedArray.array;
            } else {
                geometry.setAttribute( attr, attribute.bufferAttribute );
            }
            attribute.bufferAttribute.needsUpdate = true;
        }
    }
    this.geometry.setDrawRange( 0, this.particleCount );
};

SPE.Group.prototype.addEmitter = function( emitter ) {
    'use strict';
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    } else if ( this.emitterIDs.indexOf( emitter.uuid ) > -1 ) {
        console.error( 'Emitter already exists in this group. Will not add again.' );
        return;
    } else if ( emitter.group !== null ) {
        console.error( 'Emitter already belongs to another group. Will not add to requested group.' );
        return;
    }

    var attributes = this.attributes,
        start = this.particleCount,
        end = start + emitter.particleCount;
    this.particleCount = end;

    if ( this.maxParticleCount !== null && this.particleCount > this.maxParticleCount ) {
        console.warn( 'SPE.Group: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount );
    }
    emitter._calculatePPSValue( emitter.maxAge._value + emitter.maxAge._spread );
    emitter._setBufferUpdateRanges( this.attributeKeys );
    emitter._setAttributeOffset( start );
    emitter.group = this;
    emitter.attributes = this.attributes;

    for ( var attr in attributes ) {
        if ( attributes.hasOwnProperty( attr ) ) {
            attributes[ attr ]._createBufferAttribute(
                this.maxParticleCount !== null ?
                this.maxParticleCount :
                this.particleCount
            );
        }
    }

    for ( var i = start; i < end; ++i ) {
        emitter._assignPositionValue( i );
        emitter._assignForceValue( i, 'velocity' );
        emitter._assignForceValue( i, 'acceleration' );
        emitter._assignAbsLifetimeValue( i, 'opacity' );
        emitter._assignAbsLifetimeValue( i, 'size' );
        emitter._assignAngleValue( i );
        emitter._assignRotationValue( i );
        emitter._assignParamsValue( i );
        emitter._assignColorValue( i );
    }

    this._applyAttributesToGeometry();
    this.emitters.push( emitter );
    this.emitterIDs.push( emitter.uuid );
    this._updateDefines( emitter );
    this.material.needsUpdate = true;
    this.geometry.needsUpdate = true;
    this._attributesNeedRefresh = true;
    return this;
};

SPE.Group.prototype.removeEmitter = function( emitter ) {
    'use strict';

    var emitterIndex = this.emitterIDs.indexOf( emitter.uuid );
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    } else if ( emitterIndex === -1 ) {
        console.error( 'Emitter does not exist in this group. Will not remove.' );
        return;
    }
    var start = emitter.attributeOffset,
        end = start + emitter.particleCount,
        params = this.attributes.params.typedArray;
    for ( var i = start; i < end; ++i ) {
        params.array[ i * 4 ] = 0.0;
        params.array[ i * 4 + 1 ] = 0.0;
    }
    this.emitters.splice( emitterIndex, 1 );
    this.emitterIDs.splice( emitterIndex, 1 );
    for ( var attr in this.attributes ) {
        if ( this.attributes.hasOwnProperty( attr ) ) {
            this.attributes[ attr ].splice( start, end );
        }
    }
    this.particleCount -= emitter.particleCount;
    emitter._onRemove();
    this._attributesNeedRefresh = true;
};

SPE.Group.prototype.getFromPool = function() {
    'use strict';

    var pool = this._pool,
        createNew = this._createNewWhenPoolEmpty;

    if ( pool.length ) {
        return pool.pop();
    }
    else if ( createNew ) {
        var emitter = new SPE.Emitter( this._poolCreationSettings );

        this.addEmitter( emitter );

        return emitter;
    }

    return null;
};

SPE.Group.prototype.releaseIntoPool = function( emitter ) {
    'use strict';

    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( 'Argument is not instanceof SPE.Emitter:', emitter );
        return;
    }

    emitter.reset();
    this._pool.unshift( emitter );


    return this;

};

SPE.Group.prototype.getPool = function() {
    'use strict';

    return this._pool;
};

SPE.Group.prototype.addPool = function( numEmitters, emitterOptions, createNew ) {
    'use strict';
    var emitter;
    this._poolCreationSettings = emitterOptions;
    this._createNewWhenPoolEmpty = !!createNew;
    for ( var i = 0; i < numEmitters; ++i ) {
        if ( Array.isArray( emitterOptions ) ) {
            emitter = new SPE.Emitter( emitterOptions[ i ] );
        }
        else {
            emitter = new SPE.Emitter( emitterOptions );
        }
        this.addEmitter( emitter );
        this.releaseIntoPool( emitter );
    }
    return this;
};

SPE.Group.prototype._triggerSingleEmitter = function( pos ) {
    'use strict';
    var emitter = this.getFromPool(),
        self = this;
    if ( emitter === null ) {
        console.log( 'SPE.Group pool ran out.' );
        return;
  
    }
    if ( pos instanceof Vector3 ) {
        emitter.position.value.copy( pos );
        emitter.position.value = emitter.position.value;
    }

    emitter.enable();

    setTimeout( function() {
        emitter.disable();
        self.releaseIntoPool( emitter );
    }, ( Math.max( emitter.duration, ( emitter.maxAge.value + emitter.maxAge.spread ) ) ) * 1000 );

    return this;
};

SPE.Group.prototype.triggerPoolEmitter = function( numEmitters, position ) {
    'use strict';
    if ( typeof numEmitters === 'number' && numEmitters > 1 ) {
        for ( var i = 0; i < numEmitters; ++i ) {
            this._triggerSingleEmitter( position );
        }
    } else {
        this._triggerSingleEmitter( position );
    }
    return this;
};

SPE.Group.prototype._updateUniforms = function( dt ) {
    'use strict';
    this.uniforms.runTime.value += dt;
    this.uniforms.deltaTime.value = dt;
};

SPE.Group.prototype._resetBufferRanges = function() {
    'use strict';
    var keys = this.attributeKeys,
        i = this.attributeCount - 1,
        attrs = this.attributes;

    for ( i; i >= 0; --i ) {
        attrs[ keys[ i ] ].resetUpdateRange();
    }
};

SPE.Group.prototype._updateBuffers = function( emitter ) {
    'use strict';
    var keys = this.attributeKeys,
        i = this.attributeCount - 1,
        attrs = this.attributes,
        emitterRanges = emitter.bufferUpdateRanges,
        key,
        emitterAttr,
        attr;
    for ( i; i >= 0; --i ) {
        key = keys[ i ];
        emitterAttr = emitterRanges[ key ];
        attr = attrs[ key ];
        attr.setUpdateRange( emitterAttr.min, emitterAttr.max );
        attr.flagUpdate();
    }
};

SPE.Group.prototype.tick = function( dt ) {
    'use strict';
    var emitters = this.emitters,
        numEmitters = emitters.length,
        deltaTime = dt || this.fixedTimeStep,
        keys = this.attributeKeys,
        i,
        attrs = this.attributes;

    this._updateUniforms( deltaTime );
    this._resetBufferRanges();

    if (
        numEmitters === 0 &&
        this._attributesNeedRefresh === false &&
        this._attributesNeedDynamicReset === false
    ){
        return;
    }

    for ( var i = 0, emitter; i < numEmitters; ++i ){
        emitter = emitters[ i ];
        emitter.tick( deltaTime );
        this._updateBuffers( emitter );
    }

    if ( this._attributesNeedDynamicReset === true ) {
        i = this.attributeCount - 1;

        for ( i; i >= 0; --i ) {
            attrs[ keys[ i ] ].resetDynamic();
        }

        this._attributesNeedDynamicReset = false;
    }

    if ( this._attributesNeedRefresh === true ) {
        i = this.attributeCount - 1;

        for ( i; i >= 0; --i ) {
            attrs[ keys[ i ] ].forceUpdateAll();
        }

        this._attributesNeedRefresh = false;
        this._attributesNeedDynamicReset = true;
    }
};

SPE.Group.prototype.dispose = function() {
    'use strict';
    this.geometry.dispose();
    this.material.dispose();
    return this;
};

SPE.Emitter = function( options ) {
    'use strict';

    var utils = SPE.utils,
        types = utils.types,
        lifetimeLength = SPE.valueOverLifetimeLength;

    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.position = utils.ensureTypedArg( options.position, types.OBJECT, {} );
    options.velocity = utils.ensureTypedArg( options.velocity, types.OBJECT, {} );
    options.acceleration = utils.ensureTypedArg( options.acceleration, types.OBJECT, {} );
    options.radius = utils.ensureTypedArg( options.radius, types.OBJECT, {} );
    options.drag = utils.ensureTypedArg( options.drag, types.OBJECT, {} );
    options.rotation = utils.ensureTypedArg( options.rotation, types.OBJECT, {} );
    options.color = utils.ensureTypedArg( options.color, types.OBJECT, {} );
    options.opacity = utils.ensureTypedArg( options.opacity, types.OBJECT, {} );
    options.size = utils.ensureTypedArg( options.size, types.OBJECT, {} );
    options.angle = utils.ensureTypedArg( options.angle, types.OBJECT, {} );
    options.wiggle = utils.ensureTypedArg( options.wiggle, types.OBJECT, {} );
    options.maxAge = utils.ensureTypedArg( options.maxAge, types.OBJECT, {} );

    if ( options.onParticleSpawn ) {
        console.warn( 'onParticleSpawn has been removed. Please set properties directly to alter values at runtime.' );
    }

    this.uuid = xMath.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.distributions.BOX );

    this.position = {
        _value: utils.ensureInstanceOf( options.position.value, Vector3, new Vector3() ),
        _spread: utils.ensureInstanceOf( options.position.spread, Vector3, new Vector3() ),
        _spreadClamp: utils.ensureInstanceOf( options.position.spreadClamp, Vector3, new Vector3() ),
        _distribution: utils.ensureTypedArg( options.position.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false ),
        _radius: utils.ensureTypedArg( options.position.radius, types.NUMBER, 10 ),
        _radiusScale: utils.ensureInstanceOf( options.position.radiusScale, Vector3, new Vector3( 1, 1, 1 ) ),
        _distributionClamp: utils.ensureTypedArg( options.position.distributionClamp, types.NUMBER, 0 ),
    };

    this.velocity = {
        _value: utils.ensureInstanceOf( options.velocity.value, Vector3, new Vector3() ),
        _spread: utils.ensureInstanceOf( options.velocity.spread, Vector3, new Vector3() ),
        _distribution: utils.ensureTypedArg( options.velocity.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.acceleration = {
        _value: utils.ensureInstanceOf( options.acceleration.value, Vector3, new Vector3() ),
        _spread: utils.ensureInstanceOf( options.acceleration.spread, Vector3, new Vector3() ),
        _distribution: utils.ensureTypedArg( options.acceleration.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.drag = {
        _value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.wiggle = {
        _value: utils.ensureTypedArg( options.wiggle.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.wiggle.spread, types.NUMBER, 0 )
    };

    this.rotation = {
        _axis: utils.ensureInstanceOf( options.rotation.axis, Vector3, new Vector3( 0.0, 1.0, 0.0 ) ),
        _axisSpread: utils.ensureInstanceOf( options.rotation.axisSpread, Vector3, new Vector3() ),
        _angle: utils.ensureTypedArg( options.rotation.angle, types.NUMBER, 0 ),
        _angleSpread: utils.ensureTypedArg( options.rotation.angleSpread, types.NUMBER, 0 ),
        _static: utils.ensureTypedArg( options.rotation.static, types.BOOLEAN, false ),
        _center: utils.ensureInstanceOf( options.rotation.center, Vector3, this.position._value.clone() ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };


    this.maxAge = {
        _value: utils.ensureTypedArg( options.maxAge.value, types.NUMBER, 2 ),
        _spread: utils.ensureTypedArg( options.maxAge.spread, types.NUMBER, 0 )
    };

    this.color = {
        _value: utils.ensureArrayInstanceOf( options.color.value, Color, new Color() ),
        _spread: utils.ensureArrayInstanceOf( options.color.spread, Vector3, new Vector3() ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.opacity = {
        _value: utils.ensureArrayTypedArg( options.opacity.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.opacity.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.size = {
        _value: utils.ensureArrayTypedArg( options.size.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.size.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.angle = {
        _value: utils.ensureArrayTypedArg( options.angle.value, types.NUMBER, 0 ),
        _spread: utils.ensureArrayTypedArg( options.angle.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.particleCount = utils.ensureTypedArg( options.particleCount, types.NUMBER, 100 );
    this.duration = utils.ensureTypedArg( options.duration, types.NUMBER, null );
    this.isStatic = utils.ensureTypedArg( options.isStatic, types.BOOLEAN, false );
    this.activeMultiplier = utils.ensureTypedArg( options.activeMultiplier, types.NUMBER, 1 );
    this.direction = utils.ensureTypedArg( options.direction, types.NUMBER, 1 );

    this.alive = utils.ensureTypedArg( options.alive, types.BOOLEAN, true );


    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;

    // The current particle index for which particles should
    // be marked as active on the next update cycle.
    this.activationIndex = 0;

    // The offset in the typed arrays this emitter's
    // particle's values will start at
    this.attributeOffset = 0;

    // The end of the range in the attribute buffers
    this.attributeEnd = 0;



    // Holds the time the emitter has been alive for.
    this.age = 0.0;

    // Holds the number of currently-alive particles
    this.activeParticleCount = 0.0;

    // Holds a reference to this emitter's group once
    // it's added to one.
    this.group = null;

    // Holds a reference to this emitter's group's attributes object
    // for easier access.
    this.attributes = null;

    // Holds a reference to the params attribute's typed array
    // for quicker access.
    this.paramsArray = null;

 
    this.resetFlags = {
        // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
        //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
        position: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.radius.randomise, types.BOOLEAN, false ),
        velocity: utils.ensureTypedArg( options.velocity.randomise, types.BOOLEAN, false ),
        acceleration: utils.ensureTypedArg( options.acceleration.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.drag.randomise, types.BOOLEAN, false ),
        rotation: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        rotationCenter: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        size: utils.ensureTypedArg( options.size.randomise, types.BOOLEAN, false ),
        color: utils.ensureTypedArg( options.color.randomise, types.BOOLEAN, false ),
        opacity: utils.ensureTypedArg( options.opacity.randomise, types.BOOLEAN, false ),
        angle: utils.ensureTypedArg( options.angle.randomise, types.BOOLEAN, false )
    };

    this.updateFlags = {};
    this.updateCounts = {};

    this.updateMap = {
        maxAge: 'params',
        position: 'position',
        velocity: 'velocity',
        acceleration: 'acceleration',
        drag: 'acceleration',
        wiggle: 'params',
        rotation: 'rotation',
        size: 'size',
        color: 'color',
        opacity: 'opacity',
        angle: 'angle'
    };

    for ( var i in this.updateMap ) {
        if ( this.updateMap.hasOwnProperty( i ) ) {
            this.updateCounts[ this.updateMap[ i ] ] = 0.0;
            this.updateFlags[ this.updateMap[ i ] ] = false;
            this._createGetterSetters( this[ i ], i );
        }
    }

    this.bufferUpdateRanges = {};
    this.attributeKeys = null;
    this.attributeCount = 0;

    utils.ensureValueOverLifetimeCompliance( this.color, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.opacity, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.size, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.angle, lifetimeLength, lifetimeLength );
};

SPE.Emitter.constructor = SPE.Emitter;

SPE.Emitter.prototype._createGetterSetters = function( propObj, propName ) {
    'use strict';

    var self = this;

    for ( var i in propObj ) {
        if ( propObj.hasOwnProperty( i ) ) {

            var name = i.replace( '_', '' );

            Object.defineProperty( propObj, name, {
                get: ( function( prop ) {
                    return function() {
                        return this[ prop ];
                    };
                }( i ) ),

                set: ( function( prop ) {
                    return function( value ) {
                        var mapName = self.updateMap[ propName ],
                            prevValue = this[ prop ],
                            length = SPE.valueOverLifetimeLength;

                        if ( prop === '_rotationCenter' ) {
                            self.updateFlags.rotationCenter = true;
                            self.updateCounts.rotationCenter = 0.0;
                        }
                        else if ( prop === '_randomise' ) {
                            self.resetFlags[ mapName ] = value;
                        }
                        else {
                            self.updateFlags[ mapName ] = true;
                            self.updateCounts[ mapName ] = 0.0;
                        }

                        self.group._updateDefines();

                        this[ prop ] = value;

                        if ( Array.isArray( prevValue ) ) {
                            SPE.utils.ensureValueOverLifetimeCompliance( self[ propName ], length, length );
                        }
                    };
                }( i ) )
            } );
        }
    }
};

SPE.Emitter.prototype._setBufferUpdateRanges = function( keys ) {
    'use strict';

    this.attributeKeys = keys;
    this.attributeCount = keys.length;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        this.bufferUpdateRanges[ keys[ i ] ] = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
    }
};

SPE.Emitter.prototype._calculatePPSValue = function( groupMaxAge ) {
    'use strict';

    var particleCount = this.particleCount;

    if ( this.duration ) {
        this.particlesPerSecond = particleCount / ( groupMaxAge < this.duration ? groupMaxAge : this.duration );
    } else {
        this.particlesPerSecond = particleCount / groupMaxAge;
    }
};

SPE.Emitter.prototype._setAttributeOffset = function( startIndex ) {
    this.attributeOffset = startIndex;
    this.activationIndex = startIndex;
    this.activationEnd = startIndex + this.particleCount;
};

SPE.Emitter.prototype._assignValue = function( prop, index ) {
    'use strict';

    switch ( prop ) {
        case 'position':
            this._assignPositionValue( index );
            break;

        case 'velocity':
        case 'acceleration':
            this._assignForceValue( index, prop );
            break;

        case 'size':
        case 'opacity':
            this._assignAbsLifetimeValue( index, prop );
            break;

        case 'angle':
            this._assignAngleValue( index );
            break;

        case 'params':
            this._assignParamsValue( index );
            break;

        case 'rotation':
            this._assignRotationValue( index );
            break;

        case 'color':
            this._assignColorValue( index );
            break;
    }
};

SPE.Emitter.prototype._assignPositionValue = function( index ) {
    'use strict';

    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.position,
        attr = this.attributes.position,
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( attr, index, value, spread, prop._spreadClamp );
            break;

        case distributions.SPHERE:
            utils.randomVector3OnSphere( attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x, prop._distributionClamp || this.particleCount );
            break;

        case distributions.DISC:
            utils.randomVector3OnDisc( attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x );
            break;

        case distributions.LINE:
            utils.randomVector3OnLine( attr, index, value, spread );
            break;
    }
};

SPE.Emitter.prototype._assignForceValue = function( index, attrName ) {
    'use strict';

    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this[ attrName ],
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution,
        pos,
        positionX,
        positionY,
        positionZ,
        i;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( this.attributes[ attrName ], index, value, spread );
            break;

        case distributions.SPHERE:
            pos = this.attributes.position.typedArray.array;
            i = index * 3;

            positionX = pos[ i ];
            positionY = pos[ i + 1 ];
            positionZ = pos[ i + 2 ];

            utils.randomDirectionVector3OnSphere(
                this.attributes[ attrName ], index,
                positionX, positionY, positionZ,
                this.position._value,
                prop._value.x,
                prop._spread.x
            );
            break;

        case distributions.DISC:
            pos = this.attributes.position.typedArray.array;
            i = index * 3;

            positionX = pos[ i ];
            positionY = pos[ i + 1 ];
            positionZ = pos[ i + 2 ];

            utils.randomDirectionVector3OnDisc(
                this.attributes[ attrName ], index,
                positionX, positionY, positionZ,
                this.position._value,
                prop._value.x,
                prop._spread.x
            );
            break;

        case distributions.LINE:
            utils.randomVector3OnLine( this.attributes[ attrName ], index, value, spread );
            break;
    }

    if ( attrName === 'acceleration' ) {
        var drag = utils.clamp( utils.randomFloat( this.drag._value, this.drag._spread ), 0, 1 );
        this.attributes.acceleration.typedArray.array[ index * 4 + 3 ] = drag;
    }
};

SPE.Emitter.prototype._assignAbsLifetimeValue = function( index, propName ) {
    'use strict';

    var array = this.attributes[ propName ].typedArray,
        prop = this[ propName ],
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] ) )
        );
    }
};

SPE.Emitter.prototype._assignAngleValue = function( index ) {
    'use strict';

    var array = this.attributes.angle.typedArray,
        prop = this.angle,
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ),
            utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ),
            utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ),
            utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] )
        );
    }
};

SPE.Emitter.prototype._assignParamsValue = function( index ) {
    'use strict';

    this.attributes.params.typedArray.setVec4Components( index,
        this.isStatic ? 1 : 0,
        0.0,
        Math.abs( SPE.utils.randomFloat( this.maxAge._value, this.maxAge._spread ) ),
        SPE.utils.randomFloat( this.wiggle._value, this.wiggle._spread )
    );
};

SPE.Emitter.prototype._assignRotationValue = function( index ) {
    'use strict';

    this.attributes.rotation.typedArray.setVec3Components( index,
        SPE.utils.getPackedRotationAxis( this.rotation._axis, this.rotation._axisSpread ),
        SPE.utils.randomFloat( this.rotation._angle, this.rotation._angleSpread ),
        this.rotation._static ? 0 : 1
    );

    this.attributes.rotationCenter.typedArray.setVec3( index, this.rotation._center );
};

SPE.Emitter.prototype._assignColorValue = function( index ) {
    'use strict';
    SPE.utils.randomColorAsHex( this.attributes.color, index, this.color._value, this.color._spread );
};

SPE.Emitter.prototype._resetParticle = function( index ) {
    'use strict';

    var resetFlags = this.resetFlags,
        updateFlags = this.updateFlags,
        updateCounts = this.updateCounts,
        keys = this.attributeKeys,
        key,
        updateFlag;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        key = keys[ i ];
        updateFlag = updateFlags[ key ];

        if ( resetFlags[ key ] === true || updateFlag === true ) {
            this._assignValue( key, index );
            this._updateAttributeUpdateRange( key, index );

            if ( updateFlag === true && updateCounts[ key ] === this.particleCount ) {
                updateFlags[ key ] = false;
                updateCounts[ key ] = 0.0;
            }
            else if ( updateFlag == true ) {
                ++updateCounts[ key ];
            }
        }
    }
};

SPE.Emitter.prototype._updateAttributeUpdateRange = function( attr, i ) {
    'use strict';

    var ranges = this.bufferUpdateRanges[ attr ];

    ranges.min = Math.min( i, ranges.min );
    ranges.max = Math.max( i, ranges.max );
};

SPE.Emitter.prototype._resetBufferRanges = function() {
    'use strict';

    var ranges = this.bufferUpdateRanges,
        keys = this.bufferUpdateKeys,
        i = this.bufferUpdateCount - 1,
        key;

    for ( i; i >= 0; --i ) {
        key = keys[ i ];
        ranges[ key ].min = Number.POSITIVE_INFINITY;
        ranges[ key ].max = Number.NEGATIVE_INFINITY;
    }
};

SPE.Emitter.prototype._onRemove = function() {
    'use strict';
    this.particlesPerSecond = 0;
    this.attributeOffset = 0;
    this.activationIndex = 0;
    this.activeParticleCount = 0;
    this.group = null;
    this.attributes = null;
    this.paramsArray = null;
    this.age = 0.0;
};

SPE.Emitter.prototype._decrementParticleCount = function() {
    'use strict';
    --this.activeParticleCount;

    // TODO:
    //  - Trigger event if count === 0.
};

SPE.Emitter.prototype._incrementParticleCount = function() {
    'use strict';
    ++this.activeParticleCount;

    // TODO:
    //  - Trigger event if count === this.particleCount.
};

SPE.Emitter.prototype._checkParticleAges = function( start, end, params, dt ) {
    'use strict';
    for ( var i = end - 1, index, maxAge, age, alive; i >= start; --i ) {
        index = i * 4;

        alive = params[ index ];

        if ( alive === 0.0 ) {
            continue;
        }

        // Increment age
        age = params[ index + 1 ];
        maxAge = params[ index + 2 ];

        if ( this.direction === 1 ) {
            age += dt;

            if ( age >= maxAge ) {
                age = 0.0;
                alive = 0.0;
                this._decrementParticleCount();
            }
        }
        else {
            age -= dt;

            if ( age <= 0.0 ) {
                age = maxAge;
                alive = 0.0;
                this._decrementParticleCount();
            }
        }

        params[ index ] = alive;
        params[ index + 1 ] = age;

        this._updateAttributeUpdateRange( 'params', i );
    }
};

SPE.Emitter.prototype._activateParticles = function( activationStart, activationEnd, params, dtPerParticle ) {
    'use strict';
    var direction = this.direction;

    for ( var i = activationStart, index, dtValue; i < activationEnd; ++i ) {
        index = i * 4;

        // Don't re-activate particles that aren't dead yet.
        // if ( params[ index ] !== 0.0 && ( this.particleCount !== 1 || this.activeMultiplier !== 1 ) ) {
        //     continue;
        // }

        if ( params[ index ] != 0.0 && this.particleCount !== 1 ) {
            continue;
        }

        // Increment the active particle count.
        this._incrementParticleCount();

        // Mark the particle as alive.
        params[ index ] = 1.0;

        // Reset the particle
        this._resetParticle( i );

        dtValue = dtPerParticle * ( i - activationStart )
        params[ index + 1 ] = direction === -1 ? params[ index + 2 ] - dtValue : dtValue;

        this._updateAttributeUpdateRange( 'params', i );
    }
};

SPE.Emitter.prototype.tick = function( dt ) {
    'use strict';

    if ( this.isStatic ) {
        return;
    }

    if ( this.paramsArray === null ) {
        this.paramsArray = this.attributes.params.typedArray.array;
    }

    var start = this.attributeOffset,
        end = start + this.particleCount,
        params = this.paramsArray, // vec3( alive, age, maxAge, wiggle )
        ppsDt = this.particlesPerSecond * this.activeMultiplier * dt,
        activationIndex = this.activationIndex;

    // Reset the buffer update indices.
    this._resetBufferRanges();

    // Increment age for those particles that are alive,
    // and kill off any particles whose age is over the limit.
    this._checkParticleAges( start, end, params, dt );

    // If the emitter is dead, reset the age of the emitter to zero,
    // ready to go again if required
    if ( this.alive === false ) {
        this.age = 0.0;
        return;
    }

    // If the emitter has a specified lifetime and we've exceeded it,
    // mark the emitter as dead.
    if ( this.duration !== null && this.age > this.duration ) {
        this.alive = false;
        this.age = 0.0;
        return;
    }


    var activationStart = this.particleCount === 1 ? activationIndex : ( activationIndex | 0 ),
        activationEnd = Math.min( activationStart + ppsDt, this.activationEnd ),
        activationCount = activationEnd - this.activationIndex | 0,
        dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

    this._activateParticles( activationStart, activationEnd, params, dtPerParticle );

    // Move the activation window forward, soldier.
    this.activationIndex += ppsDt;

    if ( this.activationIndex > end ) {
        this.activationIndex = start;
    }


    // Increment the age of the emitter.
    this.age += dt;
};

SPE.Emitter.prototype.reset = function( force ) {
    'use strict';

    this.age = 0.0;
    this.alive = false;

    if ( force === true ) {
        var start = this.attributeOffset,
            end = start + this.particleCount,
            array = this.paramsArray,
            attr = this.attributes.params.bufferAttribute;

        for ( var i = end - 1, index; i >= start; --i ) {
            index = i * 4;

            array[ index ] = 0.0;
            array[ index + 1 ] = 0.0;
        }

        attr.updateRange.offset = 0;
        attr.updateRange.count = -1;
        attr.needsUpdate = true;
    }

    return this;
};

SPE.Emitter.prototype.enable = function() {
    'use strict';
    this.alive = true;
    return this;
};

SPE.Emitter.prototype.disable = function() {
    'use strict';

    this.alive = false;
    return this;
};

SPE.Emitter.prototype.remove = function() {
    'use strict';
    if ( this.group !== null ) {
        this.group.removeEmitter( this );
    }
    else {
        console.error( 'Emitter does not belong to a group, cannot remove.' );
    }

    return this;
};

const Particles = (_t)=>{

	let _p = _t.Particles = {};

	_p.particleGroups = [];

	_p.getRandomNumber = ( base )=>{
	    return Math.random() * base - (base/2);
	}

	_p.getRandomColor = ()=>{
	    var c = new Color();
	    c.setRGB( Math.random(), Math.random(), Math.random() );
	    return c;
	}

	// Create particle group and emitter
	_p.createParticles = ( settings ) =>{ // x, y, z, s, tex, numEmitters, maxParticles, parent)=>{

        /*
        position: { x: 0,  y: 0, z: 0 }, 
        scale: 200, 
        tex: _t.Assets.textures.particles[0], 
        emitters: 60, 
        maxParticles: 6000, 
        colors: !obj.colors ? false : obj.colors,
        parent: cluster.area
        */

		const particleGroup = new SPE.Group({
			texture: {
	            value: settings.tex,
	        },
	        maxParticleCount: settings.maxParticles 
		});

        const emitters = [];

	    for( var i = 0; i < settings.emitters; ++i ) {
	    	const emitter = new SPE.Emitter({
	            maxAge: 4 * Math.random() + 4,
	            type: Math.random() * 4 | 0,
	    		position: {
	                value: new Vector3(
	                    _p.getRandomNumber(200),
	                    _p.getRandomNumber(200),
	                    _p.getRandomNumber(200)
	                )
	            },
	    		acceleration:{
	                value: new Vector3(
	                    _p.getRandomNumber(-2),
	                    _p.getRandomNumber(-2),
	                    _p.getRandomNumber(-2)
	                )
	            },
	            velocity: {
	                value: new Vector3(
	                    _p.getRandomNumber(5),
	                    _p.getRandomNumber(5),
	                    _p.getRandomNumber(5)
	                )
	            },
	            rotation: {
	                axis: new Vector3(
	                    _p.getRandomNumber(1),
	                    _p.getRandomNumber(1),
	                    _p.getRandomNumber(1)
	                ),
	                angle: Math.random() * Math.PI,
	                center: new Vector3(
	                    _p.getRandomNumber(100),
	                    _p.getRandomNumber(100),
	                    _p.getRandomNumber(100)
	                )
	            },
	            wiggle: {
	                value: Math.random() * 20
	            },
	            drag: {
	                value: Math.random()
	            },
	            color: {
	                value: !settings.colors ? [ _p.getRandomColor(), _p.getRandomColor() ] : settings.colors,
	            },
	            size: {
	                value: [settings.size.x,settings.size.y,settings.size.z]
	            },
	    		particleCount: settings.particleCount,
	            opacity: [0, 1, 0]
	    	});
	    	particleGroup.addEmitter( emitter );
            emitters.push(emitter);

	    }

		settings.parent.add( particleGroup.mesh );
		particleGroup.mesh.position.set(settings.position.x,settings.position.y,settings.position.z);
        particleGroup.mesh.scale.set(settings.scale,settings.scale,settings.scale);

		_p.particleGroups.push(particleGroup)

		return { group: particleGroup, emitters: emitters};
		
	}

    _p.createCenterParticles = ( settings ) =>{ // x, y, z, s, tex, numEmitters, maxParticles, parent)=>{

        /*
        position: { x: 0,  y: 0, z: 0 }, 
        scale: 200, 
        tex: _t.Assets.textures.particles[0], 
        emitters: 60, 
        maxParticles: 6000, 
        colors: !obj.colors ? false : obj.colors,
        parent: cluster.area
        */

        const particleGroup = new SPE.Group({
            texture: {
                value: settings.tex,
            },
            maxParticleCount: settings.maxParticles 
        });

        const emitter = new SPE.Emitter({
            maxAge: 5,
            type: settings.type,
            position: {
                value: new Vector3(
                    settings.position.x,
                    settings.position.y,
                    settings.position.z
                )
            },
            acceleration:{
                value: new Vector3(
                    settings.acceleration.x,
                    settings.acceleration.y,
                    settings.acceleration.z
                )
            },
            velocity: {
                value: new Vector3(
                    settings.velocity.x,
                    settings.velocity.y,
                    settings.velocity.z
                )
            },
            rotation: {
                axis: new Vector3(
                    settings.axis.x,
                    settings.axis.y,
                    settings.axis.z
                ),
                angle: settings.angle,
                center: new Vector3(
                    settings.target.x,
                    settings.target.y,
                    settings.target.z
                )
            },
            wiggle: {
                value: settings.wiggle
            },
            drag: {
                value: settings.drag
            },
            color: {
                value: !settings.colors ? [ _p.getRandomColor(), _p.getRandomColor() ] : settings.colors,
            },
            size: {
                value: [settings.size.x, settings.size.y, settings.size.z]
            },
            particleCount: settings.particleCount,
            opacity: [settings.opacity.x, settings.opacity.y, settings.opacity.z]
        });

        particleGroup.addEmitter( emitter );

        settings.parent.add( particleGroup.mesh );
        particleGroup.mesh.position.set(settings.position.x,settings.position.y,settings.position.z);
        particleGroup.mesh.rotation.set(settings.rotation.x,settings.rotation.y,settings.rotation.z);
        particleGroup.mesh.scale.set(settings.scale,settings.scale,settings.scale);

        _p.particleGroups.push(particleGroup)

        return { group: particleGroup, emitter: emitter};
        
    }


    _p.createPointerParticles = (settings)=>{
        
        const particleGroup = new SPE.Group({
            texture: {
                value: settings.tex,
            },
            maxParticleCount: settings.maxParticles 
        });

        const emitter = new SPE.Emitter({
            maxAge: settings.maxAge,
            position: {
                value: new Vector3(settings.position.x, settings.position.y, settings.position.z)
            },
            acceleration: {
                value: new Vector3(settings.acceleration.x, settings.acceleration.y, settings.acceleration.z),
                spread: new Vector3(settings.accelerationSpread.x, settings.accelerationSpread.y, settings.accelerationSpread.z)
            },

            velocity: {
                value: new Vector3(settings.velocity.x, settings.velocity.y, settings.velocity.z)
            },

            color: {
                value: !settings.colors ? [ _p.getRandomColor(), _p.getRandomColor() ] : settings.colors,
                spread: new Vector3(1, 1, 1),
            },
            size: {
                value: [settings.size.x, settings.size.y, settings.size.z]
            },
            particleCount: 1500
        });
        particleGroup.addEmitter( emitter );
        settings.parent.add( particleGroup.mesh );

        particleGroup.mesh.position.set(settings.position.x,settings.position.y,settings.position.z);
        particleGroup.mesh.rotation.set(settings.rotation.x,settings.rotation.y,settings.rotation.z);
        particleGroup.mesh.scale.set(settings.scale,settings.scale,settings.scale);

        _t.Motion.animations.pointerPart = ()=>{
            particleGroup.tick( 0.0016 );
        }

        return { group: particleGroup, emitter: emitter};
    }


	_t.Motion.animations.multipart = ()=>{
		for(_p.itmp = 0; _p.itmp < _p.particleGroups.length; _p.itmp++){
			_p.particleGroups[_p.itmp].tick( _t.Render.delta );
		}
	}
	
	return _p;
}
 

export { Particles, SPE}