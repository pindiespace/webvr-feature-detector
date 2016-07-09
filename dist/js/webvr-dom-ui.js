var domui = ( function () {

    var messages = [], 

    name = 'webvr-dom-ui-',

    counter = 0;

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
     * Replace <canvas> tags with images in
     * browsers that can't support THREE or other libraries
     * with a 3d canvas context.
     * @param {String} imgPath the path to the replacement image.
     */
    function replaceCanvasWithImage ( imgPath ) {

        var c = document.getElementsByTagName( 'canvas' );

        // Replace each canvas with a default image

        for( var i = 0; i < c.length; i++ ) {

            var img = document.createElement( 'img' );

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

        counter++;

        var elem = document.createElement( 'div' );

        elem.id = name + counter;

        elem.className = className;

        hideMessage( elem );

        // make container for text and button

        var container = document.createElement( 'div' );

        // make the message element

        var message = document.createElement( 'span' );

        message.id = elem.id + '-message';

        container.appendChild( message );

        if ( useButton ) {

            var button = document.createElement( 'button' );

            button.id = elem.id + '-button';

            button.onclick = function () {

                removeMessage ( elem );

                }

        }

        container.appendChild(button);

        elem.appendChild(container);

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

            var m = messages[i];

            // change the element's text

            if ( elem === m ) {

                m.innerHTML = msg;

                if ( showFlag ) {

                    showMessage( elem  );

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
     */
    function showMessage ( elem ) {

        if ( ! elem ) {

            console.error( 'domui.showMessage(): failed to specify DOM element')
        }

        elem = getElement( elem );

        if ( elem ) {

            elem.style.display = 'block';

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

            console.warn( 'domui.hideProgress(): tried to hid non-existent progress window.');
        }

    };

    /** 
     * What to do when we can't load HTML5 canvas, 
     * 3d libraries, or WebVR.
     * @param {String} msg the message to show on failure.
     * @param {String} imgPath path to the replacement image
     */
    function browserFail ( msg, imgPath ) {

        replaceCanvasWithImage( imgPath );

        hideProgress();

        setMessage( msg, true, true );

        showMessage();

    };

    return {

        replaceCanvasWithImage: replaceCanvasWithImage,

        browserFail: browserFail

    };

} )();