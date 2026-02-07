import React from "react";

export default function Header({ view, setView, selectedMonth, changeMonth, onGenerateSummary }){
  return (
    <header className="header">
      <div style={{display:"flex",gap:8}}>
        <div style={{padding:6, background:"#f3f4f6", borderRadius:8}}>{view.toUpperCase()}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>changeMonth(-1)} className="small-btn">&lt;</button>
          <div style={{minWidth:180,textAlign:"center"}}>{selectedMonth.toLocaleString('default',{month:"long", year:"numeric"})}</div>
          <button onClick={()=>changeMonth(1)} className="small-btn">&gt;</button>
        </div>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button className="small-btn" onClick={onGenerateSummary}>AI Summary</button>
      </div>
    </header>
  );
}