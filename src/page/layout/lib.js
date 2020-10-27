/* eslint-disable */
import model from './model'
import {SizeUtil} from './util'
import Var from './constants'


const $ = document.getElementById.bind(document);
let svgRectData={x:0, y:0, width:0, height:0};

// 颜色变量
const Property={
  goods:{
    fill:'rgba(255, 170, 170, 0.8)',
    stroke:'#e86f8d',
  }
};

const EdgeTop = 50, EdgeLeft = 50;

// 画布与svg初始化
export function resetCanvas(mainGd, copyGd, svg){
  let mainCanvas = mainGd.canvas, copyCanvas = copyGd.canvas;
  mainCanvas.width = mainCanvas.getBoundingClientRect().width;
  mainCanvas.height = mainCanvas.getBoundingClientRect().height;

  copyCanvas.width = copyCanvas.getBoundingClientRect().width;
  copyCanvas.height = copyCanvas.getBoundingClientRect().height;

  svg.setAttribute('width', svg.getBoundingClientRect().width);
  svg.setAttribute('height', svg.getBoundingClientRect().height);

  const oCanvas = $('canvas');
  oCanvas.oncontextmenu=()=>false; // 先屏掉右键菜单
}

export function handleEvents(){

  const oCanvas = $('canvas');

  const svgHandle = new SvgHandle();

  oCanvas.onmousedown = e=>{

    let touchStartX = e.clientX - EdgeLeft, touchStartY = e.clientY - EdgeTop;

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

  mainGd.fillStyle='white';
  mainGd.fillRect( Var.worldPosition.x, Var.worldPosition.y, Var.worldPosition.width, Var.worldPosition.height );

  const gd = mainGd;
  // 绘制柜子
  for( let i = 0; i < model.data.goods.length; i ++ ){

    let rectItem = model.data.goods[i];

    let x = SizeUtil.worldToScreenX(rectItem.x),
        y = SizeUtil.worldToScreenY(rectItem.y),
        width = SizeUtil.calc(rectItem.width),
        height = SizeUtil.calc(rectItem.height);

    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle = Property.goods.stroke;
    gd.fillRect( x, y, width, height );
    gd.strokeRect( x, y, width, height );

  } // for i end

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

    if( Var.beBatchEnd ){
      return;
    }

    touchStartX = ev.clientX - EdgeLeft;
    touchStartY = ev.clientY - EdgeTop;
    svgRectData.x = touchStartX;
    svgRectData.y = touchStartY;
  };

  this.move = function(ev){
    if( Var.beBatchEnd ){
      return;
    }

    touchMoveX = ev.clientX - EdgeLeft;
    touchMoveY = ev.clientY - EdgeTop;

    let x = Math.min( touchStartX, touchMoveX ), y = Math.min( touchStartY, touchMoveY );
    let width = Math.abs( touchStartX - touchMoveX ), height = Math.abs( touchStartY - touchMoveY );
    svgRectData={x, y, width, height};
  };

  this.end = function(ev){

    // 先查看是否需要处理批量生成
    if(Var.beBatch && svgRectData.width > 200 && svgRectData.height > 200){
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

  displayJ_batchGoods(left, top);
  Var.beBatchEnd = true; // 说明要批处理生成了

}

function J_batchGoodsEvents(){
  const batch_row = $('batch_row'), batch_col=$('batch_col');
  const batch_shut = $('batch_shut'), batch_save=$('batch_save');
  const J_batchGoods = $('J_batchGoods');
  const batch_num_value = $('batch_num_value');
  const batch_size_w = $('batch_size_w'), batch_size_h = $('batch_size_h');

  batch_row.onchange = function(){
    if(this.checked){
      Var.batchPreviewData['value']='row';
      createBatchTmpData();
    }
  };

  batch_col.onchange = function(){
    if(this.checked){
      Var.batchPreviewData['value']='col';
      createBatchTmpData();
    }
  };

  batch_num_value.oninput=function(){
    Var.batchPreviewData['num'] = +this.value.trim();
    createBatchTmpData();
  };

  batch_size_w.oninput = function(){
    createBatchTmpData();
  }

  batch_size_h.oninput = function(){
    createBatchTmpData();
  }

  batch_shut.onclick = ()=>{
    clearSvgRectData();
    createBatchTmpData();
  }

  batch_save.onclick = ()=>{

    //
    model.data.goods.push( ...Var.batchTmpData );
    console.log('goods: ', model.data.goods)

    clearSvgRectData();
    createBatchTmpData();
  }


}

function clearSvgRectData(){
  const batch_row = $('batch_row'), batch_col=$('batch_col');
  batch_row.checked = false;
  batch_col.checked = false;
  const batch_num_value = $('batch_num_value');
  batch_num_value.value='';

  const batch_size_w = $('batch_size_w'), batch_size_h = $('batch_size_h');
  batch_size_w.value=80;
  batch_size_h.value=40;

  const J_batchGoods = $('J_batchGoods');
  J_batchGoods.style.display='none';
  Var.beBatchEnd = false;
  svgRectData={x:0, y:0, width:0, height:0};
  Var.batchPreviewData={value:'', num:0};
}

// 就中间临时的批量生成一个预览图
function previewCanvas(copyGd){
  const gd = copyGd;
  if(!Var.beBatchEnd) return; // 只有批量生成了，再往下走

  for( let i = 0; i < Var.batchTmpData.length; i ++ ){

    let item = Var.batchTmpData[i];
    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle=Property.goods.stroke;

    gd.fillRect( item.x, item.y, SizeUtil.calc(item.width), SizeUtil.calc(item.height) );
    gd.strokeRect( item.x, item.y, SizeUtil.calc(item.width), SizeUtil.calc(item.height) );

  } // for i

}

function displayJ_batchGoods(left, top){
  const J_batchGoods = $('J_batchGoods');

  // J_batchGoods
  J_batchGoods.style.display='block';
  J_batchGoods.style.left=left+'px';
  J_batchGoods.style.top=top+'px';

}

// 得到中途临时的预览数据
function createBatchTmpData(){
  Var.batchTmpData = [];
  const batch_size_w = $('batch_size_w'), batch_size_h = $('batch_size_h');

  if( Var.batchPreviewData['value'] === 'row' && Var.batchPreviewData['num'] > 0 ){
    let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value), spaceV = svgRectData.height / Var.batchPreviewData['num'] - SizeUtil.calc(sizeH * 2);
    if( spaceV <= 1 ){
     return;
    }

    let colNum = svgRectData.width / SizeUtil.calc(sizeW) | 0;
    let rowNum = svgRectData.height / SizeUtil.calc(sizeH * 2 + spaceV) | 0;

    for( let r = 0; r < rowNum; r ++ ){

      for( let c = 0; c < colNum; c ++ ){

        Var.batchTmpData.push({
          x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV), width:sizeW, height:sizeH
        });
        Var.batchTmpData.push({
          x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV) + sizeH + spaceV, width:sizeW, height:sizeH
        });

      } // for c

    } // for r

  }

  if( Var.batchPreviewData['value'] === 'col' && Var.batchPreviewData['num'] > 0 ){
    let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value), spaceH = svgRectData.width / Var.batchPreviewData['num'] - SizeUtil.calc(sizeW * 2);

    if( spaceH <= 1 ){
      return;
    }

    let colNum = svgRectData.width / SizeUtil.calc(sizeW * 2 + spaceH) | 0;
    let rowNum = svgRectData.height / SizeUtil.calc(sizeH) | 0;

    for( let c = 0; c < colNum; c ++ ){
      for( let r = 0; r < rowNum; r ++ ){

        Var.batchTmpData.push({
          x:svgRectData.x + c * (sizeW * 2 + spaceH), y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH
        });
        Var.batchTmpData.push({
          x:svgRectData.x + c * (sizeW * 2 + spaceH) + sizeW + spaceH, y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH
        });

      } // for r
    } // for c
  }
}
