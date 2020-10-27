// 处理上边与左边以下边这三条栏
import Var, {ModeEnum, Mode_Batch} from './constants'

const $ = document.getElementById.bind(document);

export function leftNavHandle(){
  const J_tools_ul = $('J_tools_ul');
  const a_tools_li = Array.from(J_tools_ul.getElementsByTagName('li'));

  a_tools_li.forEach((objLi, index)=>{
      objLi.onclick=()=>{
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
          // currMode = ModeEnum[index];

      }
  });
}
