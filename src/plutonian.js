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

    // An array of the Planet meshes only (not Rings, stars, galaxy skybox)

    var gazeObjects = [];

    // VR components

    var vrEffect, vrControls, controls;

    // Initialize a mesh-loader

    var modLoader = new THREE.ObjectLoader();

    // Initialize a texture-loader

    var texLoader = new THREE.TextureLoader();

    texLoader.crossOrigin = '';

    // Count the number of loads we have to do

    var numLoads = 0, totalLoads = 0;

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
     * Other non-Plutonian planets are present
     */
    var solarCenter = 100; // TODO: GET RIGHT FIGURE HERE


    /** 
     * Expose the GazeObjects for picking.
     */
    function getGazeObjects () {

      return gazeObjects;

    };

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

        {

          name: 'neptune',

          path: 'img/neptune_rgb_cyl_512.png',

          material: new THREE.MeshPhongMaterial( { shininess: "10", emissive:"#272222" } ),

          geometry: new THREE.SphereGeometry( plutoSize * 0.51, plutoSegments, plutoSegments ),

          diameter: plutoSize * 20, //49528km

          distance: 80 - solarCenter, // TODO: TEMPORARY!!!!!!!! NOT ACCURATE

          translation: new THREE.Matrix4().makeTranslation( 80 - solarCenter, 0, 0 ), // TODO: GET RIGHT VALUE

          rotation: -plutoCharonRot * 0.129, // about 19 hours

          mesh: null, // Spherical

          group: new THREE.Group() // Charon and Pluto are in same orbit group

        }
    ];

    /** 
     * Array of coordinates for bright stars
     * @link https://github.com/mrdoob/three.js/issues/263
     * @link https://gielberkers.com/evenly-distribute-particles-shape-sphere-threejs/
     * @type {Array<Object>}
     */
    var stellarArray = [

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


    /** 
     * Create the avatar body for the VR scene
     */
    function createAvatar () {

        var avatar = new THREE.Object3D();

        var avatarBody = makeCube( 'blue' );

        avatarBody.position.y = -1.5;

        avatar.add( characterBody );

        scene.add( avatar );

        return avatar;

    };

    /** 
     * Move to an object we are looking at
     * Adapted from the link at:
     * @link 
     * @param {THREE.PerspectiveCamera} camera the scene camera
     * @param {THREE.Object} avatar object representing the user
     * @param {Number} moveDistance fractional move, e.g. 0.1
     */
    function moveAvatarTo ( camera, avatar, moveDistance ) {

        camera.position.copy( avatar.position);

        // move in direction we look at

        var direction = ZAXIS.clone();

        direction.applyQuaternion(camera.quaternion);

        direction.sub( YAXIS.clone().multiplyScalar( direction.dot( YAXIS ) ) );

        direction.normalize();

        // TODO: for a VR scene, this might be moving the whole THREE.Scene

        character.quaternion.setFromUnitVectors( ZAXIS, direction );

        character.translateZ( -moveDistance );

    };

    /**
     * Scale the geometry (rather than scale Scene or Mesh)
     * Similar to: 
     * @link http://learningthreejs.com/data/THREEx/docs/THREEx.GeometryUtils.html
     * @param {THREE.Geometry} geometry basic shape (unity size).
     * @param {Number} scale how much to scale the Geometry.
     * @returns {THREE.Geometry} the scaled Geometry.
     */
    function doGeometryScale ( geometry, scale ) {

      for( var i = 0; i < geometry.vertices.length; i++ ) {

        var vertex  = geometry.vertices[ i ];

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

        keyLight = new THREE.DirectionalLight( 0xffffff, 1.0 );

        // TODO: determine actual light angle

        keyLight.position.set( 0, 10, 15 ).normalize();

        scene.add( keyLight );

    };

    /** 
     * Load an individual Planet's texture and model.
     * 1. Load the texture
     * 2. In the callback, load a standard or custom mesh
     */
    function loadPlanet ( planetData, scene, progressCallback, resolve, reject ) {

        texLoader.load( planetData.path, function ( texture ) {

            console.log('in texLoader, typeof planet.geometry:' + typeof planetData.geometry);

            if ( isString( planetData.geometry ) ) { // path to mesh file

                modLoader.load( planetData.geometry, function ( obj ) {

                    planetData.geometry = obj.children[ 0 ].geometry;

                    planetData.material.map = texture;

                    //planetData.geometry.scale( 10, 10, 10 ); // might need later

                    planetData.geometry.center(); // center model within bounding box

                    planetData.mesh = new THREE.Mesh( planetData.geometry, planetData.material );

                    planetData.mesh.position.set( 0, 0, 0 );

                    planetData.geometry.applyMatrix( planetData.translation );

                    planetData.group.add( planetData.mesh );

                    planetData.mesh.name = planetData.name;

                    // Planet mesh stored for picking (can't pick Rings, Stars, Galaxy)

                    gazeObjects.push( planetData.mesh );

                    //  create a visible ring for the planetary orbit

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

                planetData.mesh.name = planetData.name;

                // Planet mesh stored for picking (can't pick Rings, Stars, Galaxy)

                gazeObjects.push( planetData.mesh );

                if( texture instanceof THREE.Texture ) {

                    resolve( planetData );

                } else {

                    reject( planetData );
                }

            } // End of THREE.Sphere load


                // compute the number of loads

                numLoads++;

                // progressCallback used bind() to keep global scope inside this object

                console.log( 'numloads:' + numLoads + ' totalLoads:' + totalLoads);

                if ( progressCallback ) {

                    var loaded = parseInt( 100 * numLoads / totalLoads );

                    progressCallback( loaded / 2, planetData.name, 50 );

                }

            },

            function ( xhr ) { // Report loading progress

                console.log(planetData.name + ' ' + parseInt(xhr.loaded / xhr.total * 100) + '% loaded');

                if ( progressCallback ) {

                    var loaded = parseInt( 100 * numLoads / totalLoads );

                    progressCallback( loaded / 2, planetData.name, 50 );

                }
            },

            function ( xhr ) { // Report loading error.

                reject( new Error ('domui.loadPlanet() error:' + xhr + ' An error occurred loading while loading' + planetData.path));

            }

        ); // end of texLoader

    };

    /** 
     * Load all textures and models for the defined planets
     * @param {THREE.Scene} scene the THREE.js Scene to use
     * @param {Function} callback the function to call when initialization is complete
     * @param {Function} progressCallback the function to call after individual objects are loaded
     */
    function loadPlanets ( dataArray, scene, progressCallback, callback ) {

        var promiseArray = [];

        dataArray.forEach( function ( planetData ) {

            console.log('domui.loadPlanets(): loading ' + planetData.name + '.');

            promiseArray.push( new Promise( function ( resolve , reject ) {

                loadPlanet( planetData, scene, progressCallback, resolve, reject );

            } ) ); // nested .push( new Promise() )

        } );

        Promise.all( promiseArray ).then( function ( planets ) {

            console.log('domui.loadPlanets(): successfully loaded a batch of Planets.');

            if( callback ) {

                callback(); // this is start() in example.html

            }

        } ).catch ( function ( planetData ) {

            console.log( 'domui.loadPlanets():' + planetData );

            if ( progressCallback ) {

                progressCallback( 100, 'Error loading ' + planetData.name );
            }

        } );

    };

    /** 
     * Load the Stars from a stellar position file
     * @param {Function} callback the function to call when initialization is complete
     * @param {Function} progressCallback the function to call after individual objects are loaded
     */
    function loadStars ( dataArray, scene, progressCallback, callback ) {

        var promiseArray = [];

        // Load the Stars

        promiseArray.push( new Promise ( function ( resolve, reject ) {

            var loaded = true;

            if( loaded ) {

                resolve( dataArray );

            } else {

                reject( dataArray );

            }

        } ) );

        // Load the galaxy texture

        promiseArray.push ( new Promise ( function ( resolve, reject ) {

            texLoader.load('img/textures/galaxy.jpg', function ( texture ) {

                console.log( 'in texLoader, galaxy texture in callback...' );

                // TODO: attach this texture to enclosing universe

            }, function ( xhr ) { // Report loading progress

                console.log( 'galaxy loading....' );

                if ( progressCallback ) {

                    var loaded = parseInt( 100 * numLoads / totalLoads );

                    progressCallback( loaded / 2, planetData.name );

                }

            },

            function ( xhr ) { // Report loading error.

                reject( new Error ('loadStars() error:' + xhr + ' An error occurred loading while loading the galaxy texture.'));

            } );


        } ) );

        // Completion

        Promise.all( promiseArray ).then( function ( objects ) {

            console.log('domui.loadStars(): successfully loaded all Stellar objects.');

        } ).catch ( function ( object ) {

            console.log( object );

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

          plutoArray[ i ].group.rotation.y += plutoArray[ i ].rotation;

        }

    };

    /** 
     * Begin creating the Plutonian system
     * @param {THREE.Scene} threeScene the THREE.js scene
     * @param {THREE.Camera} threeCamera the main THREE camera for the scene
     * @param {CanvasElement} the HTML5 <canvas> element
     * @param {THREE.Renderer} renderer the standard THREE.js (not VR) renderer for the scene
     * @param {THREE.Camera} dolly a moveable camera used to shift point of view in VR simulations
     * @param {Function} callback the function to call when initialization is complete
     * @param {Function} progressCallback the function to call after individual objects are loaded
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

            scene.add( plutoArray[ i ].group );

        }

        // Load texture and model data for Plutonian System

        loadPlanets( plutoArray, scene, progressCallback, callback );

        // Load texture and model data from other Planets (can happen independently)

        loadPlanets( solarSystemArray, scene, null, null );

        // Load the Stars and Galaxy texture (can happen independently)

        loadStars( stellarArray, scene, null, null );

        // We only count plutoArray as essential, stars and Galaxy texture load after start();

        totalLoads = plutoArray.length;

    };

    return {

        init: init,

        update: update,

        getGazeObjects: getGazeObjects

    };

} )();
