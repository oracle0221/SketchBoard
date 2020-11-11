/* eslint-disable */
import model from './model'
import {SizeUtil, AlignUtil, inView, mouseInRect, drawDashedRect, getSelectedRects, drawBackgroundLines, getWorldCollideTest, testHitInGoods, clearSelectedRects, clearSelectedBarrierRects, drawBarrierObject, isRightMouseClick, drawGoodsText, resetEditText, startEditText, scrollView, pushUndoStack, mouseOverBarrierRect, mouseClickBarrierRect} from './util'
import Var, {EdgeTop, EdgeLeft, Mode_Select, Mode_Location, Mode_Text, Mode_Barrier, Mode_Zoom, Mode_Batch, Mode_Pan, Property} from './constants'
import {setMenu} from './sidebar'

const $ = document.getElementById.bind(document);
let svgRectData={x:0, y:0, width:0, height:0};

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
    e.preventDefault();
    e.stopPropagation();
    if( Var.Menu_Mode_Left ===  Mode_Batch){ // 如果是批处理 则开启右键菜单
      createContextForBatch(e);
    }

    if( Var.Menu_Mode_Left === Mode_Location ){
      createContextForGoodsLocation(e);
    }

    if( Var.Menu_Mode_Left === Mode_Select ){
      createContextForSelectAlign(e);
    }

    return false;
  };
}

