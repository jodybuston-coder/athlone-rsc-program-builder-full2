import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const RED = "#C8102E", BORDER = "#e6e6e6", BG = "#f7f7f8";

/** ---------------------------
 *  RESISTANCE LIBRARY
 *  --------------------------- */
const MACHINES = [
  "Half rack with adjustable bench","Full rack with adjustable bench","Smith machine",
  "Adjustable hack squat","Belt squat","Power plate","Adjustable bench","Incline bench",
  "Cable crossover","Assisted Dip/Chin","Split squat station","T calf raiser",
  "Incline Leg Press (plate loaded)","Chest press (plate loaded)","Low row",
  "Lat pulldown (plate loaded)","Shoulder press (plate loaded)","Seated lateral raise",
  "Abductor/Adductor machine","Leg ext / curl combo","Preacher curl (plate loaded)",
  "Glutes buster (plate loaded)","Glutes push back (plate loaded)","Calf and Tibia (plate loaded)",
  "Seated Leg ext / Leg Curl","Fixed weight bar tower","Hex Bar","Open-End Hex Bar",
  "T-Bar","Landmine Station","Free weights (2.5–60kg)","Kettlebells",
  "Bumper plates","Battle ropes","Cable machines (various)","Rope climb","Slam balls"
];

const by10 = arr => arr.slice(0,10);

/** Dumbbells (10 each muscle group) */
const DUMBBELLS = {
  Chest: by10([
    "Dumbbell Bench Press","Incline DB Press","Decline DB Press","DB Flye",
    "Incline DB Flye","DB Pullover","Neutral-Grip DB Press","Single-Arm DB Press",
    "DB Squeeze Press","Floor DB Press"
  ]),
  Back: by10([
    "One-Arm DB Row","DB Bent-Over Row","Chest-Supported DB Row","DB Pullover",
    "DB Reverse Flye","DB Seal Row","DB Deadlift","DB High Pull","DB Renegade Row","DB Shrug"
  ]),
  Legs: by10([
    "Goblet Squat","DB Romanian Deadlift","DB Lunge","DB Split Squat",
    "DB Step-Up","DB Front Squat","DB Hip Thrust","DB Sumo Squat","DB Box Squat","DB Calf Raise"
  ]),
  Shoulders: by10([
    "DB Shoulder Press","DB Arnold Press","DB Lateral Raise","DB Front Raise",
    "DB Rear-Delt Flye","DB Upright Row","DB Cuban Press","DB Push Press",
    "DB Y-Raise","DB W Press"
  ]),
  Arms: by10([
    "DB Biceps Curl","Incline DB Curl","Hammer Curl","DB Concentration Curl",
    "DB Preacher Curl","DB Skullcrusher","DB Overhead Triceps Ext","DB Kickback",
    "DB Reverse Curl","Zottman Curl"
  ]),
  Core: by10([
    "DB Russian Twist","DB Woodchop","DB Side Bend","DB Deadbug",
    "DB Sit-Up","DB Hollow Hold","DB Pallof Press (standing)","DB Suitcase Carry",
    "DB Turkish Sit-Up","DB Windmill (light)"
  ])
};

