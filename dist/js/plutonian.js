/** 
 * plutonian.js
 * @description create a virtual word out of the Pluto system of 
 * ice dwarf and moons.
 */
var plutonian = (function () {

    // Global variables

    var dpr = 1; // Default non-retina display

    // THREE components

    var scene, canvas, camera, dolly, renderer;

    // VR components

    var vrEffect, vrControls, controls;

    // Initialize a mesh-loader

    var modLoader = new THREE.ObjectLoader();

    // Initialize a texture-loader

    var texLoader = new THREE.TextureLoader();

    texLoader.crossOrigin = '';

    // Events and picking

    // TODO: event variables

    /** 
     * Pluto is sized 1 unit in simulation = 2370km, other objects and orbits 
     * are sized relative to Pluto's size.
     * @type {Number}
     */
    var plutoSize = 1;

    /** 
     * Number of segments to render Pluto and charon at
     * @type {Number}
     */
    var plutoSegments = 32;

    /**
     * Default speed or Pluto's rotation = Charon orbit in simulation, 
     * about 6 days in the real world. The speed of other moons is set 
     * relative to this value.
     * @type {Number}
     */
    var plutoCharonRot = 0.0020;

    /** 
     * Pluto normalized distance offset from simulation center, which 
     * is the barycenter of the system at 1195km above Pluto, center. 
     * The other moons (Styx, Hydra, Kerberos, Nix) ar assumed to orbit the barycenter.
     * @link http://mathscinotes.com/2015/06/barycenter-of-pluto-and-charon/
     * @type {Number}
     */
    var baryCenter = 0.885 + 0.5;

    // Ice dwarf and moon features in detail

    planetArray = [

        {

          name: 'pluto',

          path: 'img/pluto_rgb_cyl_1024.png',

          material: new THREE.MeshPhongMaterial( { shininess: "10", emissive:"#272222" } ),

          geometry: new THREE.SphereGeometry( plutoSize, plutoSegments, plutoSegments ),

          diameter: plutoSize, //2370km

          distance: -baryCenter, //TODO: TODO: TODO: CHECK THIS ONE!!!

          translation: new THREE.Matrix4().makeTranslation( -baryCenter, 0, 0 ), // 1195km

          rotation: -plutoCharonRot, // A Pluto day is about 6 Earth days

          mesh:null, // Spherical

          group: new THREE.Group() // primary orbit group

        },

        {

          name: 'charon',

          path: 'img/charon_rgb_cyl_1024.png',

          material: new THREE.MeshPhongMaterial( { shininess: "10", emissive:"#272222" } ),

          geometry: new THREE.SphereGeometry( plutoSize * 0.51, plutoSegments, plutoSegments ),

          diameter: plutoSize * 0.51, //1208km

          distance: 16.51 - baryCenter,

          translation: new THREE.Matrix4().makeTranslation( 16.51 - baryCenter, 0, 0 ), // 17536km

          rotation: -plutoCharonRot, // Charon has synchronous rotation with Pluto, day = orbital period

          mesh:null, // Spherical

          group: new THREE.Group() // Charon and Pluto are in same orbit group

        },

        {

          name: 'styx',

          path: 'img/styx_rgb_cyl_128.png', // texture is non-spherical

          material: new THREE.MeshPhongMaterial( { emissive:"#272222" } ),

          geometry: 'models/nix.json',

          diameter: plutoSize * 0.006, // 16 x 9 x 8km

          distance: 35.10 - baryCenter,

          translation: new THREE.Matrix4().makeTranslation( 35.10 - baryCenter, 0, 0 ), // 42656±78km

          rotation: -plutoCharonRot * 6.3872 / 20.16, // Computed relative to Pluto-Charon rotation speed

          mesh:null, // Loaded from file

          group: new THREE.Group() // In its own orbital group

        },

        {

          name: 'nix',

          path: 'img/nix_rgb_cyl_128.png',

          material: new THREE.MeshPhongMaterial( {emissive:"#272222"} ),

          geometry: 'models/nix.json',

          diameter: plutoSize * 0.021, // 50 x 35 x 33km

          distance: 41.09 - baryCenter,

          translation: new THREE.Matrix4().makeTranslation( 41.09 - baryCenter, 0, 0 ), // 48694±3km

          rotation: -plutoCharonRot * 6.3872 / 24.85, // Relative to Pluto-Charon (note it is really chaotic)

          mesh:null, // Loaded from file

          group: new THREE.Group() // In its own orbital group

        },

        {

          name: 'kerberos',

          path: 'img/kerberos_rgb_cyl_128.png',

          material: new THREE.MeshPhongMaterial( { emissive:"#272222" } ),

          geometry: 'models/nix.json',

          diameter: plutoSize * 0.008, // 19 x 10 x 9km

          distance: 48.762 - baryCenter,

          translation: new THREE.Matrix4().makeTranslation( 48.762 - baryCenter, 0, 0 ), //57783±19km

          rotation: -plutoCharonRot * 6.3872 / 32.17, //ratioed to Pluto-Charon

          mesh:null, // Loaded from file

          group: new THREE.Group() // In its own orbital group

        },

        {

          name: 'hydra',

          path: 'img/hydra_rgb_cyl_128.png',

          material: new THREE.MeshPhongMaterial( { emissive:"#272222"} ),

          diameter: plutoSize * 0.027, //65 x 45 x 25km

          geometry: 'models/nix.json',

          distance: 54.60 - baryCenter,

          translation: new THREE.Matrix4().makeTranslation(54.60 - baryCenter, 0, 0), //64738±3km

          rotation: -plutoCharonRot * 6.3872 / 38.20, //ratioed to Pluto-Charon

          mesh:null, // Loaded from file

          group: new THREE.Group() // In its own orbital group

        }

    ]; // End of planetArray

    /*
     * @method doGeometryScale
     * @description Scale the geometry (rather than scale Scene or Mesh)
     * Similar to: 
     * @link http://learningthreejs.com/data/THREEx/docs/THREEx.GeometryUtils.html
     * @param {THREE.Geometry} geometry basic shape (unity size).
     * @param {Number} scale how much to scale the Geometry.
     * @returns {THREE.Geometry} the scaled Geometry.
     */
    function doGeometryScale ( geometry, scale ) {

      for( var i = 0; i < geometry.vertices.length; i++ ) {

        var vertex  = geometry.vertices[i];

        vertex.position.multiplySelf( scale );

      }

      geometry.__dirtyVertices = true;

      return geometry;

    };

    /*
     * @method doGeometryRotation
     * @description Rotate a geometry (not a mesh)
     * @param {THREE.Geometry} geometry a basic shape geometry (unit size).
     * @param {THREE.Vector3} rotation xyz coordinates.
     * @returns {THREE.Geometry} the rotated Geometry.
     */
    function doGeometryRotation ( geometry, rotation ) {

      var rMatrix = new THREE.Matrix4();

      geometry.applyMatrix( rMatrix.makeRotationX( rotation.x ) );

      geometry.applyMatrix( rMatrix.makeRotationY( rotation.y ) );

      geometry.applyMatrix( rMatrix.makeRotationZ( rotation.z ) );

      return geometry;

    };

    /**
     * @method createCircle
     * @description Circle positioned and rotated.
     * @param {Number} segmentCount how many segments (ultimately polys) to use creating the Mesh.
     * @param {Number} radius the radius of the Mesh.
     * @param {THREE.Material} the material used to wrap the Mesh.
     * @param {THREE.Vector3} position the 3d position of the Mesh.
     * @param {THREE.Vector3} rotation the 3d rotation of the Mesh.
     * @returns {THREE.Mesh} the sized, positioned, and rotated Mesh.
     */
    function createCircle ( segmentCount, radius, material, position, rotation ) {

      var geometry = new THREE.CircleGeometry( radius, segmentCount );

      doGeometryRotation( geometry, rotation );

      var circle = new THREE.Mesh( geometry, material );

      circle.position.set( position.x, position.y, position.z );

      return circle;

    };

    /*
     * @method createRing
     * @description Create orbital lines or flat rings.
     * @param {Number} phiSegments the number of divisions in phi direction
     * @param {Number} thetaSegments the number of divisions in theta drection
     * @param {Number} start the inner radius of the ring
     * @param {Number} end the outer radius of the ring
     * @param {THREE.Vector3} position vector
     * @Param {Three.Vector3} rotation vector
     */
    function createRing ( phiSegments, thetaSegments, start, end, material, position, rotation ) {

      var geometry = new THREE.RingGeometry( start, end, thetaSegments, phiSegments, 0, Math.PI * 2 );

      doGeometryRotation( geometry, rotation );

      var ring = new THREE.Mesh( geometry, material );

      ring.position.set( position.x, position.y, position.z );

      return ring;

    };

    /**
     * @method createOrbitLine
     * @description a THREE Line tracing a planet or moon orbit.
     * @param {Number} segmentCount the number of divisions of the line
     * @param {Number} radius the radius of the circular line
     * @param {THREE.Material} material properties
     * @param {THREE.Vector3} position the position vector
     * @param {Three.Vector3} rotation the rotation vector
     */
    function createOrbitLine ( segmentCount, radius, material, position, rotation ) {

      var geometry = new THREE.Geometry();

      for ( var i = 0; i <= segmentCount; i++ ) {

         var theta = (i / segmentCount) * Math.PI * 2;

         geometry.vertices.push(

          new THREE.Vector3(

            Math.cos(theta) * radius,

            Math.sin(theta) * radius,

        0)); //multiply third value * Math.sin(theta) * radius to create a parabolic orbit
      }

      doGeometryRotation(geometry, rotation);

      return new THREE.Line(geometry, material);

    };

    /** 
     * Load textures and models for the defined planets
     * @param {Function} callback the main program function to call after callback
     */
    function loadTexturesAndModels ( callback ) {

    };

    /** 
     * Set the dolly position (with camera) in a running simulation
     * @param {THREE.Vector3} position the new THREE.Camera position
     */
    function setDolly ( position ) {

    };

    /** 
     * Update the simulation
     */
    function update () {

    };

    /** 
     * Begin creating the Plutonian system
     * @param {CanvasElement} HTML5 <canvas> element
     * @param {THREE.renderer} renderer the standard (not VR) renderer for the scene
     */
    function init( threeScene, threeCamera, threeRenderer, threeDolly ) {

        // Local reference to <canvas>

        console.log( 'Initializing Plutonian system...' );

        scene = threeScene;

        camera = threeCamera;

        renderer = threeRenderer;

        canvas = renderer.domElement;

        dolly = threeDolly;

        dolly.add( camera );

        scene.add( dolly );

        // Add groups defined for the planets to scene

        for ( var i = 0, len = planetArray.length; i < len; i++ ) {

            scene.add( planetArray[i].group );
        }

    };

    return {

        init: init,

        loadTexturesAndModels: loadTexturesAndModels,

        update: update

    };

})();







