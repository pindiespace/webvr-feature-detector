var domui = ( function () {

    var messages = [],

    name = 'dom-ui-',

    messageStr = '-message',

    buttonStr = '-button',

    progressStr = '-progress',

    containerStr = '-container',

    fadeInInc = 10, // milliseconds between fadeIn increment

    fadeOutInc = 50, // milliseconds between fadeOut increment

    fadeDelay = 5000, // number of seconds until fading alerts begin fading

    counter = 0;

    /* 
     * Set ids used for elements to a custom value.
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

                console.error( 'domui.getElement():' + elem + ' not found in DOM');

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

            console.error( 'domui.setMessage(): failed to specify message')
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

        console.error ( 'domui.setMessage(): could not find message DOM element');

        return null;

    };

    /** 
     * Show the alert-style dialog with its message.
     * @param {DOMElement|String} elem DOM element we want to get
     * @param {DOMElement|String} overElem the element to position the alert over
     */
    function showMessage ( elem ) {

        if ( ! elem ) {

            console.error( 'domui.showMessage(): failed to specify DOM element');
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

        console.error ( 'domui.setMessage(): could not find message DOM element');

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

            console.error( 'domui.hideMessage(): failed to specify DOM element')
        }

        elem = getElement( elem );

        if ( elem ) {

            if ( fadeFlag ) {

                if ( inc ) {

                    if (inc > 0.99 ) {

                        console.error( 'domui.hideMessage(): invalid fade increment:' + inc );

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

        console.error ( 'domui.setMessage(): could not find message DOM element');

        return false;

    };

    /** 
     * delete a message entirely
     * @param {DOMElement} elem the message element
     */
    function removeMessage ( elem ) {

        if ( ! elem ) {

            console.error( 'domui.removeMessage(): failed to specify DOM element')
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

        console.error ( 'domui.removeMessage(): could not find message DOM element');

    }

    /** 
     * Create a Progress dialog, with fallback to text-style presentation.
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

        // Create a container

        var container = document.createElement( 'div' );

        container.id = name + counter + progressStr + containerStr;

        container.className = containerClassName || '';

        // Create <progress>

        var progElem = document.createElement( 'progress' );

        progElem.id = name + counter + progressStr;

        progElem.className = className || '';

        progElem.value = value || 0;

        progElem.max = max || 100;

        progElem.innerHTML = '<span>0</span>%';

        container.appendChild( progElem );

        parent = parent || document.body;

        parent.appendChild( container );

        return progElem;

    };

    /** 
     * Update the progress dialog, using local scope 'that', since 
     * we are likely to be in a callback.
     * @param {DOMElement} prog the <progress> element
     * @param {Number} percent (value between 0-100)
     * @param {String} msg additional message
     */
    function updateProgress ( progElem, percent, msg ) {

        progElem = getElement( progElem );

        console.log( 'progress function, ' + percent + '%' + ' for:' + msg );

        if ( ! progElem ) {

            console.error( 'domui.updateProgress() error: <progress> element not provided' );

            return;

        }

        // Handle non-<progress> tags

        if ( progElem.tagName.toUpperCase() === 'PROGRESS' ) {

            progElem.value = percent;

        } else { // text fallback

            progElem.getElementsByTagName( 'span' )[0].innerHTML = percent;

        }

    };

    /** 
     * Hide and remove the progress dialog, using a supplied DOM element 
     * containing the <progress> bar. 
     * @param {DOMElement|String} a DOM <progress> element, or its Id value,
     * falls back to inserting equivalent text.
     */
    function hideProgress ( progElem ) {

        progElem = getElement( progElem );

        if ( ! progElem ) {

            console.warn( 'domui.hideProgress() error: <progress> element not provided' );

            return;

        }

        var container = progElem.parentNode;

        // set to final value for consistency

        progElem.value = 100;

        progElem.getElementsByTagName('span')[0].innerHTML = '100%';

        // remove it via removing its parent

        progElem.style.display = 'none';

        container.parentNode.removeChild( progElem );

        container.parentNode.removeChild( container );

        progElem = container = null;

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

        // Hide any active <progress>

        hideProgress();

        var elem = setMessage( msg, true, true, className );

        showMessage( elem );

        // show message for value shown in the delay

        delay( 2000, function () {

            // hide the message with fading, remove when invisible

            hideMessage( elem, removeMessage, true, 0.1 );

        });

    };

    return {

        replaceCanvasWithImage: replaceCanvasWithImage,

        browserFail: browserFail,

        createProgress: createProgress,

        updateProgress: updateProgress,

        hideProgress: hideProgress

    };

} )();