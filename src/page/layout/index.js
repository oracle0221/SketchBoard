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
              <div className="main_button" title="Menu" >
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
              <div className="lang-div" >
                <select id="J_language_select" defaultValue="en" >
                  <option value="en" >ENG</option>
                  <option value="ko" >한국어</option>
                </select>
              </div>
          </div>
          {/*<div className="tools-left" >
              <ul id="J_tools_ul">
                  <li id="J_tool_select" className="tool_button current" title="选择工具" language="tool_select_button" >
                      <div className="img select" ></div>
                  </li>
                  <li id="J_tool_location" className="tool_button" title="Location" language="tool_location_button" >
                      <div className="img location" ></div>
                  </li>
                  <li id="J_tool_barrier" className="tool_button" title="Barrier" language="tool_barrier_button" >
                      <div className="img barrier" ></div>
                  </li>
                  <li id="J_tool_text" className="tool_button" title="文字工具" language="tool_text_button" >
                      <div className="img text" ></div>
                  </li>
                  <li id="J_tool_zoom" className="tool_button" title="缩放工具" language="tool_zoom_button" >
                      <div className="img zoom" ></div>
                  </li>
                  <li id="J_tool_batch" className="tool_button" title="批量生成" language="tool_batch_button" >
                      <div className="img batch" ></div>
                  </li>
                  <li id="J_tool_panning" className="tool_button" title="Panning" language="tool_pan_button" >
                      <div className="img panning" ></div>
                  </li>
              </ul>
          </div>*/}
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
                <li data-copy="" ><a>复制</a></li>
                <li data-cut="" ><a>剪切</a></li>
                <li data-paste="" ><a>粘贴</a></li>
                <li data-align="" className="separator" ></li>
                <li data-align="topAlign" ><a language="top_align" >顶部对齐</a></li>
                <li data-align="leftAlign" ><a language="left_align" >居左对齐</a></li>
                <li data-align="bottomAlign" ><a language="bottom_align" >底部对齐</a></li>
                <li data-align="rightAlign" ><a language="right_align" >居右对齐</a></li>
                <li data-align="" className="separator" ></li>
                <li data-align="horizonAlign" ><a language="horizon_align" >水平对齐</a></li>
                <li data-align="verticalAlign" ><a language="vertical_align" >竖直对齐</a></li>
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
                  <button type="button" language="label_shut" >关闭</button>
                </div>
              </div>
              <div className="batchGoods" id="J_batchGoods" >
                <div className="tab-nav">
                  <label>
                    <span language="label_horizon" >横向</span>
                    <input type="radio" name="radio_input" value="row" id="batch_row" />
                  </label>
                  <label>
                    <span language="label_vertical" >纵向</span>
                    <input type="radio" name="radio_input" value="col" id="batch_col" />
                  </label>
                  <div className="section" ><input type="number" defaultValue="" id="batch_cell_value" /><span className="sec-span" language="label_cell" >单元格</span><input placeholder="列起始编号" type="number" defaultValue="" id="batch_cell_startindex" /></div>
                  <div className="section" ><input type="number" defaultValue="" id="batch_num_value" /><span className="sec-span" language="label_Rows" >排</span><input placeholder="行起始编号" type="number" defaultValue="" id="batch_cell_endindex" /></div>
                  <div className="w_h_div section" >
                    <div>
                      <span language="label_width" >宽</span>: <div><input type="number" defaultValue={80} id="batch_size_w" /></div>
                    </div>
                    <div>
                      <span language="label_height" >高</span>: <div><input type="number" defaultValue={40} id="batch_size_h" /></div>
                    </div>
                  </div>
                  <div className="section" >
                    <span language="label_aisle" >过道</span>:
                    <div>
                      <input type="number" defaultValue={50} id="batch_aisle" /> aisle
                    </div>
                  </div>
                </div>
                <div className="footer" >
                  <button type="button" id="batch_shut" language="label_cancel" >关闭</button>
                  <button type="button" className="btn-primary" id="batch_save" language="label_ok" >确定</button>
                </div>
              </div>
            </div>
            <textarea type="text" autoComplete="off"  id="J_fill_text" />
          </div>
          <div className="tools-bottom" >
              <span className="btn" id="ZoomIn" >+</span>
              <input type="number" defaultValue={1} id="J_input_zoom" readOnly={true} />
              <span className="btn" id="ZoomOut" >-</span>
          </div>
          {/* 放大与缩小 */}
          <div className="widget-zoom" id="J_widget_zoom" >
              <button type="button" className="zoomin"  id="J_zoomin" >+</button>
              <div className="slider" id="J_slider_box" >
                <a id="J_slider_grab" ></a>
              </div>
              <button type="button" className="zoomout" id="J_zoomout" >-</button>
              <div className="show-zoom-slider" id="J_toShowSlider" >
                <p>缩放</p>
                <a>显示滑块</a>
              </div>
              <div className="show-zoom-slider" id="J_toHideSlider" >
                <p>缩放</p>
                <a>隐藏滑块</a>
              </div>
          </div>
          {/* 多语言 */}
          <div className="translations-div" >
            <div className="inner-div" >
              <span></span>
              <ol>
                <li>
                  <label>
                    <input type="radio" name="translations_input" value="en" defaultChecked/>
                    <b>ENG</b>
                  </label>
                </li>
                <li>
                  <label>
                    <input type="radio" name="translations_input" value="ko" />
                    <b>한국어</b>
                  </label>
                </li>
              </ol>
            </div>
          </div>
          <div className="section-cardbox" id="J_section_cardbox" >
            <ul>
              <li className="current" >
                <div>
                  <dt>
                    <div className="img select" title="选择工具" language="tool_select_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_select_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img location" title="Location" language="tool_location_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_location_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img barrier" title="Barrier" language="tool_barrier_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_barrier_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img text" title="文字工具" language="tool_text_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_text_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img zoom" title="缩放工具" language="tool_zoom_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_zoom_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img batch" title="批量生成" language="tool_batch_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_batch_button"></p>*/}
                  </dd>
                </div>
              </li>
              <li>
                <div>
                  <dt>
                    <div className="img panning" title="Panning" language="tool_pan_button" ></div>
                  </dt>
                  <dd>
                    {/*<p language="tool_pan_button"></p>*/}
                  </dd>
                </div>
              </li>
            </ul>
            <button className="show-side-nav side-nav" id="J_show_sideNav" ></button>
            <button className="hide-side-nav side-nav" id="J_hide_sideNav" ></button>
          </div>
      </div>
    </>
  );
};
