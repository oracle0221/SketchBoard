/* eslint-disable */
import {resetCanvas, handleEvents, drawScene, drawCopyScene, drawSvg} from './lib'
import {leftNavHandle, PanZoom, undoAction, redoAction, initUndoRedo} from './sidebar'

const $ = document.getElementById.bind(document);

export default function layout(){
  const mainCanvas = $('mainCanvas'), copyCanvas = $('copyCanvas'), svg = $('svg');
  const mainGd = mainCanvas.getContext('2d'), copyGd = copyCanvas.getContext('2d');

  leftNavHandle(); // 工具与菜单栏
  PanZoom(); // 视图放大与缩小
  undoAction(); // 撤消操作
  redoAction(); // 重做操作
  initUndoRedo(); // 撤消与重做初始化

  resetCanvas(mainGd, copyGd, svg);

  handleEvents();

  draw();

  clearTimeout(window.resizeTimer);
  window.onresize = ()=>{
    window.resizeTimer = setTimeout(()=>{
      resetCanvas(mainGd, copyGd, svg);
      draw();
    }, 500);
  };

  function draw(){
    drawScene(mainGd);
    drawCopyScene(copyGd);
    drawSvg(svg);
    window.requestAnimationFrame(draw)
  }

}
