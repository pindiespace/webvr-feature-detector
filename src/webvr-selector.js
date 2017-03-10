/** 
 * webvr-selector.js
 * Events allowing selection via gaze or buttons
 * Hyperlink navigation
 */

var WebVRSelector = ( function () {


    var raycaster = new THREE.Raycaster();



    /** 
     * Raycast to find if we are clicking on a scene object
     * Explained nicely at this link: 
     * @link http://barkofthebyte.azurewebsites.net/post/2014/05/05/three-js-projecting-mouse-clicks-to-a-3d-scene-how-to-do-it-and-how-it-works
     * or use the vrecticle library
     * @link http://opentechschool-brussels.github.io/webVR-for-3D-graphics-and-music/interacting-within-the-scene.html
     * @link https://jsfiddle.net/dariukas/zpo7qwt1/
     * @link http://threejs.org/docs/#Reference/Core/Raycaster
     * TODO: EMPTY ARRAY
     * @param {Event} e mousedown event
     */
    function scenePicker ( scene, camera, sceneVector ) {

        // Create Point in front of camera, based on click coordinates

        //NO EFFECT scene.updateMatrixWorld(true);
        camera.lookAt(scene.position);
/*

        sceneVector.x =  ( e.clientX / window.innerWidth ) * 2 - 1;

        sceneVector.y =  -( ( e.clientY / window.innerHeight ) * 2 + 1 );

        sceneVector.z =  1; // can be plus or minus!!

//////////////
        sceneVector.y = 0.001; //MANUALLY!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //THIS MAKES IT WORK. WORKS ON ALL OBJECTS
        // WHAT WOULD HAPPEN FOR OUT-OF-PLANE OBJECTS?????????????
//////////////
*/

        console.log("mouse x:" + sceneVector.x + " y:" + sceneVector.y + " z:" + sceneVector.z );

        // Convert position of the Point to its position in world space

        /////////sceneVector.unproject( camera );
        //sceneVector.unproject( dolly );

        // Create a ray 
        /////////raycaster = new THREE.Raycaster( camera.position, sceneVector.sub( camera.position ).normalize() );

        raycaster.setFromCamera( sceneVector, camera );


        //var intersects = raycaster.intersectObjects( scene.children, true );

        window.gazeObjects = plutonian.getGazeObjects();

        var intersects = raycaster.intersectObjects( plutonian.getGazeObjects() );

        console.log( intersects ); ///////////////////////

        // Change color if hit block
        // TODO: MAKE THIS SELECT IN ANOTHER WAY

        if ( intersects.length > 0 ) {

            console.log("Intersected object:", intersects.length);

            for ( var i = 0, len = intersects.length; i < len; i++ ) {

                intersects[ i ].object.material.color.setHex( Math.random() * 0xffffff );

                window.selObj = intersects[i].object; /////////////////////////////

            }

        }

    };

    // TODO: Picker from aframe - https://raw.githubusercontent.com/aframevr/aframe/master/dist/aframe.js

    // TODO: THREE.Points.prototype.raycast = ( function () {

    // TODO: custom event to exit VR

    // TODO: custom event to trigger a hyperlink

    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events

    return {

        scenePicker: scenePicker

    };


} )();