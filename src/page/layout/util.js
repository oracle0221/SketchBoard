/* eslint-disable */

import Var, {EdgeTop, EdgeLeft, Property, FontSize} from './constants'
import model from './model'

const $ = document.getElementById.bind(document);

export const SizeUtil = {
  // 得到画布中物块的绝对尺寸
  calc( size ){
    return Var.zoomLevel * (+size);
  },
  // 屏幕坐标转为世界坐标
  screenToWorldX(x){
    return x / Var.zoomLevel - Var.worldPosition.x;
  },
  screenToWorldY(y){
    return y / Var.zoomLevel - Var.worldPosition.y;
  },

  // 世界坐标转屏幕坐标
  worldToScreenX(x){
    return (x + Var.worldPosition.x) * Var.zoomLevel;
  },
  worldToScreenY(y){
    return (y + Var.worldPosition.y) * Var.zoomLevel;
  },

}

// 判断物体是否在视图中
export function inView( rect ){
  let x = SizeUtil.worldToScreenX(rect.x), y = SizeUtil.worldToScreenY(rect.y)
  let width = SizeUtil.calc( rect.width ), height = SizeUtil.calc( rect.height );

  // 左上角
  if( x >= 0 && x < Var.screen.width && y >= 0 && y < Var.screen.height ){
    return true;
  }

  // 右上角
  if( x + width >= 0 && x + width < Var.screen.width && y >= 0 && y < Var.screen.height ){
    return true;
  }

  // 左下角
  if( x >= 0 && x < Var.screen.width && y + height >= 0 && y + height < Var.screen.height ){
    return true;
  }

  // 右下角
  if( x+width >= 0 && x+width < Var.screen.width && y+height >= 0 && y+height < Var.screen.height ){
    return true;
  }

  return false;
}

// 鼠标点是否在rect区域内
export function mouseInRect(ev, rect){
  let x = SizeUtil.worldToScreenX(rect.x), y = SizeUtil.worldToScreenY(rect.y);
  let width = SizeUtil.calc( rect.width ), height = SizeUtil.calc( rect.height );

  let ex = ev.clientX - EdgeLeft, ey = ev.clientY - EdgeTop;

  if( ex >= x && ex <= x + width && ey >= y && ey <= y + height ){
    return true;
  }

  return false;
}

// 查看框选区域内选择了多少柜子
export function getSelectedRects(selectRegion, arr){
  let res=[];
  let resIndex=[];

  for( let i = 0; i < arr.length; i ++ ){
    let itemRect = arr[i];

    if( !inView(itemRect) ){
      continue;
    }

    let x = SizeUtil.worldToScreenX(itemRect.x), y = SizeUtil.worldToScreenY(itemRect.y),
        width = SizeUtil.calc( itemRect.width ), height = SizeUtil.calc( itemRect.height );

    let rx = selectRegion.x, ry = selectRegion.y, rwidth=selectRegion.width, rheight=selectRegion.height;

    let bHit = getCollideTest( selectRegion, {x, y, width, height} );

    if(bHit){
      res.push(itemRect);
      resIndex.push(i);
    }

  } // end for i

  return [res, resIndex];
}

