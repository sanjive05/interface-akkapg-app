export default function GuestCard({ guest }) {
  return (
    <div className="card">
      <h3>{guest.name}</h3>
      <p>{guest.message}</p>
    </div>
  );
}
// // <GuestCard guest={guest} />