/** Barbells (10 each) */
const BARBELLS = {
  Chest: by10([
    "Barbell Bench Press","Incline Barbell Press","Close-Grip Bench","Paused Bench",
    "Spoto Press","Floor Press","Decline Barbell Press","Reverse-Grip Bench",
    "Board Press","Pin Press"
  ]),
  Back: by10([
    "Barbell Row","Pendlay Row","Yates Row","T-Bar Row (barbell)","Landmine Row",
    "Barbell High Pull","Barbell Deadlift","Snatch-Grip Deadlift","Rack Pull","Seal Row (barbell)"
  ]),
  Legs: by10([
    "Back Squat","Front Squat","Romanian Deadlift","Conventional Deadlift","Sumo Deadlift",
    "Barbell Lunge","Good Morning","Barbell Hip Thrust","Pause Squat","Box Squat"
  ]),
  Shoulders: by10([
    "Overhead Press","Push Press","Behind-Neck Press (cautious)","Bradford Press",
    "Z Press","Barbell Upright Row","Landmine Press","Seated OHP","Military Press","Half-Kneeling Landmine Press"
  ]),
  Arms: by10([
    "Barbell Curl","EZ-Bar Curl","Reverse Curl","Preacher Curl (barbell)","Drag Curl",
    "Close-Grip Bench Press","Skullcrusher (barbell)","JM Press","Lying Triceps Extension","Barbell French Press"
  ]),
  Core: by10([
    "Barbell Rollout","Landmine Rotation","Landmine Anti-Rotation","Suitcase Deadlift",
    "Overhead Walk (barbell)","Front Rack Carry (barbell)","Zercher Carry","Barbell Sit-Up (light)",
    "Barbell Russian Twist (light)","Overhead Squat (light)"
  ])
};

/** Kettlebells (10 each) */
const KETTLEBELLS = {
  Chest: by10([
    "KB Floor Press","KB Bench Press","KB Alternating Press","KB Squeeze Press",
    "KB Flye (floor)","KB Push-Up on Bells","KB Floor Flye","KB Close-Grip Press",
    "KB Crush Press","Half-Kneeling KB Press (chest focus)"
  ]),
  Back: by10([
    "KB Row","KB Gorilla Row","KB High Pull","KB Deadlift","KB Swing",
    "KB Clean","KB Snatch","KB Bent-Over Row","KB Suitcase Row","KB Renegade Row"
  ]),
  Legs: by10([
    "Goblet Squat","KB Front Squat (double)","KB Swing","KB Deadlift",
    "KB Lunge","KB Split Squat","KB Step-Up","KB Sumo Deadlift","KB Thruster","KB Single-Leg RDL"
  ]),
  Shoulders: by10([
    "KB Press","KB Push Press","KB See-Saw Press","KB Bottom-Up Press",
    "KB Halo","KB Windmill","KB Snatch (shoulder finish)","KB Clean & Press",
    "KB Upright Row","KB Lateral Raise (light)"
  ]),
  Arms: by10([
    "KB Curl","KB Hammer Curl","KB Zottman Curl","KB Skullcrusher",
    "KB Overhead Triceps Ext","KB Kickback","KB Reverse Curl","KB Concentration Curl",
    "KB Crush Curl","KB Tate Press (light)"
  ]),
  Core: by10([
    "Turkish Get-Up","KB Windmill","KB Russian Twist","KB Around-the-World",
    "KB Deadbug","KB Suitcase Carry","KB Farmer Carry","KB Overhead Carry",
    "KB Sit-Up","KB Side Bend"
  ])
};

/** Bodyweight (10 each) */
const BODYWEIGHT = {
  Chest: by10([
    "Push-Up","Incline Push-Up","Decline Push-Up","Diamond Push-Up","Archer Push-Up",
    "Wide Push-Up","Tempo Push-Up","Plyo Push-Up","Clap Push-Up","Slow Eccentric Push-Up"
  ]),
  Back: by10([
    "Pull-Up","Chin-Up","Inverted Row","Towel Row","Isometric Lat Hold",
    "Scapular Pull-Up","Reverse Snow Angels","Prone Y-T-W","Superman","Doorway Row (caution)"
  ]),
  Legs: by10([
    "Bodyweight Squat","Rear-Foot Elevated Split Squat","Walking Lunge","Reverse Lunge",
    "Cossack Squat","Step-Up","Single-Leg RDL (BW)","Wall Sit","Glute Bridge (BW)","Calf Raise (BW)"
  ]),
  Shoulders: by10([
    "Pike Push-Up","Handstand Hold (wall)","Wall Slides","Scapular Wall Slide",
    "Shoulder Taps","Y-T-W (wall)","Arm Circles","Plank to Down Dog","Elevated Pike Press","Cross-Body Reach"
  ]),
  Arms: by10([
    "Bench Dip (BW)","Diamond Push-Up","Chin-Up (biceps bias)","Isometric Curl (towel)",
    "Close-Grip Push-Up","Reverse Push-Up (table)","TRX Curl (if available)","TRX Triceps Ext (if available)","Negative Chin-Up","Doorway Isometric Curl"
  ]),
  Core: by10([
    "Plank","Side Plank","Hollow Hold","Deadbug","Bird Dog",
    "Crunch","Sit-Up","Russian Twist (no load)","Mountain Climber","V-Sit Hold"
  ])
};

