/* eslint-disable */
import model from './model'

const $ = document.getElementById.bind(document);
let svgRectData={x:0, y:0, width:0, height:0};
let zoomLevel = 1.0;

let beBatch = true; // 需要批量操作
let beBatchEnd = false; // 批量操作结束
let batchPreviewData={value:'', num:0};
let batchTmpData=[]; // 在预览时的临时数据

// 颜色变量
const Property={
  goods:{
    fill:'rgba(255, 170, 170, 0.8)',
    stroke:'#e86f8d',
  }
};

// 世界
let worldPosition={x:0, y:0, width:2000, height:2000};

const Size = {
  // 得到画布中物块的绝对尺寸
  calc( size ){
    return zoomLevel * (+size);
  },
  // 屏幕坐标转为世界坐标
  screenToWorldX(x){
    return x / zoomLevel - worldPosition.x;
  },
  screenToWorldY(y){
    return y / zoomLevel - worldPosition.y;
  },

  // 世界坐标转屏幕坐标
  worldToScreenX(x){
    return (x + worldPosition.x) * zoomLevel;
  },
  worldToScreenY(y){
    return (y + worldPosition.y) * zoomLevel;
  },

}

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

  mainGd.fillStyle='white';
  mainGd.fillRect( worldPosition.x, worldPosition.y, worldPosition.width, worldPosition.height );

  const gd = mainGd;
  // 绘制柜子
  for( let i = 0; i < model.data.goods.length; i ++ ){

    let rectItem = model.data.goods[i];

    let x = Size.worldToScreenX(rectItem.x),
        y = Size.worldToScreenY(rectItem.y),
        width = Size.calc(rectItem.width),
        height = Size.calc(rectItem.height);

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

  displayJ_batchGoods(left, top);
  beBatchEnd = true; // 说明要批处理生成了

}

function J_batchGoodsEvents(){
  const batch_row = $('batch_row'), batch_col=$('batch_col');
  const batch_shut = $('batch_shut'), batch_save=$('batch_save');
  const J_batchGoods = $('J_batchGoods');
  const batch_num_value = $('batch_num_value');
  const batch_size_w = $('batch_size_w'), batch_size_h = $('batch_size_h');

  batch_row.onchange = function(){
    if(this.checked){
      batchPreviewData['value']='row';
      createBatchTmpData();
    }
  };

  batch_col.onchange = function(){
    if(this.checked){
      batchPreviewData['value']='col';
      createBatchTmpData();
    }
  };

  batch_num_value.oninput=function(){
    batchPreviewData['num'] = +this.value.trim();
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
    model.data.goods.push( ...batchTmpData );
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
  beBatchEnd = false;
  svgRectData={x:0, y:0, width:0, height:0};
  batchPreviewData={value:'', num:0};
}

// 就中间临时的批量生成一个预览图
function previewCanvas(copyGd){
  const gd = copyGd;
  if(!beBatchEnd) return; // 只有批量生成了，再往下走

  for( let i = 0; i < batchTmpData.length; i ++ ){

    let item = batchTmpData[i];
    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle=Property.goods.stroke;

    gd.fillRect( item.x, item.y, Size.calc(item.width), Size.calc(item.height) );
    gd.strokeRect( item.x, item.y, Size.calc(item.width), Size.calc(item.height) );

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
  batchTmpData = [];
  const batch_size_w = $('batch_size_w'), batch_size_h = $('batch_size_h');

  if( batchPreviewData['value'] === 'row' && batchPreviewData['num'] > 0 ){
    let sizeW = Size.calc(batch_size_w.value), sizeH = Size.calc(batch_size_h.value), spaceV = svgRectData.height / batchPreviewData['num'] - Size.calc(sizeH * 2);
    if( spaceV <= 1 ){
     return;
    }

    let colNum = svgRectData.width / Size.calc(sizeW) | 0;
    let rowNum = svgRectData.height / Size.calc(sizeH * 2 + spaceV) | 0;

    for( let r = 0; r < rowNum; r ++ ){

      for( let c = 0; c < colNum; c ++ ){

        batchTmpData.push({
          x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV), width:sizeW, height:sizeH
        });
        batchTmpData.push({
          x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV) + sizeH + spaceV, width:sizeW, height:sizeH
        });

      } // for c

    } // for r

  }

  if( batchPreviewData['value'] === 'col' && batchPreviewData['num'] > 0 ){
    let sizeW = Size.calc(batch_size_w.value), sizeH = Size.calc(batch_size_h.value), spaceH = svgRectData.width / batchPreviewData['num'] - Size.calc(sizeW * 2);

    if( spaceH <= 1 ){
      return;
    }

    let colNum = svgRectData.width / Size.calc(sizeW * 2 + spaceH) | 0;
    let rowNum = svgRectData.height / Size.calc(sizeH) | 0;

    for( let c = 0; c < colNum; c ++ ){
      for( let r = 0; r < rowNum; r ++ ){

        batchTmpData.push({
          x:svgRectData.x + c * (sizeW * 2 + spaceH), y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH
        });
        batchTmpData.push({
          x:svgRectData.x + c * (sizeW * 2 + spaceH) + sizeW + spaceH, y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH
        });

      } // for r
    } // for c
  }
}
