/**
 * VRUi.js
 * Create a basic user interface for entering and leaving VR mode
 * @author Pete Markiewicz / http://plyojump.com
 *
 * Adapted from the three.js sample
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 *
 * WebVR 1.0 draft
 * @link https://mozvr.com/webvr-spec/
 */
var WebVRUi = (function () {

    var VRMode = false,
    available = (navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined),
    latest = (navigator.getVRDisplays !== undefined),
    polyfill = false,
    message = '',
    canvasPage = null, //entire page, usually document.body
    canvasContainer = null, // immediate parent of canvas
    camera = null,
    canvas = null, // canvas inside container    msgContainer = null, // for VR messages
    vrDisplay = false,
    renderer = null,
    vrEffect = null,
    buttonContainer = null, // for enter VR button
    captionContainer = null, // figure caption
    n = document.body.childNodes,
    swap = [], // store elements during DOM swap
    placeholder = null,
    messageClass = 'vr-ui-message',
    errorClass = 'vr-ui-error',
    pointerEvents = null;

    // It takes a complex set of styles to go to fullscreen on mobile. Save the
    // original styles so they can be reset.
    var saveStyles = {
      canvas: {
        style: {}
      }
    }

    /**
     * @method isDOM
     * @description confirm user passed in a DOM element to attach the Ui to.
     */
    function isDOM (o) {
      if (typeof o != 'object') return false;
      return (/HTML(?:.*)Element/).test(Object.prototype.toString.call(o).slice(8, -1));
    }

    /**
     * @method getScreenWidth
     * @description get normalized screen width
     * @returns Number screen width
     */
    function getScreenWidth () {
      return Math.max(window.screen.width, window.screen.height)
    };

    /**
     * @method getScreenHeight
     * @description get normalized screen height
     * @returns Number screen height
     */
    function getScreenHeight () {
      return Math.min(window.screen.width, window.screen.height)
    };

    /**
     * @method setupDOMForSwap
     * @description find all the elements on the page to hide
     * @param DOMElement Canvas the <canvas> element to 'fullscreen'
     */
    function setupDOMForSwap (swapElem) {
      if(swapElem) {
        canvas = swapElem; //TODO: THIS NEEDS TO BE CHANGED!!!!!!!!!
      }
      if (!canvas) {
        console.error('DOM swap element ' + canvas + ' not found');
      }
      // find all the elements on the page
      for (var i = 0, len = n.length; i < len; i++) {
        if (n[i] !== canvas) {
          swap.push(n[i]);
        }
      }
      // add an invisible placeholder element in front of all other content for DOM swapping
      placeholder = document.createElement('div');
      placeholder.id = 'webvr-placeholder';
      placeholder.style.display = 'none';
      document.body.insertBefore(placeholder, document.body.childNodes[0]);

    };

    /**
     * @method swapDOMToFullscreen
     * @description Do the swap
     */
    function swapDOM (swapElem) {
      // set up the swap
      if (!swapElem) {
        swapElem = canvas;
      }
      setupDOMForSwap(swapElem);
      console.log('canvas::::::::::' + swapElem)
      // get the parent for the swapped element
      var parent = canvas.parentNode;
      // swap our placeholder ahead of the canvas
      parent.insertBefore(placeholder, canvas);
      //swap canvas to top of document.body
      document.body.insertBefore(canvas, document.body.firstChild);
      //hide everything
      for (var i = 0, len = n.length; i < len; i++) {
        if(n[i].style) { //not defined for Text nodes
          n[i].oldDisp = n[i].style.display;
          if (n[i] !== canvas ) {
            n[i].style.display = 'none';
          } else {
            //var w = getScreenWidth();
            //var h = getScreenHeight();
            //var aspect = w / h;
            //VRRenderer.setViewport(w, w / aspect);
            //VREffect.setSize(w, w / aspect);
          }
        }
      }
    };

    /**
     * @method resetDOM
     * @description put canvas back in its original position in the DOM,
     * and make the rest of the DOM visible again.
     */
    function changeToDOM () {
      if(n[0] !== canvas) {
        console.warn('WebVRUi.resetDOM: tried to reset when not set');
        return;
      }
      var parent = placeholder.parentNode;
      console.log('canvas:' + canvas + ' placeholder:' + placeholder)
      //swap our canvas elemenb there
      parent.insertBefore(canvas, placeholder);
      //move placeholder back to top of document.body
      for (var i = 0, len = n.length; i < len; i++) {
        if (n[i].style) {
          console.log("putting back old display:" + n[i].oldDisp)
          n[i].style.display = n[i].oldDisp;
        } else {
          //if (!hasFullscreenElement()) {
          ////////restoreSwapStyles();
          //}
        }
      }
    }

    /** 
     * @method changeToFullScreen
     */
    function changeToFullScreen () {
      console.log('changeToFullScreen')
      var w = parseInt(document.body.clientWidth);
      var h = parseInt(document.body.clientHeight);
      swapDOM(canvasContainer);
      canvas.width = w;
      canvas.height = h;

      renderer.setViewport(0, 0, w, h); // this sets the drawing area correctly
      vrEffect.setSize(w, h); // THIS is needed to change size
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    /**
     * @method init
     * @description detects WebVR Ui, and adds appropriate controls and user messages.
     * @param DOMElement domElement the element we want our Ui attached to.
     * @param VREffect effect a THREE.js specific effect giving stereo rendering.
     * @returns Promise result of WebVR test as a promise.
     */
    function init (page, canvasContainer, sceneCanvas, sceneCamera, canvasRenderer, VREffect, figureCaption) {
      if(!isDOM(page)) {
        console.error('WebVRUi.init: did not pass in DOM element, ' + typeof page);
      }
      canvasPage = page,
      container = canvasContainer,
      canvas = sceneCanvas,
      camera = sceneCamera,
      renderer = canvasRenderer,
      vrEffect = VREffect;

      // Collect WebVR data
      return new Promise (function (resolve, reject) {
        if (navigator.getVRDisplays) {
          navigator.getVRDisplays().then(function(displays) {
          if (displays.length > 0) {
            if (displays[0] instanceof VRDisplay) {
                resolve({display:displays[0], msg:'Your browser supports WebVR but not the latest version. See <a href="http://webvr.info">webvr.info</a> for more info.'});
            }
          } else {
            reject(Error('WebVR Supported, but no VR displays found.'));
          }
        });
        }
        else if (navigator.getVRDevices) {
          navigator.getVRDevices().then(function(devices) {
            if (devices.length > 0) {
              if(devices[0] instanceof HMDVRDevice) {
                resolve({display:devices[0], msg:'Your browser supports WebVR but not the latest version. See <a href="http://webvr.info">webvr.info</a> for more info.'});
              }
            } else {
              reject(Error('Legacy WebVR supported, but no VR displays found.'));
            }
          });
        } else {
          reject(Error('WebVR is not supported on your system.'));
        }
      }).then (function (result) { // Resolved
        //console.log("GOT A PROMISE RESULT:" + result + " GOT A PROMISE MESSAGE:" + result.msg)
        vrDisplay = result.display;
        //deviceName and deviceId present in polyfill and legacy native API
        // Flag whether we're using WebVR-Polyfill, or native API
        //(vrDisplay.deviceName && vrDisplay.deviceName.indexOf('webvr-polyfill') !== -1) ? polyfill = true : polyfill = false;
        if (vrDisplay.deviceName && vrDisplay.deviceName.indexOf('webvr-polyfill') !== -1) {
          polyfill = true;
          result.msg += '(using webvr-polyfill)';
        } else {
          polyfill = false;
        }
        ////////////////////////////////createVRMessage(page, result.msg);
        ////////////////////////////////createVRCaption(figureCaption);
        //createButton();

        // Set up the DOM for a swap
        setupDOMForSwap(canvas);
      })/*.catch (function (err) { // Rejected, doesn't work for IE8 Promise polyfill
          //console.error("ERROR in WebVRUi.init");
      });*/
    }; // end of function

      /**
       * @method hasFullScreenElement
       * @description Check if fullScreen element is non-null for browsers that have it.
       * @returns Boolean if fullscreen toggle present, return true, else false
       */
      function hasFullScreenElement () {
        if (!document.fullscreenElement ||
          !document.mozFullScreenElement ||
          !document.webkitFullscreenElement ||
          !document.msFullscreenElement ) {
          return false;
        }
        return true;
      }; // end of funciton

    /**
     * @method hasPointerEvents.
     * @description see if CSS Pointer Events are supported. Adapted
     * directly from ausi's Modernizr test
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/
     */
    function hasPointerEvents () {
      if (pointerEvents !== null) return pointerEvents;
      var elem = document.createElement('x');
      elem.style.cssText = 'pointer-events:auto';
      var r = elem.style.pointerEvents === 'auto';
      elem = null;
      return pointerEvents = r;
    }

    /**
     * @method elementFromPoint
     * @description normalize elementFromPoint across browsers. Similar to
     * https://github.com/moll/js-element-from-point.
     * @param Number x the x coordinate from mouseclick.
     * @param Number y the y coordinate from mouseclick.
     * @returns DOMElement the underlying page element.
     */
    function elemFromPoint (x, y) {

      if (!isRelativeToViewport()) {
        x += window.pageXOffset,
        y += window.pageYOffset;
      }
      return document.elementFromPoint(x, y)

      var relativeToViewPort = function () {
        var x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;
        var y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;
        if (!x && !y) return true;
        return !document.elementFromPoint(x, y);
      };

    };

    /**
     * @method makeClickThrough
     * @description see if pointerEvents are supported on a DOM element, manually pass
     * mouseclicks if they are not. It works by briefly hiding the current element,
     * then checking which underlying element would be clicked on, then restoring
     * visibility to the element.
     * @param DOMElement elem the element we want to be transparent to clicks.
     */
    function makeClickThrough (elem) {

      elem.onclick = function(e) {
        var underneath, disp;
        if (e && e.target) {
          disp = e.target.style.display;
          e.target.style.display = 'none'
          underneath = elemFromPoint(e.pageX, e.pageY);
          e.target.style.display = disp;
        } else if (window.event !== undefined) {
          disp = window.event.srcElement.style.visibility;
          window.event.srcElement.style.visibility = 'hidden';
          underneath = elemFromPoint(e.pageX, e.pageY);
          window.event.srcElement.style.visibility = disp;
          underneath.click();
        }

      }

    };

    /**
     * @method createVRMessage
     * @description create an overlay telling the user if they can run WebVR.
     * @param DOMElement domContainer the part of the DOM to attach the message to, typically
     * the entire document or 'document.body'.
     * @param String msg the message to the user.
     */
    function createVRMessage (canvasContainer, msg) {
      // create the message container
      msgContainer = document.createElement('div');
      msgContainer.className = messageClass;
      msgContainer.style.position = 'absolute';
      msgContainer.style.left = '0';
      msgContainer.style.top = '0';
      msgContainer.style.right = '0';
      msgContainer.style.zIndex = '999';
      msgContainer.align = 'center';

      // Keep the message from blocking underlying DOM elements.
      if (hasPointerEvents()) {
        msgContainer.style.pointerEvents = 'none';
      } else {
        makeClickThrough(msgContainer);
      }

      // Create the message as a child DOM element.
      message = document.createElement('div');
      message.className = messageClass;
      message.style.fontFamily = 'sans-serif';
      message.style.fontSize = '16px';
      message.style.fontStyle = 'normal';
      message.style.lineHeight = '26px';
      message.style.color = '#000';
      try {
        message.style.borderRadius = '6px';
        message.style.backgroundColor = 'rgba(56, 22, 188, 0.1)';
      } catch (e) {
        message.style.backgroundColor = '#dbf';
      }
      message.style.padding = '10px 20px';
      message.style.margin = '50px';
      message.style.display = 'inline-block';
      message.innerHTML = msg;

      msgContainer.appendChild(message);
      console.log("domContainer:" + typeof canvasContainer)

      //TODO: add FPS
      //TODO: check standard WebGL Ui used by Toji.

      // Attach to the DOM, using the domContainer (page).
      canvasContainer.appendChild(msgContainer);

    };

    /**
     * @method setMessage
     * @description setter to add additional info to the Ui element describing WebVR.
     * @param String msg the additional message.
     * @param Boolean append if true, append, otherwise replace.
     */
    function setMessage (msg, append) {
      // attach to document.body if there isn't a DOM.
      if (!msgContainer) {
        createVRMessage(document.body, msg);
      }
      // Append message, or replace.
      if (msg && message) {
        if (append) {
          message.innerHTML += msg;
        } else {
          message.innerHTML = msg;
        }
      }

    };

    /**
     * @method flipToLandscapeMessage
     * @description tell mobile users to flip to landscape mode to see VR
     */
    function flipToLandscapeMessage () {
      alert('flip to landscape');
    };

    /**
     * @method createVRCaption
     * @description optional caption of VR element when in the DOM.
     * @param DOMElement Canvas canvasContainer the part of the DOM to attach the button to.
     * @param String captionText the caption text.
     */
    function createVRCaption(captionText) {
      captionContainer = container.getElementsByTagName('figcaption')[0];
      if (!captionContainer) {
        captionContainer = document.createElement('figcaption');
        container.appendChild(captionContainer);
      }

      if (captionText) {
        captionContainer.innerHTML = captionText;
      } else if (captionContainer.innerHTML == '') {
        captionContainer.innerHTML = '3d VR World';
      }

      if (!captionContainer.id) {
        captionContainer.id = 'webvr-caption';
      }

      // ARIA description
      container.setAttribute('aria-describedby', captionContainer.id);

      // Caption styles
      captionContainer.style.width = '100%';
      captionContainer.style.textAlign = 'center';
    };

    /**
     * @method createButton
     * @description create a button allowing the user to go to fullscreen. In
     * THREE.js VREffect, going to fullscreen triggers a VR stereo view.
     * @param DOMElement Canvas canvasContainer the part of the DOM to attach the button to.
     * @param VREffect effect a THREE.js VREffect object. If this object is set
     * to fullScreen, the VR stereo effect is triggered.
     */
    function createButton (className, buttonText) {
      // Create the button.
      var button = document.createElement('button');

      // Set the button
      button.className = 'vr-button-enter';
      button.innerHTML = 'ENTER VR';

      // Create a button container.
      buttonContainer = document.createElement('div');
      buttonContainer.id = 'vr-button-container';

      // To position the container in a <figure> we need find the height of the <figcaption> element.
      var captionOffset = parseFloat(getComputedStyle(container).getPropertyValue('height'));

      buttonContainer.style.width = '100%';
      //buttonContainer.style.height= '40px';

      buttonContainer.style.position = 'absolute';
      buttonContainer.style.left = '0px';
      buttonContainer.style.bottom = 20 + 'px';
      buttonContainer.style.border = '1px solid red';
      buttonContainer.style.padding = '8px';

      buttonContainer.style.textAlign = 'center';

      // Adjust the buttonContainter to enclose the created button
      buttonContainer.style.height = button.style.height;

      buttonContainer.appendChild(button);
      container.appendChild(buttonContainer);

      return button;

    };

    /* show the canvasContainer Ui */
    function showUi () {
      canvasContainer.style.display = 'block';
    };

    /* hide the canvasContainer Ui */
    function hideUi () {
      canvasContainer.style.display = 'none';
    };

    /**
     * @method isPolyfill
     * @description return true if using webvr-polyfill.
     * @returns Boolean if polyfill, return true, else false.
     */
    function isPolyfill () {
      return polyfill;
    };

    /**
     * @method getDisplay
     * @description return a VRDisplay object, if present.
     * @returns VRDisplay or null.
     */
    function getDisplay () {
      return vrDisplay;
    };

    /**
     * @method isVRMode
     * @description flag for VR state was entered.
     * @returns Boolean if in VR state, true, else false.
     */
    function isVRMode () {
      return VRMode;
    };

    /**
     * @method setVRMode
     * @description toggle the VRMode
     * @param Boolean mode set the VR mode to true, or false.
     */
    function setVRMode (mode) {
      VRMode = mode;
    };

    // Expose properties and methods.
    return {
      isDOM: isDOM,
      getScreenWidth: getScreenWidth,
      getScreenHeight: getScreenHeight,
      changeToFullScreen: changeToFullScreen,
      changeToDOM: changeToDOM,
      swapDOM: swapDOM, //TODO: Debug only
      init: init,
      hasFullScreenElement: hasFullScreenElement,
      createVRMessage: createVRMessage,
      flipToLandscapeMessage: flipToLandscapeMessage,
      createButton: createButton,
      setMessage: setMessage,
      available: available,
      latest: latest,
      showUi: showUi,
      hideUi: hideUi,
      isPolyfill: isPolyfill,
      isVRMode: isVRMode,
      getDisplay: getDisplay,
      setVRMode: setVRMode,
      init: init
    };
})();
