"use strict";

import transitions from "gl-transitions";
import createTransition from "gl-transition";
import createTexture from "gl-texture2d";

var _texture = _interopRequireDefault(require("../node_modules/gl-texture2d/texture.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import transitions from "../node_modules/gl-transitions/gl-transitions.js";
//var transitions = window.GLTransitions; //var createTransition = require("gl-transition");

//var createTexture = require("gl-texture2d");
//console.log(transitions);

var globalImageFrom, globalImageTo;
var scrollFlag = false;


window.addEventListener('scroll', function() {
  scrollFlag == true;
});

var startScroll = function() {
  let contentArea = document.querySelector("#rmh-content");
  let frame = document.querySelector(".rmh-frame");

  let canvas = document.querySelectorAll("canvas.cnv");
  canvas.forEach((item) => { contentArea.removeChild(item) })

  contentArea.appendChild(globalImageTo);
  
  // if(!frame.querySelector(".rmh-frame__scrollbar")) {
  //   let scroll = document.querySelector("#scrollbar");
  //   contentArea.parentNode.appendChild(scroll.content.cloneNode(true));
  // }


  //let scroll = new MiniBar(contentArea, alwaysShowBars: true});

  let start = null;
    const loop = timestamp => {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      //scroll.scrollBy(progress / 50, "y");
      contentArea.scrollTop = progress / 10;
      console.log(progress)
       if (progress < globalImageTo.naturalHeight && scrollFlag == false) {
          requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
}

var ready = function () {
  let contentArea = document.querySelector("#rmh-content");
  document.addEventListener('pointerdown', function (event) {
    if (event.target && event.target.classList.contains("a-link")) {
      let node = event.target;
      event.preventDefault();
      event.stopPropagation();
      const imageFromPromise = asyncImageLoader("/1-2-3/867-978-4-svyatoslav-ru.png");
      const imageToPromise = asyncImageLoader("/1-2-3/1-1.png"); //
      
      Promise.all([imageFromPromise, imageToPromise]).then((values) => {
        curlPage(values[0], values[1]).then(startScroll);
      })
      // let page = document.querySelector(current);
      // console.log(page);
      // contentArea.innerHTML = "";
      // contentArea.appendChild(page.content.cloneNode(true));
    }
  }); // document.querySelectorAll(".a-link").forEach(node => {
  //   node.addEventListener("click", event => {
  //   }, true)
  // })
};

function curlPage(imageFrom, imageTo) {
  // let widthTo = imageTo.naturalWidth;
  // let heightTo = imageTo.naturalHeight;
  globalImageFrom = imageFrom;
  globalImageTo = imageTo;
  imageTo = imageResize(imageTo, imageFrom.naturalWidth, imageFrom.naturalHeight);
  let contentArea = document.querySelector("#rmh-content");
  contentArea.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.classList.add("cnv");
  //contentArea.appendChild(imageTo);
  contentArea.appendChild(canvas);
  canvas.width = imageFrom.width;
  canvas.height = imageFrom.height;

// const width = Math.floor(w * window.devicePixelRatio)
//     const  height = Math.floor(h * window.devicePixelRatio)
//  canvas.width = width
//  canvas.height = height
//     context.viewport(0, 0, width, height)

  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
  gl.STATIC_DRAW);
  gl.viewport(0, 0, canvas.width, canvas.height);
  const from = (0, _texture.default)(gl, imageFrom);
  from.minFilter = gl.LINEAR;
  from.magFilter = gl.LINEAR;
  const to = (0, _texture.default)(gl, imageTo);
  to.minFilter = gl.LINEAR;
  to.magFilter = gl.LINEAR;
  const transition = createTransition(gl, transitions.find(t => t.name === "InvertedPageCurl")); // https://github.com/gl-transitions/gl-transitions/blob/master/transitions/cube.glsl
  // animates forever!

  let promise = new Promise((resolve, reject) => {

    let start = null;
    const loop = timestamp => {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      try {
        transition.draw(progress / 3000 % 1, from, to, canvas.width, canvas.height, {
          persp: 1.5,
          unzoom: 0.6
        });
      }
      catch {
        reject();
      }
      if (progress < 2900) {
          requestAnimationFrame(loop);
      }
      else {
        // canvas.width = widthTo;
        // canvas.height = heightTo;
        resolve();
      }
    };
    requestAnimationFrame(loop);
  });

 

  return promise;
}

function asyncImageLoader(imgUrl) {
  // var outside;
  // var fetchedImage = new Image();
  // fetch(imgUrl).then(response => response.blob()).then(images => {
  //   outside = URL.createObjectURL(images);
  //   fetchedImage.src = outside;
  //   fetchedImage.onload = () => {
  //     return fetchedImage;
  //   }
  // });
  return new Promise( (resolve, reject) => {
        var image = new Image()
        image.src = imgUrl
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('could not load image'))
    })
}

function imageResize(image, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const cont2d = canvas.getContext("2d");
  cont2d.drawImage(image, 0, 0, width, image.naturalHeight);
  //document.body.appendChild(canvas);
  return canvas;
}



document.addEventListener("DOMContentLoaded", ready);