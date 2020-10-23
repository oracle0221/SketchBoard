import React,{useEffect} from 'react';
import {useHistory} from 'react-router-dom';

export default ()=>{

  const history = useHistory();
  history.push('/map')

  return (
    <div>这是首页</div>
  );
};
