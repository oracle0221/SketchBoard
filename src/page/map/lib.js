// 给地图用的辅助函数

// 让input框变成只能输入数字
export function inputNumHandler(input, fnCallback){
  input.onkeydown = e=>{
    let keyCode = e.keyCode;
    keyCode+='';
    // 0-9 enter backspace 方向键
    let keys=['48','49', '50', '51', '52', '53', '54', '55', '56', '57', '8', '13', '37', '38', '39', '40'];
    if( keys.includes( keyCode ) ){
      if( keyCode === '13' ){
        if( input.value.trim() === '' ){
          input.value='1'; // 如果没输入,那么默认就是 1
        }
        fnCallback && fnCallback(input.value)
      }
      return true;
    }
    return false;
  };
}

// 生成虚线矩形框
export function drawDashedRect(gd, item, zoomLevel){
  gd.save();
  gd.beginPath()
  gd.strokeStyle = '#22C'
  gd.lineWidth = 1;
  gd.setLineDash([2, 2]);
  gd.rect(item.x * zoomLevel, item.y * zoomLevel, item.width * zoomLevel, item.height * zoomLevel);
  gd.stroke();
  gd.restore();

  gd.save();

  // 生成8个小圆圈
  // 上面3个
  for( let i = 0; i < 3; i ++ ){
      gd.beginPath();
      gd.arc(item.x * zoomLevel + (item.width * zoomLevel) / 2 * i, item.y * zoomLevel, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 中间2个
  for( let i = 0; i < 2; i ++ ){
      gd.beginPath();
      gd.arc(item.x * zoomLevel + (item.width * zoomLevel) * i, item.y * zoomLevel + item.height / 2 * zoomLevel, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  // 下面3个
  for( let i = 0; i < 3; i ++ ){
      gd.beginPath();
      gd.arc(item.x * zoomLevel + (item.width * zoomLevel) / 2 * i, item.y * zoomLevel + item.height * zoomLevel, 4, 0, Math.PI * 2, false);
      gd.fillStyle='#22C';
      gd.fill();
  } // for i

  gd.restore();
}

// 拖动物块的过程中显示坐标点, 相对于视窗
export function NewLocateCoordinate(evt, dx, dy, txtX, txtY){
  let objDiv;

  this.start = function(evt, dx, dy, txtX, txtY){
    objDiv = document.createElement('div');
    objDiv.className = 'coordinate';
    document.body.appendChild(objDiv);
    this.move(evt, dx, dy, txtX, txtY)
  }

  this.move = function(evt, dx, dy, txtX, txtY){
    let x = evt.pageX, y = evt.pageY;
    objDiv.innerHTML = `[${txtX.toFixed(0)}, ${txtY.toFixed(0)}]`;
    objDiv.style.display='block';
    objDiv.style.left = x - dx - objDiv.offsetWidth + 'px';
    objDiv.style.top = y - dy - objDiv.offsetHeight + 'px';
  }

  this.end = function(){
    // document.body.removeChild( objDiv );
    let J_coordinates = Array.from( document.getElementsByClassName('coordinate') );
    J_coordinates.forEach(div=>{
      div.parentNode.removeChild( div );
    });
  }
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

// 在一个canvas绘制的物块上改变尺寸 Size
export function DragChangeSize(canvas){
  let beInRect = false;
  let T = 5; // 容差值
  /*
  .----.----.
  \         \
  \         \
  .         .
  \         \
  \         \
  .----.----.
  */
  this.start = function(evt, rect){
    let mouse = {x:evt.offsetX, y:evt.offsetY};

    // 左上角 top left
    let topLeft = (mouse.x - rect.x) * (mouse.x - rect.x) + (mouse.y - rect.y) * (mouse.y - rect.y)
    // 右下角 bottom right
    let bottomRight = (mouse.x - (rect.x + rect.width)) * (mouse.x - (rect.x + rect.width)) + (mouse.y - (rect.y + rect.height)) * (mouse.y - (rect.y + rect.height));

    if(topLeft <= T * T || bottomRight <= T * T ){
      canvas.style.cursor='nwse-resize';
      return;
    }

    // 左下角
    let bottomLeft = (mouse.x - rect.x) * (mouse.x - rect.x) + (mouse.y - (rect.y + rect.height)) * (mouse.y - (rect.y + rect.height))
    // 右上角
    let topRight = (mouse.x - (rect.x + rect.width)) * (mouse.x - (rect.x + rect.width)) + (mouse.y - rect.y) * (mouse.y - rect.y)

    if( bottomLeft <= T * T || topRight <= T * T ){
      canvas.style.cursor='nesw-resize';
      return;
    }

  };

  this.move = function(evt){
    let mouse = {x:evt.offsetX, y:evt.offsetY};
    
  };

  this.end = function(evt){
    beInRect = false;
    canvas.style.cursor='default';
  };
}
