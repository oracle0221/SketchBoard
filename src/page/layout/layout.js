/* eslint-disable */
import {resetCanvas, handleEvents, drawScene, drawCopyScene, drawSvg} from './lib'
import {leftNavHandle, PanZoom, undoAction, redoAction, initUndoRedo} from './sidebar'
import {fetchMapJson, LangUtil} from './util'
import model from './model'

const $ = document.getElementById.bind(document);


// 初始请求地图数据
async function getMapJson(){
  return await fetchMapJson();
}

export default function layout(){
  const mainCanvas = $('mainCanvas'), copyCanvas = $('copyCanvas'), svg = $('svg');
  const mainGd = mainCanvas.getContext('2d'), copyGd = copyCanvas.getContext('2d');

  // 多语言
  LangUtil.translate();

  leftNavHandle(); // 工具与菜单栏
  PanZoom(); // 视图放大与缩小
  undoAction(); // 撤消操作
  redoAction(); // 重做操作
  initUndoRedo(); // 撤消与重做初始化

  resetCanvas(mainGd, copyGd, svg);

  handleEvents();

  (async()=>{
    let data = await getMapJson();

    let goods = data.filter(item=>item.type === 'wdl_location').map(item=>({...item, text:item.name}));
    let barriers = data.filter(item=>item.type === 'wdl_barrier');

    model.data.goods = goods;
    model.data.obstacle = barriers;

    draw();
  })();

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
