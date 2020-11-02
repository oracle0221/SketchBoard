/* eslint-disable */
import model from './model'
import {SizeUtil, inView, mouseInRect, drawDashedRect, getSelectedRects, drawBackgroundLines} from './util'
import Var, {EdgeTop, EdgeLeft, Mode_Select, Mode_Location, Mode_Barrier, Mode_Text, Mode_Zoom, Mode_Batch, Mode_Pan} from './constants'
import {setMenu} from './sidebar'

const $ = document.getElementById.bind(document);
let svgRectData={x:0, y:0, width:0, height:0};

// 颜色变量
const Property={
  goods:{
    fill:'rgba(255, 170, 170, 0.8)',
    stroke:'#e86f8d',
  }
};

// 画布与svg初始化
export function resetCanvas(mainGd, copyGd, svg){
  let mainCanvas = mainGd.canvas, copyCanvas = copyGd.canvas;
  mainCanvas.width = mainCanvas.getBoundingClientRect().width;
  mainCanvas.height = mainCanvas.getBoundingClientRect().height;

  Var.screen.width = mainCanvas.width;
  Var.screen.height = mainCanvas.height;

  copyCanvas.width = copyCanvas.getBoundingClientRect().width;
  copyCanvas.height = copyCanvas.getBoundingClientRect().height;

  svg.setAttribute('width', svg.getBoundingClientRect().width);
  svg.setAttribute('height', svg.getBoundingClientRect().height);

  const oCanvas = $('canvas');
  oCanvas.oncontextmenu=(e)=>{

    if( Var.Menu_Mode_Left ===  Mode_Batch){ // 如果是批处理 则开启右键菜单
      // console.log(e);
      createContextForBatch(e);
    }

    return false;
  };
}

