//
// const GoodsType=0, BarrierType=1;
// const Mode_Select = 0, Mode_Location = 1, Mode_Barrier=2, Mode_Text = 3, Mode_Zoom = 4, Mode_Batch = 5, Mode_Pan = 6;
//
// export GoodsType
// export BarrierType
//
// export Mode_Select
// export Mode_Location
// export Mode_Barrier
// export Mode_Text
// export Mode_Zoom
// export Mode_Batch
// export Mode_Pan

export const FontSize = 28;

export const GoodsType=0;
export const BarrierType=0;

export const Mode_Select=0;
export const Mode_Location=1;
export const Mode_Barrier=2;
export const Mode_Text=3;
export const Mode_Zoom=4;
export const Mode_Batch=5;
export const Mode_Pan=6;

export const EdgeTop = 50;
export const EdgeLeft = 50;

export const ModeEnum={
  0:Mode_Select,
  1:Mode_Location,
  2:Mode_Barrier,
  3:Mode_Text,
  4:Mode_Zoom,
  5:Mode_Batch,
  6:Mode_Pan,
};

// 颜色变量
export const Property={
  goods:{
    fill:'rgba(255, 170, 170, 0.8)',
    stroke:'#e86f8d',
  },
  obstacle:{
    fill:'rgba(127, 127, 127, 0.8)',
    stroke:'rgba(0, 0, 0, 0.5)',
  },
};


let Var = {
  zoomLevel:1.0,
  beBatch: false, // 需要批量操作
  beBatchEnd: false,  // 批量操作结束
  batchPreviewData:{value:'', num:0, cells:0},
  batchTmpData:[], // 在预览时的临时数据
  batchContext:false, // 批处理右键菜单

  worldPosition:{x:0, y:0, width:2000, height:2000}, // 世界坐标, 世界大小
  screen:{width:0, height:0}, // canvas画布在屏幕上的尺寸
  ruleUnit:50, // 背景辅助线 单元格宽高

  // 左边菜单变量
  Menu_Mode_Left:Mode_Select,

  // 柜子
  zIndex:1,
  selectedRects:[],
  selectedRectsOffset:[],
  selectedRectsIndex:[], // 选中的柜子在大数据中的下标
  selectedDrag:false, // 选择状态下,就只要拖动就好了

  // 障碍物
  currBarrierRect:null,
  selectedBarrierRects:[],
  selectedBarrierRectsOffset:[],
  selectedBarrierRectsIndex:[], // 选中的柜子在大数据中的下标
  selectedBarrierDrag:false, // 选择状态下,就只要拖动就好了

  // 是否需要编辑文字
  editGoodsTextIndex:-1, // 当前在编辑哪一个柜子

};

export default Var;
