import React, { useState } from "react";

export default function Electricity({ rooms, guests, applyBill }){
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1>Electricity</h1>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Room</th><th>Guests</th><th>Last</th><th>Current</th><th>Action</th></tr></thead>
          <tbody>
            {rooms.map(room=>(
              <RoomRow key={room.id} room={room} guests={guests.filter(g=>g.roomId===room.id)} applyBill={applyBill} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomRow({ room, guests, applyBill }){
  const [last,setLast] = useState('');
  const [current,setCurrent] = useState('');
  return (
    <tr>
      <td>Room {room.name}</td>
      <td>{guests.map(g=>g.name).join(", ") || "Empty"}</td>
      <td><input className="input" value={last} onChange={e=>setLast(e.target.value)} /></td>
      <td><input className="input" value={current} onChange={e=>setCurrent(e.target.value)} /></td>
      <td><button className="btn" onClick={()=>applyBill(room.id,last,current)}>Apply</button></td>
    </tr>
  );
}