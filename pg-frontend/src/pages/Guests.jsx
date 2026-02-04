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
    } catch (error) {
      console.error("Error fetching guests:", error);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Guests</h2>
          <button
            style={styles.addButton}
            onClick={() => navigate("/add-guest")}
          >
            + Add Guest
          </button>
        </div>

        {loading ? (
          <div style={styles.message}>Loading guests...</div>
        ) : guests.length === 0 ? (
          <div style={styles.message}>No guests found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, index) => (
                <tr key={guest.guestId ?? index} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{guest.name}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.status,
                        backgroundColor: guest.status ? "#e8f5e9" : "#ffebee",
                        color: guest.status ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {guest.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "40px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "900px",
    margin: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#1f2937",
  },
  addButton: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #1976d2, #1565c0)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "14px",
  },
  tr: {
    transition: "background 0.2s",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  },
  status: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  message: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
  },
};

export default Guests;
