/** 
 * ui.js
 * Basic ui elements for a WebVR scene in DOM
 */
var ui = (function () {

    var page,               // DOM page (often document.body)
    msgContainer,           // container DOM element for alerts
    message,                // page message
    container,              // container DOM object (e.g. <figure>)
    containerMessage,       // container message  (e.g. <figcaption>)
    popup,                  // progress DOM element
    detail,                 // detail popup on mouseover
    buttonContainer,        // container DOM element for buttons
    canvas,                 // presentation canvas
    cssSizes = [],          // place to save computed CSS sizes
    placeholder = null,     // saves location of canvas element in hidden DOM
    vrDisplay = null,       // webVR display
    vrMode = false,         // flag for in VR mode
    fullscreenMode = false, // flag for fullScreen mode
    toFullscreen = false,   // flag for DOM -> Fullscreen used by window.onresize event handlers
    toDOM = false,          // flag for Fullscreen || VR -> DOM
    mousedown = false,      // flag for mousedown (drag?)
    polyfill = false,       // flag for webvr-polyfill being used
    pointerEvents = false,  // flag for whether CSS pointerEvents are supported
    msgContainerClass = 'ui-message-container', // message container (transparent)
    msgClass = 'ui-message', // styled element in message container
    msgTextClass = 'ui-message-text', // text im message container
    msgTextId = 'ui-message-text-id', // unique id for message container
    msgBtnId = 'ui-message-close-id', // id for close button in message
    buttonContainerclass = 'ui-buttons', // DOM element holding all Ui buttons
    buttonClass = 'ui-button'; // button class

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
        msgBtn.style.marginLeft = '1em';
        msgBtn.innerHTML = 'Close';
        //msgBtn.className = buttonClass;

        // Use old method for browser compatibity
        //msgBtn.addEventListener('click', hideMessage, false);
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
    function showPopup (msg) {
        alert(msg);
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

    /** 
     * @method hasWebVR
     * @description see if WebVR is supported.
     */
    function hasWebVR () {
        return !!(navigator.getVRDisplays || navigator.getVRDevices);
    };

    /** 
     * @method hasWebVRDisplay
     * @description if WebVR is supported, see if a display is attached. The WebVRPolyfill 
     * attaches a generic Cardboard display, while native Chromium does not. Display can be 
     * emulated using a Chrome Extension
     */
    function hasVRDisplay () {
        return !!vrDisplay;
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
     * @method useOrientationMode 
     * @description determine if we're using orientation to enter VR, or buttons
     */
    function useOrientationMode () {
        if (window.orientation !== undefined && !hasFullscreen()) {
            return true;
        }
        return false;
    };

    /**
     * @method getVRDisplay
     * @description return a VRDisplay object, if present.
     * @returns VRDisplay or null.
     */
    function getVRDisplay () {
        return vrDisplay;
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
     * @method getScreenWidth
     * @description get normalized screen width
     * @returns Number screen width
     */
    function getScreenWidth () {
        return Math.max(window.screen.width, window.screen.height)
    };

    /** 
     * @method getCSSSize
     * @description get the current computed size of the element in the DOM.
     */
    function getCSSStyle (elem) {
        var w = parseFloat(getComputedStyle(elem).getPropertyValue('width'));
        var h = parseFloat(getComputedStyle(elem).getPropertyValue('height'));
        return {
            element: elem,
            width: w,
            height: h,
            aspect: w / h
        };
    };

    /** 
     * @method saveCSSSize
     * @description save the computed width and height of an element. 
     * An array allows several sizes to be saved if necessary.
     */
    function saveCSSStyle (elem) {
        for (var i = 0, len = cssSizes.length; i < len; i++) {
            if (cssSizes[i] === elem) {
                console.warn('ui.saveCSSSize: already saved size for this element');
                return;
            }
        }
        // new, so save size
        cssSizes.push(getCSSStyle(elem));
    };

    /** 
     * @method restoreCSSSize 
     * @description restore the size of an element to its original, 
     * provided it was saved to the cssSizes array earlier.
     */
    function restoreCSSStyle (elem) {
        for (var i = 0, len = cssSizes.length; i < len; i++) {
            if (cssSizes[i].elem === elem) {
                var c = cssSizes[i];
                // reset width and height
                if (elem.width) {
                    elem.width = c.width;
                }
                if (elem.height) {
                    elem.height = c.height;
                }
                elem.style.width = c.style.width;
                elem.style.height = c.style.height;
            }
        }
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
     * @method hasFullscreen
     * @description check if requestFullscreen is defined
     */
    function hasFullscreen () {
        var elem = document.documentElement;
        if (elem.requestFullscreen || 
            elem.mozRequestFullscreen || 
            elem.webkitRequestFullscreen || 
            elem.webkitRequestFullscreen || 
            elem.msRequestFullscreen
        ) {
            return true;
        }
        return false;
    };

    /** 
     * @method isFullscreenMode
     * @description check if we are in fullscreen
     */
    function isFullscreenMode () {
        console.log('fullscreenElement:' + getFullscreenElement())
        return !!getFullscreenElement();
    };

    /**
     * @method getFullscreenElement
     * @description Check if fullScreen element is non-null for browsers that have it.
     * @returns DOMElement|null if fullscreen present, return the element in fullscreen, else null
     */
    function getFullscreenElement () {
        return (document.fullscreenElement ||
            document.mozFullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            null);
    };

    /** 
     * @method enterFullscreen 
     * @description request fullScreen using vendor prefixes.
     * @param DOMElement elem the element to set fullscreen.
     */
    function enterFullscreen (elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
            return true;
        } else if (elem.mozRequestFullscreen) {
            elem.mozRequestFullscreen();
            return true;
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
            return true;
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
            return true;
        } 
        return false;
    };

    /** 
     * @method exitFullscreen
     */
    function exitFullscreen () {
        console.log('exitFullscreen');
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
            return true;
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
            return true;
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
            return true;
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            return true;
        }
        return false;
    };

    function setGoingToFullscreen (val) {
        toFullscreen = val;
    };

    function isGoingToFullscreen (val) {
        return toFullscreen;
    }

    /** 
     * A flag we keep to know our direction
     * 1. DOM -> fullscreen
     * 2. DOM -> VR
     * 3. fullscreen -> DOM
     * 4. VR -> DOM
     */
    function setReturningToDOM (val) {
        toDOM = val;
    };

    /** 
     * Access stored flag to see if we've just 
     * 1. DOM -> fullscreen
     * 2. DOM -> VR
     * 3. fullscreen -> DOM
     * 4. VR -> DOM
     */
    function isReturningToDOM () {
        return toDOM;
    };

    /** 
     * @method setMouseDown
     * @description set the mouse as being down
     */
    function setMouseDown (mouse) {
        mousedown = mouse;
    };

    /** 
     * @method isMouseDown 
     * @description check if the mouse is (still) down
     */
    function isMouseDown () {
        return mousedown;
    };

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

        //TODO: need to capture events (buttons) within the dialog

        elem.onclick = function(e) {

            e = e || window.event;
            var target = e.target || e.srcElement;

            // If our element was on a button or link, don't pass through.
            if (target && target.tagName === 'A' || target.tagName === 'BUTTON') {
                hideMessage();
                return;
            }

            console.log("e.tagName:" + elem.tagName + " >>>>>>>>>>IN CLICKTHROUGH")
            // Otherwise, pass the event to a lower layer.
            var underneath, disp, clickEvent;
            if (e && e.target) {
                disp = e.target.style.display;
                e.target.style.display = 'none'
                underneath = elemFromPoint(e.pageX, e.pageY);
                e.target.style.display = disp;
                if(document.createEvent) { // IE 9-11
                    clickEvent = document.createEvent("MouseEvent");
                    clickEvent.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
                } else {
                    clickEvent = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': false
                    });
                }
                // dispatchEvent is the same for both above cases.
                underneath.dispatchEvent(clickEvent);
            } else if (window.event !== undefined) {
                disp = window.event.srcElement.style.visibility;
                window.event.srcElement.style.visibility = 'hidden';
                underneath = elemFromPoint(window.event.clientX, window.event.clientY);
                window.event.srcElement.style.visibility = disp;
            }
        }
    };

    /**
     * @method setupDOMForSwap
     * @description find all the elements on the page to hide
     * @param DOMElement Canvas the <canvas> element to 'fullscreen'
     */
    function setupDOMForSwap () {
        // If placeholder <div> present, do nothing
        if (placeholder) {
            console.warn('ui.setUpDOMForSwap: swap DOM already set up');
            return;
        }
        // If canvas not defined, error
        if (!canvas) {
            console.error('ui.setupDOMForSwap: DOM swap element ' + canvas + ' not found');
            return;
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
     * @param DOMElement canvas the element to be swapped out of the DOM 
     * and attached to document.body, with all other DOM elements having 
     * visibility: none
     */
    function swapDOM () {
        // Set up the swap
        var n = document.body.childNodes;
        if (!placeholder) {
            console.error('ui.swapDOM: tried to reset when not set with setupDOMForSwap()');
            return;
        }
        if (!canvas) {
            console.error('ui.swapDOM: canvas not defined')
        }
        ///setupDOMForSwap(canvas);
        // Get the parent for the swapped element (should be figure)
        var parent = canvas.parentNode;
        // Swap our placeholder ahead of the canvas, inside the parent
        parent.insertBefore(placeholder, canvas);
        // Swap canvas to top of document.body
        document.body.insertBefore(canvas, n[0]);
        // Hide everything
        for (var i = 0, len = n.length; i < len; i++) {
            if(n[i].style) { //not defined for Text nodes
                if (n[i] !== canvas) {
                    console.log('swapping node:' + n[i].tagName + ' oldDisp:' + n[i].style.display)
                    n[i].oldDisp = n[i].style.display;
                    n[i].style.display = 'none';
                } else {
                    // canvas needs to have position:static, but may be altered by webvr-polyfill
                    canvas.oldPos = canvas.style.position;
                }
            }
        }
    };

    // TODO: shouldResetDOM

    /**
     * @method resetDOM
     * @description put swapped DOMElement (usually a display canvas) back 
     * in its original position in the DOM, and make the rest of the DOM visible again.
     */
    function resetDOM () {
        var n = document.body.childNodes;
        if (!placeholder) {
            console.error('ui.swapDOM: tried to reset when not set with setupDOMForSwap()');
            return;
        }
        if (!canvas) {
            console.error('ui.swapDOM: canvas not defined')
        }
        console.log("ui.resetDOM ----------- PUTTING BACK DOM")
        var parent = placeholder.parentNode;
        // Swap our canvas element back into the parent, just ahead of placeholder
        parent.insertBefore(canvas, placeholder);
        // Move placeholder back to top of document.body
        document.body.insertBefore(placeholder, document.body.childNodes[0]);
        for (var i = 0, len = n.length; i < len; i++) {
            if (n[i].style) {
                console.log('putting back old display:' + n[i].tagName + " oldDisp:" + n[i].oldDisp)
                //if (n[i].oldDisp) { // canvas.oldDisp could be undefined
                    n[i].style.display = n[i].oldDisp;
                //}
            } else {
                // reset canvas positioning
                canvas.style.position = canvas.oldPos;
            }
        }
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
                ////console.log('>>>>>>>>>>>>>>>>>>VR DISPLAYS!!!!!!!!!!!!!!!!!!!!')
                navigator.getVRDisplays().then(function(displays) {
                    if (displays.length > 0) {
                        if (displays[0] instanceof VRDisplay) {
                            resolve({display:displays[0], msg:'Your browser supports WebVR! See <a href="http://webvr.info">webvr.info</a> for more.'});
                        }
                    } else {
                        reject(Error('WebVR Supported, but no VR displays found.'));
                    }
                });
            } else if (navigator.getVRDevices) {
                navigator.getVRDevices().then(function(devices) {
                    ////console.log('>>>>>>>>>>>>>>>>>VR DEVICES')
                    if (devices.length > 0) {
                        if(devices[0] instanceof HMDVRDevice) {
                            resolve({display:devices[0], msg:'Your browser supports WebVR, but not the latest version. See <a href="http://webvr.info">webvr.info</a> for more.'});
                        }
                    } else {
                        reject(Error('Legacy WebVR supported, but no VR devices found.'));
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

      }).catch (function (err) { // Rejected doesn't work for IE8 Promise polyfill
          setMessage(err);
          showMessage();
      });

    };

    return {
        createMessage: createMessage,
        showMessage: showMessage,
        hideMessage: hideMessage,
        setMessage: setMessage,
        createPopup: createPopup,
        showPopup: showPopup,
        hidePopup: hidePopup,
        createButton: createButton, // Container implicitly created
        showButtons: showButtons,
        hideButtons: hideButtons,
        getScreenWidth: getScreenWidth,
        getScreenHeight: getScreenHeight,
        getCSSStyle: getCSSStyle,
        saveCSSStyle: saveCSSStyle,
        restoreCSSStyle: restoreCSSStyle,
        hasWebVR: hasWebVR,
        hasVRDisplay: hasVRDisplay,
        isPolyfill: isPolyfill,
        useOrientationMode: useOrientationMode,
        isVRMode: isVRMode,
        setVRMode: setVRMode,
        getVRDisplay: getVRDisplay,
        hasFullscreen: hasFullscreen,
        isFullscreenMode: isFullscreenMode,
        getFullscreenElement: getFullscreenElement,
        enterFullscreen: enterFullscreen,
        setGoingToFullscreen: setGoingToFullscreen,
        isGoingToFullscreen: isGoingToFullscreen,
        setReturningToDOM: setReturningToDOM,
        isReturningToDOM: isReturningToDOM,
        exitFullscreen: exitFullscreen,
        setMouseDown: setMouseDown,
        isMouseDown: isMouseDown,
        swapDOM: swapDOM,
        resetDOM: resetDOM,
        init: init
    };

})();