/** Banded (10 each) */
const BANDED = {
  Chest: by10([
    "Band Chest Press","Band Flye","Band Push-Up","Band Squeeze Press","Band Floor Press",
    "Band Single-Arm Press","Band Incline Press (anchored)","Band Decline Press (anchored)",
    "Band Isometric Press","Band Crossover"
  ]),
  Back: by10([
    "Band Row","Band Lat Pulldown","Band Face Pull","Band Pull-Apart","Band High Row",
    "Band Straight-Arm Pulldown","Band Reverse Flye","Band Good Morning (back chain)","Band Deadlift (back chain)","Band Assisted Pull-Up"
  ]),
  Legs: by10([
    "Band Squat","Band Deadlift","Band RDL","Band Lateral Walk","Band Monster Walk",
    "Band Glute Bridge","Band Hip Thrust","Band Leg Extension","Band Leg Curl","Band Step-Out Squat"
  ]),
  Shoulders: by10([
    "Band Overhead Press","Band Lateral Raise","Band Front Raise","Band External Rotation",
    "Band Internal Rotation","Band Press-Out","Band Upright Row","Band Cuban Press",
    "Band Face Pull (light)","Band Scap Retraction"
  ]),
  Arms: by10([
    "Band Biceps Curl","Band Hammer Curl","Band Reverse Curl","Band Triceps Pressdown",
    "Band Overhead Triceps Ext","Band Kickback","Band JM Press (light)","Band Concentration Curl",
    "Band 21s Curl","Band Tate Press (light)"
  ]),
  Core: by10([
    "Band Pallof Press","Band Anti-Rotation Hold","Band Woodchop","Band Lift",
    "Band Deadbug (banded)","Band Hollow Hold Assist","Band Side Bend","Band Suitcase March",
    "Band Rotation","Band Stir-the-Pot (standing)"
  ])
};

const RESISTANCE_LIBRARY = {
  Machines: MACHINES,
  Dumbbells: DUMBBELLS,
  Barbells: BARBELLS,
  Kettlebells: KETTLEBELLS,
  Bodyweight: BODYWEIGHT,
  Banded: BANDED
};

/** ---------------------------
 *  CARDIO / MOBILITY LIBRARIES
 *  --------------------------- */
const CARDIO = [
  "Treadmill","Cross trainer","Skierg","Rowing machine","Assault Bike","Assault Runner",
  "Versa climber","Recumbent bike","Upright bike","Stair machine","Zero Runner"
];

const MOBILITY_MACHINES = [
  "Hamstring Stretch Machine","Hip Flexor Stretch Machine","Balance Master","Power Plate"
];

const FOAM_ROLLING_20 = [
  "Quads","Hamstrings","Glutes/Piriformis","Calves","IT Band (light)","TFL","Adductors",
  "Hip Flexors","Thoracic Spine (T-spine)","Lats","Upper Back (rhomboids)","Mid Back",
  "Lower Back (light)","Chest (pec minor, gentle)","Shins (tibialis anterior)",
  "Peroneals (outer calf)","Feet (plantar fascia)","Triceps (light)","Forearms (flexors/extensors)","Rear Delts"
];

