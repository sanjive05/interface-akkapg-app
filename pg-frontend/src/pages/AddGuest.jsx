import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Save 
} from "lucide-react";
import { addGuest } from "../services/guestService";

function AddGuest() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [guest, setGuest] = useState({
    guestId: "", name: "", age: "", date: "", phoneNo: "",
    email: "", address: "", city: "", aadhaarNo: "",
    roomId: "", joiningDate: "", vacatingDate: "",
    status: true, advancePaid: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuest({
      ...guest,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await addGuest(guest);
      navigate("/guests");
    } catch (error) {
      console.error("Error adding guest", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <header style={styles.header}>
          <button onClick={() => navigate("/guests")} style={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ marginLeft: '12px' }}>
            <h1 style={styles.title}>Register New Guest</h1>
            <p style={styles.subtitle}>Fill in the details to onboard a new resident</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Section: Identity */}
          <Section icon={<UserPlus size={20} />} title="Personal Information">
            <div style={styles.grid}>
              <Input label="Guest ID" name="guestId" placeholder="G-1001" onChange={handleChange} />
              <Input label="Full Name" name="name" placeholder="John Doe" onChange={handleChange} />
              <Input label="Age" type="number" name="age" placeholder="25" onChange={handleChange} />
              <Input label="Registration Date" type="date" name="date" onChange={handleChange} />
              <Input label="Phone" name="phoneNo" placeholder="+91 ..." onChange={handleChange} />
              <Input label="Email" type="email" name="email" placeholder="john@example.com" onChange={handleChange} />
            </div>
          </Section>

          {/* Section: Location */}
          <Section icon={<MapPin size={20} />} title="Address Details">
            <div style={styles.grid}>
              <Input label="Address" name="address" placeholder="Street/Area" onChange={handleChange} />
              <Input label="City" name="city" placeholder="City" onChange={handleChange} />
              <Input label="Aadhaar / ID Number" name="aadhaarNo" placeholder="0000 0000 0000" onChange={handleChange} />
            </div>
          </Section>

          {/* Section: Stay */}
          <Section icon={<Calendar size={20} />} title="Stay Configuration">
            <div style={styles.grid}>
              <Input label="Room Assigned" name="roomId" placeholder="Room No." onChange={handleChange} />
              <Input label="Joining Date" type="date" name="joiningDate" onChange={handleChange} />
              <Input label="Vacating Date" type="date" name="vacatingDate" onChange={handleChange} />
            </div>
          </Section>

          {/* Section: Payment */}
          <Section icon={<CreditCard size={20} />} title="Finance & Status">
            <div style={styles.grid}>
              <Input label="Advance Paid" type="number" name="advancePaid" placeholder="₹ 5000" onChange={handleChange} />
              <div style={styles.checkboxWrapper}>
                <span style={styles.label}>Account Status</span>
                <label style={styles.toggle}>
                  <input type="checkbox" name="status" checked={guest.status} onChange={handleChange} style={styles.hiddenCheckbox} />
                  <div style={{...styles.toggleSlider, backgroundColor: guest.status ? '#10b981' : '#cbd5e1'}}>
                    <div style={{...styles.toggleCircle, transform: guest.status ? 'translateX(20px)' : 'translateX(0px)'}} />
                  </div>
                  <span style={styles.toggleText}>{guest.status ? "Active" : "Inactive"}</span>
                </label>
              </div>
            </div>
          </Section>

          {/* Footer Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={() => navigate("/guests")} style={styles.secondaryBtn}>
              Discard
            </button>
            <button type="submit" style={styles.primaryBtn} disabled={saving}>
              {saving ? "Processing..." : (
                <><Save size={18} style={{ marginRight: '8px' }} /> Save Guest Details</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Component for cleaner code
const Input = ({ label, ...props }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <input style={styles.input} {...props} />
  </div>
);

// Reusable Section Component
const Section = ({ icon, title, children }) => (
  <div style={styles.sectionCard}>
    <div style={styles.sectionHeader}>
      <span style={styles.iconBox}>{icon}</span>
      <h3 style={styles.sectionTitle}>{title}</h3>
    </div>
    {children}
  </div>
);

const styles = {
  page: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "40px 20px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "32px",
  },
  backBtn: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#64748b",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    border: "1px solid #f1f5f9",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "12px",
  },
  iconBox: {
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#334155",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#fcfcfd",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "10px",
  },
  secondaryBtn: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontWeight: "600",
    color: "#64748b",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "12px 28px",
    backgroundColor: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(30, 41, 59, 0.2)",
  },
  checkboxWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  hiddenCheckbox: {
    display: "none",
  },
  toggleSlider: {
    width: "40px",
    height: "20px",
    borderRadius: "20px",
    padding: "2px",
    transition: "background-color 0.3s",
  },
  toggleCircle: {
    width: "16px",
    height: "16px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    transition: "transform 0.3s",
  },
  toggleText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  }
};

export default AddGuest;