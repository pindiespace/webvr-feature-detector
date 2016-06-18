/** 
 * imgfallback.js
 * replace HTML5 canvas tags with PNG images in browsers that 
 * are too old to support HTML5 canvas.
 */

document.replaceCanvasWithImage = function (imgPath) {
  var c = document.getElementsByTagName('canvas');
  // Replace each canvas with a default image.
  for(var i = 0; i < c.length; i++) {
    var img = document.createElement('img');
    img.src = imgPath;
    var parentNode = c[i].parentNode;
    parentNode.insertBefore(img, c[i]);
    parentNode.removeChild(c[i]);
  }
};
