import React from 'react';
import { createRoot } from 'react-dom/client';

function App(){
  return (
    <div style={{fontFamily:'Arial',textAlign:'center',marginTop:'20vh'}}>
      <h1 style={{color:'#C8102E'}}>Athlone RSC Program Builder</h1>
      <p>Developed by Jody Buston</p>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
