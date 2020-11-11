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
      <div className="editor-box" >
          <div className="tools-top" >
              <div className="main_button" title="主菜单" >
                  <a >MENU</a>
              </div>
              <div className="sep" ></div>
              <div className="top_button tool_undo" id="J_tool_undo" >
                <div className="img" ></div>
              </div>
              <div className="top_button tool_redo" id="J_tool_redo" >
                <div className="img" ></div>
              </div>
              <div className="sep" ></div>
              <div className="search_bar" >
                  <ul>
                      <li>
                          <span>Search Locations:</span>
                          <input type="text" id="J_search_goods" />
                      </li>
                  </ul>
              </div>
          </div>
          <div className="tools-left" >
              <ul id="J_tools_ul">
                  <li id="J_tool_select" className="tool_button current" title="选择工具" >
                      <div className="img select" ></div>
                  </li>
                  <li id="J_tool_location" className="tool_button" title="Location" >
                      <div className="img location" ></div>
                  </li>
                  <li id="J_tool_barrier" className="tool_button" title="Barrier" >
                      <div className="img barrier" ></div>
                  </li>
                  <li id="J_tool_text" className="tool_button" title="文字工具">
                      <div className="img text" ></div>
                  </li>
                  <li id="J_tool_zoom" className="tool_button" title="缩放工具">
                      <div className="img zoom" ></div>
                  </li>
                  <li id="J_tool_batch" className="tool_button" title="批量生成">
                      <div className="img batch" ></div>
                  </li>
                  <li id="J_tool_panning" className="tool_button" title="Panning">
                      <div className="img panning" ></div>
                  </li>
              </ul>
          </div>
          <div className="workarea" >
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
              <ul className="contextAlign" id="J_select_contextAlign" >
                <li data-align="topAlign" ><a>顶部对齐</a></li>
                <li data-align="leftAlign" ><a>居左对齐</a></li>
                <li data-align="bottomAlign" ><a>底部对齐</a></li>
                <li data-align="rightAlign" ><a>居右对齐</a></li>
                <li data-align="" className="separator" ></li>
                <li data-align="horizonAlign" ><a>水平对齐</a></li>
                <li data-align="verticalAlign" ><a>竖直对齐</a></li>
              </ul>
              <div className="goods_form" id="J_goods_form" >
                <div>
                  <label>
                    宽:
                    <input type="number" id="goods_form_w" defaultValue={80} />
                  </label>
                </div>
                <div>
                  <label>
                    高:
                    <input type="number" id="goods_form_h" defaultValue={40} />
                  </label>
                </div>
                <div>
                  <button type="button">关闭</button>
                </div>
              </div>
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
                  <div className="section" ><input type="number" defaultValue="" id="batch_cell_value" />单元格</div>
                  <div className="section" ><input type="number" defaultValue="" id="batch_num_value" />排</div>
                  <div className="w_h_div section" >
                    <div>
                      长: <div><input type="number" defaultValue={80} id="batch_size_w" /></div>
                    </div>
                    <div>
                      宽: <div><input type="number" defaultValue={40} id="batch_size_h" /></div>
                    </div>
                  </div>
                  <div className="section" >
                    过道:
                    <div>
                      <input type="number" defaultValue={50} id="batch_aisle" /> aisle
                    </div>
                  </div>
                </div>
                <div className="footer" >
                  <button type="button" id="batch_shut" >关闭</button>
                  <button type="button" className="btn-primary" id="batch_save" >确定</button>
                </div>
              </div>
            </div>
            <textarea type="text" autoComplete="off"  id="J_fill_text" />
          </div>
          <div className="tools-bottom">
              <span className="btn" id="ZoomOut" >+</span>
              <input type="number" defaultValue={1} id="J_input_zoom" readOnly={true} />
              <span className="btn" id="ZoomIn" >-</span>
          </div>
      </div>
    </>
  );
};