export function handleEvents(){

  const oCanvas = $('canvas');

  const svgHandle = new SvgHandle();
  const dragRect = new DragRect();
  const stretchBarrier = new StretchBarrier();
  const panMove = new PanMove();
  const barrierObject = new BarrierObject();
  const goodsLocation = new GoodsLocation();
  const editText = new EditText();

  oCanvas.onmousemove = e=>{
    stretchBarrier.move(e);
  };

  oCanvas.onmousedown = e=>{

    let touchStartX = e.clientX - EdgeLeft, touchStartY = e.clientY - EdgeTop;

    svgHandle.start(e); // 选择框
    dragRect.start(e); // 拖动
    stretchBarrier.start(e); // 如果需要,伸缩障碍物
    panMove.start(e); // Pan 拖动视图
    barrierObject.start(e); // 生成障碍物
    goodsLocation.start(e); // 点击生成柜子
    editText.start(e); // 点击柜子编辑文字

    document.onmousemove =e=>{
      svgHandle.move(e);
      dragRect.move(e);
      stretchBarrier.move(e);
      panMove.move(e);
      barrierObject.move(e);
    };

    document.onmouseup = e=>{
      svgHandle.end(e);
      dragRect.end(e);
      stretchBarrier.end(e);
      panMove.end(e);
      barrierObject.end(e);
      document.onmousemove = document.onmouseup = null;
    };

    return false;
  };

  document.onkeyup = e=>{
    let tag = e.target.tagName.toLowerCase();
    if(tag === 'input' || tag === 'textarea') return;

    // 通过键盘移动柜子
    // 要在移动模式下才做键盘行为
    if(Var.Menu_Mode_Left != Mode_Select)return;
    keyboardForGoods(e);
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

    // 在视野中,才进行绘制
    if( !inView(rectItem) ){
      continue;
    }

    let x = SizeUtil.worldToScreenX(rectItem.x),
        y = SizeUtil.worldToScreenY(rectItem.y),
        width = SizeUtil.calc(rectItem.width),
        height = SizeUtil.calc(rectItem.height);

    gd.fillStyle = Property.goods.fill;
    gd.strokeStyle = Property.goods.stroke;
    gd.fillRect( x, y, width, height );
    gd.strokeRect( x, y, width, height );

  } // for i end

  // 绘制文字
  drawGoodsText(gd);

  // 如果有选择项, 那么绘制选择标记
  Var.selectedRects.forEach( itemRect=>{
    drawDashedRect(gd, itemRect);
  } );

  Var.selectedBarrierRects.forEach( itemRect=>{
    drawDashedRect(gd, itemRect);
  } );

  // 障碍物
  // 1.拖动过程中的障碍物
  if( Var.currBarrierRect ){
    drawBarrierObject(gd, Var.currBarrierRect);
  }

  // 2. 遍历障碍物数组,绘制障碍物
  for( let i = 0; i < model.data.obstacle.length; i ++ ){
    let itemBarrierRect = model.data.obstacle[i];
    drawBarrierObject(gd, itemBarrierRect);

  } // end for obstacle

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
    if(Var.Menu_Mode_Left === Mode_Barrier) return; // 拖动绘制障碍物不需要走框选

    // 只有选择或批量模式下才有框选
    if( !(Var.Menu_Mode_Left === Mode_Select  ||  Var.Menu_Mode_Left === Mode_Batch || Var.Menu_Mode_Left === Mode_Barrier) ){
      return;
    }



    touchStartX = ev.clientX - EdgeLeft;
    touchStartY = ev.clientY - EdgeTop;
    svgRectData.x = touchStartX;
    svgRectData.y = touchStartY;

    if(Var.selectedDrag) return;
    if(Var.selectedBarrierDrag) return;
    if(Var.beBatchEnd)return;

  };

  this.move = function(ev){

    if(Var.Menu_Mode_Left === Mode_Barrier) return; // 拖动绘制障碍物不需要走框选

    // 只有选择或批量模式下才有框选
    if( !(Var.Menu_Mode_Left === Mode_Select  ||  Var.Menu_Mode_Left === Mode_Batch) ){
      return;
    }

    touchMoveX = ev.clientX - EdgeLeft;
    touchMoveY = ev.clientY - EdgeTop;

    if(Var.selectedDrag) return;
    if(Var.selectedBarrierDrag) return;
    if(Var.beBatchEnd) return;

    let x = Math.min( touchStartX, touchMoveX ), y = Math.min( touchStartY, touchMoveY );
    let width = Math.abs( touchStartX - touchMoveX ), height = Math.abs( touchStartY - touchMoveY );
    svgRectData={x, y, width, height};
  };

  this.end = function(ev){

    if( Var.Menu_Mode_Left === Mode_Select ){
      // 查看目前框选了有多少柜子
      if( Var.selectedRects.length === 0 ){
        let [vRes, vResIndex] = getSelectedRects(svgRectData, model.data.goods);
        Var.selectedRects = vRes;
        Var.selectedRectsIndex = vResIndex;
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

// 拖动柜子相关
function DragRect(){

  let beDrag = false, beBarrierDrag = false;
  let oldPosArr=[], oldPosBarrierArr = [];

  this.start = function(e){

    // 只有选择才有后续的拖动
    if( !(Var.Menu_Mode_Left === Mode_Select ) ){
      return;
    }

    // 如果是鼠标右键点下来的话,返回
    if(!isRightMouseClick(e)){
      $('J_select_contextAlign').style.display='none';
    }else{
      return;
    }

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    let bHit = false;
    // 先处理普通柜子
    for( let i = 0; i < model.data.goods.length; i ++ ){

      let itemRect = model.data.goods[i];
      if( !inView(itemRect) ){
        continue;
      }

      if(mouseInRect( e, itemRect )){
        beDrag = true;
        bHit = true;
        Var.selectedDrag = true;

        if( Var.selectedRects.length === 0 || !Var.selectedRects.includes(itemRect) ){
          Var.selectedRects = [itemRect];
          Var.selectedRectsIndex = [i]; // 生成Var.selectedRects之余需要同步Var.selectedRectsIndex

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

        // 存一下老位置,后面如果与其它柜子碰撞了,则复位
        oldPosArr = Var.selectedRects.map(item=>({x:item.x, y:item.y}));

        break;
      } //  if(mouseInRect( e, itemRect ))

    } // for i

    if(!bHit){
      clearSelectedRects();
    }

    if(bHit){
      clearSelectedBarrierRects();
      return; // 既然拖动了柜子了,说明障碍物就不用再拖动了
    }

    // 另外再加一条,就是障碍物存在伸缩的情况,如果在可伸缩的模式下,也不用再拖动了
    if( Var.stretchBarrier ){
      return;
    }

    // 接下来处理障碍物
    let bBarrierHit = false;
    let oldBarrierPosArr=[];

    for( let i = 0; i < model.data.obstacle.length; i ++ ){
      let itemRect = model.data.obstacle[i];
      if( !inView(itemRect) ){
        continue;
      }

      if(mouseInRect( e, itemRect )){
        beBarrierDrag = true;
        bBarrierHit = true;
        Var.selectedBarrierDrag = true;

        Var.selectedBarrierRects = [itemRect];
        Var.selectedBarrierRectsIndex = [i]; // 生成Var.selectedRects之余需要同步Var.selectedRectsIndex

        Var.selectedBarrierRectsOffset = [
          {
            x : x - SizeUtil.worldToScreenX(itemRect.x),
            y : y - SizeUtil.worldToScreenY(itemRect.y),
          }
        ];

        Var.selectedBarrierRects.forEach(itemRect=>{
          itemRect.zIndex = ++Var.zIndex;
        });

        // 存一下老位置,后面如果与其它柜子碰撞了,则复位
        oldPosBarrierArr = Var.selectedBarrierRects.map(item=>({x:item.x, y:item.y}));

        break;

      }
    } // for i

    if(!bBarrierHit){
      clearSelectedBarrierRects();
    }

  }

  this.move = function(e){

    // 只有选择才有后续的拖动
    if( !(Var.Menu_Mode_Left === Mode_Select ) ){
      return;
    }

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    if( beDrag ){
      Var.selectedRectsOffset.forEach((itemRectOffset, index)=>{
        Var.selectedRects[index].x = SizeUtil.screenToWorldX(x - itemRectOffset.x);
        Var.selectedRects[index].y = SizeUtil.screenToWorldY(y - itemRectOffset.y);
      });

      scrollView(e);
    }

    if( beBarrierDrag && !Var.stretchBarrier ){ // 不在伸缩模式下才可拖动障碍物
      Var.selectedBarrierRectsOffset.forEach((itemRectOffset, index)=>{
        Var.selectedBarrierRects[index].x = SizeUtil.screenToWorldX(x - itemRectOffset.x);
        Var.selectedBarrierRects[index].y = SizeUtil.screenToWorldY(y - itemRectOffset.y);
      });
      scrollView(e);
    }

  }

  this.end = function(e){
    beDrag = false;
    beBarrierDrag = false;

    // 释放鼠标一刻, 需要检测有无碰撞,如果有,则复位
    let bool1 = testHitInGoods( [...model.data.goods], [...Var.selectedRects] );
    let bool2 = testHitInGoods( [...model.data.goods], [...Var.selectedBarrierRects] );
    let bool3 = testHitInGoods( [...model.data.obstacle], [...Var.selectedBarrierRects] );
    let bool4 = testHitInGoods( [...model.data.obstacle], [...Var.selectedRects] );
    // console.log('是否碰了: ', bool)
    if(bool1 || bool2 || bool3 || bool4){
      Var.selectedRects.forEach((itemRect, index)=>{
        Var.selectedRects[index].x=oldPosArr[index].x;
        Var.selectedRects[index].y=oldPosArr[index].y;
      });
      // console.log('Var.selectedBarrierRects: ', Var.selectedBarrierRects);
      Var.selectedBarrierRects.forEach((itemRect, index)=>{
        Var.selectedBarrierRects[index].x=oldPosBarrierArr[index].x;
        Var.selectedBarrierRects[index].y=oldPosBarrierArr[index].y;
      });
    }

    oldPosArr=[];
    oldPosBarrierArr = [];
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

// 拖动生成障碍物
function BarrierObject(){

  let startX, startY, moveX, moveY;

  this.start = function(e){
    if( Var.Menu_Mode_Left != Mode_Barrier ){
      return;
    }

    startX = e.clientX - EdgeLeft;
    startY = e.clientY - EdgeTop;
  };

  this.move = function(e){
    if( Var.Menu_Mode_Left != Mode_Barrier ){
      return;
    }

    moveX = e.clientX - EdgeLeft;
    moveY = e.clientY - EdgeTop;

    let x = Math.min( startX, moveX );
    let y = Math.min( startY, moveY );
    let width = Math.abs( startX - moveX );
    let height = Math.abs( startY - moveY );

    // let x = SizeUtil.
    Var.currBarrierRect = {
      x : SizeUtil.screenToWorldX(x),
      y : SizeUtil.screenToWorldY(y),
      width:width / Var.zoomLevel,
      height:height / Var.zoomLevel,
    };

  };

  this.end = function(e){
    if( Var.Menu_Mode_Left != Mode_Barrier ){
      return;
    }

    model.data.obstacle.push({...Var.currBarrierRect});

    setMenu(Mode_Select);
    Var.currBarrierRect = null;
  };
}

// 点击生成柜子 Mode_Location
function GoodsLocation(){
  this.start = function(e){
    if(Var.Menu_Mode_Left != Mode_Location) return; // 只有在 Mode_Location模式时，才有点击生成柜子

    // 如果是鼠标右键点下来的话,返回
    if(isRightMouseClick(e)) return;

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    let width = +$('goods_form_w').value.trim(), height=+$('goods_form_h').value.trim();
    model.data.goods.push({
      x:SizeUtil.screenToWorldX(x),
      y:SizeUtil.screenToWorldY(y),
      width,
      height,
    });
  }
}

function EditText(){
  this.start = function(e){
    if(Var.Menu_Mode_Left != Mode_Text)return;
    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    resetEditText();
    let oTxtRect = null;
    // Var.editGoodsTextIndex = -1; // 已在 resetEditText内
    // 文字只能在柜子上,故只需要处理柜子数据就好了
    for( let i = 0; i < model.data.goods.length; i ++ ){
      let itemRect = model.data.goods[i];
      if( !inView(itemRect) ){
        continue;
      }

      if(mouseInRect( e, itemRect )){
        oTxtRect = itemRect;
        Var.editGoodsTextIndex = i;
        startEditText(itemRect, i);
        break;
      }

    }

  };
}

// 伸缩障碍物
function StretchBarrier(){

  this.mouseDown = false; // 是否鼠标按下
  let oldW=0, oldH = 0, oldX = 0, oldY = 0;
  let stretchDir = false; // 往哪个方向伸缩
  let startX = 0, startY = 0;

  this.start = function(e){
    if(Var.Menu_Mode_Left != Mode_Select)return;

    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;
    startX = x;
    startY = y;
    //
    this.mouseDown = false;
    Var.stretchBarrier = false;

    let bClickLocation = mouseClickBarrierRect(e);
    stretchDir = bClickLocation;

    // 存在方向指示同时也要选中
    if( bClickLocation !== false && Var.selectedBarrierRects.length ){
      this.mouseDown = true;
      Var.stretchBarrier = true;
      oldW = SizeUtil.calc(Var.selectedBarrierRects[0].width);
      oldH = SizeUtil.calc(Var.selectedBarrierRects[0].height);
      oldX = SizeUtil.worldToScreenX(Var.selectedBarrierRects[0].x);
      oldY = SizeUtil.worldToScreenY(Var.selectedBarrierRects[0].y);
    }

  }

  this.move = function(e){
    if(Var.Menu_Mode_Left != Mode_Select)return;
    let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;

    if( this.mouseDown ){

      // 约束一下最小尺寸
      if( Var.selectedBarrierRects[0].width < 50 || Var.selectedBarrierRects[0].height < 50 ){
        return;
      }

      // 可以做伸缩动作
      if(stretchDir === 0){ // 左上角

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldY((x - startX) + oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY((y - startY) + oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW - (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH - (y - startY));

      }else if(stretchDir === 1){ // 右上角

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY((y - startY) + oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW + (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH - (y - startY));

      }else if(stretchDir === 2){ // 右下角
        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW + (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH + (y - startY));

      }else if(stretchDir === 3){ // 左下角

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX + (x - startX));
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW - (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH + (y - startY));

      }else if(stretchDir === 4){ // 上方

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY + (y - startY));
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW);
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH - (y - startY));

      }else if(stretchDir === 5){  // 右方

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW + (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH);

      }else if(stretchDir === 6){ // 下方

        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX);
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW);
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH + (y - startY));

      }else if(stretchDir === 7){ // 左方
        Var.selectedBarrierRects[0].x = SizeUtil.screenToWorldX(oldX + (x - startX));
        Var.selectedBarrierRects[0].y = SizeUtil.screenToWorldY(oldY);
        Var.selectedBarrierRects[0].width = SizeUtil.calcFromScreen(oldW - (x - startX));
        Var.selectedBarrierRects[0].height = SizeUtil.calcFromScreen(oldH);
      }

    }else{
      // 显示鼠标样式
      mouseOverBarrierRect(e);
    }
  }

  this.end = function(e){

    if( this.mouseDown ){
      if( Var.selectedBarrierRects[0].width < 50  ){
        Var.selectedBarrierRects[0].width = 50;
      }

      if( Var.selectedBarrierRects[0].height < 50 ){
        Var.selectedBarrierRects[0].height = 50;
      }
    }

    this.mouseDown = false;
    Var.stretchBarrier = false;
    stretchDir = false;

  }

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

// 通过键盘移动柜子 微调
function keyboardForGoods(e){
  let code = e.keyCode;
  // 37 38 39 40 方向键
  if( code == 37 ){
    Var.selectedRects.forEach(itemRect=>{
      itemRect.x --;
    })
  }else if( code == 38 ){
    Var.selectedRects.forEach(itemRect=>{
      itemRect.y --;
    })
  }else if( code == 39 ){
    Var.selectedRects.forEach(itemRect=>{
      itemRect.x ++;
    })
  }else if( code == 40 ){
    Var.selectedRects.forEach(itemRect=>{
      itemRect.y ++;
    })
  }

  // 8 退格键
  if( code == 8 ){
    // 普通柜子
    let sortedIndexArr = [...Var.selectedRectsIndex];
    sortedIndexArr.sort((a, b)=>b-a);

    for( let i = 0; i < sortedIndexArr.length; i ++ ){
      model.data.goods.splice(sortedIndexArr[i], 1);
    }

    // 障碍物
    let sortedBarrierIndexArr = [...Var.selectedBarrierRectsIndex];
    sortedBarrierIndexArr.sort((a, b)=>b-a);

    for( let i = 0; i < sortedBarrierIndexArr.length; i ++ ){
      model.data.obstacle.splice(sortedBarrierIndexArr[i], 1);
    }

    clearSelectedRects();
    clearSelectedBarrierRects();
  }

}

function createContextForGoodsLocation(e){
  $('J_goods_form').style.display='block';

  let left = e.clientX - EdgeLeft, top = e.clientY - EdgeTop;

  $('J_goods_form').style.top = top+'px';
  $('J_goods_form').style.left = left+10+'px';
  $('J_goods_form').querySelector('button').onclick=()=>{
    $('J_goods_form').style.display='none';
  };
}

function createContextForSelectAlign(e){

  // 当所选择超出1个时,可以做对齐选项了
  if( Var.selectedRects.length > 1 ){
    $('J_select_contextAlign').style.display='block';
    let left = e.clientX, top = e.clientY;

    $('J_select_contextAlign').style.top = top+'px';
    $('J_select_contextAlign').style.left = left+10+'px';

    // 绑定点击事件
    Array.from($('J_select_contextAlign').getElementsByTagName('li')).forEach(itemLi=>{
      itemLi.onclick = ()=>{
        let alignFn = itemLi.dataset.align;
        if(!alignFn) return; // align=''为辅助线

        AlignUtil[alignFn]();
        $('J_select_contextAlign').style.display='none';
      };
    });

  }

}
