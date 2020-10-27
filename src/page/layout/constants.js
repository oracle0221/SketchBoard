
let Var = {
  zoomLevel:1.0,
  beBatch: false, // 需要批量操作
  beBatchEnd: false,  // 批量操作结束
  batchPreviewData:{value:'', num:0},
  batchTmpData:[], // 在预览时的临时数据
  worldPosition:{x:0, y:0, width:2000, height:2000}, // 世界坐标
};

export default Var;
