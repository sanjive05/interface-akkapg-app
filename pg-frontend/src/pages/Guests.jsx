import MainLayout from "../components/layout/MainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGuests } from "../services/guestService";

function Guests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const response = await getAllGuests();
      setGuests(response.data || []);
    } catch (e) {
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <h2>Guests</h2>

      <button onClick={() => navigate("/add-guest")}>
        + Add Guest
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        guests.map((g) => (
          <div key={g.guestId}>{g.name}</div>
        ))
      )}
    </MainLayout>
  );
}

export default Guests;
