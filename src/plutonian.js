/** 
 * plutonian.js
 * @description create a virtual word out of the Pluto system of 
 * ice dwarf and moons.
 */
var plutonian = (function () {

    // Global variables

    var dpr = 1; // Default non-retina display

    // THREE components

    var scene, canvas, camera, dolly, keyLight, renderer;

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

    /** 
     * Ice dwarf and moon features in detail
     * @type {Array<Object>}
     */
    plutoArray = [

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

    ]; // End of plutoArray


    /** 
     * Other Planets in the solar system
     * @type {Array<Object>}
     */
    var solarSystemArray = [

    ];

    /** 
     * Array of coordinates for bright stars
     * @link https://github.com/mrdoob/three.js/issues/263
     * @link https://gielberkers.com/evenly-distribute-particles-shape-sphere-threejs/
     * @type {Array<Object>}
     */
    var starData = [

    ];

    /** 
     * Texture for Milky Way Galaxy
     * @type {Array<Object>}
     */
    var galaxyTexture = {

          name: 'milky way',

          path: 'img/milky_way.png',

          material: new THREE.PointsMaterial(),

    };

    /** 
     * Detect if an object is a string
     * @param {Object} str an Object that might be a String
     * @returns {Boolean} if a String, return true, else false
     */
    function isString( str ) {

        return Object.prototype.toString.call( str ) == '[object String]';

    };

    /*
     * Scale the geometry (rather than scale Scene or Mesh)
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
     * light the scene
     */
    function loadLights ( scene ) {

        // Using MeshPhongMaterial REQUIRES a DirectionalLight!

        keyLight = new THREE.DirectionalLight(0xffffff, 1.0);

        keyLight.position.set(0, 25, 15).normalize();

        scene.add( keyLight );

    };

    /** 
     * Load an individual Planet's texture and model.
     * Load the texture
     * In the callback, load a standard or custom mesh
     */
    function loadPlanet ( planetData, scene, resolve, reject ) {

        texLoader.load( planetData.path, function ( texture ) {

            console.log('in texLoader, typeof planet.geometry:' + typeof planetData.geometry);

            if ( isString( planetData.geometry ) ) { // path to mesh file

                modLoader.load( planetData.geometry, function ( obj ) {

                    planetData.geometry = obj.children[0].geometry;

                    planetData.material.map = texture;

                    //planet.geometry.scale( 0.1, 0.1, 0.1 ); // might need later

                    planetData.geometry.center(); // center model within bounding box

                    planetData.mesh = new THREE.Mesh( planetData.geometry, planetData.material );

                    planetData.mesh.position.set( 0, 0, 0 );

                    planetData.geometry.applyMatrix( planetData.translation );

                    planetData.group.add( planetData.mesh );

                    planetData.orbit = createRing( 50, 50, planetData.distance - 0.25, planetData.distance + 0.25,

                    new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, opacity: 0.2 } ),

                    new THREE.Vector3( 0, 0, 0 ), // position

                    new THREE.Vector3( Math.PI / 2, 0, 0 ) // rotation

                    );

                    scene.add( planetData.orbit );

                    // Resolve the Promise if our texture loaded successfully

                    if( texture instanceof THREE.Texture) {

                        resolve( planetData );

                    } else {

                        reject( planetData );

                    }

                } ); // End of mesh loaded by program

            } else { // Use THREE.Sphere primitive

                planetData.geometry.applyMatrix( planetData.translation );

               planetData.material.map = texture;

                planetData.mesh = new THREE.Mesh( planetData.geometry, planetData.material );

                planetData.group.add( planetData.mesh );

                if( texture instanceof THREE.Texture ) {

                    resolve( planetData );

                } else {

                    reject( planetData );
                }

            } // End of THREE.Sphere load

                //TODO: update progress indicator here...

                // fallthrough reject

                //reject( planetData );
            },

            function (xhr) { // Report loading progress

                console.log(planetData.name + ' ' + parseInt(xhr.loaded / xhr.total * 100) + '% loaded');

            },

            function (xhr) { // Report loading error.

                reject( new Error ('loadPlanet() error:' + xhr + ' An error occurred loading while loading' + planetData.path));

            }

        ); // end of texLoader

    };

    /** 
     * Load all textures and models for the defined planets
     * @param {Function} callback the main program function to call after callback
     */
    function loadPlanets ( scene, callback ) {

        var promiseArray = [];

        plutoArray.forEach( function ( planetData ) {

            console.log('domui.loadPlanets(): loading ' + planetData.name + '.');

            promiseArray.push( new Promise( function ( resolve , reject ) {

                loadPlanet( planetData, scene, resolve, reject );

            } ) ); // nested .push( new Promise() )

        } );

        Promise.all( promiseArray ).then( function ( planets ) {

            console.log('domui.loadPlanets(): successfully loaded all Planets.');

            callback(); // this is start() in example.html

        } ).catch ( function ( planetData ) {

            console.log( 'domui.loadPlanets(): error loading a Planet:' + planetData );

        } );

    };

    /** 
     * Load a Milky Way galaxy texture
     */
    function loadGalaxy ( callback ) {

        return false;

    };

    /** 
     * Load the stars from a stellar position file
     */
    function loadStars ( callback ) {

        return false;

    };

    /** 
     * Load other solar system objects
     */
    function loadSolarSystem ( callback ) {

        return false;

    };

    /** 
     * Load the surrounding universe of other Solar System 
     * Planets, stars, and the galaxy band.
     */
    function loadUniverse ( callback ) {

        var promiseArray = [];

        solarSystemArray.forEach( function ( planet ) { 

            promiseArray.push( new Promise( function ( resolve , reject ) {

                if ( loadSolarSystem( planet ) ) {

                    resolve( planet );

                } else {

                    reject( planet );

                }

            } ) ); // nested .push( new Promise() )

        } ); // foreach

        // Load the Stars

        promiseArray.push( new Promise ( function ( resolve, reject ) {

            if( loadStars( starData ) ) {

                resolve( starData );

            } else {

                reject( starData );

            }

        } ) );


        promiseArray.push( new Promise ( function ( resolve, reject ) {

            if( loadGalaxy( galaxyTexture ) ) {

                resolve( galaxyTexture );

            } else {

                reject( galaxyTexture );

            }

        } ) );

        Promise.all( promiseArray ).then( function ( objects ) {

            console.log('domui.loadUniverse(): successfully loaded all Universe objects.');

        } ).catch ( function ( object ) {

            window.p  =  object;

            console.log( 'domui.loadUniverse(): error loading a Universe object:' + object );

        } );

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

        for (var i in plutoArray) {

          plutoArray[i].group.rotation.y += plutoArray[i].rotation;

        }

    };

    /** 
     * Begin creating the Plutonian system
     * @param {CanvasElement} HTML5 <canvas> element
     * @param {THREE.renderer} renderer the standard (not VR) renderer for the scene
     */
    function init( threeScene, threeCamera, threeRenderer, threeDolly, callback, progressCallback ) {

        // Local reference to <canvas>

        console.log( 'Initializing Plutonian simulation...' );

        scene = threeScene;

        camera = threeCamera;

        renderer = threeRenderer;

        canvas = renderer.domElement;

        dolly = threeDolly;

        dolly.add( camera );

        scene.add( dolly );

        loadLights( scene );

        // Add groups defined for the planets to scene

        for ( var i = 0, len = plutoArray.length; i < len; i++ ) {

            scene.add( plutoArray[i].group );
        }

        // Load texture and model data for Plutonian System

        loadPlanets( scene, callback );

        // Load texture and model data from the Universe (can happen independently)

        loadUniverse( scene, callback );

    };

    return {

        init: init,

        update: update

    };

})();







