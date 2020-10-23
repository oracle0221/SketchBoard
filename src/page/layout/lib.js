/* eslint-disable */
import model from './model'

const $ = document.getElementById.bind(document);
let svgRectData={x:0, y:0, width:0, height:0};
let zoomLevel = 1.0;

let beBatch = true; // 需要批量操作
let beBatchEnd = false; // 批量操作结束
let batchPrevieData={value:'', num:0};
// 世界
let worldPosition={x:0, y:0, width:2000, height:2000};

// 画布与svg初始化
export function resetCanvas(mainGd, copyGd, svg){
  let mainCanvas = mainGd.canvas, copyCanvas = copyGd.canvas;
  mainCanvas.width = mainCanvas.getBoundingClientRect().width;
  mainCanvas.height = mainCanvas.getBoundingClientRect().height;

  copyCanvas.width = copyCanvas.getBoundingClientRect().width;
  copyCanvas.height = copyCanvas.getBoundingClientRect().height;

  svg.setAttribute('width', svg.getBoundingClientRect().width);
  svg.setAttribute('height', svg.getBoundingClientRect().height);
}

export function handleEvents(){

  const oCanvas = $('canvas');

  const svgHandle = new SvgHandle();

  oCanvas.onmousedown = e=>{

    let touchStartX = e.clientX, touchStartY = e.clientY;

    svgHandle.start(e);

    document.onmousemove =e=>{
      svgHandle.move(e);
    };

    document.onmouseup = e=>{
      svgHandle.end(e);
      document.onmousemove = document.onmouseup = null;
    };

    return false;
  };

  // 处理弹框中的事件
  J_batchGoodsEvents();
}

export function drawScene(mainGd){
  let mainCanvas = mainGd.canvas;
  mainGd.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

}

export function drawCopyScene(copyGd){
  let copyCanvas = copyGd.canvas;
  copyGd.clearRect(0, 0, copyCanvas.width, copyCanvas.height);

  previewCanvas(copyGd);
}

export function drawSvg(svg){
  let svgRect = svg.getElementsByClassName('path-select')[0];
  svgRect.setAttribute('x', svgRectData.x);
  svgRect.setAttribute('y', svgRectData.y);
  svgRect.setAttribute('width', svgRectData.width);
  svgRect.setAttribute('height', svgRectData.height);

  let svgText = svg.getElementsByClassName('path-text')[0];
  svgText.setAttribute('x', svgRectData.x);
  svgText.setAttribute('y', svgRectData.y+15);
  if( svgRectData.width && svgRectData.height ){
    svgText.innerHTML = svgRectData.width + ', ' + svgRectData.height;
  }else{
    svgText.innerHTML='';
  }


}

function SvgHandle(){
  let touchStartX, touchStartY, touchMoveX, touchMoveY;

  this.start = function(ev){

    if( beBatchEnd ){
      return;
    }

    touchStartX = ev.clientX;
    touchStartY = ev.clientY;
    svgRectData.x = touchStartX;
    svgRectData.y = touchStartY;
  };

  this.move = function(ev){
    if( beBatchEnd ){
      return;
    }

    touchMoveX = ev.clientX;
    touchMoveY = ev.clientY;

    let x = Math.min( touchStartX, touchMoveX ), y = Math.min( touchStartY, touchMoveY );
    let width = Math.abs( touchStartX - touchMoveX ), height = Math.abs( touchStartY - touchMoveY );
    svgRectData={x, y, width, height};
  };

  this.end = function(ev){

    // 先查看是否需要处理批量生成
    if(beBatch && svgRectData.width > 200 && svgRectData.height > 200){
      handleBatchCreate();
    }else{
      clearSvgRectData();
    }
  };
}

function handleBatchCreate(){
  let L = 0, T = 0, R = document.documentElement.clientWidth || document.body.clientWidth, B = document.documentElement.clientHeight || document.body.clientHeight;
  const divW = 200, divH = 200;
  let left = 0, top = 0;
  if( svgRectData.x + svgRectData.width < R - divW ){ // div放在右边
    left = svgRectData.x + svgRectData.width;
  }else{
    left = svgRectData.x + svgRectData.width - divW;
  }

  if( svgRectData.y + svgRectData.height < B - divH){ // div放在下边
    top = svgRectData.y + svgRectData.height;
  }else{
    top = svgRectData.y + svgRectData.height - divH;
  }

  const J_batchGoods = $('J_batchGoods');
  // J_batchGoods
  J_batchGoods.style.display='block';
  J_batchGoods.style.left=left+'px';
  J_batchGoods.style.top=top+'px';
  beBatchEnd = true; // 说明要批处理生成了

}

function J_batchGoodsEvents(){
  const batch_row = $('batch_row'), batch_col=$('batch_col');
  const batch_row_num = $('batch_row_num'), batch_col_num=$('batch_col_num');
  const batch_shut = $('batch_shut'), batch_save=$('batch_save');
  const J_batchGoods = $('J_batchGoods');

  batch_row.onchange = function(){
    // alert(batch_row.checked)
    if(this.checked){
      batchPrevieData['value']='row'
    }
  };

  batch_col.onchange = function(){
    // alert(batch_col.checked)
    if(this.checked){
      batchPrevieData['value']='col'
    }
  };

  batch_row_num.oninput=function(){
    batchPrevieData['num'] = +this.value.trim();
  };

  batch_col_num.oninput=function(){
    batchPrevieData['num'] = +this.value.trim();
  };

  batch_shut.onclick = ()=>{
    clearSvgRectData();
  }

  batch_save.onclick = ()=>{
    clearSvgRectData();
  }


}

function clearSvgRectData(){
  const J_batchGoods = $('J_batchGoods');
  J_batchGoods.style.display='none';
  beBatchEnd = false;
  svgRectData={x:0, y:0, width:0, height:0};
  batchPrevieData={value:'', num:0};
}

// 就中间临时的批量生成一个预览图
function previewCanvas(copyGd){
  const gd = copyGd;
  if(!beBatchEnd) return; // 只有批量生成了，再往下走

  // svgRectData, batchPrevieData
  // 行 row
  if( batchPrevieData['value'] === 'row' ){

    // 30 * 10
    let colNum = svgRectData.width / 30 | 0;
    

  }

  if( batchPrevieData['value'] === 'col' ){

  }

}