const STRETCHES_20 = [
  "Standing Hamstring Stretch","Seated Hamstring Stretch","Quad Stretch (standing)",
  "Couch Stretch (hip flexor)","Calf Stretch (wall)","Figure-4 Glute Stretch",
  "Butterfly Groin Stretch","90/90 Hip Stretch","Chest Doorway Stretch","Lat Wall Stretch",
  "Triceps Overhead Stretch","Cross-Body Shoulder Stretch","Neck Lateral Stretch",
  "Cat-Cow","Child’s Pose","Cobra/Up-Dog","Thoracic Open Book","World’s Greatest Stretch",
  "Adductor Rock Back","Ankle Dorsiflexion Stretch (knee to wall)"
];

const JOINT_MOBILITY = {
  Ankle: ["Ankle Circles","Knee-to-Wall Dorsiflexion","Ankle CARs"],
  Knee: ["Terminal Knee Extension (band)","Knee CARs","Tibial Rotation Drill"],
  Hip: ["90/90 Switches","Hip CARs","Hip Airplanes (assisted)"],
  Shoulder: ["Shoulder CARs","Broomstick Pass-Throughs","Wall Slides"],
  Wrist: ["Wrist Extension/Flexion Rocks","Wrist Circles","Pronation/Supination"],
  "Thoracic Spine": ["T-Spine Rotations (open book)","Quadruped T-Spine Rotations","Prone Swimmers"]
};

/** ---------------------------
 *  APP
 *  --------------------------- */
