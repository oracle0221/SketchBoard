/* eslint-disable */
import {resetCanvas, handleEvents, drawScene, drawCopyScene, drawSvg} from './lib'

const $ = document.getElementById.bind(document);

export default function layout(){
  const mainCanvas = $('mainCanvas'), copyCanvas = $('copyCanvas'), svg = $('svg');
  const mainGd = mainCanvas.getContext('2d'), copyGd = copyCanvas.getContext('2d');

  resetCanvas(mainGd, copyGd, svg);

  handleEvents();

  draw();

  function draw(){
    drawScene(mainGd);
    drawCopyScene(copyGd);
    drawSvg(svg);
    window.requestAnimationFrame(draw)
  }

}
