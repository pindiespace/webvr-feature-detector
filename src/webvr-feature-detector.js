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
(function (win) {
  var self = this; // Scope.
  var cs, ctx, glType = '', glVers = '', tests = [], retests = {}; self.results = {};

  var names = ['webgl', 'experimental-webgl', 'moz-webgl', 'experimental-webgl2', '3d'];

  /*
   * Patches and fixes.
   *
   * This hack lets IE10 render to canvas with newer versions of
   * of THREE.js (which use overrideMimeType in the Object loader).
   */
  if(win.XMLHttpRequest && !XMLHttpRequest.overrideMimeType) {
    XMLHttpRequest.prototype.overrideMimeType = function (type) {};
  }

  /* 
   * Remove errors for console.log or console.error executing on ancient browsers.
   * Add 'alert' if debugging is desired.
   */
  (function (con) {
    if (!con.log) con.log = function (val) {}; // debug with alert(val)
    if (!con.error) con.error = function (val) {}; // debug with alert(val)
  })(win.console = win.console || {});

  /* 
   * feature detect browsers, modified from: 
   * @link https://jsfiddle.net/9atsffau/
   * @link http://www.opentechguides.com/how-to/article/javascript/99/browser-detect.html
   */
  var ua = navigator.userAgent.toLowerCase(), verOffset = -1, ver = false, m, verReg = new RegExp('[0-9]+');

  var browser = {
    opera: (!!win.opr && !!opr.addons) || !!win.opera || ua.indexOf(' opr/') > -1 || ua.indexOf('opios') > -1 || false,
    // Firefox 1.0+
    firefox: !!win.netscape || typeof InstallTrigger !== 'undefined' || 'MozAppearance' in document.documentElement.style,
    // At least Safari 3+: "[object HTMLElementConstructor]"
    safari: Object.prototype.toString.call(win.HTMLElement).indexOf('Constructor') > 0,
    // Internet Explorer 6-11
    ie: /*@cc_on!@*/false || !!document.documentMode
    // Chrome 1+
  };
  // Blink engine detection
  //blink: (isChrome || isOpera) && !!win.CSS
  browser.chrome = !browser.opera && (!!win.chrome && !win.Geolocation) || !!(win.chrome && win.chrome.webstore) || ua.match('crios') || false;
  browser.edge = !browser.safari && !browser.ie && !!win.Geolocation && !browser.chrome && !browser.firefox && !browser.opera && !!win.styleMedia && !!win.Promise;
  browser.mobileSafari = browser.safari && ua.indexOf('mobile') > -1 || false; //detect later
  browser.mobileChrome = browser.chrome && ua.indexOf('mobile') > -1 || false;
  //http://developer.samsung.com/technical-doc/view.do?v=T000000270&pi=1&ps=10&pb=Y&ct=CT330000&sc=javascript
  browser.samsung = ua.indexOf('samsung') > -1 || false;
  browser.samsungGearVR = ua.indexOf('mobile vr') > -1 || false; //impt for GearVR
  browser.mobileFirefox = browser.firefox && ua.indexOf('mobile') > -1 || false;

  /* 
   * Look for the browser version number in a user-agent string. 
   * Fallback when browser feature detection doesn't work.
   * @param String str the user-agent string.
   * @param Boolean fflag if true, return float;
   * @reaturns Number version number.
   */
  function getVer (str, fflag) {
    var result = verReg.exec(str);
    if (result && result[0]) {
      if (fflag) {
        return parseFloat(result[0]);
      }
      return parseInt(result[0]);
    }
    return false;
  }

  /* 
   * Operating systems. These generally can't be feature-detected, se 
   * we use the user-agent. Needed for browser determinations later, 
   * so done before our detect.
   * Adapted from:
   * https://github.com/ded/bowser/blob/master/src/bowser.js#L29
   */
  var os = {
      ios: ua.match(/(ipod|iphone|ipad)/) || false,
      android: ua.indexOf('android') > -1 || false,
      chromeos: ua.indexOf('cros') > -1 || false,
      silk: ua.indexOf('silk') > -1 || false,
      sailfish: ua.indexOf('sailfish') > -1 || false, // linux mobile os with webgl
      tizen: ua.indexOf('tizen') > -1 || false,
      webos: /(web|hpw)os/i.test(ua) || false,
      windowsphone: ua.indexOf('windows phone') > -1 || false,
      blackberry: /(blackberry|bb10|rim[0-9])/.test(ua),
      firefoxos: /mobile.*(firefox)/i.test(ua) || false
   };

  // Additional matches.
  os.windows = !os.windowsphone && ua.indexOf('windows') > -1,
  os.mac = !os.ios && !os.silk && /(macintosh|mac os)/.test(ua) || false,
  os.linux = !os.android && !os.sailfish && !os.tizen && !os.webos && ua.indexOf('linux') > -1;

  // OS Version detects (mobile only).
  if (os.ios) {
    m = (ua).match(/os (\d+)_(\d+)_?(\d+)?/);
    if (m && m[1] && m[2]) {
      os.ios = parseFloat(m[1] + '.' + m[2]);
    }
  } else if (os.crios) {
    // TODO: CriOS detects here.
  } else if (os.linux) {
    // TODO: Linux detects here.
  } else if (os.android) {
    m = ua.match(/android (\d+(?:\.\d+)+)[;)]/);
    if (m && m[0]) {
      os.android = parseFloat(m[0]);
    }
  } else if (os.windowsphone) {
    m = ua.match(/windows phone (\d+\.\d+)/);
    if (m && m[1]) {
      os.windowsphone = parseFloat(m[1]);
    }
  } else if (os.blackberry) {
    if (ua.indexOf('bb10') >= 0) { // only Blackberry 10 phones would work (also support WebGL).
      m = ua.match(/bb10.*version\/(\d+\.\d+)?/);
      if (m && m[1]) {
        os.blackberry = parseFloat(m[1]);
      }
    }
  } else if (os.tizen) {
      m = ua.match(/tizen.*(\d+\.\d+)/);
      if (m && m[0]) {
        os.tizen = parseFloat(m[0])
      }
  } else if (os.windows) {
    verOffset = ua.indexOf('windows nt ');
    //ver = parseFloat(ua.substring(verOffset+11));
    ver = getVer(ua.substring(verOffset+11), true);
    //alert("OFFSET:" + verOffset + "VER:" + ver)
    switch (ver) {
      case 10.0:
        os.windows = '10';
        break;
      case 6.2:
        os.windows = '8';
        break;
      case 6.1:
        os.windows = '7';
        break;
      case 6.0:
        os.windows = 'vista';
        break;
      case 5.1:
        os.windows = 'xp';
        break;
      default:
        break;
    }
  } else if (os.mac) {
      // Not used.
    }

  var platform = {
    tablet: ua.indexOf('tablet') > -1,
    xbox: ua.indexOf('xbox') > -1, 
    wii: ua.indexOf('wiiu') > -1,
    nintendo: ua.indexOf('nintendo') > -1,
    playstation: ua.indexOf('playstation') > -1,
  };

  platform.console = platform.xbox || platform.wii || platform.playstation || false,
  platform.tv = /(google|apple|smart|hbb|opera|pov|net).*tv|(lg|aquos|inettv).*browser|(roku|kylo|aquos|viera|espial|boxee|dlnadoc|crkey|ce-html)/.test(ua) || false,
  platform.mobile = !platform.tablet && !platform.tv && !(os.ios || os.android || os.silk || os.sailfish || os.tizen || os.webos || /[^-]mobi/i.test(ua) > -1) || false,
  platform.desktop = !platform.mobile && !platform.tablet && !platform.console && !platform.tv;

  // Test for features here that other feature tests depend on, to ensure they work.
  var createElement = !!document.createElement;
  var canvas = !!win.CanvasRenderingContext2D;

  /* 
   * Detect browsers by features (not user-agent)
   *
   * Test for Edge versions. All work with WeGL, 
   * THREE v77 and WebVR-polyfill
   */
    if (browser.edge)  {
      browser.edge = (function () {
        if (!document.documentElement.requestPointerLock) {
          return 12;
        } else if (!navigator.sendBeacon) {
          return 13;
        }
        // Fallback for new browsers with undefined feature-testing
        verOffset = ua.indexOf('edge/')
        if (verOffset !== -1) {
          return getVer(ua.substring(verOffset+8));
        }
        return false;
      })();
    }

  /*
   * Test for IE versions. UA string is so abused that 
   * we test features to confirm.
   * IE10 : CanvasRenderer
   * IE11+: WebGL
   * @link http://tanalin.com/en/articles/ie-version-js/
   * @link https://codepen.io/gapcode/pen/vEJNZN
   * @returns if IE or Edge, the version number, else false.
   */
  if (browser.ie) {
    browser.ie = (function () {
    // Feature-test IE candidate, fallback to user-agent if fails.
    if (document.compatMode && !win.atob) {
      if (!win.XMLHttpRequest) { //ie7 test, only works in 'real' IE6
        return 6;
      } else if (!document.querySelector) {
        return 7;
      } else if (!document.addEventListener) {
        return 8;
      } else {
        return 9;
      }
    } else { // Modern.IE
      if(!win.Promise && win.atob) {
        if (!(win.ActiveXObject) && "ActiveXObject" in win) {
          return 11; // Supports THREE WebGL
        } else {
          return 10; // Supports THREE CanvasRenderer
        }
      }
      return 5;
    }
    return false;
    })();
  }

  /** 
   * Test for firefox. To handle Gecko clones, we feature-detect old browsers, and 
   * use the user-agent for newer ones able to run THREE.
   * Compatible:
   * FF 15+ : CanvasRenderer
   * @link http://browserhacks.com/
   * @link https://davidwalsh.name/check-parent-node
   * @link http://stackoverflow.com/questions/7000190/detect-all-firefox-versions-in-js
   */
  if (browser.firefox) {
    browser.firefox = (function () {
    // Feature-test Firefox candidate, fallback to user-agent if fails.
    if (typeof win.devicePixelRatio === undefined) {
      try {
        if (win.alert && !win.XPCNativeWrapper && !win.URL) {
            return 1;
        } else if(win.XPCNativeWrapper) {
            return 1.5
        } else if (win.globalStorage && !win.postMessage) {
            return 2;
        } else if (!document.querySelector) {
            return 3;
        } else if (!win.mozRequestAnimationFrame) {
            return 3.5;
        } else if (win.URL && !createdElement.style.MozAnimation) {
            return 4; // WebGL available.
        } else if (!typeof WeakMap) {
            return 5; // WebGL available CORS textures disabled.
        } else if (!createdElement.style.textOverflow) {
            return 6;
        } else if (!createdElement.insertAdjacentHTML) {
            return 7;
        } else if (!navigator.doNotTrack) {
            return 8; // CORS re-enabled for WebGL textures.
        } else if (win.mozIndexedDB &&
            !document.mozFullScreenEnabled) {
            return 9;
        } else if (
            !win.mozCancelAnimationFrame && !Reflect === undefined) {
            return 10;
        } else if (!createdElement.style.MozTextAlignLast) {
            return 11;
        } else if (!createdElement.style.MozOpacity) {
            return 12;
        } else if (!createdElement.style.MozOpacity &&
            win.globalStorage) {
            return 13;
        } else if (!win.globalStorage && !createdElement.style.borderImage) {
            return 14;
        } else if (!createdElement.style.animation) {
            return 15; // First version that works with CanvasRenderer
        } else if (
            !createdElement.style.iterator && !Math.hypot) {
            return 16;
        } else {
            return 17; // last version with device.pixelRatio
        }
      } catch (e) {
        console.error('firefox feature test failed:' + e);
      } // end of try...catch
    } // end of device.pixelRatio test

    // version 23 first support for CSS.supports();

    // fallback for new browsers, and old browsers with console.config features disabled
    verOffset = ua.indexOf('firefox');
    if (verOffset !== -1) {
      return getVer(navigator.userAgent.substring(verOffset+8));
    }
    return false;
    })();
  }

  //TODO: research Firefox mobile https://en.wikipedia.org/wiki/Firefox_for_mobile
  //TODO: https://html5test.com/compare/browser/android.samsung-3.0/nintendowiiu-4/xboxone-10.0/firefoxmobile-40.html

  /* 
   * Feature test for Google Chrome. We feature-detect out non-chrome browsers, 
   * then do some feature-testing for individual versions of chrome. Otherwise, 
   * trust the user agent string.
   * Compatible:
   * Chrome 24+ : CanvasRenderer
   * @link http://browsershots.org/
   * @link http://oldversion.com
   * @link http://browserstack.com
   * @link http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
   */
  if (browser.chrome) {
    browser.chrome = (function () {
      // get a version from the user-agent first, since some versions, don't have differentiating features.
      verOffset = ua.indexOf('chrome/');
      if (verOffset !== -1) {
        ver = getVer(ua.substring(verOffset+7));
      }
      // Feature-test Chrome candidate, fallback to user-agent if fails.
      try {
        if (!('onhashchange' in win)) {
            return 4;
        } else if (win.EventSource === undefined) { //server-sent events undefined
            return 5;
        } else if (!win.ArrayBuffer) { //typed arrays undefined
            return 6;
        } else if (win.URL && 
          !win.URL.createObjectURL) { // .createObjectURL undefined
            return 7;
        } else if (!win.matchMedia) { // .matchMedia undefined
            return 8;
        } else if (!win.webkitRequestAnimationFrame) { // .requestAnimationFrame undefined
            return 9; //Note: This version CRASHES trying to get WebGL context!
        } else if (!win.crypto) { // crypto undefined
            return 10;
        } else if (ver === 11) { // no reliable features!
            return 11;
        } 
        else if (!navigator.registerProtocolHandler) { //customEvent enabled in Chrome 9-12
            return 12;
        } else if (typeof document['hidden'] === undefined) { // Page visibility enabled in 14
            return 13;
        } else if(!document.documentElement.scrollIntoViewIfNeeded) { //scrollIntoView enabled in 15
            return 14;
        } else if (document.documentElement.webkitRequestFullScreen && 
          !win.CustomEvent) { //CustomEvent re-enabled in 15
            return 15;
        } else if (ver === 16) { // no reliable features!
            return 16;
        } else if (!win.MutationObserver) { //MutationObserver undefined
            return 17;
        } else if (!(win.performance && win.performance.now)) { //No undefined test, MutationObserver enabled
            return 18; // First version with valid WebGL
        } else if (!ver === 19) { // no reliable features!
            return 19;
        } else if (!navigator.getGamepads) { //, no gamePads, High-Resolution time API enabled
            return 20;
        } else if (!document.documentElement.requestPointerLock) { //no pointerLock, GamePad API enabled
            return 21;
        } else if (!win.MediaSource) {
            return 22
        } else if (!win.Intl) { // Internationalization undefined
            return 23;
        } else if (!document.documentElement.createShadowRoot) { //shadow DOM undefined
            return 24;
        } else if (ver === 25) { // no reliable features!
            return 25;
        }
        else if (ver === 26) { // no reliable features!
            return 26;
        }
        else if (!CSS.supports) {
          return 27; // After this, easy to get version via css.supports() sniffing.
        }
      } catch (e) {
        console.error('chrome feature test failed:' + e)
      }

      // If we didn't feature detect, return guess based on user-agent
      return ver;

    return false; // not Chrome
    })();
  }

  // TODO: Research chrome mobile

  /* 
   * Test for Opera versions (webkit) that work with WebGL
   */
  if (browser.opera) {
    browser.opera = (function() {
    // Detect version in old and new versions.
    verOffset = ua.indexOf('opr/');
    if (verOffset !== -1) {
      ver = getVer(ua.substring(verOffset+4));
    } else {
      if (win.opera && win.opera.version) { // ask old Opera its version
        return parseInt(win.opera.version());
      }
      verOffset = ua.indexOf('opera/'); // fallback to ua-sniffing
      if(verOffset !== -1) {
        ver = getVer(ua.substring(verOffset+6));
      }
    }
    // Feature-test Opera candidate, fallback to user-agent if fails.
    try {
      if (!win.JSON) {
          return 10;
      } else if (!win.ArrayBuffer) { //typed arrays undefined
          return 11;
      } else if (!win.MutationObserver || (win.CSS && !win.CSS.supports)) { //MutationObserver undefined
          return 12;
      } else if (!navigator.geolocation) { // Enabled in 11-12, disabled 15, re-enabled 16
          return 15;
      } else if (!win.navigator.vibrate) {
          return 16;
      } else if (!win.webkitRTCPeerConnection) {
          return 17;
      } else if (!win.CustomEvent && !win.Promise) {
        return 18;
      } else if (!win.CustomEvent) {
        return 19;
      } else if (!document.documentElement.matches) {
        return 20; // webkitmatches only
      } else if (ver === 21) {
        return 21;
      } else if (ver === 22) {
        return 22;
      } else if (!navigator.getGamepads) {
        return 23;
      }
    } catch (e) {
      console.error('opera feature tests failed');
    }

    // Fallthrough if not feature-detected.
    if (ver !== -1) {
      return ver;
    }
    return false;
    })();
  }

  /* 
   * Test for Apple Safari, esp. mobile iOS versions. 
   * VASTLY more accurate than trying to sniff webkit version 
   * in the user-agent.
   */
  if (browser.safari) {
    browser.safari = (function () {
    verOffset = ua.indexOf('safari/');
    // Feature-test Safari candidate, fallback to user-agent if fails.
    try {
      if (!document.documentElement.insertAdjacentHTML) {
          return 3.1;
        } else if (!navigator.geolocation) {
          return 4;
        } else if (!window.matchMedia) {
          return 5;
        } else if (!win.MutationObserver) {
          return 5.1;
        } else if (!document['hidden']) {
          return 6;
        } else if (!win.SpeechSynthesisUtterance) {
          return 6.1;
        } else if (!win.crypto) {
          return 7;
        } else if (!win.performance.timing) {
          return 7.1;
        } else if (!document.documentElement.closest) {
          return 8;
        } else if (!window.CSS.supports('--all', 'unset')) { // css.supports() tests possible
          return 9;
        } else if (!document.documentElement.createShadowRoot) {
          return 9.1
        }
      } catch (e) {
        console.error('Safari feature detect failed');
      }
      if (verOffset !== -1) {
        return getVer(ua.substring(verOffset+7));
      }
      return false;
    })();
  }

  /* 
   * Mobile Safari has a different featureset
   */
  if (browser.safari && platform.iOS) {
    browser.mobileSafari = (function () {
      verOffset = ua.indexOf('safari/');
      try {
        if (!win.JSON) {
          return 3.2;
        } else if (!win.ArrayBuffer) {
          return 4.1;
        } else if (!win.matchMedia) {
          return 4.3;
        } else if (!win.FileReader) {
          return 5.1;
        } else if(!win.crypto) {
          return 6.1;
        }
      } catch (e) {
        console.error('Mobile Safari feature detect failed');
      }
      if (verOffset !== -1) {
        return getVer(ua.substring(verOffset+7));
      }
      return false;
    })();
  }

  /* 
   * Hardware detects.
   */
  tests['screen'] = function () {
    var s = {
      touch: !!(('ontouchstart' in win) || win.DocumentTouch && document instanceof DocumentTouch),
      width: (Math.max(win.screen.width, win.screen.height)  || 0),
      height: (Math.min(win.screen.width, win.screen.height) || 0),
      pixelRatio: win.devicePixelRatio
    };
    // Define display pixels and retina.
    s.pixelWidth = parseInt(s.width * s.pixelRatio);
    s.pixelHeight = parseInt(s.height * s.pixelRatio);
    s.retina = (s.pixelRatio > 1);
    s.longest = Math.max(s.width, s.height);
      return s;
  };

  /* 
   * Used to resize canvas.
   */
  tests['getComputedStyle'] = function () {
    return !!window.getComputedStyle;
  };

  /*
   * Environment Feature detection.
   * 
   * The goal is to determine whether we can run WebVR (native or polyfill), 
   * along with the associated libraries, loading polyfills if necessary.
   *
   * Our feature detectors are wrapped in named functions so they
   * can be re-tested after loading polyfills.
   *
   * Client vendor prefixes.
   * @link https://davidwalsh.name/vendor-prefix
   */
  tests['vendorPrefix'] = function () {
    // Get the vendor prefix for the client.
    if (!win.getComputedStyle) {
      return {
        js: '',
        css: ''
      };
    } else {
    var styles = win.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms|o|xv)-/) || ['',''])[1]; // Default to nothing.
      return {
          js: pre,
          css: '-' + pre + '-'
        };
    }
  };

  /*
   * Test for document.createElement presence,
   * missing in IE < 7, FF < 2.
   */
  tests['createElement'] = function () {
    return !!document.createElement;
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
    return canvas;
    //return !!win.CanvasRenderingContext2D;
  };

  /*
   * Test for WebGL support in browsers supporting HTML5 canvas.
   * IE 9, 10 Polyfill available (non-Flash).
   * @link https://github.com/iewebgl/iewebgl
   */
  tests['webGL'] = function () {
    if (canvas && document.createElement) {

      if (!win.WebGLRenderingContext) {
        return false;
      }
      var verOffset = ua.indexOf('chrome');
      //Flag for Google Chrome 9, which crashes if you try to access a 3d context.
      if (browser.chrome && getVer(ua.substring(verOffset+7)) < 18) {
        return false;
      }
      cs = document.createElement('canvas');
      for (i in names) {
        try {
          ctx = cs.getContext(names[i]);
          if (ctx && typeof ctx.getParameter == 'function') {
            glType = names[i];
            glVers = ctx.getParameter(ctx.VERSION).toLowerCase();
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
   * Return type of WebGL context (e.g. 'experimental') from WebGL detect.
   */
  tests['glType'] = function () {
    return glType;
  };

  /* 
   * Return version of WebGL context from WebGL detect.
   */
  tests['glVersion'] = function () {
    return glVers;
  };

  /*
   * Detect Promise object support, missing in
   * all IE, Chrome < 33, FF < 29, Safari < 7.1,
   * iOS < 8, Android < 4.4.4.
   */
  tests['promise'] = function () {
    return ('Promise' in win);
  };

  /*
   * Detect support for WebWorkers, used in many 3D libraries, missing in
   * IE < 11, FF < 3.5, Safari < 4, iOS < 5.1, Android < 4.4.
   */
  tests['workers'] = function () {
    return !!win.Worker;
  };

  /*
   * Detect FileAPI support, may be usefulf or object
   * management in VR spaces, missing in
   * IE < 10, Chrome < 38, FF < 28, Safari < 5.1, iOS < 6,
   * Android < 3
   */
  tests['fileapi'] = function () {
    return !!(win.File && win.FileReader && win.FileList && win.Blob);
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
    return ('fetch' in win);
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
    return ('addEventListener' in win);
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
   * Detect support for CSS PointerEvents, useful 
   * for ui 
   */
  tests['CSSPointerEvent'] = function () {
    if (document.createElement) {
      var elem = document.createElement('x');
      elem.style.cssText = 'pointer-events:auto';
      var r = elem.style.pointerEvents === 'auto';
      elem = null;
      return r;
    }
    return false;
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
    return ('ArrayBuffer' in win);
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
    return !!(('ontouchstart' in win) || (win.DocumentTouch && document instanceof DocumentTouch));
  };

  /*
   * Detect native support for requestAnimationFrame, missing in
   * IE < 11, Chrome < 10, FF < 4, Safari < 6, Android < 4.4
   */
  tests['requestAnimationFrame'] = function () {
    return ('requestAnimationFrame' in win);
  };

  /*
   * Gamepad API, used by haptic controllers.
   * No IE Support, Chrome < 21, FF < 29, no iOS or
   * Android support. Wii has its own non-W3C version,
   * win.wiiu.gamepad
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
   * Test if the device is mobile
   */
  tests['mobile'] = function () {
    return (platform.mobile || platform.tablet);
  };

  /* 
   * Browser types and versions
   */
  tests['browser'] = function () {
    return browser;
  };

  /* 
   * Operating system.
   */
  tests['os'] = function () {
    return os;
  };

  /* 
   * Hardware form-factor (e.g. mobile vs TV)
   */
  tests['platform'] = function () {
    return platform;
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
        try {
          head.removeChild(s);
        } catch (e) {};
      }
      if(failFn) {
        failFn('error at script #:', batchCount, scriptCount, s);
        s = null;
      }
    };

    var clear_ = function (s) {
      //clear the event and prevent memory leaks
      console.log('clearing event:' + typeof s)
      // Progress report.

      if (s) {
        gScriptCount++;
        progressFn(parseInt(100 * gScriptCount / scriptsToLoad), s.src);
        console.log('CLEARING:' + s.src)
        //try {
        //  head.removeChild(s);
        //} catch (e) {};

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
          console.log('ALL DONE')
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
          console.log('No polyfill needed:' + scr.name);
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
            err_(s,'script loading not supported for:' + scr.path, ' type:' + typeof s + ' nodeType:' + typeof s.nodeType);
          }

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
      deviceorientation: eventSupport_(win, 'deviceorientation'),
      devicemotion: eventSupport_(win, 'devicemotion'),
      load: load,
      detect: detect,
      reDetect: reDetect
    };
    for (var i in tests) {
      if (typeof(tests[i]) === 'function') { // this allows us to pre-compute some results.
        //alert("test:" + i)
        self.results[i] = tests[i]();
        //alert("test result:" + self.results[i])
      } else {
        //alert("prebuilt result:" + tests[i])
        self.results[i] = tests[i];
      }
    };
    return self.results;
  }

  // Fire first detection and report results.
  win.WebVRFeatureDetector = detect();

})(window);
