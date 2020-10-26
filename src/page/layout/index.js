/* eslint-disable */
import React, {useEffect} from 'react';
import './index.scss';
import layout from './layout'

export default ()=>{

  useEffect(()=>{
    layout();
  }, []);

  return (
    <>
      <div>
        <div className="canvas" id="canvas" >
          <canvas id="mainCanvas" ></canvas>
          <canvas id="copyCanvas" ></canvas>
          <svg id="svg" >
            {/* 框选路径 */}
            <rect className="path-select" ></rect>
            <text className="path-text" x="0" y="15" >100 X 300</text>

          </svg>
        </div>
        <ul className="contextMenu" >
          <li><a href="#paste">粘贴</a></li>
        </ul>
        <div className="batchGoods" id="J_batchGoods" >
          <div className="tab-nav">
            <label>
              <span>横向</span>
              <input type="radio" name="radio_input" value="row" id="batch_row" />
            </label>
            <label>
              <span>纵向</span>
              <input type="radio" name="radio_input" value="col" id="batch_col" />
            </label>
            <div><input type="number" defaultValue="" id="batch_num_value" />排</div>
            <div className="w_h_div" >
              <div>
                长: <div><input type="number" defaultValue={80} id="batch_size_w" /></div>
              </div>
              <div>
                宽: <div><input type="number" defaultValue={40} id="batch_size_h" /></div>
              </div>
            </div>
          </div>
          <div className="footer" >
            <button type="button" id="batch_shut" >关闭</button>
            <button type="button" className="btn-primary" id="batch_save" >确定</button>
          </div>
        </div>
      </div>
    </>
  );
};
