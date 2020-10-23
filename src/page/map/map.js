/* eslint-disable */
import {inputNumHandler, drawDashedRect, NewLocateCoordinate, getCollideTest, DragChangeSize} from './lib'

const $=document.getElementById.bind(document);

function createDigitalMap(){
  const oC = $('c1');
  const gd = oC.getContext('2d');
  oC.width = oC.offsetParent.offsetWidth;
  oC.height = oC.offsetParent.offsetHeight;

  const J_tools_ul = $('J_tools_ul');
  const a_tools_li = Array.from(J_tools_ul.getElementsByTagName('li'));

  const J_search_goods_loc = $('J_search_goods'); // 搜索货架
  J_search_goods_loc.oninput = function(){
      setDataItemIntoView(J_search_goods_loc.value);
  };
  J_search_goods_loc.onkeydown=function(e){
      e.cancelBubble = true; // 输入框中的形为不要往上奏报了
      if(e.keyCode == 13) setDataItemIntoView(J_search_goods_loc.value);
  };

  let searchLocAnimation={
      life:600, start:600, index:-1,
  };

  a_tools_li.forEach((objLi, index)=>{
      objLi.onclick=()=>{
          a_tools_li.forEach(obj=>obj.classList.remove('current'));
          objLi.classList.add('current');
          currMode = ModeEnum[index];

          multiSelectedRect=null;
          selectedRect=null;
          selectedTextRect = null;
          currLocationRect = null;
          currBarrierRect = null;
          currSelectMoveRect = null;
      }
  });

  // 设置当前按钮模式 Mode_Select = 0, Mode_Location = 1, Mode_Barrier=2, Mode_Text = 3, Mode_Zoom = 4;
  function setButtonMode( mode ){
      a_tools_li[mode].onclick();
  }

  const ZoomOut = $('ZoomOut'), ZoomIn = $('ZoomIn');
  const J_input_zoom = $('J_input_zoom');
  J_input_zoom.value = '1';
  inputNumHandler(J_input_zoom, (txt)=>{
    setCurrentWorldSize(txt);
  });

  const J_fill_text = $('J_fill_text');

  let world_start_offsetx = 0, world_start_offsety = 0;
  let zoomLevel = 1;
  let bSpaceDown = false;
  let shelveDepthIndex=0; // 货架的深度值

  let canvas_width, canvas_height, world_width, world_height, now_world_width, now_world_height, selectedRect, multiSelectedRect, currLocationRect, selectedTextRect, currBarrierRect, currSelectMoveRect;
  reset();
  function reset(){
    oC.width = oC.offsetParent.offsetWidth;
    oC.height = oC.offsetParent.offsetHeight;
    canvas_width = oC.width;
    canvas_height = oC.height;
    world_width = 1200 > oC.width ? 1200 : oC.width;
    world_height = 1600 < oC.height ? 1600:oC.height;
    now_world_width = world_width * zoomLevel;
    now_world_height = world_height * zoomLevel;

    multiSelectedRect=null; // 可以框选多个货架,但不能使货架与障碍物同时选中, 有值的话，它是一个数组
    selectedRect=null; // 当前选中的货架/障碍物
    currLocationRect = null; // 当前要绘制的location
    selectedTextRect = null; //  当前选中的文字rect
    currBarrierRect = null; // 当前要绘制的障碍物
    currSelectMoveRect = null; // 当前框选的矩形---临时
  }

  const GoodsType=0, BarrierType=1;
  const Mode_Select = 0, Mode_Location = 1, Mode_Barrier=2, Mode_Text = 3, Mode_Zoom = 4;
  const ModeEnum={
      0:Mode_Select,
      1:Mode_Location,
      2:Mode_Barrier,
      3:Mode_Text,
      4:Mode_Zoom,
  };
  let currMode=Mode_Select;
  // 屏敞canvas右键菜单
  oC.oncontextmenu = ()=>{
      return false;
  };

  ZoomOut.onclick = ()=>{
      if( bSpaceDown ) return;
      zoomFn(1);
  }

  ZoomIn.onclick = ()=>{
      if( bSpaceDown ) return;
      zoomFn(-1)
  }

  // zoomIn, zoomOut公共方法
  // dir:1放大  dir:-1缩小
  function zoomFn(dir){
      if( dir > 0 ){
          if( zoomLevel >= 1 ){
              zoomLevel = ++zoomLevel
          }else{
              zoomLevel += 0.2
          }
      }else{
          if(zoomLevel > 1){
              zoomLevel = --zoomLevel
          }else{
              zoomLevel -= 0.2
          }
      }
      setCurrentWorldSize( (parseInt(zoomLevel * 100)) / 100 )
  }

  function setCurrentWorldSize(val){
    zoomLevel = +val
    J_input_zoom.value = zoomLevel; // 1->0.8->0.6浮点数运算不精确，所以 * 100取整再除100
    now_world_width = world_width * zoomLevel
    now_world_height = world_height * zoomLevel
  }

  // mock data
  let data=[];
  for( let r = 0; r < 2; r ++ ){
      for( let c = 0; c < 10; c ++ ){
          data.push({
              x:50 + c * 100,
              y:100 + r * 80,
              width:100, height:80,
              stroke:'#e86f8d',
              fill:'rgba(255, 170, 170, 0.8)',
              text:`Row${r}-Col${c}`,
              order:shelveDepthIndex,
              type:GoodsType,
          })
      } // for c
  } // for r

  document.onkeydown = e=>{
      // 空格键
      if(e.keyCode == 32){
          e.preventDefault();
          bSpaceDown = true;
          oC.style.cursor="move";
      }

      // 退格键
      if(e.keyCode == 8){
        // 单选的情况
          if( selectedRect ){
              let index = selectedRect['index'];
              data.splice(index, 1);
              selectedRect =null;
          }
        // 多选的情况
          if( multiSelectedRect ){
            // 先排 multiSelectedRect 按 index从大到小排
            multiSelectedRect.sort((obj1, obj2)=>obj2.index-obj1.index);
            for( let i = 0; i < multiSelectedRect.length; i ++ ){
              data.splice(multiSelectedRect[i]['index'], 1);
            } // for multiSelectedRect end
            multiSelectedRect = null;
          }
      }
  }

  document.onkeyup=e=>{
      if(e.keyCode ==32){
          e.preventDefault();
          bSpaceDown = false;
          oC.style.cursor="default";
      }
  }

  // 在主画布里进行鼠标的操作
  oC.onmousedown = e=>{
      // console.log(e.offsetX, e.offsetY)
      let tap_start_x = e.offsetX, tap_start_y = e.offsetY;
      let tap_now_x = e.offsetX, tap_now_y = e.offsetY;
      let base_world_start_offsetx = world_start_offsetx, base_world_start_offsety = world_start_offsety;

      currLocationRect=null;
      currBarrierRect=null;
      currSelectMoveRect=null;
      selectedTextRect =  null;
      selectedRect=null;
      // multiSelectedRect=null;
      J_fill_text.blur(); // 这里文字输入框要显示的触发一下失焦事件
      J_search_goods_loc.blur(); // oC画布设置了mousedown阻止默认行为，故而显示触发搜索栏中的失焦事件

      if( bSpaceDown ){
          multiSelectedRect=null; // 既然拖动世界，就不用选中框选的状态了
          // 空格键按下才做位置拖动的工作
          document.onmousemove = e=>{
              tap_now_x = e.offsetX;
              tap_now_y = e.offsetY;

              if( bSpaceDown ){
                  world_start_offsetx = base_world_start_offsetx + (tap_now_x - tap_start_x);
                  world_start_offsety = base_world_start_offsety + (tap_now_y - tap_start_y);
                  // console.log(world_start_offsetx, world_start_offsety)
              }
          }

          document.onmouseup = e=>{
              document.onmousemove = document.onmouseup = null;
          }
      }else{


          // 区分是哪种模式,即左侧菜单选中了哪项
          if( currMode == Mode_Select ){
              // console.log(multiSelectedRect)
              selectedRect = getHitRect(tap_now_x + (-world_start_offsetx), tap_now_y + (-world_start_offsety));
              if(!selectedRect) multiSelectedRect = null;

              // 多选拖动
              if(multiSelectedRect && selectedRect){
                let bHit = false; // 是否选中了多选物体中的一块
                for( let i = 0; i < multiSelectedRect.length; i ++ ){
                  if( selectedRect['index'] == multiSelectedRect[i]['index'] ){
                    // console.log('击中了...')
                    selectedRect = null;
                    bHit = true;
                    break;
                  }
                } // for i multiSelectedRect

                if(!bHit) multiSelectedRect = null;
                if( bHit ){ // 既然击中了多选物体，为拖动作准备
                  let needShelveDepthIndex=++shelveDepthIndex;
                  let bCollide = false; // 框选的矩形与界面上的矩形碰撞检测

                  // 多选拖动前的预备
                  let dragArr = [];
                  for( let i = 0; i < multiSelectedRect.length; i ++ ){
                    let dataItem = data[multiSelectedRect[i]['index']];
                    dataItem.order = needShelveDepthIndex;
                    dragArr.push( {
                      index: multiSelectedRect[i]['index'],
                      x:dataItem.x * zoomLevel, y:dataItem.y * zoomLevel,
                      width:dataItem.width* zoomLevel, height:dataItem.height* zoomLevel,
                      preX:dataItem.x, preY:dataItem.y,
                      rect_offsetx:tap_start_x - dataItem.x * zoomLevel, rect_offsety:tap_start_y - dataItem.y * zoomLevel,
                      newLocateCoordinate: new NewLocateCoordinate(),
                    } );
                  } // for multiSelectedRect

                  dragArr.forEach((dragItem)=>{
                    dragItem.newLocateCoordinate.start(e, dragItem.rect_offsetx - world_start_offsetx, dragItem.rect_offsety - world_start_offsety, dragItem.preX, dragItem.preY)
                  });

                  document.onmousemove = e=>{

                    // 只有在canvas上拖动时, 才有效
                    if( e.target == oC ){
                      tap_now_x = e.offsetX;
                      tap_now_y = e.offsetY;

                      // inView
                      let bAllInView = true;
                      for( let i = 0; i < dragArr.length; i ++ ){
                        let dragItem = dragArr[i];
                        if( !inView( {x:(tap_now_x - dragItem.rect_offsetx)/zoomLevel, y:(tap_now_y - dragItem.rect_offsety)/zoomLevel, width:dragItem.width/ zoomLevel, height:dragItem.height/ zoomLevel} ) ){
                          bAllInView = false;
                          break;
                        }
                      } // for i dragArr

                      if(bAllInView){
                        for( let i = 0; i < dragArr.length; i ++ ){
                          let dragItem = dragArr[i];
                          let dataItem = data[dragItem['index']];
                          dataItem.x = (tap_now_x - dragItem.rect_offsetx)/zoomLevel;
                          dataItem.y = (tap_now_y - dragItem.rect_offsety)/zoomLevel;

                          dragItem.newLocateCoordinate.move(e, dragItem.rect_offsetx - world_start_offsetx, dragItem.rect_offsety - world_start_offsety, dataItem.x, dataItem.y)
                        } // for i dragArr
                      }
                    }
                  };

                  document.onmouseup = e=>{
                    document.onmousemove = document.onmouseup = null;

                    dragArr.forEach((dragItem)=>{
                      dragItem.newLocateCoordinate.end(e)
                    });

                    tap_now_x = e.offsetX;
                    tap_now_y = e.offsetY;

                    for( let i = 0; i < data.length; i ++ ){
                      let item = data[i];
                      // 如果物块在可视范围之外
                      if( !inView( {x:item.x, y:item.y, width:item.width, height:item.height} ) ){
                        continue;
                      }

                      let ret = dragArr.filter(obj=>obj['index']==i)
                      if(ret.length > 0) continue;

                      let rect1={x:item.x * zoomLevel, y:item.y * zoomLevel, width:item.width * zoomLevel, height:item.height * zoomLevel};

                      for( let ii = 0; ii < dragArr.length; ii ++ ){
                        let dragItem = dragArr[ii];
                        let dataItem = data[dragItem['index']];
                        let rect2={x:tap_now_x - dragItem.rect_offsetx, y: tap_now_y - dragItem.rect_offsety,  width:dataItem.width * zoomLevel, height:dataItem.height * zoomLevel};

                        if( getCollideTest(rect1, rect2)){
                            bCollide = true;
                            break;
                        }

                        if( bCollide ){
                          break;
                        }

                      } // for ii dragArr

                    } // for i data

                    if(bCollide){
                      // console.log('Hit!!!!!!!!')
                      for( let i = 0; i < dragArr.length; i++ ){
                        let dragItem = dragArr[i];
                        let dataItem = data[dragItem['index']];
                        dataItem.x = dragItem.preX;
                        dataItem.y = dragItem.preY;
                      } // for i dragArr
                    }

                  };

                  return; // 当前只要拖动就好了，下面可以先不去理会了
                } // if bHit
              } // if(multiSelectedRect && selectedRect)

              // 只有不在多选拖动的情况下，才会有下方的事情
              if( selectedRect ){
                  let dataItem = data[selectedRect['index']];
                  dataItem.order = ++shelveDepthIndex;
                  let rectX = dataItem.x * zoomLevel, rectY = dataItem.y * zoomLevel;
                  let rect_offsetx = tap_start_x - rectX, rect_offsety = tap_start_y - rectY;

                  let preX = dataItem.x, preY = dataItem.y;
                  let bCollide = false;

                  const newLocateCoordinate = new NewLocateCoordinate();
                  newLocateCoordinate.start(e, rect_offsetx - world_start_offsetx, rect_offsety - world_start_offsety, preX, preY);

                  document.onmousemove = e=>{
                      // 只有在canvas上拖动时, 才有效
                      if( e.target == oC ){
                        // console.log(inView(dataItem))
                        tap_now_x = e.offsetX;
                        tap_now_y = e.offsetY;
                        if( inView( {x:(tap_now_x - rect_offsetx)/zoomLevel, y:(tap_now_y - rect_offsety)/zoomLevel, width:dataItem.width, height:dataItem.height} ) ){
                          dataItem.x = (tap_now_x - rect_offsetx)/zoomLevel;
                          dataItem.y = (tap_now_y - rect_offsety)/zoomLevel;
                          newLocateCoordinate.move(e, rect_offsetx - world_start_offsetx, rect_offsety - world_start_offsety, dataItem.x, dataItem.y);
                        }

                      }
                  };

                  document.onmouseup = e=>{
                      document.onmousemove = document.onmouseup = null;
                      newLocateCoordinate.end();

                      tap_now_x = e.offsetX;
                      tap_now_y = e.offsetY;

                      let rect2={x:tap_now_x - rect_offsetx, y: tap_now_y - rect_offsety,  width:dataItem.width * zoomLevel, height:dataItem.height * zoomLevel};

                      for( let i = 0; i < data.length; i ++ ){
                          if(selectedRect['index'] == i){
                              continue;
                          }
                          let item = data[i];
                          let rect1={x:item.x * zoomLevel, y:item.y * zoomLevel, width:item.width * zoomLevel, height:item.height * zoomLevel};

                          // 如果物块在可视范围之外
                          if( !inView( {x:item.x, y:item.y, width:item.width, height:item.height} ) ){
                            continue;
                          }

                          if( getCollideTest(rect1, rect2)){
                              bCollide = true;
                              break;
                          }
                      } // for i
                      if( bCollide ){
                          dataItem.x = preX;
                          dataItem.y = preY;
                      }
                  };
              }else{
                  // 如果没选中rect,说明此时就是框选--多选的, 当然也包括一个
                  document.onmousemove = e=>{
                      // console.log(multiSelectedRect)
                      tap_now_x = e.offsetX;
                      tap_now_y = e.offsetY;

                      let movePoint={x:tap_now_x + (-world_start_offsetx), y:tap_now_y + (-world_start_offsety)},
                      startPoint={x:tap_start_x + (-world_start_offsetx), y:tap_start_y + (-world_start_offsety)};
                      currSelectMoveRect=getMoveRect(startPoint, movePoint)
                  };

                  document.onmouseup = e=>{
                      document.onmousemove = document.onmouseup = null;
                      // 手松开的一刻,开始检测此时框选了多少矩形
                      if( currSelectMoveRect ){
                        let aRects = getHowManySelectRect(currSelectMoveRect)
                        // 如果 aRects里有障碍物,说明我要放弃这个障碍物
                        aRects = aRects.filter(item=>item.type==GoodsType);
                        multiSelectedRect = aRects.length ? aRects : null;
                      }

                      currSelectMoveRect = null;
                  };
              }

          }else if( currMode == Mode_Location){

              document.onmousemove = e=>{
                  // currLocationRect
                  tap_now_x = e.offsetX;
                  tap_now_y = e.offsetY;

                  let movePoint={x:tap_now_x + (-world_start_offsetx), y:tap_now_y + (-world_start_offsety)},
                      startPoint={x:tap_start_x + (-world_start_offsetx), y:tap_start_y + (-world_start_offsety)};
                  currLocationRect=getMoveRect(startPoint, movePoint)
              };

              document.onmouseup = e=>{
                  document.onmousemove = document.onmouseup = null;
                  // 只有当拖动过才存在 currLocationRect
                  if(currLocationRect){
                      data.push({
                          x:currLocationRect.x / zoomLevel,y:currLocationRect.y / zoomLevel,
                          width:currLocationRect.width / zoomLevel, height:currLocationRect.height / zoomLevel,
                          stroke:'#e86f8d', fill:'rgba(255, 170, 170, 0.8)',
                          text:''+Math.random(), order:++shelveDepthIndex,
                          type:GoodsType,
                      });
                      currLocationRect=null;
                  }
              };
          }else if( currMode == Mode_Text){ // 处理文字的情况
              selectedTextRect = getHitRect(tap_now_x + (-world_start_offsetx), tap_now_y + (-world_start_offsety));
              if(selectedTextRect && selectedTextRect.type==GoodsType){

                  let dataItem = data[selectedTextRect['index']];
                  setFillTextLocation(dataItem);
              } // end if selectedTextRect

          }else if( currMode == Mode_Barrier ){
              // 绘制障碍物
              document.onmousemove = e=>{
                  // currBarrierRect
                  tap_now_x = e.offsetX;
                  tap_now_y = e.offsetY;

                  let movePoint={x:tap_now_x + (-world_start_offsetx), y:tap_now_y + (-world_start_offsety)},
                      startPoint={x:tap_start_x + (-world_start_offsetx), y:tap_start_y + (-world_start_offsety)};

                  currBarrierRect=getMoveRect(startPoint, movePoint)
                  let bCollide = false;
                  // 看绘制过程中,障碍物是否碰到了货架，如果碰到了，就不能再绘制,及时阻止住
                  for( let i = 0; i < data.length; i ++ ){
                      let item = data[i];

                      if(!inView({...item})){
                        // 如果物块不在可视范围内,则不用判断
                        continue;
                      }

                      let rect1 = {x:item.x * zoomLevel - world_start_offsetx, y:item.y * zoomLevel - world_start_offsety, width:item.width * zoomLevel, height:item.height* zoomLevel};
                      let rect2 = {...currBarrierRect};

                      if( getCollideTest(rect1, rect2) ){
                          bCollide = true;
                          break;
                      }

                  } // for i

                  if(bCollide){
                      currBarrierRect = null;
                  }

              };

              document.onmouseup=e=>{
                  document.onmousemove = document.onmouseup = null;

                  // 只有拖动绘制过才有 currBarrierRect
                  if( currBarrierRect ){
                      data.push({
                          x:currBarrierRect.x / zoomLevel,y:currBarrierRect.y / zoomLevel,
                          width:currBarrierRect.width / zoomLevel, height:currBarrierRect.height / zoomLevel,
                          stroke:'rgba(0, 0, 0, 0.5)', fill:'rgba(127, 127, 127, 0.8)',
                          text:'', order:++shelveDepthIndex,
                          type:BarrierType,
                      });

                      setButtonMode(Mode_Select)
                      setHitRect(BarrierType)

                      currBarrierRect=null;
                  }
              };

          }else if( currMode == Mode_Zoom ){

          }

      }

      return false;
  }; // oC mouse down

  // next渲染入口
  next();
  window.onresize=()=>{reset(); drawScene();};

  function next(){
      drawScene();
      window.requestAnimationFrame(next);
  }

  // 主绘制方法
  function drawScene(){
      gd.clearRect(0, 0, canvas_width, canvas_height);

      // 绘制底版
      gd.save();
      gd.fillStyle='#A0A0A0';
      gd.fillRect(0, 0, canvas_width, canvas_height);
      gd.restore();

      // 绘制真实世界 需要考虑上偏移
      gd.save();
      gd.translate(world_start_offsetx, world_start_offsety);

          gd.save();
          gd.fillStyle = 'white'
          gd.fillRect(0, 0, now_world_width, now_world_height);
          gd.restore();

          // 绘制货架
          gd.save();
          gd.beginPath();
          gd.rect(0, 0, now_world_width, now_world_height)
          gd.clip();

          let newGoodsData = data.map((item, index)=>({...item,originalIndex:index})).filter(item=>item.type==GoodsType).sort((a, b)=>a.order-b.order);
          for( let i = 0; i < newGoodsData.length; i ++ ){
              let item = newGoodsData[i];
              gd.beginPath();
              gd.rect(item.x * zoomLevel, item.y * zoomLevel, item.width * zoomLevel, item.height * zoomLevel);
              gd.fillStyle = item.fill;
              gd.strokeStyle = item.stroke;
              gd.lineWidth = 4*zoomLevel;
              gd.fill();
              gd.stroke();

              // 搜索聚焦功能
              if( item.originalIndex == searchLocAnimation.index && searchLocAnimation.start < searchLocAnimation.life ){
                  gd.beginPath();
                  gd.globalAlpha = 0.7;
                  gd.fillStyle='yellow';
                  gd.fillRect( item.x * zoomLevel, item.y * zoomLevel, item.width * zoomLevel, item.height * zoomLevel );
                  searchLocAnimation.start++;
              }

              if( selectedTextRect && item.originalIndex ==  selectedTextRect['index']){
                  continue;
              }

              gd.globalAlpha = 1;

              gd.fillStyle='black'
              gd.font=`${12*zoomLevel}px Arial`
              gd.fillText(item.text, item.x * zoomLevel, item.y * zoomLevel+item.height * zoomLevel/2)

          }

          let newBarrierData = data.map((item, index)=>({...item,originalIndex:index})).filter(item=>item.type==BarrierType).sort((a, b)=>a.order-b.order);
          for( let i = 0; i < newBarrierData.length; i ++ ){
              let item = newBarrierData[i];
              gd.beginPath();
              gd.rect(item.x * zoomLevel, item.y * zoomLevel, item.width * zoomLevel, item.height * zoomLevel);
              gd.fillStyle = item.fill;
              gd.strokeStyle = item.stroke;
              gd.lineWidth = 1;
              gd.fill();
              gd.stroke();

              gd.beginPath();
              gd.moveTo(item.x * zoomLevel, item.y * zoomLevel)
              gd.lineTo(item.x * zoomLevel + item.width * zoomLevel, item.y * zoomLevel + item.height * zoomLevel);

              gd.moveTo(item.x * zoomLevel+item.width * zoomLevel, item.y * zoomLevel)
              gd.lineTo(item.x * zoomLevel, item.y * zoomLevel+item.height * zoomLevel)
              gd.lineWidth = 2;
              gd.stroke();
          }

          // currLocationRect
          if(currLocationRect){

              gd.beginPath();
              gd.rect(currLocationRect.x, currLocationRect.y, currLocationRect.width, currLocationRect.height);
              gd.fillStyle='rgba(255, 170, 170, 0.8)';
              gd.strokeStyle='#e86f8d';
              gd.fill();
              gd.stroke();

          } // end if currLocationRect

          // currBarrierRect
          if(currBarrierRect){

              gd.beginPath();
              gd.rect(currBarrierRect.x, currBarrierRect.y, currBarrierRect.width, currBarrierRect.height);
              gd.fillStyle='rgba(127, 127, 127, 0.8)';
              gd.strokeStyle='rgba(0, 0, 0, 0.5)';
              gd.lineWidth=1;
              gd.fill();
              gd.stroke();

              gd.beginPath();
              gd.moveTo(currBarrierRect.x, currBarrierRect.y)
              gd.lineTo(currBarrierRect.x+currBarrierRect.width, currBarrierRect.y+currBarrierRect.height);

              gd.moveTo(currBarrierRect.x+currBarrierRect.width, currBarrierRect.y)
              gd.lineTo(currBarrierRect.x, currBarrierRect.y+currBarrierRect.height)
              gd.lineWidth = 2;
              gd.stroke();

          } // end if currBarrierRect

          // currSelectMoveRect 框选 rect
          if(currSelectMoveRect){
              gd.beginPath();
              gd.rect(currSelectMoveRect.x, currSelectMoveRect.y, currSelectMoveRect.width, currSelectMoveRect.height);
              gd.fillStyle='rgba(0, 0, 220, 0.1)';
              gd.strokeStyle='rgba(0, 0, 255, 0.8)';
              gd.lineWidth=1;
              gd.fill();
              gd.stroke();
          }

          // 看是否鼠标打中了一个货架
          if(selectedRect || (selectedTextRect && selectedTextRect.type==GoodsType)){
              // let index = selectedRect['index'];
              // let item = data[index];
              let index = selectedRect ? selectedRect['index'] : selectedTextRect['index'];
              let item = data[index];

              // 生成虚线矩形框
              drawDashedRect(gd, item, zoomLevel);
          } // if(selectedRect)

          // 框选的情况
          if( multiSelectedRect ){
            for( let i  = 0; i < multiSelectedRect.length; i ++ ){
              let index = multiSelectedRect[i]['index'];
              let item = data[index];
              // 生成虚线矩形框
              drawDashedRect(gd, item, zoomLevel);
            } // for i
          } // if multiSelectedRect

          gd.restore();

      gd.restore();

  }

  // 判断鼠标点击行为, 是否击中货架--单选
  function getHitRect(world_tapX, world_tapY){
      for( let i = 0; i < data.length; i ++ ){
          let item = data[i];
          let left = item.x * zoomLevel, right = (item.x + item.width) * zoomLevel, top = item.y * zoomLevel, bottom = (item.y + item.height) * zoomLevel;
          if( world_tapX > left && world_tapX < right && world_tapY > top && world_tapY < bottom){
              return {index:i, item, type:item.type};
          }
      } // for i
      return null;
  }

  // 手动设置 selectedRect
  function setHitRect(type){
      selectedRect={index:data.length - 1, type};
  }

  // 根据给定的初始点与终止点计算一个矩形
  function getMoveRect(startPoint, movePoint){
      let startx = Math.min(startPoint.x, movePoint.x),
          starty = Math.min(startPoint.y, movePoint.y);
      let endx = Math.max(startPoint.x,movePoint.x),
          endy = Math.max(startPoint.y, movePoint.y);

      return {
          x:startx, y:starty, width:endx-startx, height:endy-starty
      };
  }

  // 设置J_fill_text框的位置
  function setFillTextLocation(dataItem){
      J_fill_text.style.display = 'inline-block';
      J_fill_text.style.top = (dataItem.y) * zoomLevel + world_start_offsety + 'px';
      J_fill_text.style.left = (dataItem.x) * zoomLevel + world_start_offsetx + 'px';
      J_fill_text.style.width = dataItem.width*zoomLevel + 'px';
      J_fill_text.style.height = dataItem.height*zoomLevel + 'px';
      J_fill_text.style.fontSize = 12 * zoomLevel + 'px';
      J_fill_text.value=dataItem.text;
      J_fill_text.focus();

      J_fill_text.onblur=function(){
          J_fill_text.style.display = 'none';
          selectedTextRect = null;
          if( this.value.trim().length){
              dataItem.text = this.value.trim();
          }
      };
  }

  // 在data中查找指定text
  function findTextFromData(inputTxt){
      let goodsData = data.map((item, index)=>({...item,originalIndex:index})).filter(item=>item.type==GoodsType);
      for( let i = 0; i < goodsData.length; i ++ ){
          let item=goodsData[i];
          if(item.text == inputTxt){
              return item.originalIndex
          }
      }
      return -1;
  }

  function setDataItemIntoView(inputTxt){
      let idx = findTextFromData(inputTxt);
      if(idx == -1){
          searchLocAnimation = {life:600, start:600, index:-1};
          return;
      }

      let dataItem = data[idx];
      let viewX = dataItem.x * zoomLevel + world_start_offsetx, viewY = dataItem.y * zoomLevel + world_start_offsety;
      let viewWidth = dataItem.width * zoomLevel, viewHeight = dataItem.height * zoomLevel;

      if( viewX >= 0 && viewY >= 0 && viewX + viewWidth < canvas_width && viewY + viewHeight < canvas_height){
          //  已经在视野范围内
          console.log('在范围内 IN')
      }else{
          // 要移动到视野范围内
          console.log('不在范围内 Out')
          let centerX = gd.canvas.width / 2, centerY = gd.canvas.height / 2;
          /*
              offsetX + x = centerX
          */
         world_start_offsetx = centerX - dataItem.x * zoomLevel;
         world_start_offsety = centerY - dataItem.y * zoomLevel;
      }

      searchLocAnimation = {life:600, start:0, index:idx};
  }



  // 检测一个矩形是否在可视范围内
  function inView(rect){
      const T = 1/4; // tolerance容差
      let viewX = rect.x * zoomLevel + world_start_offsetx, viewY = rect.y * zoomLevel + world_start_offsety;
      let viewWidth = rect.width * zoomLevel, viewHeight = rect.height * zoomLevel;
      // canvas_width == gd.canvas.width, canvas_height == gd.canvas.height
      let world_rect_x = world_start_offsetx, world_rect_y = world_start_offsety, world_rect_width = now_world_width, world_rect_height = now_world_height;
      let rect_x = rect.x * zoomLevel, rect_y = rect.y * zoomLevel, rect_width = viewWidth, rect_height = viewHeight;

      if( viewX >= -viewWidth * T && viewY >= -viewHeight * T && viewX + viewWidth * T < canvas_width && viewY + viewHeight * T < canvas_height
        &&
        rect_x >= 0 && rect_y >= 0 && rect_x + rect_width < world_rect_width && rect_y + rect_height < world_rect_height
      ){
          return true;
      }
      return false;
  }

  // 检测框选了多少在视区范围内的矩形
  function getHowManySelectRect(movingRect){
      // movingRect->相对于世界坐标
      let aRes=[];
      for( let i = 0; i < data.length; i ++ ){
          let item = data[i];
          if(!inView(item)) continue;
          //
          if( getCollideTest( movingRect, {x:item.x * zoomLevel, y:item.y * zoomLevel, width: item.width * zoomLevel, height:item.height * zoomLevel} ) ){
              aRes.push({index:i, item, type:item.type});
          }
      } // end for i
      return aRes;
  }
} // createDigitalMap end

export default createDigitalMap;