function App(){
  const [tab, setTab] = useState("resistance");
  const [programName, setProgramName] = useState("New Program");
  const [recipient, setRecipient] = useState("");
  const [resItems, setResItems] = useState([]);
  const [carItems, setCarItems] = useState([]);
  const [mobItems, setMobItems] = useState([]);
  const previewRef = useRef(null);

  /** Helpers */
  const getIsMachines = (cat) => cat === "Machines";
  const getHasMuscleGroups = (cat) => !getIsMachines(cat);
  const listForCategory = (cat, group) => {
    if (getIsMachines(cat)) return RESISTANCE_LIBRARY.Machines;
    const lib = RESISTANCE_LIBRARY[cat] || {};
    return (group && lib[group]) ? lib[group] : [];
  };
  const muscleGroups = (cat) => getHasMuscleGroups(cat) ? Object.keys(RESISTANCE_LIBRARY[cat]) : [];

  /** Add rows */
  const addResistance = () => {
    const defaultCat = "Machines";
    const firstExercise = listForCategory(defaultCat)[0] || "";
    setResItems(s => [...s, {
      id: Date.now()+Math.random(),
      category: defaultCat,
      group: "",
      exercise: firstExercise,
      sets: 3,
      reps: 8,
      notes: ""
    }]);
  };
  const addCardio = () => {
    setCarItems(s => [...s, {
      id: Date.now()+Math.random(),
      equipment: CARDIO[0],
      duration: 10,
      intensity: "Moderate",
      notes: ""
    }]);
  };
  const addMobility = () => {
    setMobItems(s => [...s, {
      id: Date.now()+Math.random(),
      type: "Machines",
      joint: "",
      name: MOBILITY_MACHINES[0],
      duration: 60,
      unit: "seconds",
      notes: ""
    }]);
  };

  const upd = (setter,id,patch) => setter(s => s.map(x => x.id===id ? {...x, ...patch} : x));
  const del = (setter,id) => setter(s => s.filter(x => x.id !== id));

  function onDragEnd(result){
    const { source, destination } = result;
    if (!destination) return;
    const reorder=(list,start,end)=>{ const a=[...list]; const [r]=a.splice(start,1); a.splice(end,0,r); return a; };
    if (source.droppableId==='resistance' && destination.droppableId==='resistance') setResItems(s=>reorder(s,source.index,destination.index));
    if (source.droppableId==='cardio' && destination.droppableId==='cardio') setCarItems(s=>reorder(s,source.index,destination.index));
    if (source.droppableId==='mobility' && destination.droppableId==='mobility') setMobItems(s=>reorder(s,source.index,destination.index));
  }

  /** Exports */
  function exportCSV(){
    const rows = [];
    rows.push(["Program Name", programName], [], ["Resistance"], ["Category","Group","Exercise","Sets","Reps","Notes"]);
    resItems.forEach(r=>rows.push([r.category, r.group || "-", r.exercise, r.sets, r.reps, r.notes]));
    rows.push([], ["Cardio"], ["Equipment","Duration (min)","Intensity","Notes"]);
    carItems.forEach(c=>rows.push([c.equipment, c.duration, c.intensity, c.notes]));
    rows.push([], ["Mobility"], ["Type","Joint","Name","Duration","Unit","Notes"]);
    mobItems.forEach(m=>rows.push([m.type, m.joint || "-", m.name, m.duration, m.unit, m.notes]));
    const csv = rows.map(r=>r.map(cell=>`"${String(cell??"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${programName.replace(/\s+/g,"_")||"program"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function exportPDF(){
    if (!previewRef.current) return;
    const el = previewRef.current;
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation:"portrait", unit:"pt", format:"a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${programName.replace(/\s+/g,"_")||"program"}.pdf`);
  }

  async function emailPDF(){
    if (!recipient) { alert("Enter recipient email"); return; }
    const payload = { to: recipient, programName, resItems, carItems, mobItems };
    const r = await fetch("/.netlify/functions/sendProgramEmailPdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) { alert("Email failed: " + (j.error || "unknown")); return; }
    alert("Email sent with PDF.");
  }

  const Tab = ({k,children})=>(
    <button onClick={()=>setTab(k)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+BORDER,background:tab===k?"#fff":"#fafafa"}}>
      {children}
    </button>
  );

  return (
    <div style={{fontFamily:"Arial,sans-serif",minHeight:"100vh",background:BG}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        {/* Header */}
        <header style={{padding:24,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:RED,textAlign:"center"}}>Athlone RSC Program Builder</div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
            <input aria-label="Program name" value={programName} onChange={e=>setProgramName(e.target.value)} placeholder="Program name" style={{padding:8,border:"1px solid "+BORDER,borderRadius:8,minWidth:240}}/>
            <input aria-label="Recipient email" value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Recipient email" style={{padding:8,border:"1px solid "+BORDER,borderRadius:8,minWidth:240}}/>
            <button onClick={emailPDF} style={{padding:"8px 12px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Email PDF</button>
            <button onClick={exportCSV} style={{padding:"8px 12px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Export CSV</button>
            <button onClick={exportPDF} style={{padding:"8px 12px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Export PDF</button>
          </div>
          <nav style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
            <Tab k="resistance">Resistance</Tab>
            <Tab k="cardio">Cardio</Tab>
            <Tab k="mobility">Mobility</Tab>
            <Tab k="preview">Preview</Tab>
          </nav>
        </header>

        {/* Main */}
        <main style={{flex:1,padding:16}}>
          <DragDropContext onDragEnd={onDragEnd}>
            {/* RESISTANCE */}
            {tab==="resistance" && (
              <section>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <h3 style={{margin:0}}>Resistance</h3>
                  <button onClick={addResistance} style={{padding:"6px 10px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Add Exercise</button>
                </div>
                <Droppable droppableId="resistance">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {resItems.length===0 && <p style={{color:"#777"}}>No items yet.</p>}
                      {resItems.map((r,idx)=>(
                        <Draggable key={String(r.id)} draggableId={String(r.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{
                                background:"#fff", border:"1px solid "+BORDER, borderRadius:8, marginBottom:12, padding:12,
                                ...prov.draggableProps.style
                              }}
                            >
                              {/* Row 1: Category / (Group if needed) / Exercise / Sets / Reps / Delete */}
                              <div style={{display:"grid",gridTemplateColumns:getIsMachines(r.category) ? "180px 1fr 90px 90px auto" : "180px 160px 1fr 90px 90px auto", gap:8, alignItems:"center"}}>
                                <select
                                  value={r.category}
                                  onChange={(e)=>{
                                    const newCat = e.target.value;
                                    if (getIsMachines(newCat)) {
                                      const first = listForCategory(newCat)[0] || "";
                                      upd(setResItems, r.id, { category:newCat, group:"", exercise:first });
                                    } else {
                                      const groups = muscleGroups(newCat);
                                      const g = groups[0] || "";
                                      const first = listForCategory(newCat, g)[0] || "";
                                      upd(setResItems, r.id, { category:newCat, group:g, exercise:first });
                                    }
                                  }}
                                  style={{padding:8}}
                                >
                                  {Object.keys(RESISTANCE_LIBRARY).map(k=><option key={k} value={k}>{k}</option>)}
                                </select>

                                {!getIsMachines(r.category) && (
                                  <select
                                    value={r.group}
                                    onChange={(e)=>{
                                      const g = e.target.value;
                                      const first = listForCategory(r.category, g)[0] || "";
                                      upd(setResItems, r.id, { group:g, exercise:first });
                                    }}
                                    style={{padding:8}}
                                  >
                                    {muscleGroups(r.category).map(g=><option key={g} value={g}>{g}</option>)}
                                  </select>
                                )}

                                <select
                                  value={r.exercise}
                                  onChange={(e)=>upd(setResItems, r.id, { exercise:e.target.value })}
                                  style={{padding:8}}
                                >
                                  {listForCategory(r.category, r.group).map(ex=><option key={ex} value={ex}>{ex}</option>)}
                                </select>

                                <div>
                                  <div style={{fontSize:12,color:"#666"}}>Sets</div>
                                  <input type="number" value={r.sets} onChange={e=>upd(setResItems,r.id,{sets:Number(e.target.value)})} style={{padding:8,width:"100%"}}/>
                                </div>
                                <div>
                                  <div style={{fontSize:12,color:"#666"}}>Reps</div>
                                  <input type="number" value={r.reps} onChange={e=>upd(setResItems,r.id,{reps:Number(e.target.value)})} style={{padding:8,width:"100%"}}/>
                                </div>
                                <button onClick={()=>del(setResItems,r.id)} style={{padding:8,border:"1px solid #ccc",borderRadius:8,background:"#fff"}}>Delete</button>
                              </div>

                              {/* Notes full-width */}
                              <div style={{marginTop:8}}>
                                <div style={{fontSize:12,color:"#666",marginBottom:4}}>Notes / Coaching cues</div>
                                <textarea
                                  value={r.notes}
                                  onChange={e=>upd(setResItems,r.id,{notes:e.target.value})}
                                  rows={3}
                                  placeholder="Tempo, rest, RPE, coaching cues…"
                                  style={{width:"100%",padding:10,border:"1px solid "+BORDER,borderRadius:8,resize:"vertical"}}
                                />
                              </div>
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

            {/* CARDIO */}
            {tab==="cardio" && (
              <section>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <h3 style={{margin:0}}>Cardio</h3>
                  <button onClick={addCardio} style={{padding:"6px 10px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Add Cardio</button>
                </div>
                <Droppable droppableId="cardio">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {carItems.length===0 && <p style={{color:"#777"}}>No items yet.</p>}
                      {carItems.map((c,idx)=>(
                        <Draggable key={String(c.id)} draggableId={String(c.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{display:"grid",gridTemplateColumns:"1fr 160px 160px 1fr auto",gap:8,alignItems:"center",marginBottom:8,background:"#fff",padding:10,border:"1px solid "+BORDER,borderRadius:8,...prov.draggableProps.style}}>
                              <select value={c.equipment} onChange={e=>upd(setCarItems,c.id,{equipment:e.target.value})} style={{padding:8}}>
                                {CARDIO.map(x=><option key={x} value={x}>{x}</option>)}
                              </select>
                              <div><div style={{fontSize:12,color:"#666"}}>Duration (minutes)</div><input type="number" value={c.duration} onChange={e=>upd(setCarItems,c.id,{duration:Number(e.target.value)})} style={{padding:8}}/></div>
                              <div><div style={{fontSize:12,color:"#666"}}>Intensity</div>
                                <select value={c.intensity} onChange={e=>upd(setCarItems,c.id,{intensity:e.target.value})} style={{padding:8}}>
                                  <option>Low</option><option>Moderate</option><option>High</option>
                                </select>
                              </div>
                              <input placeholder="Notes" value={c.notes} onChange={e=>upd(setCarItems,c.id,{notes:e.target.value})} style={{padding:8}}/>
                              <button onClick={()=>del(setCarItems,c.id)} style={{padding:8,border:"1px solid #ccc",borderRadius:8,background:"#fff"}}>Delete</button>
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

            {/* MOBILITY */}
            {tab==="mobility" && (
              <section>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <h3 style={{margin:0}}>Mobility / Flexibility</h3>
                  <button onClick={addMobility} style={{padding:"6px 10px",border:"1px solid "+BORDER,borderRadius:8,background:"#fff"}}>Add Mobility</button>
                </div>
                <Droppable droppableId="mobility">
                  {(provided)=>(
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {mobItems.length===0 && <p style={{color:"#777"}}>No items yet.</p>}
                      {mobItems.map((m,idx)=>(
                        <Draggable key={String(m.id)} draggableId={String(m.id)} index={idx}>
                          {(prov)=>(
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:8,marginBottom:12,padding:12,...prov.draggableProps.style}}>
                              {/* Row 1: Type / (Joint if needed) / Name / Duration / Unit / Delete */}
                              <div style={{display:"grid",gridTemplateColumns: m.type==="Mobility (Joints)" ? "200px 200px 1fr 120px 120px auto" : "200px 1fr 120px 120px auto", gap:8, alignItems:"center"}}>
                                <select
                                  value={m.type}
                                  onChange={(e)=>{
                                    const t = e.target.value;
                                    if (t==="Machines"){
                                      upd(setMobItems,m.id,{ type:t, joint:"", name:MOBILITY_MACHINES[0] });
                                    } else if (t==="Foam Rolling"){
                                      upd(setMobItems,m.id,{ type:t, joint:"", name:FOAM_ROLLING_20[0] });
                                    } else if (t==="Stretches"){
                                      upd(setMobItems,m.id,{ type:t, joint:"", name:STRETCHES_20[0] });
                                    } else {
                                      const j0 = Object.keys(JOINT_MOBILITY)[0];
                                      upd(setMobItems,m.id,{ type:t, joint:j0, name:JOINT_MOBILITY[j0][0] });
                                    }
                                  }}
                                  style={{padding:8}}
                                >
                                  <option>Machines</option>
                                  <option>Foam Rolling</option>
                                  <option>Stretches</option>
                                  <option>Mobility (Joints)</option>
                                </select>

                                {m.type==="Mobility (Joints)" && (
                                  <select
                                    value={m.joint}
                                    onChange={(e)=>{
                                      const j = e.target.value;
                                      upd(setMobItems,m.id,{ joint:j, name:JOINT_MOBILITY[j][0] });
                                    }}
                                    style={{padding:8}}
                                  >
                                    {Object.keys(JOINT_MOBILITY).map(j=><option key={j} value={j}>{j}</option>)}
                                  </select>
                                )}

                                <select
                                  value={m.name}
                                  onChange={(e)=>upd(setMobItems,m.id,{name:e.target.value})}
                                  style={{padding:8}}
                                >
                                  {m.type==="Machines" && MOBILITY_MACHINES.map(x=><option key={x} value={x}>{x}</option>)}
                                  {m.type==="Foam Rolling" && FOAM_ROLLING_20.map(x=><option key={x} value={x}>{x}</option>)}
                                  {m.type==="Stretches" && STRETCHES_20.map(x=><option key={x} value={x}>{x}</option>)}
                                  {m.type==="Mobility (Joints)" && (JOINT_MOBILITY[m.joint]||[]).map(x=><option key={x} value={x}>{x}</option>)}
                                </select>

                                <div>
                                  <div style={{fontSize:12,color:"#666"}}>Duration</div>
                                  <input type="number" value={m.duration} onChange={e=>upd(setMobItems,m.id,{duration:Number(e.target.value)})} style={{padding:8,width:"100%"}}/>
                                </div>
                                <div>
                                  <div style={{fontSize:12,color:"#666"}}>Unit</div>
                                  <select value={m.unit} onChange={e=>upd(setMobItems,m.id,{unit:e.target.value})} style={{padding:8,width:"100%"}}>
                                    <option value="seconds">seconds</option>
                                    <option value="reps">reps</option>
                                    <option value="breaths">breaths</option>
                                  </select>
                                </div>
                                <button onClick={()=>del(setMobItems,m.id)} style={{padding:8,border:"1px solid #ccc",borderRadius:8,background:"#fff"}}>Delete</button>
                              </div>

                              {/* Notes */}
                              <div style={{marginTop:8}}>
                                <div style={{fontSize:12,color:"#666",marginBottom:4}}>Notes / Coaching cues</div>
                                <textarea
                                  value={m.notes}
                                  onChange={e=>upd(setMobItems,m.id,{notes:e.target.value})}
                                  rows={3}
                                  style={{width:"100%",padding:10,border:"1px solid "+BORDER,borderRadius:8,resize:"vertical"}}
                                />
                              </div>
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

          {/* PREVIEW */}
          {tab==="preview" && (
            <section ref={previewRef} style={{background:"#fff",padding:12,border:"1px solid "+BORDER,borderRadius:8,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,opacity:0.06,display:"flex",justifyContent:"center",alignItems:"center",pointerEvents:"none",fontSize:72,fontWeight:800,color:RED,transform:"rotate(-30deg)"}}>
                Athlone RSC
              </div>
              <div style={{position:"relative"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <img src="/assets/athlonr_logo.png" alt="logo" style={{height:40}} onError={e=>{e.currentTarget.style.display="none"}}/>
                  <div><div style={{color:RED,fontWeight:700}}>Athlone RSC Program Builder</div><div style={{fontSize:12,color:"#666"}}>Program Preview</div></div>
                </div>
                <h3 style={{margin:"6px 0"}}>{programName}</h3>

                <strong>Resistance</strong>
                <ul>
                  {resItems.length ? resItems.map(r=>(
                    <li key={r.id}>
                      {r.category}{r.group?` / ${r.group}`:""}: {r.exercise} — {r.sets} x {r.reps}
                      {r.notes ? <> <span style={{color:RED}}>Notes: {r.notes}</span></> : null}
                    </li>
                  )) : <li style={{color:"#999"}}>None</li>}
                </ul>

                <strong>Cardio</strong>
                <ul>
                  {carItems.length ? carItems.map(c=>(
                    <li key={c.id}>
                      {c.equipment} — {c.duration} minutes @ {c.intensity}
                      {c.notes ? <> <span style={{color:RED}}>Notes: {c.notes}</span></> : null}
                    </li>
                  )) : <li style={{color:"#999"}}>None</li>}
                </ul>

                <strong>Mobility</strong>
                <ul>
                  {mobItems.length ? mobItems.map(m=>(
                    <li key={m.id}>
                      {m.type}{m.joint?` / ${m.joint}`:""}: {m.name} — {m.duration} {m.unit}
                      {m.notes ? <> <span style={{color:RED}}>Notes: {m.notes}</span></> : null}
                    </li>
                  )) : <li style={{color:"#999"}}>None</li>}
                </ul>

                <div style={{fontSize:12,color:"#666",marginTop:8}}>Developed by Jody Buston</div>
              </div>
            </section>
          )}
        </main>

        <footer style={{padding:12,textAlign:"center",borderTop:"1px solid "+BORDER}}>
          <div style={{fontSize:13,color:RED}}>Athlone RSC Program Builder</div>
          <div style={{fontSize:12,color:"#777"}}>Developed by Jody Buston</div>
        </footer>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App/>);
