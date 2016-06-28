# webvr-feature-detector

This is a specialized device and browser detector script which checks for the ability to run a 3d environment and the WebVR api, using

1. Device detection via WebGL version, vendor, shader language.
2. Feature detection of APIs required for WebVR to work.
3. Support for specific event types, automatically testing for those used in VR (deviceMotion, deviceOrientation).
3. Browser detection via user-agent.
4. Probable hardware device (useful for smartphone-based WebVR).
5. A microloader (useful for sequentially loading the required polyfills without adding 
   additional JS libraries).

WebVRFeatureDetector is NOT a general-purpose user-agent sniffer, or a comprehensive feature detector. It is focused narrowly on the browser APIs and hardware needed for WebGL and WebVR, with "graceful decay" support for older browsers. The goal is to improve Ux for users with obsolete or outdated browers.

For a currated support list of the state of VR in browsers, check IsWebVRReady?:
https://iswebvrready.org/

For a general test of Your WebVR ability, try Hello VR 
https://toji.github.io/webvr-samples/00-hello-webvr

In additon to detecting support for WebVR in the browser, WebVRFeatureDetector tries to match smartphone hardware that could be used by Google Cardboard or other phone-based VR headsets. The list of hardware can be updated.

## Example
  http://pindiespace.github.io/webvr-feature-detector/index.html

### Requirements
 1. Need THREE.js dev branch (v77 or greater)
    - three.js  (v78dev)
    - VRControls.js
    - VREffect.js
 2. WebVR Boilerplate
    - WebVR 1.0 version

