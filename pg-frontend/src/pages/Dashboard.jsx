import GuestCard from "../components/guests/GuestCard";

export default function Dashboard({ guests, openGuestForm }){
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1>All Guests</h1>
        <button className="btn" onClick={openGuestForm}>Add New Guest</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12}}>
        {guests.map(g=> <GuestCard key={g.id} guest={g} />)}
      </div>
    </div>
  );
}