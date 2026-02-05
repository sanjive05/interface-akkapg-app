import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save
} from "lucide-react";
import { addGuest } from "../services/guestService";

function AddGuest() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [guest, setGuest] = useState({
    // guestId removed - backend will generate it
    name: "", 
    dateOfBirth: "",
    age: "", 
    date: new Date().toISOString().split('T')[0],
    phoneNo: "",
    email: "", 
    address: "", 
    city: "", 
    aadhaarNo: "",
    roomId: "", 
    joiningDate: "", 
    vacatingDate: "",
    status: true, 
    advancePaid: "",
  });

  // Smart Age Calculation
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedGuest = { ...guest, [name]: type === "checkbox" ? checked : value };

    if (name === "dateOfBirth") {
      updatedGuest.age = calculateAge(value);
    }
    setGuest(updatedGuest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addGuest(guest);
      navigate("/guests");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      
      {/* Top Navigation Bar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <button onClick={() => navigate("/guests")} style={styles.iconBtn}>
            <ArrowLeft size={20} />
          </button>
          <div style={styles.breadcrumb}>
            <span style={{color: '#94a3b8'}}>Guests</span>
            <span style={{margin: '0 8px', color: '#cbd5e1'}}>/</span>
            <span style={{color: '#0f172a', fontWeight: 600}}>New Registration</span>
          </div>
        </div>
        <div style={styles.navRight}>
          <button style={styles.cancelBtn} onClick={() => navigate("/guests")}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Create Profile"}
          </button>
        </div>
      </div>

      <div style={styles.mainLayout}>
        
        {/* Left Column: Quick Profile & Context */}
        <div style={styles.sidebar}>
          <div style={styles.profileCard}>
            <div style={styles.avatarPlaceholder}>
              {guest.name ? guest.name.charAt(0).toUpperCase() : "G"}
            </div>
            <h3 style={styles.sidebarName}>{guest.name || "New Guest"}</h3>
            {/* Updated ID display to show it's auto-generated */}
            <p style={styles.sidebarId}>ID: <span style={{fontStyle: 'italic', color: '#94a3b8'}}>Auto-generated</span></p>
            <div style={styles.statusBadge(guest.status)}>
               {guest.status ? "Active Resident" : "Inactive"}
            </div>
          </div>

          <div style={styles.helperCard}>
            <h4 style={styles.helperTitle}>Quick Guide</h4>
            <ul style={styles.helperList}>
              <li>Ensure <strong>Aadhaar</strong> is verified.</li>
              <li><strong>Advance</strong> must be paid before check-in.</li>
              <li>Room <strong>{guest.roomId || "..."}</strong> will be locked.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: The Form */}
        <div style={styles.formContainer}>
          <form style={styles.formGrid}>
            
            {/* Group 1: Identity */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Personal Identity</h3>
              <div style={styles.row}>
                {/* Removed Guest ID Input, expanded Name to full width */}
                <FloatingInput label="Full Name" name="name" value={guest.name} onChange={handleChange} width="100%" />
              </div>
              <div style={styles.row}>
                <FloatingInput label="Date of Birth" type="date" name="dateOfBirth" value={guest.dateOfBirth} onChange={handleChange} width="48%" />
                <FloatingInput label="Age" value={guest.age} readOnly width="48%" bg="#f8fafc" />
              </div>
              <div style={styles.row}>
                <FloatingInput label="Aadhaar Number" name="aadhaarNo" value={guest.aadhaarNo} onChange={handleChange} width="100%" />
              </div>
            </div>

            {/* Group 2: Contact */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Contact Info</h3>
              <div style={styles.row}>
                <FloatingInput label="Phone Number" name="phoneNo" value={guest.phoneNo} onChange={handleChange} width="48%" />
                <FloatingInput label="Email Address" type="email" name="email" value={guest.email} onChange={handleChange} width="48%" />
              </div>
              <FloatingInput label="Permanent Address" name="address" value={guest.address} onChange={handleChange} width="100%" />
              <FloatingInput label="City" name="city" value={guest.city} onChange={handleChange} width="100%" />
            </div>

            {/* Group 3: Stay & Billing */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Residency & Billing</h3>
              <div style={styles.row}>
                <FloatingInput label="Room Number" name="roomId" value={guest.roomId} onChange={handleChange} width="30%" />
                <FloatingInput label="Joining Date" type="date" name="joiningDate" value={guest.joiningDate} onChange={handleChange} width="33%" />
                <FloatingInput label="Advance Payment (₹)" type="number" name="advancePaid" value={guest.advancePaid} onChange={handleChange} width="33%" />
              </div>
              
               <div style={styles.toggleRow}>
                  <label style={styles.toggleLabel}>
                    <input type="checkbox" name="status" checked={guest.status} onChange={handleChange} style={{marginRight: '10px'}} />
                    Mark resident as currently Active
                  </label>
               </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// Professional Floating Label Component
const FloatingInput = ({ label, width = "100%", bg = "#fff", ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  return (
    <div style={{ ...styles.inputWrapper, width, backgroundColor: bg }}>
      <label style={{
        ...styles.floatingLabel,
        top: (focused || hasValue) ? '6px' : '14px',
        fontSize: (focused || hasValue) ? '10px' : '14px',
        color: focused ? '#6366f1' : '#64748b'
      }}>
        {label}
      </label>
      <input 
        style={styles.floatingField} 
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props} 
      />
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    paddingBottom: "40px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navLeft: { display: "flex", alignItems: "center", gap: "16px" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  breadcrumb: { fontSize: "14px", display: "flex", alignItems: "center" },
  navRight: { display: "flex", gap: "12px" },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    color: "#475569",
    fontWeight: "500",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 20px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mainLayout: {
    display: "flex",
    maxWidth: "1100px",
    margin: "32px auto",
    gap: "32px",
    padding: "0 20px",
    alignItems: "flex-start",
  },
  sidebar: {
    width: "280px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px 20px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  avatarPlaceholder: {
    width: "80px",
    height: "80px",
    backgroundColor: "#f8fafc",
    color: "#cbd5e1",
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "700",
    border: "2px dashed #e2e8f0",
  },
  sidebarName: { margin: "0 0 4px", fontSize: "18px", color: "#0f172a" },
  sidebarId: { margin: "0 0 16px", fontSize: "13px", color: "#64748b" },
  statusBadge: (isActive) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: isActive ? "#dcfce7" : "#f1f5f9",
    color: isActive ? "#166534" : "#64748b",
  }),
  helperCard: {
    backgroundColor: "#f8fafc", // slightly different from white
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  helperTitle: { fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "12px" },
  helperList: { paddingLeft: "20px", margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.6" },
  
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    padding: "32px",
  },
  formGrid: { display: "flex", flexDirection: "column", gap: "40px" },
  group: { display: "flex", flexDirection: "column", gap: "20px" },
  groupTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "12px",
    marginBottom: "4px",
  },
  row: { display: "flex", gap: "20px", alignItems: "flex-start" },
  
  // Floating Input Styles
  inputWrapper: {
    position: "relative",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    height: "56px",
    transition: "border-color 0.2s",
  },
  floatingLabel: {
    position: "absolute",
    left: "14px",
    transition: "all 0.2s ease",
    pointerEvents: "none",
    fontWeight: "500",
  },
  floatingField: {
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
    padding: "20px 14px 4px", // Top padding makes room for label
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
    fontWeight: "500",
  },
  toggleRow: {
    marginTop: "8px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
  }
};

export default AddGuest;