### Browser Support
Browsers are FEATURE-DETECTED rather than simply sniffing the user-agent. This 
handles browser clones, and ensures that detection of old browsers (i.e. the ones 
that won't run) won't be foiled by a strange user-agent string. This in turns allows 
fallbacks when you know a browser won't work, even if it is advertising the ability 
to run WebGL.

Safari
Mobile Safari
Chrome:
 - All evergreen versions (after Chrome 24)
Chrome Android/iOS
Internet Explorer
 - IE6-9: not supported
 - IE10:  canvas rendering of one scene only
 - IE11:  supported
Opera

Other browsers will typically register as one of these browsers. FOr example, 
the Epiphany and Midori browsers (old Firefox clones) register as Safari.

Mismatching versions of the boilerplate with THREE.js will lead to grief.

Some Feature-detection sources:
http://browsershots.org/
https://saucelabs.com/beta/dashboard/manual (check it)
https://html5test.com/compare/browser/index.html
https://browshot.com
https://www.browserstack.com (check it) 
http://www.browseemall.com/Buy

### Installation

Installation will be most up-to-date if you do a build. 
 a. Download the program files
 b. In Terminal or Windows Console, navigate to the home directory
 c. If on Mac OS X or Linux, do an "sudo su" so you can do global NPM installs
 d. "npm install" will install dependencies, including a suite of useful polyfills
 e. To get the dev dependencies (e.g. browserify) if NODE_ENV is set to "production", also run "npm install --only-dev"
 f. "npm run build:dist" will build and minify the distribution only.
 e. "npm run build" will build the distribution and an example using polyfills and the THREE.js library
 f. "npm run build:debug" will build the detector with console.log information.

### Including the Detector

The detector file is standalone, and can be copied to your own projects. The file should be included via a script tag in the HEAD region of your web page, and your actual WebVR program should be somewhere further down, e.g. near the end of the page body. The detector will run automatically.

### Use

When WebVRFeatureDetector loads and initializes, it automatically does device and feature detection. You can manually re-detect (for example, after loading a polyfill) via WebVRFeatureDetector.detect(). Try it using the "index.html" file in the dist/ folder.

The detector gives the following results for these features deemed essential to WebVR:

1. Browser JavaScript APIs required to run WebGL apps 
   - HTML5 Canvas
   - TypedArrays
   - WebGL
   - Fullscreen API
   - Promise (vor WebVR-Polyfill and WebVR-Boilerplate)
   - requestAnimationFrame

2. Additional useful tests
   - WebWorkers API
   - Fetch API
   - Fullscreen API
   - Touch events
   - GamePad API (for haptic devices)

3. Microloader
   - WebVRFeatureDetector also has a microloader, written to be ultra-compatible with old browsers, that can load additional libraries and polyfills in the order specified. The syntax of the supplied load manifest resembles Modernizr;

   [{load1}, {load2}, {load3},...{loadNum}]

   Where each loadNum can have multiple objects specified, which do not load in a preferred order.

   {name: 'object name', path: 'path to js file', poly: Boolean }

   'object name' should exactly match a detected property in WebVRFeature detector if the poly: true option is selected. Non polyfill libraries should be loaded with poly: false.

   If you supply a polyfill and it is unnecessary, don't work - it won't be loaded, and the native browser API will be used instead.

   In addition to the load manifest, you should supply 3 callback functions:
    - callback for loading completing normally
    - callback for a progress bar or other indicator of the loading progress 
    - callback for error function if loading fails

   A Sample load with callbacks:

    FeatureDetector.load([
    [
      {name: 'typedArray', path: 'js/polyfills/typedarray.js', poly: true},
      {name: 'promise', path: 'js/polyfills/Promise.min.js', poly: true}
    ],
    [
      {name: 'CustomEvent', path: 'js/polyfills/custom-event-polyfill.js', poly: true},
      {name: 'three', path: 'js/three/three.min.js', poly: false}
    ], function () {
      //callback function when load complete
    }, function () {
      //progress function for loading
    }, function () {
      //error function for loading
    });

### Some Polyfills

The example (access under dist/polyfilled.html) loads a set of useful polyfills which enable a graceful decay pattern with older browsers. All the polyfills here have NPM versions.

    WebVR API - not supported in desktops, support in iOS and Android browsers.
    * @link http://webvr.info
    * @link https://iswebvrready.org/
    * Polyfill at: @link https://github.com/borismus/webvr-polyfill

    Promise API - supported in recent desktops and mobiles
    * @link https://davidwalsh.name/promises
    * Polyfill at: @link https://github.com/taylorhakes/promise-polyfill

    GamePad API - supported in recent versions of Chrome desktop
    @link https://www.smashingmagazine.com/2015/11/gamepad-api-in-web-games/
    * Polyfill at: https://github.com/MozVR/gamepad-plus


    GamePad Vibration API (proposed)
    GamePad Pose API (proposed)
    GamePad Touchpad (proposed)
    * @link https://lists.w3.org/Archives/Public/public-webapps/2016AprJun/0052.html

    Fetch API
    * @link https://davidwalsh.name/fetch
    Polyfill
    * @link https://github.com/github/fetch

### Integrating VR Headset Hardware Info

### Example

  Plutonian System Data:
  https://en.wikipedia.org/wiki/Charon_(moon)
  https://en.wikipedia.org/wiki/Pluto
  https://en.wikipedia.org/wiki/Moons_of_Pluto#Scale_model_of_the_Pluto_system

  charon map shifted by 30 degrees so rotated to face pluto corrected.

  Asteroid Editors
  Clara.io
  http://clara.io

  SculptGL
  http://stephaneginier.com/sculptgl/
  
  Image sources:
  http://laps.noaa.gov/albers/sos/sos.html
  http://laps.noaa.gov/albers/sos/features/
  http://planetpixelemporium.com/earth.html (bumpmaps)

### Some Dev Notes

  This project highlights features of WebVRFeatureDetector for testing the browser 
  and loading appropriate polyfills in the correct sequence. It will load fallbacks 
  on less capable browsers:
  - HTML5 Canvas but no WebGL: renders one frame 
  - No HTML5 Canvas: fallback GIF image

Git Deployment

Deploy website from dist to gh-pages
https://gist.github.com/cobyism/4730490
http://lea.verou.me/2011/10/easily-keep-gh-pages-in-sync-with-master/
https://help.github.com/articles/creating-project-pages-manually/
https://pages.github.com/
http://www.damian.oquanta.info/posts/one-line-deployment-of-your-site-to-gh-pages.html

METHOD 0 (not for groups)
http://brettterpstra.com/2012/09/26/github-tip-easily-sync-your-master-to-github-pages/

METHOD 1
git checkout master # you can avoid this line if you are in master...
git subtree split --prefix dist -b gh-pages # create a local gh-pages branch containing the splitted output folder
git push -f origin gh-pages:gh-pages # force the push of the gh-pages branch to the remote gh-pages branch at origin
git branch -D gh-pages # 

METHOD 2
Part I:
git checkout master
git add --all 
git commit -m "some message"
git push origin master
Part 2:
git checkout gh-pages // go to the gh-pages branch
git merge master // bring gh-pages up to date with master
git add --all 
git commit -m "some message"
git push origin gh-pages // commit the changes
git checkout master // return to the master branch
git branch //confirm you're on master
====================

WebVR Spec
https://mozvr.com/webvr-spec/

THREEJS Examples

http://learningthreejs.com/

https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js

http://threejs.org/examples/#canvas_geometry_earth

WebVR Demo (tracking dolly)
https://github.com/MozVR/webvr-demos/blob/master/demos/sechelt/js/sechelt.js

Tracking camera
https://github.com/squarefeet/THREE.TargetCamera

Another camera
https://github.com/strandedcity/InstructablesGalaxy

Chase camera
https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Chase-Camera.html

ALSO USE: Shader: glow effect
ALSO USE: DAT.gui library
ALSO USE: GamePad
ALSO USE: LeapMotion

More tracking cameras

Threejs cookbook - follow camera
https://github.com/josdirksen/threejs-cookbook

LeapMotion Cameras (lots of good VR ones)
https://github.com/leapmotion/Leap-Three-Camera-Controls

http://www.planetnodejs.com/article/56004f2db01cdd0e004d68a7/how-to-build-vr-on-the-web-today

Camera movement to point
http://stackoverflow.com/questions/18339425/three-js-camera-movement-to-point

http://barkofthebyte.azurewebsites.net/post/2014/05/05/three-js-projecting-mouse-clicks-to-a-3d-scene-how-to-do-it-and-how-it-works
https://codedump.io/share/f0Ibu51p6v6Z/1/move-in-the-direction-i-am-looking-webvr-three-js-oculus-rift

http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/

build orrey
http://planetoweb.net/app/

NPM building concept:
http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
http://www.codeblocq.com/2015/12/Build-and-package-your-client-side-code-using-npm/