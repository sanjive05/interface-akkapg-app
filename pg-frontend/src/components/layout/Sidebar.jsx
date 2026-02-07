import React from "react";

export default function Sidebar({ rooms, selectedRoomId, setSelectedRoomId, setView }){
  return (
    <aside className="sidebar">
      <div style={{marginBottom:12}}>
        <h2 style={{color:"#4f46e5",margin:0}}>AKKA PG Admin</h2>
        <small style={{color:"#6b7280"}}>Guest Management</small>
      </div>

      <div style={{marginTop:8}}>
        <button className="small-btn" onClick={()=>setSelectedRoomId("all")}>All Guests</button>
      </div>

      <div style={{marginTop:12, flex:1}}>
        <h4 style={{margin:"12px 0 6px 0", color:"#6b7280", fontSize:12}}>Rooms</h4>
        {rooms.map(r=>(
          <div key={r.id} className="room-item" style={{background: selectedRoomId===r.id ? "#eef2ff" : "transparent"}}>
            <div>
              <div style={{fontWeight:700}}>Room {r.name}</div>
              <div style={{fontSize:12,color:"#6b7280"}}>{r.capacity} beds {r.isAC ? "• AC":""}</div>
            </div>
            <div>
              <button className="small-btn" onClick={()=>setSelectedRoomId(r.id)}>View</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <button className="btn" style={{width:"100%",marginBottom:8}} onClick={()=>setView("dashboard")}>Dashboard</button>
        <button className="btn" style={{width:"100%",marginBottom:8}} onClick={()=>setView("payments")}>Payments</button>
        <button className="btn" style={{width:"100%"}} onClick={()=>setView("electricity")}>Electricity</button>
      </div>
    </aside>
  );
}