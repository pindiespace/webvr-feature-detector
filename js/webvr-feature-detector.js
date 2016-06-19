/*
 * Device and feature detector for WebVR projects needing to provide
 * graceful decay for old and obsolete browsers.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function (window) {
  var self = this; // Scope.
  var cs, ctx, tests = [], retests = {}; self.results = {};

  var names = ['3d', 'webgl', 'experimental-webgl', 'experimental-webgl2', 'moz-webgl'];

  /*
   * Patches and fixes.
   *
   * This hack lets IE10 render to canvas with newer versions of
   * of THREE.js which use overrideMimeType in the Object loader.
   */
  if(window.XMLHttpRequest) {
    if (!XMLHttpRequest.overrideMimeType) {
      XMLHttpRequest.prototype.overrideMimeType = function (type) {};
    }
  }
 
  /* 
   * Remove errors for console.log or console.error on ancient browsers.
   * Add 'alert' if debugging is desired.
   */
  (function (con) {
    if (!con.log) con.log = function () {};
    if (!con.error) con.error = function (val) {alert(val)};
  })(window.console = window.console || {});

  /*
   * Feature detection.
   *
   * Our feature detectors are wrapped in named functions so they
   * can be re-tested after loading polyfills.
   *
   * Client vendor prefixes.
   * @link https://davidwalsh.name/vendor-prefix
   */
  tests['vendorPrefix'] = function () {
    // Get the vendor prefix for the client.
    if (!window.getComputedStyle) {
      return {
        js: '',
        css: ''
      };
    } else {
    var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms|o|xv)-/) || ['',''])[1]; // Default to nothing.
      return {
          js: pre,
          css: '-' + pre + '-',
        };
    }
  };

  /*
   * Test for document.createElement presence,
   * missing in IE < 7, FF < 2.
   */
  tests['createElement'] = function () {
    return !!(document.createElement);
  };

  /*
   * Test for basic HTML5 tag support.
   * Adapted from HTML5Shiv
   * @link https://github.com/aFarkas/html5shiv/blob/master/dist/html5shiv.js
   */
  tests['html5'] = function () {
    if(tests['createElement']()) {
      var a = document.createElement('a');
      a.innerHTML = '<xyz></xyz>';
      //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
      var res = ('hidden' in a);
      a = a.innerHTML = null;
      return res;
    }
    return false;
  };

  /*
   * Test for HTML5 canvas.
   * Note: No compatible polyfill (Flash-based ones won't work for WebVR).
   */
  tests['canvas'] = function () {
    return !!window.CanvasRenderingContext2D;
  };

  /*
   * Test for WebGL support in browsers supporting HTML5 canvas.
   * IE 9, 10 Polyfill available (non-Flash).
   * @link https://github.com/iewebgl/iewebgl
   */
  tests['webGL'] = function () {
    if (tests['canvas']() && document.createElement) {
        cs = document.createElement('canvas');
        for (i in names) {
          try {
            ctx = cs.getContext(names[i]);
            if (ctx && typeof ctx.getParameter == 'function') {
              cs = ctx = null;
              return true;
            }
          } catch (e) {}
        }
    }
    cs = ctx = null;
    return false;
  };

  /*
   * It is easier to re-create the WebGL context when
   * extraction version data, instead of trying to add it
   * to tests[] array.
   */
  tests['glVersion'] = function () {
    if (tests['canvas']() && document.createElement) {
        cs = document.createElement('canvas');
        for (i in names) {
          try {
            ctx = cs.getContext(names[i]);
            if (ctx && typeof ctx.getParameter == 'function') {
              var vers = ctx.getParameter(ctx.VERSION).toLowerCase();
              cs = ctx = null;
              return vers;
            }
          } catch (e) {}
        }
    }
    cs = ctx = null;
    return false;
  };

  /*
   * Detect Promise object support, missing in
   * all IE, Chrome < 33, FF < 29, Safari < 7.1,
   * iOS < 8, Android < 4.4.4.
   */
  tests['promise'] = function () {
    return ('Promise' in window);
  };

  /*
   * Detect support for WebWorkers, used in many 3D libraries, missing in
   * IE < 11, FF < 3.5, Safari < 4, iOS < 5.1, Android < 4.4.
   */
  tests['workers'] = function () {
    return !!window.Worker;
  };

  /*
   * Detect FileAPI support, may be usefulf or object
   * management in VR spaces, missing in
   * IE < 10, Chrome < 38, FF < 28, Safari < 5.1, iOS < 6,
   * Android < 3
   */
  tests['fileapi'] = function () {
    return !!(window.File && window.FileReader && window.FileList && window.Blob);
  };

  /*
  * Detect localStorage support, may be useful for object
  * management in VR spaces, not supported in
  * IE < 8, FF < 3.5, Safari < 4.
  */
  tests['localStorage'] = function () {
    var mod = 'test';
      try {
           localStorage.setItem(mod, mod);
           localStorage.removeItem(mod);
           return true;
       } catch(e) {
           return false;
       }
   };

   /*
    * Detect fetch (alternative to XHR) API support, better for
    * dynamic object requests than Ajax, missing in
    * All IE, Edge < 14, Chrome < 42, FF < 39, All Safari,
    * Android < 5.6.
    */
  tests['fetch'] = function () {
    return ('fetch' in window);
  };

  /*
   * Detect support for .querySelectorAll, missing in
   * IE < 9, FF < 3.5
   */
  tests['querySelectorAll'] = function () {
    return !!document.querySelectorAll;
  };

  /*
   * Detect support for addEventListener, missing in
   * IE < 9.
   */
  tests['addEventListener'] = function () {
    return ('addEventListener' in window);
  };

  /*
   * Detect support for CustomEvents, missing in
   * IE 9, 10, 11, Android < 4.4
   */
  tests['CustomEvent'] = function () {
    try {
      new CustomEvent('test');
    } catch(e) {
      return false;
    }
    return true;
  };

  /*
   * Detect support for a specific event type.
   * @link http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
   */
  var eventSupport_ = function(elem, eventName) {
    eventName = 'on' + eventName;
    var isSupported = (eventName in elem);
    if (!isSupported && 'setAttribute' in elem) {
      elem.setAttribute(eventName, 'return;');
      isSupported = typeof elem[eventName] == 'function';
      elem.removeAttribute(eventName);
    }
    return isSupported;
  };

  /*
   * Support for ES5 properties, missing in
   * IE < 9, Chrome < 23, FF < 21, Safari < 6,
   * Android < 4.4
   */
  tests['defineProperty'] = function () {
    return ('defineProperty' in Object);
  };

  tests['defineProperties'] = function () {
    return ('defineProperties' in Object);
  };

  /*
   * Detect typed arrays (needed for WebGL), missing in
   * IE < 11, Chrome < 7, FF < 4, Safari < 6,
   * Android < 4.
   */
  tests['typedArray'] = function () {
    return ('ArrayBuffer' in window);
  };

  /*
   * Detect support for W3C Fullscreen API. No browser completely
   * and consistently supports the W3C standard. Partial support
   * in IE Edge, Chrome > 14, FF > 9, Safari > 5. NO SUPPORT in
   * Android and iOS Safari browser.
   *
   */
  tests['fullScreen'] = function () {
    return !!(document.documentElement.requestFullscreen);
  };

  /*
   * Detect touch support.
   * useful for changing the Ui if touch is used, missing in
   * IE, Edge, Chrome < 22, FF, Safari. Full support in iOS
   * Safari and Android.
   */
  tests['touch'] = function () {
    return !!(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch));
  };

  /*
   * Detect native support for requestAnimationFrame, missing in
   * IE < 11, Chrome < 10, FF < 4, Safari < 6, Android < 4.4
   */
  tests['requestAnimationFrame'] = function () {
    return ('requestAnimationFrame' in window);
  };

  /*
   * Gamepad API, used by haptic controllers.
   * No IE Support, Chrome < 21, FF < 29, no iOS or
   * Android support. Wii has its own non-W3C version,
   * window.wiiu.gamepad
   */
  tests['gamepad'] = function () {
    return !!navigator.getGamepads;
  };

  /*
   * Test for WebVR API.
   * @link https://iswebvrready.org/
   */
  tests['webvr'] = function () {
    if ('getVRDisplays' in navigator) {
      console.log('found getVRDisplays');
      return true;
    } else if ('getVRDevices' in navigator || 'mozGetVRDevices' in navigator) {
      console.log('found getVRDevices in navigator (obsolete, in Firefox)');
      return false;
    }
    else {
      return false;
    }
  };

  /*
   * Test for IE and Edge
   * @link https://codepen.io/gapcode/pen/vEJNZN
   * @returns if IE or Edge, the version number, else false.
   */
  tests['ie'] = function () {
    var ua = window.navigator.userAgent.toLowerCase();

    // IE 10 or older
    if (ua.indexOf('msie ') >= 0) {
      var re  = new RegExp("msie ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null)
        console.log(RegExp.$1)
        return parseFloat(RegExp.$1);
    }
    else if (ua.indexOf('trident/') >= 0) {
      // IE 11 => return version number
      var x = ua.indexOf('rv:');
      return parseInt(ua.substring(x + 3, ua.indexOf('.', x)), 10);
    }
    var x = ua.indexOf('edge/');
    if (x >= 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(x + 5, ua.indexOf('.', x)), 10);
    }
    return false;
  }

  /*
   * Microloader. Store polyfills to load. Deliberately old-school for maximum browser support.
   * @link https://css-tricks.com/snippets/javascript/async-script-loader-with-callback/
   * @link https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
  */
  function load (batches, callback, progressFn, failFn) {
    var head = document.getElementsByTagName('head')[0] || document.documentElement,
    batchLength = 0,
    batchCount = 0,
    scriptLength = 0,
    scriptCount = 0,
    gScriptCount = 0,
    scriptsToLoad = 0;

    var err_ = function (s, msg) {
      console.error('in err_:' + typeof s + ' ' + msg);
      console.error('in err_ type of s:' + typeof s.nodeType );
      if (s && s.nodeType) {
        head.removeChild(s);
      }
      if(failFn) {
        failFn('error at script #:', batchCount, scriptCount, s);
        s = null;
      }
    };

    var clear_ = function (s) {
      //clear the event and prevent memory leaks
      console.log('clearing event:' + typeof s)
      if (s) {
      // Progress report.
        gScriptCount++;
        progressFn(parseInt(100 * gScriptCount / scriptsToLoad), s.src);
        console.log("CLEARING:" + s.src)
        head.removeChild(s);
        s.onreadystatechange = s.onload = null;
        s = null;
      }
      // Increment script and possibly batch.
      scriptCount++;
      if (scriptCount >= scriptLength) {
        scriptCount = 0; batchCount++;
        if (batchCount < batchLength) {
          runScriptBatch(batches[batchCount])
        } else {
          console.log("ALL DONE")
          callback();
        }
      }
    };

    function runScriptBatch (batchScript) {
      console.log('scriptLength:' + scriptLength)
      for (var i = 0; i < batchScript.length; i++) {
        scriptLength = batchScript.length; //NOTE: if done outside for (), incorrect value in old IE.
        var scr = batchScript[i];
        if (!scr) {
          clear_(); //empty script
          break;
        }
        // If we don't need the polyfill, don't load it
        if (scr.poly === true && self.results[scr.name] === true) {
          console.log("No polyfill needed:" + scr.name);
          clear_();
        } else {
          console.log('running batchScript:' + scr.name)
          //scr.script = document.createElement('script');
          var s = document.createElement('script'); //scr.script;
          s.type = 'text\/javascript';
          s.charset = 'utf8';
          s.async = true;
          s.src = scr.path;
          // Old IE version.
          if (s.onreadystatechange !== undefined) {
            s.onreadystatechange = function () {
              console.log('value of scriptLength:' + scriptLength)
              console.log('IE readyState:' + this.readyState + ' for:' + this.src)
              if (/loaded|complete/.test(this.readyState)) {
                  console.log('IE loaded:' + this.src);
                  //head.insertBefore(s, head.firstChild);
                  this.onreadystatechange = null;
                  console.log('scriptCount:' + scriptCount)
                  clear_(this);

                // IE hack to stop loading
                var firstState = this.readyState;
                this.children;
                if (firstState == 'loaded' && this.readyState == 'loading') {
                  err_(this, 'error in readyState load for:' + e.srcElement.baseURI);
                  this.onreadystatechange = null;
                  clear_(this);
                  return;
                }
              } //loaded or complete
            }
          } else if (s.onload !== undefined) {
            s.onload = function (e) {
              console.log('loaded:' + this.src);
              console.log('scriptCount:' + scriptCount)
              clear_(this);
              return;
            }
            s.onerror = function (e) {
              err_(e.target, 'error in onload for:' + e.target);
            }
          } else {
            err_(s,'script loading not supported for:' + scr.path);
          }

        // Add script to document.head.
        //console.log('self.head is a:' + self.head)
        //TODO: TEST ON OLD IE FOR COMPLETION.
        //TODO: may need to use createNode like below
        //@link http://stackoverflow.com/questions/6946631/dynamically-creating-script-readystate-never-complete
          head.insertBefore(s, head.firstChild);
        } //end of batch[i].name test
      } // end of for () loop
      //We only go here if there's an empty batch!
      if(batchScript.length == 0) {
        failFn('Loader: empty batch [] at index:', batchCount, 0, 0, 'undefined');
      }
    }; // end of function

    // Main program. Count scripts to load.
    console.log('Loader: starting batches:' + batches.length);

    // Scripts is an array of arrays
    for (var i = 0, len = batches.length; i < len; i++) {
      for (var j = 0, len2 = batches[i].length; j < len2; j++) {
        var scr = batches[i][j];
        if (!scr) {
          failFn('Loader: missing object (probably trailing comma) for batch index:', i, j, scr);
          //return false;
        } else {

        // Make sure the necessary data is present.
        if (!scr.name || !scr.path || scr.poly === undefined) {
            if (scr.name) {
              scr = scr.name;
            }
            failFn('Loader: incorrect batch syntax for batch index:', i, j, scr);
            return false;
          }
        if (scr.poly === true) {
          if (!self.results[scr.name]) {
            scriptsToLoad++;
          }
        } else {
          scriptsToLoad++;
        }
      }
      }
    }

    // Set starting length of batches.
    batchLength = batches.length;
    // Load scripts
    runScriptBatch(batches[batchCount]);
  }; // End of microloader.

  // Redetect after loading complete
  function reDetect () {
    for (var i in retests) {
      console.log('retesting ' + i);
      if (self.results[i] === undefined) {
        console.error('error retest ' + i + ' not in original results!');
      } else if (!self.results[i]) {
        console.log('checking if polyfill ' + i + ' added functionality to browser');
        self.results[i] = tests[i]();
        if (self.results[i]) {
          console.log('polyfill ' + i + ' added browser functionality');
        } else {
          console.error('polyfill ' + i + ' failed to fix browser!');
        }
      }
    }
  };

  // Detect features. Export so we can re-detect after polyfills are loaded.
  // tests used by other tests can be pre-computed.
  function detect() {
    self.results = {
      deviceorientation: eventSupport_(window, 'deviceorientation'),
      devicemotion: eventSupport_(window, 'devicemotion'),
      load: load,
      detect: detect,
      reDetect: reDetect
    };
    for (var i in tests) {
      if (typeof(tests[i]) === 'function') { // this allows us to pre-compute some results.
        self.results[i] = tests[i]();
      } else {
        self.results[i] = tests[i];
      }
    };
    return self.results;
  }

  // Fire first detection and report results.
  window.WebVRFeatureDetector = detect();

})(window);
