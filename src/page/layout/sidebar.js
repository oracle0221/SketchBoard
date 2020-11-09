// 处理上边与左边以下边这三条栏
import Var, {ModeEnum, Mode_Location, Mode_Text, Mode_Batch, Mode_Pan} from './constants'
import {clearSelectedRects, clearSelectedBarrierRects} from './util'

const $ = document.getElementById.bind(document);

export function leftNavHandle(){
  const J_tools_ul = $('J_tools_ul');
  const a_tools_li = Array.from(J_tools_ul.getElementsByTagName('li'));

  a_tools_li.forEach((objLi, index)=>{
      objLi.onclick=()=>{
          document.body.style.cursor = 'default';
          a_tools_li.forEach(obj=>obj.classList.remove('current'));
          objLi.classList.add('current');

          Var.Menu_Mode_Left = ModeEnum[index]

          // 菜单Menu切换后,若干变量需要重置
          Var.beBatch = false
          Var.beBatchEnd = false
          Var.batchPreviewData = {value:'', num:0}
          Var.batchTmpData = []
          Var.editGoodsTextIndex = -1
          clearSelectedRects();
          clearSelectedBarrierRects();
          $('J_select_contextAlign').style.display='none';

          if( Var.Menu_Mode_Left === Mode_Batch ){
            Var.beBatch = true; // 打开批量生成模式
          }

          if( Var.Menu_Mode_Left === Mode_Pan ){
            document.body.style.cursor = 'move';
          }

          if( Var.Menu_Mode_Left === Mode_Location ){
            // 
          }

          if( Var.Menu_Mode_Left === Mode_Text ){
            document.body.style.cursor = 'text';
          }

      }
  });
}

// 将menu设成另外一个
export function setMenu( mode ){
  const J_tools_ul = $('J_tools_ul');
  const a_tools_li = Array.from(J_tools_ul.getElementsByTagName('li'));

  // 触发点击
  a_tools_li[mode].onclick();
}

// 视图放大与缩小
export function PanZoom(){
  const J_input_zoom = $('J_input_zoom'), ZoomOut = $('ZoomOut'), ZoomIn = $('ZoomIn');

  ZoomOut.onclick = ()=>{

    if( Var.zoomLevel >= 1 ){
        Var.zoomLevel = ++Var.zoomLevel
    }else{
        Var.zoomLevel += 0.2
        // zoomLevel小于1,让世界居中摆放
        Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
        Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
    }

    J_input_zoom.value = (Var.zoomLevel >= 1 ? Var.zoomLevel : Var.zoomLevel.toFixed(2) )+'';
  };

  ZoomIn.onclick = ()=>{

    if(Var.zoomLevel > 1){
        Var.zoomLevel = --Var.zoomLevel
    }else{
        Var.zoomLevel -= 0.2
        // zoomLevel小于1,让世界居中摆放
        Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
        Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
    }

    J_input_zoom.value = (Var.zoomLevel >= 1 ? Var.zoomLevel : Var.zoomLevel.toFixed(2) )+'';
  };

}
