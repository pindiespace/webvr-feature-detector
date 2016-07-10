var domui = ( function () {

    var messages = [], 

    name = 'dom-ui-',

    messageStr = '-message',

    buttonStr = '-button',

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

        // if no <canvas> exist, optionally append to supplied container element

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

        elem.className = className;

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

        }

        // find the element in our list

        for ( var i = 0, len = messages.length; i < len; i++ ) {

            // change the element's text

            window.elem = elem;

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

            // center horizontally and vertically

            elem.style.left = ( ( getScreenWidth() / 2 ) - ( w / 2 ) ) + 'px';

            elem.style.top = getScreenHeight() * 0.2 + 'px';

            document.body.appendChild( elem );

            return true;

        }

        console.error ( 'domui.setMessage(): could not find message DOM element');

        return false;

    };

    /** 
     * Hide the alret-style dialog with its message.
     */
    function hideMessage ( elem ) {

        if ( ! elem ) {

            console.error( 'domui.hideMessage(): failed to specify DOM element')
        }

        elem = getElement( elem );

        if ( elem ) {

            elem.style.display = 'none';

            return true;

        }

        console.error ( 'domui.setMessage(): could not find message DOM element');

        return false;

    };

    /** 
     * delete a message entirely
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

            return true;

        }

        console.error ( 'domui.removeMessage(): could not find message DOM element');

        return false;

    }

    /** 
     * Create a Progress dialog, with fallback to text-style presentation.
     * @param {DOMElement|String} a DOM <progress> element, or its Id value,
     */
    function createProgress ( elem ) {

        return elem;

    };

    /** 
     * Update the progress dialog.
     * @param {DOMElement|String} a DOM <progress> element, or its Id value,
     * falls back to inserting equivalent text.
     * @param {Number} percent (value between 0-100)
     * @param {String} msg additional message
     */
    function updateProgress ( elem, percent, msg ) {

        var prog;

        console.log( 'progress function, ' + percent + '%' + ' for:' + msg );

        // convert an id string to the equivalent element in DOM

        if ( typeof elem === 'string' ) {

            prog = document.getElementById( elem );

        } else {

            prog = elem;

        }

        if( prog ) {

            if ( elem.tagName === 'PROGRESS' ) {

                elem.value = percent;

            } else {

                elem.getElementsByTagName( 'span' )[0].innerHTML = percent;

            }

        } else {

            console.error( 'domui.updateProgress: progress element not found on page');

        }

    };

    /** 
     * Hide the progress dialog.
     * @param {DOMElement|String} a DOM <progress> element, or its Id value,
     * falls back to inserting equivalent text.
     */
    function hideProgress ( elem ) {

       var prog = getElement( elem );

          // set to final value for consistency

        if ( prog ) {

            prog.value = 100;

            prog.getElementsByTagName('span')[0].innerHTML = '100%';

            // remove it

            prog.style.display = 'none';

            prog.parentNode.removeChild( prog );

            prog = null;

        } else {

            console.warn( 'domui.hideProgress() warning: tried to hide non-existent progress window.' );
        }

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

        hideProgress();

        var elem = setMessage( msg, true, true, className );

        showMessage( elem );

    };

    return {

        replaceCanvasWithImage: replaceCanvasWithImage,

        browserFail: browserFail

    };

} )();