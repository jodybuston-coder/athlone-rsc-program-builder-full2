import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RED = '#C8102E', BORDER='#e6e6e6', BG='#f7f7f8';

function App(){
  const [tab,setTab]=useState('resistance');
  const [programName,setProgramName]=useState('New Program');
  const [res,setRes]=useState([]);
  const [car,setCar]=useState([]);
  const [mob,setMob]=useState([]);
  const previewRef = useRef(null);

  // Equipment lists (you can expand later)
  const RESISTANCE = [
    'Half rack with adjustable bench','Full rack with adjustable bench','Smith machine',
    'Adjustable hack squat','Belt squat','Power plate','Adjustable bench','Incline bench',
    'Cable crossover','Assisted Dip/Chin','Split squat station','T calf raiser',
    'Incline Leg Press (plate loaded)','Chest press (plate loaded)','Low row',
    'Lat pulldown (plate loaded)','Shoulder press (plate loaded)','Seated lateral raise',
    'Abductor/Adductor machine','Leg ext / curl combo','Preacher curl (plate loaded)',
    'Glutes buster','Glutes push back','Calf and Tibia (plate loaded)',
    'Seated Leg ext / Leg Curl','Fixed weight bar tower',
    'Hex Bar','Open-End Hex Bar','T-Bar','Landmine Station',
    'Free weights (2.5–60kg)','Kettlebells','Bumper plates','Battle ropes',
    'Cable machines (various)','Rope climb','Slam balls'
  ];
  const CARDIO = [
    'Treadmill','Cross trainer','Skierg','Rowing machine','Assault Bike','Assault Runner',
    'Versa climber','Recumbent bike','Upright bike','Stair machine','Zero Runner'
  ];
  const MOBILITY_MACHINES = [
    'Hamstring Stretch Machine','Hip Flexor Stretch Machine','Balance Master','Power Plate'
  ];

  const addRes=()=>setRes(s=>[...s,{id:Date.now()+Math.random(),equipment:RESISTANCE[0],sets:3,reps:8,notes:''}]);
  const addCar=()=>setCar(s=>[...s,{id:Date.now()+Math.random(),equipment:CARDIO[0],duration:10,intensity:'Moderate',notes:''}]);
  const addMob=()=>setMob(s=>[...s,{id:Date.now()+Math.random(),name:MOBILITY_MACHINES[0],duration:60,unit:'seconds',notes:''}]);

  const upd = (setter,id,patch)=>setter(s=>s.map(x=>x.id===id?{...x,...patch}:x));
  const del = (setter,id)=>setter(s=>s.filter(x=>x.id!==id));

  function onDragEnd(result){
    const { source, destination } = result;
    if(!destination) return;
    const reorder=(list,start,end)=>{ const a=[...list]; const [r]=a.splice(start,1); a.splice(end,0,r); return a; };
    if(source.droppableId==='resistance' && destination.droppableId==='resistance') setRes(s=>reorder(s, source.index, destination.index));
    if(source.droppableId==='cardio' && destination.droppableId==='cardio') setCar(s=>reorder(s, source.index, destination.index));
    if(source.droppableId==='mobility' && destination.droppableId==='mobility') setMob(s=>reorder(s, source.index, destination.index));
  }

  function exportCSV(){
    const rows = [];
    rows.push(['Program Name', programName], [], ['Resistance'], ['Equipment','Sets','Reps','Notes']);
    res.forEach(r=>rows.push([r.equipment,r.sets,r.reps,r.notes]));
    rows.push([], ['Cardio'], ['Equipment','Duration (min)','Intensity','Notes']);
    car.forEach(c=>rows.push([c.equipment,c.duration,c.intensity,c.notes]));
    rows.push([], ['Mobility'], ['Equipment','Duration','Unit','Notes']);
    mob.forEach(m=>rows.push([m.name,m.duration,m.unit,m.notes]));
    const csv = rows.map(r=>r.map(cell=>`"${String(cell??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${programName.replace(/\s+/g,'_')||'program'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function exportPDF(){
    if(!previewRef.current) return;
    const el = previewRef.current;
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`${programName.replace(/\s+/g,'_')||'program'}.pdf`);
  }

  const Tab = ({k,children})=>(
    <button onClick={()=>setTab(k)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid '+BORDER,background:tab===k?'#fff':'#fafafa'}}>
      {children}
    </button>
  );

  return (
    <div style={{fontFamily:'Arial,sans-serif',minHeight:'100vh',background:BG}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <header style={{padding:24,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{fontSize:28,fontWeight:800,color:RED,textAlign:'center'}}>Athlone RSC Program Builder</div>
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap',justifyContent:'center'}}>
            <input aria-label="Program name" value={programName} onChange={e=>setProgramName(e.target.value)} placeholder='Program name' style={{padding:8,border:'1px solid '+BORDER,borderRadius:8,minWidth:240}}/>
            <button onClick={exportCSV} style={{padding:'8px 12px',border:'1px solid '+BORDER,borderRadius:8,background:'#fff'}}>Export CSV</button>
            <button onClick={exportPDF} style={{padding:'8px 12px',border:'1px solid '+BORDER,borderRadius:8,background:'#fff'}}>Export PDF</button>
          </div>
          <nav style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap',justifyContent:'center'}}>
            <Tab k='resistance'>Resistance</Tab>
            <Tab k='cardio'>Cardio</Tab>
            <Tab k='mobility'>Mobility</Tab>
            <Tab k='preview'>Preview</Tab>
          </nav>
        </header>

        <main style={{flex:1,padding:16}}>
          <DragDropContext onDragEnd={onDragEnd}>
            {tab==='resistance' && (
              <section>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <h3 style={{margin:0}}>Resistance</h3>
                  <button onClick={addRes} style={{padding:'6px 10px',border:'1px solid '+BORDER,borderRadius:8,background:'#fff'}}>Add Exercise</button>
                </div>
                <Droppable droppableId="resistance">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {res.length===0 && <p style={{color:'#777'}}>No items yet.</p>}
                      {res.map((r,idx)=>(
                        <Draggable key={String(r.id)} draggableId={String(r.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{display:'grid',gridTemplateColumns:'1fr 90px 90px 1fr auto',gap:8,alignItems:'center',marginBottom:8,background:'#fff',padding:10,border:'1px solid '+BORDER,borderRadius:8,...prov.draggableProps.style}}>
                              <select value={r.equipment} onChange={e=>upd(setRes,r.id,{equipment:e.target.value})} style={{padding:8}}>
                                {RESISTANCE.map(x=><option key={x} value={x}>{x}</option>)}
                              </select>
                              <div><div style={{fontSize:12,color:'#666'}}>Sets</div><input type='number' value={r.sets} onChange={e=>upd(setRes,r.id,{sets:Number(e.target.value)})} style={{padding:8}}/></div>
                              <div><div style={{fontSize:12,color:'#666'}}>Reps</div><input type='number' value={r.reps} onChange={e=>upd(setRes,r.id,{reps:Number(e.target.value)})} style={{padding:8}}/></div>
                              <input placeholder='Notes' value={r.notes} onChange={e=>upd(setRes,r.id,{notes:e.target.value})} style={{padding:8}}/>
                              <button onClick={()=>del(setRes,r.id)} style={{padding:8,border:'1px solid #ccc',borderRadius:8,background:'#fff'}}>Delete</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </section>
            )}

            {tab==='cardio' && (
              <section>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <h3 style={{margin:0}}>Cardio</h3>
                  <button onClick={addCar} style={{padding:'6px 10px',border:'1px solid '+BORDER,borderRadius:8,background:'#fff'}}>Add Cardio</button>
                </div>
                <Droppable droppableId="cardio">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {car.length===0 && <p style={{color:'#777'}}>No items yet.</p>}
                      {car.map((c,idx)=>(
                        <Draggable key={String(c.id)} draggableId={String(c.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 1fr auto',gap:8,alignItems:'center',marginBottom:8,background:'#fff',padding:10,border:'1px solid '+BORDER,borderRadius:8,...prov.draggableProps.style}}>
                              <select value={c.equipment} onChange={e=>upd(setCar,c.id,{equipment:e.target.value})} style={{padding:8}}>
                                {CARDIO.map(x=><option key={x} value={x}>{x}</option>)}
                              </select>
                              <div><div style={{fontSize:12,color:'#666'}}>Duration (minutes)</div><input type='number' value={c.duration} onChange={e=>upd(setCar,c.id,{duration:Number(e.target.value)})} style={{padding:8}}/></div>
                              <div><div style={{fontSize:12,color:'#666'}}>Intensity</div><input value={c.intensity} onChange={e=>upd(setCar,c.id,{intensity:e.target.value})} style={{padding:8}}/></div>
                              <input placeholder='Notes' value={c.notes} onChange={e=>upd(setCar,c.id,{notes:e.target.value})} style={{padding:8}}/>
                              <button onClick={()=>del(setCar,c.id)} style={{padding:8,border:'1px solid #ccc',borderRadius:8,background:'#fff'}}>Delete</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </section>
            )}

            {tab==='mobility' && (
              <section>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <h3 style={{margin:0}}>Mobility / Flexibility</h3>
                  <button onClick={addMob} style={{padding:'6px 10px',border:'1px solid '+BORDER,borderRadius:8,background:'#fff'}}>Add Mobility</button>
                </div>
                <Droppable droppableId="mobility">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {mob.length===0 && <p style={{color:'#777'}}>No items yet.</p>}
                      {mob.map((m,idx)=>(
                        <Draggable key={String(m.id)} draggableId={String(m.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{display:'grid',gridTemplateColumns:'1fr 140px 140px 1fr auto',gap:8,alignItems:'center',marginBottom:8,background:'#fff',padding:10,border:'1px solid '+BORDER,borderRadius:8,...prov.draggableProps.style}}>
                              <select value={m.name} onChange={e=>upd(setMob,m.id,{name:e.target.value})} style={{padding:8}}>
                                {MOBILITY_MACHINES.map(x=><option key={x} value={x}>{x}</option>)}
                              </select>
                              <div><div style={{fontSize:12,color:'#666'}}>Duration</div><input type='number' value={m.duration} onChange={e=>upd(setMob,m.id,{duration:Number(e.target.value)})} style={{padding:8}}/></div>
                              <div><div style={{fontSize:12,color:'#666'}}>Unit</div>
                                <select value={m.unit} onChange={e=>upd(setMob,m.id,{unit:e.target.value})} style={{padding:8}}>
                                  <option value='seconds'>seconds</option>
                                  <option value='reps'>reps</option>
                                  <option value='breaths'>breaths</option>
                                </select>
                              </div>
                              <input placeholder='Notes' value={m.notes} onChange={e=>upd(setMob,m.id,{notes:e.target.value})} style={{padding:8}}/>
                              <button onClick={()=>del(setMob,m.id)} style={{padding:8,border:'1px solid #ccc',borderRadius:8,background:'#fff'}}>Delete</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </section>
            )}
          </DragDropContext>

          {tab==='preview' && (
            <section ref={previewRef} style={{background:'#fff',padding:12,border:'1px solid '+BORDER,borderRadius:8,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,opacity:0.06,display:'flex',justifyContent:'center',alignItems:'center',pointerEvents:'none',fontSize:72,fontWeight:800,color:RED,transform:'rotate(-30deg)'}}>
                Athlone RSC
              </div>
              <div style={{position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <img src='/assets/athlonr_logo.png' alt='logo' style={{height:40}} onError={e=>{e.currentTarget.style.display='none'}}/>
                  <div><div style={{color:RED,fontWeight:700}}>Athlone RSC Program Builder</div><div style={{fontSize:12,color:'#666'}}>Program Preview</div></div>
                </div>
                <h3 style={{margin:'6px 0'}}>{programName}</h3>
                <strong>Resistance</strong>
                <ul>{res.length?res.map(r=>(<li key={r.id}>{r.equipment} — {r.sets} x {r.reps}{r.notes?<> <span style={{color:RED}}>Notes: {r.notes}</span></>:null}</li>)):(<li style={{color:'#999'}}>None</li>)}</ul>
                <strong>Cardio</strong>
                <ul>{car.length?car.map(c=>(<li key={c.id}>{c.equipment} — {c.duration} minutes @ {c.intensity}{c.notes?<> <span style={{color:RED}}>Notes: {c.notes}</span></>:null}</li>)):(<li style={{color:'#999'}}>None</li>)}</ul>
                <strong>Mobility</strong>
                <ul>{mob.length?mob.map(m=>(<li key={m.id}>Machine: {m.name} — {m.duration} {m.unit}{m.notes?<> <span style={{color:RED}}>Notes: {m.notes}</span></>:null}</li>)):(<li style={{color:'#999'}}>None</li>)}</ul>
                <div style={{fontSize:12,color:'#666',marginTop:8}}>Developed by Jody Buston</div>
              </div>
            </section>
          )}
        </main>

        <footer style={{padding:12,textAlign:'center',borderTop:'1px solid '+BORDER}}>
          <div style={{fontSize:13,color:RED}}>Athlone RSC Program Builder</div>
          <div style={{fontSize:12,color:'#777'}}>Developed by Jody Buston</div>
        </footer>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
