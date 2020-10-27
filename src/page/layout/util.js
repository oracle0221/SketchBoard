import Var from './constants'

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
