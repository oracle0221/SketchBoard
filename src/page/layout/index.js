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
              <div>
                <div><input type="number" defaultValue="" id="batch_row_num" />行</div>
              </div>
            </label>
            <label>
              <span>纵向</span>
              <input type="radio" name="radio_input" value="col" id="batch_col" />
              <div>
                <div><input type="number" defaultValue="" id="batch_col_num" />列</div>
              </div>
            </label>
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
