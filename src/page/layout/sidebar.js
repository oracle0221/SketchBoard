// 处理上边与左边以下边这三条栏
import Var, {ModeEnum, Mode_Batch, Mode_Pan} from './constants'

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

          Var.beBatch = false
          Var.beBatchEnd = false
          Var.batchPreviewData = {value:'', num:0}
          Var.batchTmpData = []

          if( Var.Menu_Mode_Left === Mode_Batch ){
            Var.beBatch = true; // 打开批量生成模式
          }

          if( Var.Menu_Mode_Left === Mode_Pan ){
            document.body.style.cursor = 'move';
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
    Var.zoomLevel += 1;
    J_input_zoom.value = Var.zoomLevel+'';
  };

  ZoomIn.onclick = ()=>{
    Var.zoomLevel -= 1;
    J_input_zoom.value = Var.zoomLevel+'';
  };

}
