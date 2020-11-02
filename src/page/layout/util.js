import Var, {EdgeTop, EdgeLeft} from './constants'

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
