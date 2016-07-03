/** 
 * ui.js
 * Basic ui elements for a WebVR scene in DOM
 */
var ui = (function () {

    var page,            // DOM page (often document.body)
    msgContainer,        // container DOM element for alerts
    message,             // page message
    container,           // container DOM object (e.g. <figure>)
    containerMessage,    // container message  (e.g. <figcaption>)
    popup,               // progress DOM element
    detail,              // detail popup on mouseover
    buttonContainer,     // container DOM element for buttons
    canvas,              // presentation canvas
    swap = [],           // store elements during DOM swap
    placeholder = null,  // saves location of canvas element in hidden DOM
    vrDisplay = null,    // webVR display
    vrMode = false,      // flag for in VR mode
    polyfill = false,    // flag for webvr-polyfill being used
    pointerEvents = false, // flag for whether CSS pointerEvents are supported
    msgContainerClass = 'ui-message-container', // message container (transparent)
    msgClass = 'ui-message', // styled element in message container
    msgTextClass = 'ui-message-text',
    msgTextId = 'ui-message-text-id',
    msgBtnId = 'ui-message-close-id',
    buttonContainerclass = 'ui-buttons',
    buttonClass = 'ui-button'; 

    /** 
     * @method createMessage
     * @description Create page message container with status and warnings.
     * @param DOMElement parentElem the place to attach our message (usually 
     * document.body)
     */
    function createMessage (parentElem) {
        if (!parentElem) {
            parentElem = document.body;
        }
        if(msgContainer) {
            console.warn('ui.createMessage: tried to create message when it already exists');
            return;
        }
        // Create and set styles (transparent).
        msgContainer = document.createElement('div');

        // Styled in CSS.
        msgContainer.className = msgContainerClass;

        // Keep the message from blocking underlying DOM elements.
        if (hasPointerEvents()) {
            console.log('ui.createMessage: setting pointerEvents');
            msgContainer.style.pointerEvents = 'none';
        } else {
            console.log('ui.createMessage: no pointerEvents, making clickthrough');
            makeClickThrough(msgContainer);
        }

        // Create the message as a child DOM element (visible).
        msg = document.createElement('div');
        msg.className = msgClass;

        // Create text element showing status and errors.
        var msgText = document.createElement('span');
        msgText.id = msgTextId;
        msgText.className = msgTextClass;

        // Create a close button.
        var msgBtn = document.createElement('button');
        msgBtn.id = msgBtnId;
        msgBtn.innerHTML = 'Close';
        //msgBtn.className = buttonClass;

        //msgBtn.addEventListener('click', hideMessage, false);

        // Use old method for browser compatibity
        msgBtn.addEventListener = function () {
            hideMessage();
        }

        msg.appendChild(msgText);
        msg.appendChild(msgBtn);

        // Attach message container to window.
        msgContainer.appendChild(msg);

        //TODO: add FPS
        //TODO: check standard WebGL Ui used by Toji.

        // Attach to the DOM, using the domContainer (page).
        parentElem.appendChild(msgContainer);

        // Return reference to container.
        return msgContainer;
    };

    /** 
     * @method showMessage
     * @description show the status message.
     */
    function showMessage () {
        if (!msgContainer) {
            console.warn('ui.showMessage: displaying message without creating first');
            createMessage();
        }
        msgContainer.style.display = 'block';
    };

    /** 
     * @method hideMessage
     * @description hide the status message and its container.
     */
    function hideMessage () {
        if (!msgContainer) {
            createMessage();
        }
        //msgBtn.removeEventListener('click', hideMessage);
        msgContainer.style.display = 'none';
    };

    /** 
     * @method setMessage
     * @description set the status message onscreen.
     * @param String message the message to set
     */
    function setMessage (message) {
        if (!msgContainer) {
            createMessage();
        }
        if (message) {
            var txt = document.getElementById(msgTextId);
            txt.innerHTML = message;
        } else {
            console.error('ui.setMessage: message not initialized');
        }
    };

    /** 
     * @method createDetail
     * @description popup detail window on mouseover. This is INDEPENDENT of the status 
     * of the VRWorld loading or other elements of DOM. It creates a temporary window 
     * as long as the mouse is over the element.
     * @param DOMElement parentElem the parent that we get detail from by mousing over
     */
    function createDetail (parentElem) {
        if(detail) {
            console.warn('ui.createDetail: tried to create detail element when it already exists');
            return;
        }
    };

    /** 
     * @method showPopup
     */
    function showDetail () {
        if (!detail) {
            console.error('ui.showDetail: detail not created');
        }
    };

    /** 
     * @method hidePopup
     */
    function hideDetail () {
        if (!detail) {
            console.error('ui.showDetail: detail not created');
        }
    };

    /** 
     * @method createPopup
     * @description create a popup window horizontally and vertically centered 
     * over the parent element.
     * @param DOMElement elem the element we want to 'pop up'.
     */
    function createPopup (elem) {
        if (popup) {
            console.warn('ui.createPopup: popup element already created');
        }

    };

    /** 
     * @method showPopup
     */
    function showPopup () {
        if (!popup) {
            console.error('ui.showPopup: popup not created');
        }
    };

    /** 
     * @method hidePopup
     */
    function hidePopup () {
        if (!popup) {
            console.error('ui.showPopup: popup not created');
        }
    };

    /** 
     * @method deletePopup
     * @description since we may have several, allow deletion.
     */
    function deletePopup () {

    };

    /* 
     * @method createButtonContainer
     * @description Create a button container.
     */
    function createButtonContainer () {
        if (!canvas) {
            console.error('ui.createButtonContainer: parent not created');
            return;
        } else if (!container) {
            console.warn('ui.createButtonContainer: canvas container not specified, using parent');
            container = canvas.parentNode;
        }

        if (buttonContainer) {
            console.warn('ui.createButtonContainer: button container already created');
        }
        // Create the button container.
        buttonContainer = document.createElement('div');
        buttonContainer.className = buttonContainerclass;

        // Adjust the buttonContainter to enclose the created button
        var b = document.createElement('button');
        // CSS styles.
        b.className = buttonClass;
        // Dynamic styles.
        buttonContainer.style.height = getComputedStyle(b).getPropertyValue('height');
        b = null;

        // Add to the container (holds buttons and canvas)
        container.appendChild(buttonContainer);

        return buttonContainer;
    };

    /** 
     * @method createButton
     * @description create an interface button.
     * @param String text the button text.
     * @param Function clickHandler the function handling button clicks.
     * @param String styleClass the CSS className for the button.
     */
    function createButton (text, clickHandler, styleClass) {
        if (!buttonContainer) {
            console.error('ui.createButton: button container not initialized');
        } else {
            // Create the button.
            var button = document.createElement('button');
            button.innerHTML = text;
            button.className = styleClass || buttonClass;
            // Add the event handler
            if (typeof clickHandler == 'function') {
                button.addEventListener('click', clickHandler);
            }
            buttonContainer.appendChild(button);
        }
    };

    /** 
     * @method showButtons
     * @description show all buttons in the button container.
     */
    function showButtons () {
        if (!buttonContainer) {
            console.error('ui.showButtons: button container not initialized');
        } else {
            buttonContainer.style.display = 'block';
        }
    };

    /** 
     * @method hideButtons
     * @description hide the buttons in their container.
     */
    function hideButtons () {
        if (!buttonContainer) {
            console.error('ui.hideButtons: button container not initialized');
        } else {
            buttonContainer.style.display = 'none';
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
     * @method isDOM
     * @description confirm user passed in a DOM element to attach the Ui to.
     */
    function isDOM (o) {
        if (typeof o != 'object') return false;
        return (/HTML(?:.*)Element/).test(Object.prototype.toString.call(o).slice(8, -1));
    };

    function hasWebVR () {
        return !!navigator.getVRDisplays;
    };

    /**
     * @method isPolyfill
     * @description return true if using webvr-polyfill.
     * @returns Boolean if polyfill, return true, else false.
     */
    function isWebVRPolyfill () {
        return polyfill;
    };

    /**
     * @method isVRMode
     * @description flag for VR state was entered.
     * @returns Boolean if in VR state, true, else false.
     */
    function isVRMode () {
      return vrMode;
    };

    /**
     * @method setVRMode
     * @description toggle the VRMode
     * @param Boolean mode set the VR mode to true, or false.
     */
    function setVRMode (mode) {
      vrMode = mode;
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
     * @method getFullScreenElement
     * @description Check if fullScreen element is non-null for browsers that have it.
     * @returns DOMElement|null if fullscreen present, return the element in fullscreen, else null
     */
    function getFullScreenElement () {
        return (document.fullscreenElement !== null ||
            !document.mozFullScreenElement !== null ||
            !document.webkitFullscreenElement !== null ||
            !document.msFullscreenElement !== null ||
            null);
    }; // end of function

    /**
     * @method hasPointerEvents.
     * @description see if CSS Pointer Events are supported. Adapted
     * directly from ausi's Modernizr test
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/
     * @returns Boolean if PointerEvents supported, return true, else false
     */
    function hasPointerEvents () {
        if (pointerEvents !== null) return pointerEvents;
        var elem = document.createElement('x');
        elem.style.cssText = 'pointer-events:auto';
        var r = elem.style.pointerEvents === 'auto';
        elem = null;
        return pointerEvents = r;
    };

    /**
     * @method elementFromPoint
     * @description normalize elementFromPoint across browsers. Similar to
     * https://github.com/moll/js-element-from-point.
     * @param Number x the x coordinate from mouseclick.
     * @param Number y the y coordinate from mouseclick.
     * @returns DOMElement the underlying page element.
     */
    function elemFromPoint (x, y) {
        //define function
        var isRelativeToViewPort = function () {
            var x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;
            var y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;
            if (!x && !y) return true;
            return !document.elementFromPoint(x, y);
        };
        if (!isRelativeToViewPort()) {
            x += window.pageXOffset,
            y += window.pageYOffset;
        }
        return document.elementFromPoint(x, y)
    };

    /**
     * @method makeClickThrough
     * @description see if pointerEvents are supported on a DOM element, manually pass
     * mouseclicks to the underlying element if they are not. We do this since users 
     * may not click the 'close' button in the message dialog.
     *
     * It works by briefly hiding the current element,
     * then checking which underlying element would be clicked on, then restoring
     * visibility to the element. We use this to support old browsers that don't have 
     * CSS Pointer Events, or define .click() on hyperlinks.
     * 
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
                var clickEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': false
                });
                underneath.dispatchEvent(clickEvent);
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
     * @method setupDOMForSwap
     * @description find all the elements on the page to hide
     * @param DOMElement Canvas the <canvas> element to 'fullscreen'
     */
    function setupDOMForSwap (swapElem) {
        if(swapElem) {
            canvas = swapElem; //TODO: THIS NEEDS TO BE CHANGED!!!!!!!!!
        }
        if (!canvas) {
            console.error('ui.setupDOMForSwap: DOM swap element ' + canvas + ' not found');
        }
        // find all the elements on the page
        var n = document.body.childNodes;
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
     * @param DOMElement swapElem the element to be swapped out of the DOM 
     * and attached to document.body, with all other DOM elements having 
     * visibility: none
     */
    function swapDOM (swapElem) {
        // set up the swap
        if (!swapElem) {
            swapElem = canvas;
        }
        setupDOMForSwap(swapElem);
        // get the parent for the swapped element
        var parent = canvas.parentNode;
        // swap our placeholder ahead of the canvas
        parent.insertBefore(placeholder, canvas);
        //swap canvas to top of document.body
        document.body.insertBefore(canvas, document.body.firstChild);
        //hide everything
        var n = document.body.childNodes;
        for (var i = 0, len = n.length; i < len; i++) {
            if(n[i].style) { //not defined for Text nodes
                n[i].oldDisp = n[i].style.display;
                if (n[i] !== canvas ) {
                    n[i].style.display = 'none';
                } else {
                    // anything canvas-specific here, like saving styles
                }
            }
        }
    };

    /**
     * @method resetDOM
     * @description put swapped DOMElement (usually a display canvas) back 
     * in its original position in the DOM, and make the rest of the DOM visible again.
     */
    function resetDOM () {
        if(n[0] !== canvas) {
            console.warn('WebVRUi.resetDOM: tried to reset when not set');
            return;
        }
        var parent = placeholder.parentNode;
        //console.log('canvas:' + canvas + ' placeholder:' + placeholder)
        //swap our canvas elemenb there
        parent.insertBefore(canvas, placeholder);
        //move placeholder back to top of document.body
        var n = document.body.childNodes;
        for (var i = 0, len = n.length; i < len; i++) {
            if (n[i].style) {
                console.log('putting back old display:' + n[i].oldDisp)
                n[i].style.display = n[i].oldDisp;
            } else {
                // anything canvas-specific, like resetting styles
            }
        }
    };

    /** 
     * @method changeToFullScreen
     */
    function changeToFullScreen () {
        console.log('changeToFullScreen')
    };

    /** 
     * @method exitFullScreen
     */
    function exitFullScreen () {
        console.log('exitFullScreen');
    };

    /** 
     * @method init 
     * @description initialize webvr
     * @param Canvas canvasElem the drawing HTML5 <canvas>
     * @param DOMElement containerElem the container element
     * @param DOMElement pageElem the page, usually document.body
     */
    function init (canvasElem, containerElem, pageElem) {
        if(!isDOM(pageElem)) {
            pageElem = document.body;
        }

        // Set the default Ui interface.
        canvas = canvasElem;
        container = containerElem;
        page = pageElem;

        // Create an empty button container (buttons added separately)
        createButtonContainer();

        // Get the WebVR display
        return new Promise (function (resolve, reject) {
            if (navigator.getVRDisplays) { // 1.0 API
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

            vrDisplay = result.display;

            if (vrDisplay.deviceName && vrDisplay.deviceName.indexOf('webvr-polyfill') !== -1) {
                polyfill = true;
                result.msg += '(using webvr-polyfill)';
            } else {
                polyfill = false;
            }

            // Set the status message.
            setMessage(result.msg);

            // Show the message container onscreen.
            showMessage();

            // Set up the DOM for a swap
            setupDOMForSwap(canvas);

      })/*.catch (function (err) { // Rejected, doesn't work for IE8 Promise polyfill
          //console.error('ERROR in WebVRUi.init');
      });*/

    };



    return {
        createMessage: createMessage,
        showMessage: showMessage,
        hideMessage: hideMessage,
        setMessage: setMessage,
        createButton: createButton, // Container implicitly created
        showButtons: showButtons,
        hideButtons: hideButtons,
        hasWebVR: hasWebVR,
        isWebVRPolyfill: isWebVRPolyfill,
        isVRMode: isVRMode,
        setVRMode: setVRMode,
        getDisplay: getDisplay,
        getScreenWidth: getScreenWidth,
        getScreenHeight: getScreenHeight,
        getFullScreenElement: getFullScreenElement,
        swapDOM: swapDOM,
        resetDOM: resetDOM,
        init: init
    };

})();