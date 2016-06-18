/** 
 * pngfallback.js
 * replace HTML5 canvas tags with PNG images in browsers that 
 * are too old to support HTML5 canvas.
 * Note: if HTML5Shiv was already loaded, it won't be re-loaded.
 */
//console.log("added HTML5 Shiv");
// Replace canvas tags with images.
var c = document.getElementsByTagName('canvas');
//console.log('c.length:' + c.length)
// Replace each canvas with a default image.
for(var i = 0; i < c.length; i++) {
  //TODO: change so both canvas tags are replaced.
  console.log('replacing canvas tag id:' + c[i].id);
  var img = document.createElement('img');
  img.src = 'img/no-vr.gif';
  img.style.display = 'block';
  var parentNode = c[i].parentNode;
  parentNode.insertBefore(img, c[i]);
}
