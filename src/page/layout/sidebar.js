// 处理上边与左边以下边这三条栏
import Var, {ModeEnum, Mode_Location, Mode_Text, Mode_Zoom, Mode_Batch, Mode_Pan} from './constants'
import {clearSelectedRects, clearSelectedBarrierRects, restoreFromUndoStack, restoreFromRedoStack, fnZoomIn, fnZoomOut, setSlider} from './util'
import model from './model'

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
          beforeSwitchMenu();

          if( Var.Menu_Mode_Left === Mode_Batch ){
            Var.beBatch = true; // 打开批量生成模式
          }

          if( Var.Menu_Mode_Left === Mode_Pan ){
            document.body.style.cursor = 'move';
          }

          if( Var.Menu_Mode_Left === Mode_Location ){
            //
          }

          // Zoom == Zoom in
          if( Var.Menu_Mode_Left === Mode_Zoom ){
            Var.zoomAction = '+';
            document.body.style.cursor = 'zoom-in';
          }

          if( Var.Menu_Mode_Left === Mode_Text ){
            document.body.style.cursor = 'text';
          }

      }
  });

  // 菜单切换时,作一些dom的清理操作
  function beforeSwitchMenu(){
    $('J_select_contextAlign').style.display='none';
    $('J_batchGoods').style.display='none';
    $('J_goods_form').style.display='none';
  }

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
  const J_zoomin = $('J_zoomin'), J_zoomout = $('J_zoomout');
  const J_toShowSlider = $('J_toShowSlider'), J_toHideSlider = $('J_toHideSlider');
  const J_slider_box = $('J_slider_box');
  const J_widget_zoom = $('J_widget_zoom');
  const minY = Var.sliderMinY, maxY = Var.sliderMaxY;
  let beSliderVisible = false;

  let timer;

  J_zoomout.onclick = ZoomOut.onclick = ()=>{
    fnZoomOut();
  };

  J_zoomin.onclick = ZoomIn.onclick = ()=>{
    fnZoomIn();
  };

  J_zoomout.onmouseenter = ()=>{
    clearTimeout(timer);
    if( beSliderVisible ){
      J_toHideSlider.style.display="block"

      J_toHideSlider.style.top='160px'

    }else{
      J_toShowSlider.style.display="block"
    }
  };
  J_zoomin.onmouseenter = ()=>{
    clearTimeout(timer);
    if( beSliderVisible ){
      J_toHideSlider.style.display="block"
      J_toHideSlider.style.top='0px'
    }else{
      J_toShowSlider.style.display="block"
    }
  };

  J_zoomout.onmouseleave = ()=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      J_toShowSlider.style.display="none"
      J_toHideSlider.style.display="none"
    }, 1000);
  };
  J_zoomin.onmouseleave = ()=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      J_toShowSlider.style.display="none"
      J_toHideSlider.style.display="none"
    }, 1000);
  };

  J_toShowSlider.onmouseenter = J_toHideSlider.onmouseenter = function(){
    clearTimeout(timer);
    this.style.cursor = 'default';
    if( beSliderVisible ){
      J_toHideSlider.style.display="block"
    }else{
      J_toShowSlider.style.display="block"
    }
  };

  J_toShowSlider.onmouseleave = J_toHideSlider.onmouseleave = ()=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      J_toShowSlider.style.display="none"
      J_toHideSlider.style.display="none"
    }, 1000);
  };

  J_toShowSlider.onclick = ()=>{
    beSliderVisible = true;
    J_slider_box.style.display='block';
    J_widget_zoom.style.height='215px'
    J_toShowSlider.style.display="none"
    J_toHideSlider.style.display="none"
  };

  J_toHideSlider.onclick = ()=>{
    beSliderVisible = false;
    J_slider_box.style.display='none';
    J_widget_zoom.style.height='57px'
    J_toShowSlider.style.display="none"
    J_toHideSlider.style.display="none"
  };

  // 调动滑块进行缩放视图
  const J_slider_grab = $('J_slider_grab');

  // 滑块 top:  0 - 146 => 0.1-20
  /*
    t - 0          146-0
    ---------- = ------------
    scale-0.1      20-0.1

    t * (20-0.1) = 146 * (scale - 0.1)
    t = 146 * (scale - 0.1) / (20-0.1)
--------------------------------------------------
    (scale - 0.1) * 146 = (20-0.1) * t
    (scale - 0.1) = (20-0.1) * t / 146
    scale = (20-0.1) * t / 146 + 0.1
  */

  // J_slider_grab.style.top = `${maxY - maxY * (1.0 - 0.1) / (20-0.1)}px`;
  setSlider();

  J_slider_grab.onmousedown = e=>{

    let startY = e.clientY;
    let startTop = J_slider_grab.offsetTop;
    document.onmousemove = e=>{
      let dy = e.clientY - startY;
      let endTop = startTop + dy;

      if(endTop < 0) endTop = 0;
      if(endTop > maxY) endTop = maxY;

      let scale = (20-0.1) * (maxY - endTop) / maxY + 0.1

      Var.zoomLevel = scale;
      // Var.worldPosition.x=Var.worldPosition.y=0;
      setSlider();

      return false;
    };

    document.onmouseup = e=>{
      document.onmousemove = document.onmouseup = null;
    };

    return false;
  };

}

// 撤消与重做按钮动作
export function undoAction(){
  const J_tool_undo = $('J_tool_undo');
  J_tool_undo.onclick = ()=>{

    // console.log(model.undoStack)

    if( model.undoStack.length == 0 ){
      $('J_tool_undo').className = $('J_tool_undo').className.replace(/\s*hover\s*/, ' ');
      return;
    }

    let data = restoreFromUndoStack();
    if( data ){
      model.data = data;
      clearSelectedRects();
      clearSelectedBarrierRects();
    }else{
      $('J_tool_undo').className = $('J_tool_undo').className.replace(/\s*hover\s*/, ' ');
    }

  };
}

export function redoAction(){
  const J_tool_redo = $('J_tool_redo');
  J_tool_redo.onclick = ()=>{

    if( model.redoStack.length == 0 ){
      // J_tool_redo.style.opacity = 0.5;
      $('J_tool_redo').className = $('J_tool_redo').className.replace(/\s*hover\s*/, ' ');
      return;
    }

    let data = restoreFromRedoStack();
    if( data ){
      model.data = data;
      clearSelectedRects();
      clearSelectedBarrierRects();
    }else{
      // J_tool_redo.style.opacity = 0.5;
      $('J_tool_redo').className = $('J_tool_redo').className.replace(/\s*hover\s*/, ' ');
    }
  };
}

// 撤消与重做 初始化
export function initUndoRedo(){
  const J_tool_undo = $('J_tool_undo');
  const J_tool_redo = $('J_tool_redo');

  // J_tool_undo.style.opacity = 0.5;
  // J_tool_redo.style.opacity = 0.5;

  J_tool_undo.onmouseenter = function(){
    if( model.undoStack.length ){
      this.className += ' active';
    }
  };

  J_tool_undo.onmouseleave = function(){
    this.className = this.className.replace(/\s*active\s*/, ' ');
  };

  J_tool_redo.onmouseenter = function(){
    if( model.redoStack.length ){
      this.className += ' active';
    }
  };

  J_tool_redo.onmouseleave = function(){
    this.className = this.className.replace(/\s*active\s*/, ' ');
  };
}
