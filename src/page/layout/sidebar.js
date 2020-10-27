// 处理上边与左边以下边这三条栏
import Var, {ModeEnum} from './constants'

const $ = document.getElementById.bind(document);

export function leftNavHandle(){
  const J_tools_ul = $('J_tools_ul');
  const a_tools_li = Array.from(J_tools_ul.getElementsByTagName('li'));

  a_tools_li.forEach((objLi, index)=>{
      objLi.onclick=()=>{
          a_tools_li.forEach(obj=>obj.classList.remove('current'));
          objLi.classList.add('current');

          Var.Menu_Mode_Left = ModeEnum[index]
          // currMode = ModeEnum[index];

      }
  });
}
