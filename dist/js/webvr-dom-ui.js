var WebVRDOMUi = ( function () {

    // Ui elements

    var messages = [],

    name = 'dom-ui-',

    messageStr = '-message',

    buttonStr = '-button',

    progressStr = '-progress',

    containerStr = '-container',

    controlPanel = null,

    textContainer = null,

    buttonContainer = null,

    linkContainer = null,

    fadeInInc = 10, // milliseconds between fadeIn increment

    fadeOutInc = 50, // milliseconds between fadeOut increment

    fadeDelay = 5000, // number of seconds until fading alerts begin fading

    counter = 0,

    n, // we store all the childNodes of document.body here

    swap = [], // store elements during DOM swap

    placeholder = null; // used for swapping DOM element positions

    /*
     * Create a number padding system for adding to CSS
     * @link http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
     */

     /** 
      * Pad a string, leading (left side) with a character.
      * @param {Number} len total length desired.
      * @param {String} the string to pad leading.
      * @returns {String} the leading-padded string.
      */
    String.prototype.padLeading = function( len, c ) {

        var s = '', c = c || ' ',

        len = ( len || 2 ) - this.length;

        while( s.length < len ) { 

            s += c;

        }

        return s + this; 

    };

    /** 
     * Pad a Number, leading side, with a character.
     * @param {Number} len total length desired.
     * @param {String} the string to pad leading.
     * @returns {String} the leading-padded string.
     */
    Number.prototype.padLeading = function( len, c ) {

        return String( this ).padLeading( len, c );

    };

    /** 
     * Pad a Number, leading side, with zeroes.
     * @param {Number} the total width of the padded Number.
     */
    Number.prototype.padLeadingZeroes = function( len ) {

        return this.padLeading( len, '0' );

    };

    /** 
     * get a counter variable that is always incremented
     * @param {Boolean} pad if true, add '00' padding.
     * @returns {Number} a unique, incremented number
     */
    function getCounter ( pad ) {

        counter++;

        if ( pad ) {

            counter.padLeadingZeroes( 5 );

        }

        return counter++;

    };

    /**
     * Confirm user passed in a DOM element to attach the Ui to.
     * @param {Object} o object to test
     * @returns {Boolean} if a DOM object, return true, else false.
     */
    function isDOM ( o ) {

        if ( typeof o != 'object' ) { 

            return false;

        }

        return ( /HTML(?:.*)Element/ ).test( Object.prototype.toString.call( o ).slice( 8, -1 ) );

    };


    /** 
     * confirm that object is an HTML5 <canvas> object.
     * @param {Object} the object to test
     * @returns {Boolean} if nodeName is canvas, return true, else false.
     */
    function isCanvas ( o ) {

        return ( isDOM( o )  && (element.nodeName.toLowerCase() === 'canvas' ) );

    };

    /**
     * find all the elements on the page to hide
     * @param {DOMElement} swapElem the <canvas> element to 'fullscreen'
     */
    function setupDOMForSwap ( swapElem ) {

        if ( ! isObject( swapElem ) ) {

            console.error('DOM swap element ' + canvas + ' not found');

            return false;
        }

        n = document.body.childNodes; // assume we're past DOMReady

      // Find all the elements on the page.

        for ( var i = 0, len = n.length; i < len; i++ ) {

            if ( n[i] !== canvas ) {

                swap.push( n[i] );

            }

        }

        // Add an invisible placeholder element in front of all other content for DOM swapping.

        placeholder = document.createElement( 'div' );

        placeholder.id = 'webvr-placeholder';

        placeholder.style.display = 'none';

        document.body.insertBefore( placeholder, document.body.childNodes[0] );

        return true;

    };

    /**
     * @description swap the DOM element with a placeholder element, moving it 
     * to the top of the page, and hiding all other DOM elements. This function 
     * makes a standard DOM page act more like typical 'full window' WebVR 
     * code. The goal is to integrate WebGL into a standard web page, jumping 
     * individual DOM elements to fullscreen (or pseudo-fullscreen on mobiles).
     */
    function swapDOM ( swapElem ) {

        // Set up the swap.

        if ( ! isCanvas( swapElem ) ) {

            return false;

        }

        setupDOMForSwap( swapElem );

        // get the parent for the swapped element

        var parent = swapElem.parentNode;

        // swap our placeholder ahead of the canvas

        parent.insertBefore( placeholder, swapElem );

        //swap canvas to top of document.body

        document.body.insertBefore( placeHolder, document.body.firstChild );

        //hide everything

        for ( var i = 0, len = n.length; i < len; i++ ) {

            if( n[i].style ) { //not defined for Text nodes

                n[i].oldDisp = n[i].style.display;

                if (n[i] !== canvas ) {

                    n[i].style.display = 'none';

                } else {

                    //nothing to do;

                }

            }

        }

    };

    /**
     * Restore the (fullscreen) <canvas> back in its original position in the DOM,
     * and make the rest of the DOM visible again.
     */
    function restoreDOM () {

        if( n[0] !== canvas ) {

            console.warn( 'WebVRDOMUi.restoreDOM: tried to reset when not set');

            return;

        }

        var parent = placeholder.parentNode;

        //swap our canvas element there.

        parent.insertBefore(canvas, placeholder);

        //move placeholder back to top of document.body

        for (var i = 0, len = n.length; i < len; i++) {

            if (n[i].style) {

            console.log("putting back old display:" + n[i].oldDisp)

            n[i].style.display = n[i].oldDisp;

            } else {

                // Nothing to do.

            }

        }

    };

    /** 
     * Emulate fullscreen element in browsers (i.e. mobile) that don't support it.
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

    /* 
     * Set ids used for DOM elements used in the Ui to a custom value.
     * @param {String} id the base Id value (incremented with counter)
     * @param {String} msgId added to text messages in dialogs
     * @param {String} buttonId added to buttons in dialogs
     */
    function setIds ( id, msgId, buttonId ) {

        if ( id ) {

            name = id;

        }

        if ( msgId ) {

            messageStr = msgId;
        }

        if ( buttonId ) {

            buttonStr = buttonId;
        }
    }

    /** 
     * Get the element, either directly (just pass through) or by its id
     * @param {DOMElement|String} elem DOM element we want to get.
     */
    function getElement ( elem ) {

        var e;

        if ( typeof elem === 'string' ) {

            e = document.getElementById( elem );

            if ( ! e ) {

                console.error( 'WebVRDOMUi.getElement():' + elem + ' not found in DOM');

                e = false;

            }

        } else {

           e = elem;

        }

        return e;

    };

    /** 
     * get the width of the window
     */
    function getScreenWidth () {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };

    /** 
     * get the height of the window
     */
    function getScreenHeight () {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    };

    /**
     * Replace <canvas> tags with warning images in
     * browsers that can't support THREE or other libraries
     * with a 3d canvas context. If the <canvas> tag hasn't 
     * been created yet, optionally attach a warning image to 
     * a supplied parent DOMElement.
     * @param {String} imgPath the path to the replacement image.
     * @param {DOMElement} container if no <canvas> optionally supply a container to 
     * attach the image to.
     */
    function replaceCanvasWithImage ( imgPath, container ) {

        var img;

        var c = document.getElementsByTagName( 'canvas' );

        // if no <canvas> exists, optionally append to supplied container element

        if ( ! c[0] ) {

            console.warn( 'dom-ui.replaceCanvasWithImage() warning: no <canvas> found.' );

            if ( ! container ) {

                console.warn( 'dom-ui.replaceCanvasWithImage() warning: no container, use document.body');

                container = document.body;

            }

            img = document.createElement( 'img' );

            img.src = imgPath;

            img.style.display = 'block';

            img.style.margin = 'auto';

            // set container to relative positioning so centering works

            container.style.position = 'relative';

            container.appendChild( img );

            return;

        }

        // Replace each canvas with a default image

        for( var i = 0; i < c.length; i++ ) {

            img = document.createElement( 'img' );

            img.src = imgPath;

            var parentNode = c[i].parentNode;

            parentNode.insertBefore( img, c[i] );

            var oldNode = parentNode.removeChild( c[i] );

            oldNode = null;

        }

    };

    /** 
     * Fade in an element
     * @param {DOMElement} elem the DOM element to fade
     * @param {Number} inc the fading increment
     * @param {Function} callback function to execute after fade complete
     */
    function fadeIn ( elem, inc, callback ) {

        var op = 0.1;  // initial opacity

        elem.style.display = 'block';

        var t = setInterval( function () {

            if ( op >= 1 ) {

                clearInterval( t );

            }

            elem.style.opacity = op;

            elem.style.filter = 'alpha(opacity=' + op * 100 + ")";

            op += op * inc;

        }, fadeInInc );

    };

    /** 
     * Fade out an element.
     * @param {DOMElement} elem the DOM element to fade
     * @param {Number} inc the fading increment
     * @param {Function} callback function to execute after fade complete
     */
    function fadeOut ( elem, inc, callback ) {

        var op = 1;  // initial opacity

        var t = setInterval( function () {

            if ( op <= 0.1 ) {

                clearInterval( t );

                // elem is now invisible

                elem.style.display = 'none';

            }

            elem.style.opacity = op;

            // support old IE

            elem.style.filter = 'alpha(opacity=' + op * 100 + ")";

            op -= op * inc;

        }, fadeOutInc );

    };

    /** 
     * Wrapper for setInterval, call function after time delay
     * @param {Number} del time delay, in milliseconds
     * @param {Function} callback the callback function
     */
    function delay ( del, callback ) {

        var t = setInterval( function () {

            callback();

            clearInterval( t );

        }, del );

    }

    /** 
     * Create an alert-style dialog in the DOM.
     * @param {String} className the CSS class
     * @param {Boolean} useButton if true, add a close button
     */
    function createMessage ( className, useButton ) {

        var padding = '';

        counter++;

        if ( counter < 10 ) {

            padding = '00';

        } else if ( counter < 100 ) {

            padding = '0';

        }

        var elem = document.createElement( 'div' );

        elem.id = name + padding + counter;

        elem.className = className || '';

        hideMessage( elem );

        // make container for text and button

        var container = document.createElement( 'div' );

        container.id = elem.id + messageStr;

        // make the message element

        var message = document.createElement( 'span' );

        message.id = elem.id + messageStr;

        container.appendChild( message );

        // optionally add close button

        if ( useButton ) {

            var button = document.createElement( 'button' );

            button.id = elem.id + buttonStr;

            button.innerHTML = 'close';

            button.onclick = function () {

                removeMessage ( elem );

                }

            container.appendChild( button );

        }

        // add to alert

        elem.appendChild( container );

        // invisible by default

        elem.style.display = 'none';

        // save a reference, and return

        messages.push( elem );

        return elem;
    };

    /** 
     * Set the message within an existing alert.
     * @param {DOMElement|String} elem DOM element we want to get.
     * @param {String} msg the message to display.
     * @param {Boolean} showFlag if true, immediately display the message.
     * @param {Boolean} useButton if true, a close button is added to the dialog.
     * @param {String} className the CSS class for the message
     * @param {DOMElement|undefined} if present, use instead of creating a new DOM element
     */
    function setMessage ( msg, showFlag, useButton, className, elem ) {

        if ( ! msg ) {

            console.error( 'WebVRDOMUi.setMessage(): failed to specify message')
        }

        // use existing element, or create new one and add to messages.

        elem = getElement( elem );

        if ( ! elem ) {

            elem = createMessage( className, useButton );

            if ( ! elem ) {

                return;

            }

        }

        // find the element in our list

        for ( var i = 0, len = messages.length; i < len; i++ ) {

            // change the element's text

            if ( elem === messages[i] ) {

                elem.childNodes[0].childNodes[0].innerHTML = msg;

                if ( showFlag ) {

                    showMessage( elem );

                }

                return elem;

            }

        }

        console.error ( 'WebVRDOMUi.setMessage(): could not find message DOM element');

        return null;

    };

    /** 
     * Show the alert-style dialog with its message.
     * @param {DOMElement|String} elem DOM element we want to get
     * @param {DOMElement|String} overElem the element to position the alert over
     */
    function showMessage ( elem ) {

        if ( ! elem ) {

            console.error( 'WebVRDOMUi.showMessage(): failed to specify DOM element');
        }

        // use document.body for centering

        elem = getElement( elem );

        if ( elem ) {

            elem.style.position = 'absolute';

            elem.style.display = 'block';

            var w = 0.8 * getScreenWidth();

            if ( w > 460 ) {

                w = 460;

            }

            elem.style.width = w + 'px';

            // center horizontally and down a bit vertically

            elem.style.left = ( ( getScreenWidth() / 2 ) - ( w / 2 ) ) + 'px';

            elem.style.top = getScreenHeight() * 0.2 + 'px';

            document.body.appendChild( elem );

            return true;

        }

        console.error ( 'WebVRDOMUi.setMessage(): could not find message DOM element');

        return false;

    };

    /** 
     * Hide the alert-style dialog with its message.
     * @param {DOMElement} elem the DOM element to hide
     * @param {Function} callback function to execute after fade complete
     * @param {Boolean} fadeFlag if true, fade out slowly
     * @param {Number} inc a number beween 0 and 1 describing fade intervals
     */
    function hideMessage ( elem, callback, fadeFlag, inc ) {

        elem = getElement( elem);

        if ( ! elem ) {

            console.error( 'WebVRDOMUi.hideMessage(): failed to specify DOM element')
        }

        elem = getElement( elem );

        if ( elem ) {

            if ( fadeFlag ) {

                if ( inc ) {

                    if (inc > 0.99 ) {

                        console.error( 'WebVRDOMUi.hideMessage(): invalid fade increment:' + inc );

                        return;

                    }

                    fadeOut( elem, inc );

                } else {

                    fadeOut( elem, 0.1 );

                }


            } else {

                // no fade

                elem.style.display = 'none';

            }

            return true;

        }

        console.error ( 'WebVRDOMUi.setMessage(): could not find message DOM element');

        return false;

    };

    /** 
     * delete a message entirely
     * @param {DOMElement} elem the message element
     */
    function removeMessage ( elem ) {

        if ( ! elem ) {

            console.warn( 'WebVRDOMUi.removeMessage(): failed to specify DOM element');

            return;

        }

        elem = getElement( elem );

        if ( elem ) {

            // remove reference from DOM

            elem.parentNode.removeChild( elem );

            // remove reference from our list

            for ( var i = 0, len = messages.length; i < len; i++ ) {

                if (messages[i] === elem || messages[i].id === elem ) {

                    messages[i] = null;

                    messages.splice(i, 1);

                }

            }

        }

    }

    /** 
     * Create a Progress dialog, with fallback to text-style presentation. It 
     * creates a container with a <div> for text status, a <progress> bar for 
     * visual readout, and additional text for browsers that don't support the 
     * <progress> element.
     * @param {String} className the className CSS class to apply to the element
     * @param {String} containerClassName the className for the container element
     * @param {Number} value the current value of the <progress>
     * @param {Number} max the max value of the <progress>
     * @param {DOMElement} parent optional specified for <progress> parent
     */
    function createProgress ( containerClassName, className, value, max, parent ) {

        // Create unique ID

        var padding = '';

        counter++;

        if ( counter < 10 ) {

            padding = '0';

        }

        // Create a container forming a DOM alert

        var container = document.createElement( 'div' );

        container.id = name + counter + progressStr + containerStr;

        container.className = containerClassName || '';

        container.style.display = 'block';

        // Text readout above <progress> bar

        var progText = document.createElement( 'div' );

        progText.innerHTML = ' . ';

        // Create <progress> within the container

        var progElem = document.createElement( 'progress' );

        progElem.id = name + counter + progressStr;

        progElem.className = className || '';

        progElem.value = value || 0;

        progElem.max = max || 100;

        // Seen only if <progress> not supported by the browser

        progElem.innerHTML = '<span>0</span>%';

        container.appendChild( progText );

        container.appendChild( progElem );

        parent = parent || document.body;

        parent.appendChild( container );

        container.parentNode = parent;

        return progElem;

    };

    /** 
     * Update the progress dialog, using local scope 'that', since 
     * we are likely to be in a callback.
     * @param {DOMElement} the DOM <progress> element, or its Id value (not its wrapper)
     * @param {Number} percent (value between 0-100)
     * @param {String} msg additional message
     */
    function updateProgress ( progElem, percent, msg ) {

        msg = msg || '';

        progElem = getElement( progElem );

        if ( ! progElem ) {

            console.error( 'WebVRDOMUi.updateProgress() error: <progress> element not provided.' );

            return;

        }

        if ( isNaN( percent ) ) {

            console.error( 'WebVRDOMUi.updateProgress() error: supplied % value:' + percent + ' is not a number.');

            return;

        }

        console.log( 'progress function, ' + percent + '%' + ' for:' + msg );


        // Handle non-<progress> tags

        if ( progElem.tagName.toUpperCase() === 'PROGRESS' ) {

            // get the text element in its enclosing <div>

            progElem.parentNode.getElementsByTagName( 'div' )[0].innerHTML = msg;

            // set the <progress> element

            progElem.value = percent;

        } else { // text fallback

            progElem.getElementsByTagName( 'span' )[0].innerHTML = percent;

        }

    };

    /** 
     * Hide and remove the progress dialog, using a supplied DOM element 
     * containing the <progress> bar. 
     * @param {DOMElement|String} the DOM <progress> element, or its Id value (not its wrapper)
     * falls back to inserting equivalent text.
     */
    function hideProgress ( progElem ) {

        progElem = getElement( progElem );

        if ( ! progElem ) {

            console.warn( 'WebVRDOMUi.hideProgress() error: <progress> element not provided' );

            return;

        }

        var container = progElem.parentNode;

        // set to final value for consistency

        progElem.value = 100;

        progElem.getElementsByTagName('span')[0].innerHTML = '100%';

        // remove it via removing its parent

        container.style.display = 'none';

        container.parentNode.removeChild( container );

        progElem = container = null;

    };

    /** 
     * Set <progress> to complete, fade out
     */
    function finishProgress ( progElem ) {

        // Leave up for a bit, then fade out

        delay( 500, function () {

            // Hide the message with fading, remove when invisible

            fadeOut ( progElem.parentNode, 0.1, function () {

                hideProgress( progElem );

            } );

        } );

    };

    /** 
     * Post a non-fatal warning to the user
     * @param {String} msg the message to display
     * @param {String} className apply CSS styles to alert
     */
    function browserWarn ( msg, className ) {

        // Hide any active <progress>

        hideProgress();

        // show a message (without a close button)

        var elem = setMessage( msg, true, false, className );

        showMessage( elem );

        // keep message onscreen for value shown in the delay

        delay( 4000, function () {

            // hide the message with fading, remove when invisible

            hideMessage( elem, removeMessage, true, 0.1 );

        } );

    };

    /** 
     * What to do when we can't load HTML5 canvas, 
     * 3d libraries, or WebVR.
     * @param {String} msg the message to show on failure.
     * @param {String} imgPath path to the replacement image
     * @param {String} className apply CSS styles to alert
     * @param {DOMElement} container if the <canvas> is created dynamically, supply 
     * another DOMElement to append the "fail image" to.
     */
    function browserFail ( msg, imgPath, className , container ) {

        replaceCanvasWithImage( imgPath, container );

        browserWarn( msg, className );

        /*

        // Hide any active <progress>

        hideProgress();

        var elem = setMessage( msg, true, true, className );

        showMessage( elem );

        // show message for value shown in the delay

        delay( 2000, function () {

            // hide the message with fading, remove when invisible

            hideMessage( elem, removeMessage, true, 0.1 );

        } );

        */

    };

    /** 
     * Create buttons controling fullscreen and VR
     * The control panel is a top horizontal header with 
     * identity plus Ui buttons for entering fullscreen, VR 
     * and re-setting pose
     * @param {DOMElemen} parentElem the parent element on the page, if specified
     * @param {String} panelClass the CSS class for styling the panel
     */
    function createControlPanel ( text, panelClass, textClass, buttonClass, linkClass ) {

        if( controlPanel ) {

            console.warn( 'WebVRDOMUi.createControlPanel() warning: button container already created' );

            return;

        }

        controlPanel = document.createElement( 'div' );

        if ( controlPanel ) {

            controlPanel.className = panelClass;

        }

        textContainer = document.createElement( 'div' );

        textContainer.className = textClass || '';

        textContainer.innerHTML = text;

        buttonContainer = document.createElement( 'div' );

        buttonContainer.className = buttonClass || '';

        linkContainer = document.createElement( 'div' );

        linkContainer.className = linkClass || '';

        // Adjust the buttonContainer to enclose the created button

        var b = document.createElement('button');

        // CSS styles
        b.className = buttonClass;

        // Dynamic styles.
        buttonContainer.style.height = getComputedStyle(b).getPropertyValue('height');

        b = null;

        // Add to the container (holds buttons and canvas)

        controlPanel.appendChild( textContainer );

        controlPanel.appendChild( buttonContainer );

        controlPanel.appendChild( linkContainer );

        document.body.insertBefore( controlPanel, document.body.childNodes[0] );

        return controlPanel;

    };

    /** 
     * Create an individual button for the control panel
     * @param {DOMElement} container the container for buttons in the Ui
     * @param String text the button text.
     * @param Function clickHandler the function handling button clicks.
     * @param String buttonClass the CSS className for the button.
     */
    function addControlButton ( text, clickHandler, buttonClass ) {

        if ( ! buttonContainer) {

            console.error( 'WebVRDOMUi.addButton(): button container not initialized' );

            return;
 
        }

        if ( ! text ) {

            console.error( 'WebVRDOMUi.addControlButton() error: no button text supplied.');

            return;

        }

        // Create the button

        var button = document.createElement( 'button' );

        button.innerHTML = text;

        button.className = buttonClass || '';

        // Add the event handler

        if (typeof clickHandler == 'function') {

            button.addEventListener( 'click', clickHandler );

        } else {

            button.disabled = true;

        }

        buttonContainer.appendChild(button);

        return button;

    };

    /**
     * Define a hyperlink in the control panel
     */
    function addControlLink ( text, url, linkClass ) {

        if ( ! linkContainer ) {
            
            console.error( 'WebVRDOMUi.addControlLink() error: link container not created.');

            return;

        }

        if ( ! text || ! url ) {

            console.error( 'WebVRDOMUi.addControlLink() error: no text or link supplied.');

            return;

        }

        var link = document.createElement( 'a' );

        link.innerHTML = text;

        link.href = url;

        link.className = linkClass || '';

        linkContainer.appendChild( link );

        return link;

    };

    /** 
     * Show the Ui buttons
     */
    function showControlPanel () {

        controlPanel.style.display = 'block';

    };

    /** 
     * Hide the Ui buttons
     */
    function hideControlPanel () {

        controlPanel.style.display = 'none';

    };

    /** 
     * check if Pointer Events are supported.
     */
    function hasPointerEvents () {

      if ( pointerEvents !== null ) {

        return pointerEvents;

    }

      var elem = document.createElement( 'x' );

      elem.style.cssText = 'pointer-events:auto';

      var r = elem.style.pointerEvents === 'auto';

      elem = null;

      return ( pointerEvents = r );

    }

    /**
     * normalize elementFromPoint detection across browsers. Similar to
     * @link https://github.com/moll/js-element-from-point.
     * @param {Number} x the x coordinate from mouseclick.
     * @param {Number} y the y coordinate from mouseclick.
     * @returns {DOMElement} the underlying page element.
     */
    function elemFromPoint ( x, y ) {

        var isRelativeToViewport = function () {

            var x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;

            var y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;

            if ( ! x && ! y ) {

                return true;

            }

            return ! document.elementFromPoint(x, y);

        };

      if ( ! isRelativeToViewport() ) {

        x += window.pageXOffset,

        y += window.pageYOffset;

      }

      return document.elementFromPoint( x, y );

    };

    /**
     * See if pointerEvents are supported on a DOM element, manually pass
     * mouseclicks if they are not. It works by briefly hiding the current element,
     * then checking which underlying element would be clicked on, then restoring
     * visibility to the element.
     * @param {DOMElement} elem the element we want to be transparent to clicks.
     */
    function makeClickThrough ( elem ) {

        elem.onclick = function( e ) {

        var underneath, disp;

        if ( e && e.target ) {

          disp = e.target.style.display;

          e.target.style.display = 'none';

          underneath = elemFromPoint(e.pageX, e.pageY);

          e.target.style.display = disp;

        } else if ( window.event !== undefined ) {

            disp = window.event.srcElement.style.visibility;

            window.event.srcElement.style.visibility = 'hidden';

            underneath = elemFromPoint(e.pageX, e.pageY);

            window.event.srcElement.style.visibility = disp;

            underneath.click(); // manually fire the 'click' event.

        }

      }

    };


    /**
     * Check if fullScreen element is non-null for browsers that have it.
     * @returns Boolean if fullScreen element present, return true, else false
     */
    function isFullscreen () {

        if ( ! document.fullscreenElement ||
            ! document.mozFullScreenElement ||
            ! document.webkitFullscreenElement ||
            ! document.msFullscreenElement ) {

          return false;

        }

        return true;

    };


    /** 
     * Set up listening for fullscreen requests. Initially 
     * it may be null, so check for the event being undefined
     * @param {function} callback for change in fullscreen status.
     */
    function listenFullscreen ( fullscreenChangeFn ) {

        // NOTE: put w3c ahead of others, since they may be non-functional but still available

        if ( 'onfullscreenchange' in document ) {

            document.addEventListener( 'fullscreenchange', fullscreenChangeFn, false );

        } else if ( 'onwebkitfullscreenchange' in document ) {

            document.addEventListener( 'webkitfullscreenchange', fullscreenChangeFn, false );

        } else if ( 'onmozfullscreenchange' in document ) {

            document.addEventListener( 'mozfullscreenchange', fullscreenChangeFn, false );

        } else if ( 'onMSFullscreenChange' in document ) {

            document.addEventListener( 'MSFullscreenChange', fullscreenChangeFn, false );

        }

    };

    /** 
     * Request fullScreen using vendor prefixes.
     * @param {DOMElement} elem the element to set fullscreen.
     * @param {Boolean} controlFlag if true, hide the controls.
     */
    function enterFullscreen ( elem, controlFlag ) {

        // hide the control panel

        if ( controlFlag ) {

            hideControlPanel();

        }

        // handle vendor prefixes

        if ( elem.requestFullscreen ) {

            elem.requestFullscreen();

            return true;

        } else if ( elem.mozRequestFullscreen ) {

            elem.mozRequestFullscreen();

            return true;

        } else if ( elem.webkitRequestFullscreen ) {

            elem.webkitRequestFullscreen();

            return true;

        } else if ( elem.msRequestFullscreen ) {

            elem.msRequestFullscreen();

            return true;

        }

        return false;

    };

    /** 
     * browser fix for checking if we are in fullscreen
     */
    function isFullscreen () {

       return document.fullscreenElement || document.webkitFullscreenElement || 
            document.mozFullScreenElement || document.msFullscreenElement || 
            document.webkitCurrentFullScreenElement || 
            ( ! window.screenTop && ! window.screenY ) || false;

    };

    /** 
     * manually leave fullscreen. In the Fullscreen API, the 
     * escape key automatically leaves, and generates an 
     * onfullscreen change. Manually leaving fullscreen with 
     * a Ui control requires firing the exitFullscreen() function.
     */
    function exitFullscreen () {

        if ( document.exitFullscreen ) {

            document.exitFullscreen();

        } else if ( document.webkitExitFullscreen ) {

            document.webkitExitFullscreen();

        } else if ( document.webkitCancelFullScreen ) {

            document.webkitCancelFullScreen();

        } else if ( document.mozCancelFullScreen ) {

            document.mozCancelFullScreen();

        } else if ( document.msExitFullscreen ) {

            document.msExitFullscreen();

        }

        // Restore the Ui

       showControlPanel();

    };

    return {

        replaceCanvasWithImage: replaceCanvasWithImage,

        browserFail: browserFail,

        browserWarn: browserWarn,

        createProgress: createProgress,

        updateProgress: updateProgress,

        finishProgress: finishProgress,

        hideProgress: hideProgress,

        createControlPanel: createControlPanel,

        addControlButton: addControlButton,

        addControlLink: addControlLink,

        showControlPanel: showControlPanel,

        hideControlPanel: hideControlPanel,

        listenFullscreen: listenFullscreen,

        enterFullscreen: enterFullscreen,

        isFullscreen: isFullscreen,

        exitFullscreen: exitFullscreen

    };

} )();