export function handleEvents(){

  const oCanvas = $('canvas');

  const svgHandle = new SvgHandle();
  const dragRect = new DragRect();
  const panMove = new PanMove();

  oCanvas.onmousedown = e=>{

    let touchStartX = e.clientX - EdgeLeft, touchStartY = e.clientY - EdgeTop;

    svgHandle.start(e); // 选择框
    dragRect.start(e); // 拖动
    panMove.start(e); // Pan 拖动视图

    document.onmousemove =e=>{
      svgHandle.move(e);
      dragRect.move(e);
      panMove.move(e);
    };

    document.onmouseup = e=>{
      svgHandle.end(e);
      dragRect.end(e);
      panMove.end(e);
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
  mainGd.fillRect( Var.worldPosition.x * Var.zoomLevel, Var.worldPosition.y * Var.zoomLevel, Var.worldPosition.width * Var.zoomLevel, Var.worldPosition.height * Var.zoomLevel );

  const gd = mainGd;
  // 绘制辅助线
  drawBackgroundLines(gd);

  // model.data.goods
  let goodsArr = getSortedZindexArray(model.data.goods);
  // 绘制柜子
  for( let i = 0; i < goodsArr.length; i ++ ){

    let rectItem = goodsArr[i];

    let x = SizeUtil.worldToScreenX(rectItem.x),
        y = SizeUtil.worldToScreenY(rectItem.y),
        width = SizeUtil.calc(rectItem.width),
        height = SizeUtil.calc(rectItem.height);

    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle = Property.goods.stroke;
    gd.fillRect( x, y, width, height );
    gd.strokeRect( x, y, width, height );

  } // for i end

  // 如果有选择项, 那么绘制选择标记
  Var.selectedRects.forEach( itemRect=>{

    drawDashedRect(gd, itemRect);

  } );

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

    // 只有选择或批量模式下才有框选
    if( !(Var.Menu_Mode_Left === Mode_Select  ||  Var.Menu_Mode_Left === Mode_Batch) ){
      return;
    }

    touchStartX = ev.clientX - EdgeLeft;
    touchStartY = ev.clientY - EdgeTop;
    svgRectData.x = touchStartX;
    svgRectData.y = touchStartY;

    if(Var.selectedDrag) return;
    if(Var.beBatchEnd)return;
  };

  this.move = function(ev){

    // 只有选择或批量模式下才有框选
    if( !(Var.Menu_Mode_Left === Mode_Select  ||  Var.Menu_Mode_Left === Mode_Batch) ){
      return;
    }

    touchMoveX = ev.clientX - EdgeLeft;
    touchMoveY = ev.clientY - EdgeTop;

    if(Var.selectedDrag) return;
    if(Var.beBatchEnd) return;

    let x = Math.min( touchStartX, touchMoveX ), y = Math.min( touchStartY, touchMoveY );
    let width = Math.abs( touchStartX - touchMoveX ), height = Math.abs( touchStartY - touchMoveY );
    svgRectData={x, y, width, height};
  };

  this.end = function(ev){

    if( Var.Menu_Mode_Left === Mode_Select ){
      // 查看目前框选了有多少柜子
      if( Var.selectedRects.length === 0 ){
        Var.selectedRects = getSelectedRects(svgRectData, model.data.goods);
      }

      clearSvgRectData();
    }else if( Var.Menu_Mode_Left === Mode_Batch ){
      // 先查看是否需要处理批量生成
      if(Var.beBatch && svgRectData.width > 100 && svgRectData.height > 100){
        handleBatchCreate();
      }else{
        // console.log(svgRectData)
        if( !Var.batchContext || svgRectData.width + svgRectData.height > 0 ){
          clearSvgRectData();
        }
      }
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
  const batch_cell_value = $('batch_cell_value');
  const batch_aisle = $('batch_aisle');

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

  batch_cell_value.oninput = function(){
    createBatchTmpData();
  };

  batch_aisle.oninput = function(){
    createBatchTmpData();
  };

  batch_shut.onclick = ()=>{
    clearSvgRectData();
    createBatchTmpData();
  }

  batch_save.onclick = ()=>{
    //
    model.data.goods.push( ...Var.batchTmpData );
    // console.log('goods: ', model.data.goods)
    // 当批量设好后, 把左侧菜单切换为Mode_Select模式
    setMenu(Mode_Select);

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
  Var.batchPreviewData={value:'', num:0, cells:0};
}

// 就中间临时的批量生成一个预览图
function previewCanvas(copyGd){
  const gd = copyGd;
  if(!Var.beBatchEnd) return; // 只有批量生成了，再往下走

  for( let i = 0; i < Var.batchTmpData.length; i ++ ){

    let item = Var.batchTmpData[i];
    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle=Property.goods.stroke;

    gd.fillRect( SizeUtil.worldToScreenX(item.x), SizeUtil.worldToScreenY(item.y), SizeUtil.calc(item.width), SizeUtil.calc(item.height) );
    gd.strokeRect( SizeUtil.worldToScreenX(item.x), SizeUtil.worldToScreenY(item.y), SizeUtil.calc(item.width), SizeUtil.calc(item.height) );

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
  const batch_cell_value = $('batch_cell_value');
  const batch_aisle = $('batch_aisle');

  if( Var.batchPreviewData['value'] === 'row' && Var.batchPreviewData['num'] > 0 ){

    let colNum, rowNum;

    if( !Var.batchContext ){  // 框选
      let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value), spaceV = svgRectData.height / Var.batchPreviewData['num'] - SizeUtil.calc(sizeH * 2);
      if( spaceV <= 1 ){
       return;
      }

      colNum = svgRectData.width / SizeUtil.calc(sizeW) | 0;
      rowNum = svgRectData.height / SizeUtil.calc(sizeH * 2 + spaceV) | 0;

      for( let r = 0; r < rowNum; r ++ ){

        for( let c = 0; c < colNum; c ++ ){

          Var.batchTmpData.push({
            x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV), width:sizeW, height:sizeH,
            zIndex:Var.zIndex,
          });
          Var.batchTmpData.push({
            x : svgRectData.x + c * sizeW, y : svgRectData.y + r * (sizeH*2+spaceV) + sizeH + spaceV, width:sizeW, height:sizeH,
            zIndex:Var.zIndex,
          });

        } // for c

      } // for r
    }else{
      // 右键点击
      let cells_value = +batch_cell_value.value.trim();
      if( cells_value == 0 ){
        return;
      }

      if( !batch_aisle.value.trim() ){
        return;
      }

      let spaceV = +batch_aisle.value.trim();
      spaceV *= Var.zoomLevel;

      let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value)

      colNum = cells_value;
      rowNum = +Var.batchPreviewData['num'];

      for( let r = 0; r < rowNum; r ++ ){

        for( let c = 0; c < colNum; c ++ ){

          Var.batchTmpData.push({
            x : SizeUtil.screenToWorldX(svgRectData.x + c * sizeW), y : SizeUtil.screenToWorldY(svgRectData.y + r * (sizeH*2+spaceV)), width:+batch_size_w.value, height:+batch_size_h.value,
            zIndex:Var.zIndex,
          });
          Var.batchTmpData.push({
            x : SizeUtil.screenToWorldX(svgRectData.x + c * sizeW), y : SizeUtil.screenToWorldY(svgRectData.y + r * (sizeH*2+spaceV) + sizeH), width:+batch_size_w.value, height:+batch_size_h.value,
            zIndex:Var.zIndex,
          });

        } // for c

      } // for r

    }

  }

  if( Var.batchPreviewData['value'] === 'col' && Var.batchPreviewData['num'] > 0 ){
    let colNum, rowNum;

    if(!Var.batchContext){ // 框选
      let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value), spaceH = svgRectData.width / Var.batchPreviewData['num'] - SizeUtil.calc(sizeW * 2);

      if( spaceH <= 1 ){
        return;
      }

      colNum = svgRectData.width / SizeUtil.calc(sizeW * 2 + spaceH) | 0;
      rowNum = svgRectData.height / SizeUtil.calc(sizeH) | 0;

      for( let c = 0; c < colNum; c ++ ){
        for( let r = 0; r < rowNum; r ++ ){

          Var.batchTmpData.push({
            x:svgRectData.x + c * (sizeW * 2 + spaceH), y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH,
            zIndex:Var.zIndex,
          });
          Var.batchTmpData.push({
            x:svgRectData.x + c * (sizeW * 2 + spaceH) + sizeW + spaceH, y:svgRectData.y + r * sizeH, width:sizeW, height:sizeH,
            zIndex:Var.zIndex,
          });

        } // for r
      } // for c
    }else{

      // 右键点击
      let cells_value = +batch_cell_value.value.trim();
      if( cells_value == 0 ){
        return;
      }

      if( !batch_aisle.value.trim() ){
        return;
      }

      let spaceH = +batch_aisle.value.trim()
      spaceH = spaceH * Var.zoomLevel;

      let sizeW = SizeUtil.calc(batch_size_w.value), sizeH = SizeUtil.calc(batch_size_h.value)
      colNum = +Var.batchPreviewData['num'];
      rowNum = cells_value;

      for( let c = 0; c < colNum; c ++ ){
        for( let r = 0; r < rowNum; r ++ ){

          Var.batchTmpData.push({
            x:SizeUtil.screenToWorldX(svgRectData.x + c * (sizeW * 2 + spaceH)), y:SizeUtil.screenToWorldY(svgRectData.y + r * sizeH), width:+batch_size_w.value, height:+batch_size_h.value,
            zIndex:Var.zIndex,
          });
          Var.batchTmpData.push({
            x:SizeUtil.screenToWorldX(svgRectData.x + c * (sizeW * 2 + spaceH) + sizeW), y:SizeUtil.screenToWorldY(svgRectData.y + r * sizeH), width:+batch_size_w.value, height:+batch_size_h.value,
            zIndex:Var.zIndex,
          });

        } // for r
      } // for c

    }
  }
}

// 拖动相关
function DragRect(){

  let beDrag = false;

  this.start = function(e){

    // 只有选择才有后续的拖动
    if( !(Var.Menu_Mode_Left === Mode_Select ) ){
      return;
    }

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    let bHit = false;

    for( let i = 0; i < model.data.goods.length; i ++ ){

      let itemRect = model.data.goods[i];
      if( !inView(itemRect) ){
        continue;
      }

      // if( !Var.selectedRects.includes(itemRect) ){
      if(mouseInRect( e, itemRect )){
        beDrag = true;
        bHit = true;
        Var.selectedDrag = true;

        if( Var.selectedRects.length === 0 || !Var.selectedRects.includes(itemRect) ){
          Var.selectedRects = [itemRect];

          Var.selectedRectsOffset = [
            {
              x : x - SizeUtil.worldToScreenX(itemRect.x),
              y : y - SizeUtil.worldToScreenY(itemRect.y),
            }
          ];
        }else{

          Var.selectedRectsOffset = Var.selectedRects.map(itemRect=>{
            return {
              x : x - SizeUtil.worldToScreenX(itemRect.x),
              y : y - SizeUtil.worldToScreenY(itemRect.y),
            };
          });

        }

        Var.selectedRects.forEach(itemRect=>{
          itemRect.zIndex = ++Var.zIndex;
        });

        break;
      }


    } // for i

    if(!bHit){
      Var.selectedDrag = false;
      Var.selectedRects = [];
      Var.selectedRectsOffset=[];
    }

  }

  this.move = function(e){

    // 只有选择才有后续的拖动
    if( !(Var.Menu_Mode_Left === Mode_Select ) ){
      return;
    }

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    if(!beDrag) return;

    Var.selectedRectsOffset.forEach((itemRectOffset, index)=>{
      Var.selectedRects[index].x = SizeUtil.screenToWorldX(x - itemRectOffset.x);
      Var.selectedRects[index].y = SizeUtil.screenToWorldY(y - itemRectOffset.y);
    });

  }

  this.end = function(e){
    beDrag = false;
    // Var.selectedDrag = false;
  }
}

// Pan Move拖动视图
function PanMove(){

  let startX, startY, moveX, moveY;
  let startWorldX, startWorldY;

  this.start = function(e){
    if( !(Var.Menu_Mode_Left === Mode_Pan ) ){
      return;
    }

    startX = e.clientX - EdgeLeft;
    startY = e.clientY - EdgeTop;

    startWorldX = Var.worldPosition.x * Var.zoomLevel;
    startWorldY = Var.worldPosition.y * Var.zoomLevel;

  };

  this.move = function(e){
    if( !(Var.Menu_Mode_Left === Mode_Pan ) ){
      return;
    }

    moveX = e.clientX - EdgeLeft;
    moveY = e.clientY - EdgeTop;

    Var.worldPosition.x = (startWorldX + (moveX - startX)) / Var.zoomLevel;
    Var.worldPosition.y = (startWorldY + (moveY - startY)) / Var.zoomLevel;
  };

  this.end = function(e){};

}


function createContextForBatch(e){
  let left = e.clientX - EdgeLeft, top = e.clientY - EdgeTop;
  Var.batchContext = true;

  svgRectData.x = left;
  svgRectData.y = top;

  displayJ_batchGoods(left, top);
  Var.beBatchEnd = true; // 说明要批处理生成了
}

// 得到排序zIndex后的数组
function getSortedZindexArray(arr){
  let res = [...arr];
  res.sort( (obj1, obj2)=>obj1.zIndex - obj2.zIndex );
  return res;
}
