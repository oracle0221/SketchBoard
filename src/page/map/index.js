import React, {useEffect} from 'react';
import "styles/map.scss"
// import "./index.css"
import createDigitalMap from './map'

export default ()=>{

  useEffect(()=>{
    createDigitalMap();
  }, []);

  return (
    <>
      <div className="editor-box" >
          <div className="tools-top" >
              <div className="main_button" title="主菜单" >
                  <a >MENU</a>
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
              </ul>
          </div>
          <div className="workarea" >
              <canvas id="c1" ></canvas>
              <input type="text" autoComplete="off"  id="J_fill_text" />
          </div>
          <div className="tools-bottom">
              <span className="btn" id="ZoomOut" >+</span>
              <input type="text" id="J_input_zoom" />
              <span className="btn" id="ZoomIn" >-</span>
          </div>
      </div>
    </>
  );
};
