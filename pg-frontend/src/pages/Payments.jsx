import React from "react";

export default function Payments({ paymentRecords, generateBills, exportXlsx }){
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1>Monthly Payments</h1>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={generateBills}>Generate Bills</button>
          <button className="btn" onClick={exportXlsx}>Export XLSX</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Guest</th><th>Rent</th><th>Food</th><th>Electricity</th><th>Total</th></tr>
          </thead>
          <tbody>
            {paymentRecords.map(r=>(
              <tr key={r.id}>
                <td>{r.guestName}<div style={{color:"#6b7280",fontSize:12}}>Room {r.roomName}</div></td>
                <td>₹{r.rentAmount}</td>
                <td>{r.statusFood==="na" ? "N/A" : `₹${r.foodAmount}`}</td>
                <td>{r.electricityBill ? `₹${r.electricityBill}` : "₹0"}</td>
                <td>₹{ (r.statusRent==="unpaid"?r.rentAmount:0) + (r.statusFood==="unpaid"?r.foodAmount:0) + (r.statusElectricity==="unpaid"?r.electricityBill:0) }</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}