export function drawDashedRect(gd, rectItem){

  let x = SizeUtil.worldToScreenX(rectItem.x),
      y = SizeUtil.worldToScreenY(rectItem.y),
      width = SizeUtil.calc(rectItem.width),
      height = SizeUtil.calc(rectItem.height);

  gd.save();
  gd.beginPath()
  gd.strokeStyle = '#22C'
  gd.lineWidth = 1;
  gd.setLineDash([2, 2]);
  gd.rect(x, y, width, height);
  gd.stroke();
  gd.restore();

  gd.save();

  // 生成8个小圆圈
  // 上面3个
  for( let i = 0; i < 3; i ++ ){
      gd.beginPath();
      gd.arc(x + width / 2 * i, y, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 中间2个
  for( let i = 0; i < 2; i ++ ){
      gd.beginPath();
      gd.arc(x + width * i, y + height/2, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 下面3个
  for( let i = 0; i < 3; i ++ ){
      gd.beginPath();
      gd.arc(x + width / 2 * i, y + height, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  gd.restore();
}

// 绘制底部辅助线条
export function drawBackgroundLines(gd){
  // #D5D5D5
  let rowLines = (Var.worldPosition.height / Var.ruleUnit | 0) - 1;
  let colLines = (Var.worldPosition.width / Var.ruleUnit | 0) - 1;

  // 横向
  for( let i = 1; i <= rowLines; i++ ){
    gd.beginPath();
    gd.strokeStyle='#D5D5D5';
    gd.lineWidth = 1;

    let x0 = Var.worldPosition.x * Var.zoomLevel, y0 = Var.ruleUnit * Var.zoomLevel * i + Var.worldPosition.y * Var.zoomLevel;
    let x1 = Var.worldPosition.x * Var.zoomLevel + Var.worldPosition.width * Var.zoomLevel,
        y1 = Var.ruleUnit * Var.zoomLevel * i + Var.worldPosition.y * Var.zoomLevel;
    gd.moveTo( x0, y0+.5 );
    gd.lineTo( x1, y1+.5 );
    gd.stroke();
  } // end for i

  // 纵向
  for( let i = 1; i <= colLines; i++ ){
    gd.beginPath();
    gd.strokeStyle='#D5D5D5';
    gd.lineWidth = 1;

    let x0 = Var.worldPosition.x * Var.zoomLevel + i * Var.ruleUnit * Var.zoomLevel,
        y0 = Var.worldPosition.y * Var.zoomLevel,
        x1 = Var.worldPosition.x * Var.zoomLevel + i * Var.ruleUnit * Var.zoomLevel,
        y1 = Var.worldPosition.y * Var.zoomLevel + Var.worldPosition.height * Var.zoomLevel;

    gd.moveTo( x0+.5, y0 );
    gd.lineTo( x1+.5, y1 );
    gd.stroke();
  } // end for i

}

// 两个矩形方块的碰撞检测  tolerance=2是容差值
export function getCollideTest(rect1, rect2){
    const tolerance = 2;
    if( rect1.x + rect1.width - tolerance <= rect2.x  ||
        rect1.y + rect1.height - tolerance <= rect2.y ||
        rect1.x >= rect2.x + rect2.width - tolerance ||
        rect1.y >= rect2.y + rect2.height - tolerance
    ){
        return false;
    }
    return true;
}

// 对世界中两个矩形柜子的碰撞检测 tolerance=2是容差值
export function getWorldCollideTest( rect1, rect2 ){
  let obj1={
    x : SizeUtil.worldToScreenX(rect1.x),
    y : SizeUtil.worldToScreenX(rect1.y),
    width: SizeUtil.calc(rect1.width),
    height: SizeUtil.calc(rect1.height),
  },
  obj2={
    x : SizeUtil.worldToScreenX(rect2.x),
    y : SizeUtil.worldToScreenX(rect2.y),
    width: SizeUtil.calc(rect2.width),
    height: SizeUtil.calc(rect2.height),
  };

  return getCollideTest(obj1, obj2);
}

export function testHitInGoods(arr, compareArr){

  for( let i = 0; i < arr.length; i ++ ){
    let itemRect = arr[i];

    if(!inView(itemRect)) continue;

    for( let ii = 0; ii < compareArr.length; ii ++ ){

      let compareItemRect = compareArr[ii];

      if( compareItemRect == itemRect ){
        continue;
      }

      if( getWorldCollideTest(compareItemRect, itemRect) ){
        return true;
      }

    } // end for ii

  } // end for i

  return false;
}

export function clearSelectedRects(){
  Var.selectedDrag = false;
  Var.selectedRects = [];
  Var.selectedRectsIndex = [];
  Var.selectedRectsOffset=[];
}

export function clearSelectedBarrierRects(){
  Var.selectedBarrierDrag = false;
  Var.selectedBarrierRects = [];
  Var.selectedBarrierRectsIndex = [];
  Var.selectedBarrierRectsOffset=[];
}

// 绘制障碍物
export function drawBarrierObject( gd, itemBarrierRect ){

  let x = SizeUtil.worldToScreenX(itemBarrierRect.x),
      y = SizeUtil.worldToScreenY(itemBarrierRect.y),
      width = SizeUtil.calc(itemBarrierRect.width),
      height = SizeUtil.calc(itemBarrierRect.height);
  gd.fillStyle = Property.obstacle.fill;
  gd.strokeStyle = Property.obstacle.stroke;
  gd.fillRect( x, y, width, height );
  gd.strokeRect( x, y, width, height );

  gd.beginPath();
  gd.moveTo( x, y );
  gd.lineTo( x + width, y + height );

  gd.moveTo( x+width, y );
  gd.lineTo( x, y + height );
  gd.stroke();
}

// 判断是否是鼠标右键点击
export function isRightMouseClick(e){
  let isRightMB = false;

  if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = e.which == 3;
  else if ("button" in e)  // IE, Opera
      isRightMB = e.button == 2;

  return isRightMB;
}

// 渲染文字
export function drawGoodsText(gd){
  let data = model.data.goods;

  for( let i = 0; i < data.length; i ++ ){
    let itemRect = data[i];
    if(!inView(itemRect)) continue;

    let fontStyle=`${FontSize * Var.zoomLevel}px Arial`;
    gd.font=fontStyle;
    gd.fillStyle='black';

    let x = SizeUtil.worldToScreenX(itemRect.x),
        y = SizeUtil.worldToScreenY(itemRect.y+FontSize * Var.zoomLevel);

    gd.fillText( ''+i, x, y );

  }

}
