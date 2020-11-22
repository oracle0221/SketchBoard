/* eslint-disable */

import Var, {EdgeTop, EdgeLeft, Property, FontSize} from './constants'
import model from './model'
import langJson from './lang'

const $ = document.getElementById.bind(document);

export const SizeUtil = {
  // 得到画布中物块的绝对尺寸
  calc( size ){
    return Var.zoomLevel * (+size);
  },
  // 从屏幕中给的尺寸计算真实柜子的尺寸
  calcFromScreen(size){
    return (+size) / Var.zoomLevel;
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

// 对齐
export const AlignUtil = {
  leftAlign(){
    let minX = Number.MAX_VALUE;

    for( let i = 0; i < Var.selectedRects.length; i ++ ){
      let itemRect = Var.selectedRects[i];
      if( minX > itemRect.x ) minX = itemRect.x;
    }

    Var.selectedRects.forEach(itemRect=>{
      itemRect.x = minX;
    });
  },
  rightAlign(){
    let maxX = Number.MIN_VALUE;

    for( let i = 0; i < Var.selectedRects.length; i ++ ){
      let itemRect = Var.selectedRects[i];
      if( maxX < itemRect.x ) maxX = itemRect.x;
    }

    Var.selectedRects.forEach(itemRect=>{
      itemRect.x = maxX;
    });
  },
  topAlign(){
    let minY = Number.MAX_VALUE;

    for( let i = 0; i < Var.selectedRects.length; i ++ ){
      let itemRect = Var.selectedRects[i];
      if( minY > itemRect.y ) minY = itemRect.y;
    }

    Var.selectedRects.forEach(itemRect=>{
      itemRect.y = minY;
    });
  },
  bottomAlign(){
    let maxY = Number.MIN_VALUE;

    for( let i = 0; i < Var.selectedRects.length; i ++ ){
      let itemRect = Var.selectedRects[i];
      if( maxY < itemRect.y ) maxY = itemRect.y;
    }

    Var.selectedRects.forEach(itemRect=>{
      itemRect.y = maxY;
    });
  },
  horizonAlign(){
    AlignUtil.topAlign();
    // 接下来开始一个挨着一个水平排
    let startX = Var.selectedRects[0].x+Var.selectedRects[0].width;
    for( let i = 1; i < Var.selectedRects.length; i ++ ){

      Var.selectedRects[i].x = startX;
      startX = Var.selectedRects[i].x + Var.selectedRects[i].width;
    } // end for i
  },
  verticalAlign(){
    AlignUtil.leftAlign();
    let startY = Var.selectedRects[0].y + Var.selectedRects[0].height;
    for( let i = 1; i < Var.selectedRects.length; i ++ ){
      Var.selectedRects[i].y = startY;
      startY = Var.selectedRects[i].y + Var.selectedRects[i].height;
    }
  },
};

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

  // 上方
  if( x < 0 && (x+ width > Var.screen.width) && y > 0 && y < Var.screen.height  ){
    return true;
  }

  // 下方
  if( x < 0 && (x+ width > Var.screen.width) && (y + height) > 0 && (y + height < Var.screen.height)  ){
    return true;
  }

  // 左方
  if( y < 0 && (y + height > Var.screen.height) && x > 0 && x < Var.screen.width ){
    return true;
  }

  // 右方
  if( y < 0 && (y + height > Var.screen.height) && (x+width > 0) && (x+width < Var.screen.width) ){
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
      gd.arc(x + width / 2 * i, y, 2 * Var.zoomLevel, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 中间2个
  for( let i = 0; i < 2; i ++ ){
      gd.beginPath();
      gd.arc(x + width * i, y + height/2, 2 * Var.zoomLevel, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 下面3个
  for( let i = 0; i < 3; i ++ ){
      gd.beginPath();
      gd.arc(x + width / 2 * i, y + height, 2 * Var.zoomLevel, 0, Math.PI * 2, false);
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
    const tolerance = 2 * Var.zoomLevel;
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

    if( Var.editGoodsTextIndex === i && Var.zoomLevel > 0.7 ){

      drawDashedRect(gd, itemRect);

    }else{

      gd.font=fontStyle;
      gd.fillStyle='black';

      let x = SizeUtil.worldToScreenX(itemRect.x),
          y = SizeUtil.worldToScreenY(itemRect.y+FontSize);

      // gdWrapText(gd, ''+(itemRect.text||i), x, y, 10, FontSize * Var.zoomLevel + 12 );
      let str = ''+(itemRect.text||i);
      let textWidth = FontSize * Var.zoomLevel * str.length;
      let textHeight = FontSize * Var.zoomLevel * str.split('-').length;

      if( textWidth < itemRect.width * Var.zoomLevel ){
        gd.fillText( ''+(itemRect.text||i), x, y );
      }else{

        let arrTxt = str.split('-');
        if( textHeight > itemRect.height * Var.zoomLevel ){

          // xxx-xxx
          // xxx
          gd.fillText( arrTxt[0]+'-'+arrTxt[1], x, y );
          gd.fillText( arrTxt[2], x, y + FontSize*Var.zoomLevel);

        }else{

          arrTxt.forEach((objStr, index)=>{
            if(index == arrTxt.length - 1){
              gd.fillText( objStr, x, y );
            }else{
              gd.fillText( objStr+'-', x, y );
            }

            y += FontSize*Var.zoomLevel;
          });
        }

      }

    }

  }

}

export function resetEditText(){
  const J_fill_text = $('J_fill_text');
  J_fill_text.style.display='none';
  Var.editGoodsTextIndex = -1;
  J_fill_text.value='';
}

export function startEditText(itemRect, index){
  const J_fill_text = $('J_fill_text');
  let left = SizeUtil.worldToScreenX(itemRect.x),
      top  = SizeUtil.worldToScreenY(itemRect.y);

  J_fill_text.style.display='block';
  J_fill_text.style.left=`${left}px`;
  J_fill_text.style.top=`${top}px`;
  J_fill_text.style.width = `${SizeUtil.calc(itemRect.width)}px`;
  J_fill_text.style.height = `${SizeUtil.calc(itemRect.height)}px`;
  J_fill_text.style.fontSize = `${FontSize * Var.zoomLevel}px`;
  J_fill_text.focus();
  J_fill_text.value = itemRect.text || (index+'');

  J_fill_text.onblur=()=>{
    resetEditText();
    // console.log('blur')
  };

  J_fill_text.onkeydown=e=>{
    if( e.keyCode === 13 ){

      // 回车键确认编辑
      if( J_fill_text.value.trim() != '' ){
        itemRect.text = J_fill_text.value.trim();
        resetEditText();
      }
      return false;
    }

  };
}

// 拖动物块过程中的视图滚动
export function scrollView(e){
  let x = e.clientX - EdgeLeft, y = e.clientY - EdgeTop;
  const deltaDist = 6, needScrollDist = 100;

  let dx;
  if( x > Var.screen.width - needScrollDist ){
    dx = x - (Var.screen.width - needScrollDist);
    Var.worldPosition.x -= deltaDist * dx / needScrollDist;
  }else if( x < needScrollDist ){
    dx = needScrollDist - x;
    Var.worldPosition.x += deltaDist * dx / needScrollDist;
  }

  let dy;
  if( y > Var.screen.height - needScrollDist ){
    dy = y - (Var.screen.height - needScrollDist);
    Var.worldPosition.y -= deltaDist * dy / needScrollDist;
  }else if( y < needScrollDist ){
    dy = needScrollDist - y;
    Var.worldPosition.y += deltaDist * dy / needScrollDist;
  }
}

// 从undowStack中恢复
export function restoreFromUndoStack(){
  let dataStr = model.undoStack.pop();
  if(dataStr){
    model.redoStack.push(JSON.stringify( model.data )); // undo出栈的同时redo进栈最新的数据
    $('J_tool_redo').className = $('J_tool_redo').className.replace(/\s*hover\s*/, ' ');
    $('J_tool_redo').className += ' hover ';
    return JSON.parse(dataStr);
  }else{
    $('J_tool_undo').className = $('J_tool_undo').className.replace(/\s*hover\s*/, ' ');
  }
  return null;
}

// 从 redoStack栈中恢复
export function restoreFromRedoStack(){
  let dataStr = model.redoStack.pop();

  if(dataStr){
    return JSON.parse(dataStr);
  }else{
    $('J_tool_redo').className = $('J_tool_redo').className.replace(/\s*hover\s*/, ' ');
  }
  return null;
}

// push undo undoStack
export function pushUndoStack(){
  model.undoStack.push( JSON.stringify( model.data ) ); // 将当前的数据拷贝压入站
  $('J_tool_undo').className = $('J_tool_undo').className.replace(/\s*hover\s*/, ' ');
  $('J_tool_undo').className += ' hover ';
}

// 鼠标是否划在了障碍物上 mouseOver
/*

0------4-----1
|            |
|            |
7            5
|            |
|            |
|            |
3------6-----2

每个数字代表一个方向如上图所示
*/
export function mouseOverBarrierRect(ev){

  let x = ev.clientX - EdgeLeft, y = ev.clientY - EdgeTop;
  let bClick = false;
  const Range5 = 50 * Var.zoomLevel, Range7 = 70 * Var.zoomLevel, Range8 = 8 * Var.zoomLevel;

  for( let i = 0; i < model.data.obstacle.length; i ++ ){

    document.body.style.cursor = 'default';
    let itemRect = model.data.obstacle[i];
    if( !inView(itemRect) ) continue;
    if(!mouseInRect(ev, itemRect)) continue;

    let x0 = itemRect.x, y0 = itemRect.y,
        x1 = itemRect.x + itemRect.width, y1 = itemRect.y,
        x2 = itemRect.x + itemRect.width, y2 = itemRect.y + itemRect.height,
        x3 = itemRect.x, y3 = itemRect.y + itemRect.height;

    let x01 = itemRect.x + itemRect.width / 2,
        y01 = itemRect.y,
        x12 = itemRect.x + itemRect.width,
        y12 = itemRect.y + itemRect.height / 2,
        x23 = itemRect.x + itemRect.width / 2,
        y23 = itemRect.y + itemRect.height,
        x30 = itemRect.x,
        y30 = itemRect.y + itemRect.height / 2;

      // 01: 上方  12: 右方  23: 下方  30: 左方

    x0 = SizeUtil.worldToScreenX(x0);
    y0 = SizeUtil.worldToScreenY(y0);

    x1 = SizeUtil.worldToScreenX(x1);
    y1 = SizeUtil.worldToScreenY(y1);

    x2 = SizeUtil.worldToScreenX(x2);
    y2 = SizeUtil.worldToScreenY(y2);

    x3 = SizeUtil.worldToScreenX(x3);
    y3 = SizeUtil.worldToScreenY(y3);

    x01 = SizeUtil.worldToScreenX(x01);
    y01 = SizeUtil.worldToScreenY(y01);

    x12 = SizeUtil.worldToScreenX(x12);
    y12 = SizeUtil.worldToScreenY(y12);

    x23 = SizeUtil.worldToScreenX(x23);
    y23 = SizeUtil.worldToScreenY(y23);

    x30 = SizeUtil.worldToScreenX(x30);
    y30 = SizeUtil.worldToScreenY(y30);

    if( (x - x0)*(x - x0) + (y - y0)*(y - y0) < Range5 ){ // 左上角
      document.body.style.cursor = 'nwse-resize';
      bClick = 0;
      break;
    }else if( (x - x1)*(x - x1) + (y - y1)*(y - y1) < Range5 ){ // 右上角
      document.body.style.cursor = 'nesw-resize';
      bClick = 1;
      break;
    }else if( (x - x2)*(x - x2) + (y - y2)*(y - y2) < Range5 ){ // 右下角
      document.body.style.cursor = 'nwse-resize';
      bClick = 2;
      break;
    }else if( (x - x3)*(x - x3) + (y - y3)*(y - y3) < Range5 ){ // 左下角
      document.body.style.cursor = 'nesw-resize';
      bClick = 3;
      break;
    }else if( (x > x0 + 8) && (x < x1 - Range8) && (y - y01)*(y - y01) < Range7 ){ // 上方
      document.body.style.cursor = 'ns-resize';
      bClick = 4;
      break;
    }else if( (x - x12)*(x - x12) < Range7 && ( y > y1 + Range8 ) && ( y < y2 - Range8 ) ){ // 右方
      document.body.style.cursor = 'ew-resize';
      bClick = 5;
      break;
    }else if( (x > x0 + 8) && (x < x1 - 8) && (y - y23)*(y - y23) < Range7 ){ // 下方
      document.body.style.cursor = 'ns-resize';
      bClick = 6;
      break;
    }else if( (x - x30)*(x - x30) < Range7 && ( y > y1 + Range8 ) && ( y < y2 - Range8 ) ){  // 左方
      document.body.style.cursor = 'ew-resize';
      bClick = 7;
      break;
    }

  } // end for i

  return bClick;
}

// 鼠标是否划在了障碍物上 mouseClick
export function mouseClickBarrierRect(ev){
  let bClick = mouseOverBarrierRect(ev);
  return bClick; // false说明就不是点到了一个具体的指向上
}

// 从网络请求数据
export async function fetchMapJson(){
  let res = await fetch('/map.json')
  let data = await res.json();

  return data;
}

// 绘制多行文字
export function gdWrapText( gd, text, x, y, maxWidth, lineHeight ){
   let words = text.split(' ');
   let line = '';

   for( let i = 0; i < words.length; i ++ ){
       let txt = line + words[i] + ' ';

       if( gd.measureText(txt).width >= maxWidth  ){
           gd.fillText(line, x, y)
           y += lineHeight
           line=words[i]+' ';
       }else{
           line = txt;
       }
   } // for i
   gd.fillText(line, x, y);
}

// 多语言
export const LangUtil = {
  // 对标签里的内容作多语言
  translate(){

    $('J_language_select').onchange = ()=>{
      localStorage['lang'] = $('J_language_select').value;
      handle();
    };

    // 显示初始化一下当前的语言选项
    $('J_language_select').value = localStorage['lang'] || 'en';

    // 新多语言控件
    let aTranslationInputs = document.getElementsByName('translations_input')

    aTranslationInputs[0].checked = $('J_language_select').value === 'en';
    aTranslationInputs[1].checked = $('J_language_select').value === 'ko';

    // console.log(aTranslationInputs)
    Array.from(aTranslationInputs).forEach(eleInput=>{
      eleInput.onchange = function(){
        // alert(this.value)
        localStorage['lang'] = this.value;
        handle();
      };
    });

    handle();

    function handle(){
      localStorage['lang']= localStorage['lang'] || 'en';

      let key = localStorage['lang'];

      const aTag = Array.from( document.body.querySelectorAll('[language]') );

      aTag.forEach(domTag=>{

        let langName = domTag.getAttribute('language');

        // 接着就是对标签上的title
        let sTitle = domTag.getAttribute('title');
        if(sTitle){
          domTag.setAttribute('title',  langJson[langName][key] );
        }else{
          domTag.innerHTML = langJson[langName][key]; // 对标签里的内容
        }

      });
    }

  }
};

// 获取地图文件中最大的x, y值
export function setInitMapJsonMaxXY(){
  let arr = model.mapData;
  let maxX = Math.max.apply(null, arr.map(item=>item.x+item.width)),
      maxY = Math.max.apply(null, arr.map(item=>item.y+item.height));

  Var.worldPosition.width = maxX;
  Var.worldPosition.height = maxY;
}

// 传入鼠标事件对象 e, 菜单栏视图放大与缩小,以及与视图同步 J_input_zoom
export function syncZoomInput(e){

  // 放大后, 点击的位置放在视图的正间, 方便观察
  let screen_x = e.clientX - EdgeLeft, screen_y = e.clientY - EdgeTop;
  let targetRect = null;
  // for 普通柜子
  for( let i = 0; i < model.data.goods.length; i ++ ){
    let itemRect = model.data.goods[i];
    if( !inView(itemRect) ){
      continue;
    }

    if(mouseInRect( e, itemRect )){
      targetRect = itemRect;
      break;
    }

  }

  // for 障碍物
  for( let i = 0; i < model.data.obstacle.length; i ++ ){
    let itemRect = model.data.obstacle[i];
    if( !inView(itemRect) ){
      continue;
    }

    if(targetRect) break;

    if(mouseInRect( e, itemRect )){
      targetRect = itemRect;
      break;
    }

  }

  if( Var.zoomAction === '+' ){
    fnZoomIn();
  }else{
    fnZoomOut();
  }

  if(targetRect){
     Var.worldPosition.x = screen_x / Var.zoomLevel - targetRect.x;
     Var.worldPosition.y = screen_y / Var.zoomLevel - targetRect.y;
  }

}

// zoom in
export function fnZoomIn(){
  const J_input_zoom = $('J_input_zoom');
  if( Var.zoomLevel >= 1 ){
      Var.zoomLevel = ++Var.zoomLevel
      Var.zoomLevel = Var.zoomLevel > 20 ? 20 : Var.zoomLevel
  }else{
      Var.zoomLevel += 0.1

      // Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
      // Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
  }

  setSlider();
  J_input_zoom.value = (Var.zoomLevel >= 1 ? Var.zoomLevel : Var.zoomLevel.toFixed(2) )+'';
}

// zoom out
export function fnZoomOut(){
  const J_input_zoom = $('J_input_zoom');
  if(Var.zoomLevel > 1){
      Var.zoomLevel = --Var.zoomLevel
  }else{
      Var.zoomLevel -= 0.1
      Var.zoomLevel = Var.zoomLevel < 0.1 ? 0.1 : Var.zoomLevel

      // Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
      // Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
  }

  setSlider();
  J_input_zoom.value = (Var.zoomLevel >= 1 ? Var.zoomLevel : Var.zoomLevel.toFixed(2) )+'';
}

// 设置滑块
export function setSlider(){

  // zoomLevel小于1,让世界居中摆放
  if( Var.zoomLevel < 1 ){
    Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
    Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
  }else{

    let centerItemRect = getCenterObjectInView();
    // console.log(centerItemRect)
    if( centerItemRect){
      Var.worldPosition.x = (Var.screen.width / 2) / Var.zoomLevel - centerItemRect.x;
      Var.worldPosition.y = (Var.screen.height / 2) / Var.zoomLevel - centerItemRect.y;
    }else{
      Var.worldPosition.x = Var.worldPosition.y = 0;
      // Var.worldPosition.x = ((Var.screen.width - Var.zoomLevel * Var.worldPosition.width) / 2) / Var.zoomLevel;
      // Var.worldPosition.y = ((Var.screen.height - Var.zoomLevel * Var.worldPosition.height) / 2) / Var.zoomLevel;
    }
  }

  const J_slider_grab = $('J_slider_grab');
  const minY = Var.sliderMinY, maxY = Var.sliderMaxY;
  J_slider_grab.style.top = `${maxY - maxY * (Var.zoomLevel - 0.1) / (20-0.1)}px`;
}

// 得到当前视窗中在中间的柜子
export function getCenterObjectInView(){

  let targetRect=null;
  for( let i = 0; i < model.data.goods.length; i ++ ){
    let itemRect = model.data.goods[i];
    if( !inView(itemRect) ){
      continue;
    }
    let x = SizeUtil.worldToScreenX(itemRect.x), y = SizeUtil.worldToScreenY(itemRect.y);

    var centerX = Var.screen.width / 2, centerY = Var.screen.height / 2;
    if( (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY) < 50 * 50 ){
      targetRect = itemRect;
      break;
    }

  }

  for( let i = 0; i < model.data.obstacle.length; i ++ ){
    let itemRect = model.data.goods[i];
    if( !inView(itemRect) ){
      continue;
    }

    if(targetRect) break;

    let x = SizeUtil.worldToScreenX(itemRect.x), y = SizeUtil.worldToScreenY(itemRect.y);

    var centerX = Var.screen.width / 2, centerY = Var.screen.height / 2;
    if( (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY) < 50 * 50 ){
      targetRect = itemRect;
      break;
    }
  }

  return targetRect;
}

// 产生行模式下的批量编号
export function generateRowSeq(R, C){
  // num2 - num3
  let arr = Array(R).fill(0).map(item=>Array(C).fill(0));
  const num2Ele = $('batch_cell_startindex'), num3Ele = $('batch_cell_endindex');

  let num2_start = (+num2Ele.value) || model.data.goods.length, num3_start = (+num3Ele.value)  || model.data.goods.length ;

  let maxNum3 = num3_start + 2 * (C - 1);
  num3_start = maxNum3 + 1;

  for( let r = 0; r < R; r ++ ){
    for( let c = 0; c < C; c ++ ){
      arr[r][c] = [`${num2_start + r * 1}-${num3_start+(-2) * c}`, `${num2_start + r * 1 + 1}-${num3_start+(-2) * c-1}`]
    }
  }

  return arr;
}

// 产生列模式下的批量编号
export function generateColSeq(R, C){
  // num2 - num3
  let arr = Array(R).fill(0).map(item=>Array(C).fill(0));
  const num2Ele = $('batch_cell_startindex'), num3Ele = $('batch_cell_endindex');

  let num2_start = (+num2Ele.value) || model.data.goods.length, num3_start = (+num3Ele.value)  || model.data.goods.length ;

  let maxNum3 = num3_start + 2 * (R - 1);

  num3_start = maxNum3 + 1;

  for( let c = 0; c < C; c ++ ){

    for( let r = 0; r < R; r ++ ){

      arr[r][c] = [`${num2_start + c * 1}-${num3_start+(-2) * r}`, `${num2_start + c * 1 + 1}-${num3_start+(-2) * r-1}`]
    } // end for r

  } // end for c

  return arr;
}

// 磁性吸附
export function magneticAdsorbing(){
  // 对选中的对象与其它周边元素进行碰撞检测
  // Var.selectedRects
  // 目前先对拖动一个物体的时候做磁性吸附
  if( Var.selectedRects.length !== 1 ) return;

  const Delta = 10;

  let targetRect = Var.selectedRects[0];
  for( let i = 0; i < model.data.goods.length; i ++ ){

    let itemRect = model.data.goods[i];
    if( !inView(itemRect) ) continue;
    if( itemRect === targetRect ) continue;



  } // end for i

}

// 选择模式下右键菜单
export function handleContextMenu(e){

  const J_select_contextAlign = $('J_select_contextAlign');
  const oCopy = J_select_contextAlign.querySelector('[data-copy]');
  const oCut = J_select_contextAlign.querySelector('[data-cut]');
  const oPaste = J_select_contextAlign.querySelector('[data-paste]');

  J_select_contextAlign.style.display='block';
  let left = e.clientX, top = e.clientY; // 右键菜单点击的位置

  J_select_contextAlign.style.top = top+'px';
  J_select_contextAlign.style.left = left+10+'px';

  Array.from(J_select_contextAlign.querySelectorAll('[data-align]'))
  .forEach( dom=>{
    dom.classList.add('disabled');
  } );

  if( Var.selectedRects.length > 1 ){
    Array.from(J_select_contextAlign.querySelectorAll('[data-align]'))
    .forEach( dom=>{
      dom.classList.remove('disabled');
    } );
  }

  //
  oCopy.classList.add('disabled')
  oCut.classList.add('disabled')
  oPaste.classList.add('disabled')

  if( Var.clipBoard ){
    oCopy.classList.add('disabled')
    oCut.classList.add('disabled')
    oPaste.classList.remove('disabled')
  }else{
    oPaste.classList.add('disabled')
  }

  if(Var.selectedRects.length){
    oCopy.classList.remove('disabled')
    oCut.classList.remove('disabled')
  }

  // 绑定点击事件
  Array.from($('J_select_contextAlign').querySelectorAll('[data-align]')).forEach(itemLi=>{
    itemLi.onclick = ()=>{
      let alignFn = itemLi.dataset.align;
      if(!alignFn) return; // align=''为辅助线

      AlignUtil[alignFn]();
      $('J_select_contextAlign').style.display='none';
    };
  });

  // inner function
  function getBaseRect( ){

    let arr = Var.clipBoard ;
    // 以x值最小为准
    let minX = Number.MAX_VALUE
    let minIndex = Number.MAX_VALUE
    for( let i = 0; i < arr.length; i++ ){

      let {x} = arr[i];
      if(x < minX){
        minX = x;
        minIndex = i;
      }

    } // end for i

    let baseRect = arr[minIndex]
    // clipBoardRectsOffset
    Var.clipBoardRectsOffset = [];

    for( let i = 0; i < arr.length; i++ ){

      Var.clipBoardRectsOffset[i] = {
        x: arr[i].x - baseRect.x,
        y: arr[i].y - baseRect.y,
      };

    } // end for i

  }

  // 复制
  oCopy.onclick = e=>{

    if( Var.selectedRects.length > 0 ){
      Var.clipBoard = Var.selectedRects;
    }

    if( Var.selectedBarrierRects.length > 0 ){
      Var.clipBoard = Var.selectedBarrierRects;
    }

    $('J_select_contextAlign').style.display='none';
  };

  // 剪切
  oCut.onclick = e=>{
    oCopy.onclick();

    // 既然是剪切, 那么选择好后就要作删除动作
    if( Var.selectedRects.length > 0 ){

      // console.log(Var.selectedRectsIndex)
      let sortedIndexes = [...Var.selectedRectsIndex].sort((a,b)=>b-a);

      for( let i = 0; i < sortedIndexes.length; i ++ ){
        model.data.goods.splice( sortedIndexes[i], 1 );
      }

      Var.selectedRects = [];
    }

    if( Var.selectedBarrierRects.length > 0 ){

    }
  };

  // 粘贴
  oPaste.onclick = e=>{

    if( Var.clipBoard ){
      getBaseRect();

      Var.selectedRects = [];
      // Var.selectedRectsIndex = [];
      //
      for( let i = 0; i < Var.clipBoard.length; i ++ ){
        let itemRect = {
          ...Var.clipBoard[i],
          x:SizeUtil.screenToWorldX(left - EdgeLeft) + Var.clipBoardRectsOffset[i].x, y:SizeUtil.screenToWorldY(top - EdgeTop) + Var.clipBoardRectsOffset[i].y,
        };

        model.data.goods.push(itemRect);
        Var.selectedRects.push(itemRect)
      }

      console.log('Var.selectedRects: ', Var.selectedRects)

    }

    $('J_select_contextAlign').style.display='none';
  };
}
