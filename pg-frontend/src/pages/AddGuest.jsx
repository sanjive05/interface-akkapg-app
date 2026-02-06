import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { addGuest } from "../services/guestService";
import MainLayout from "../components/layout/MainLayout";

function AddGuest() {
  return(
    <MainLayout>
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [guest, setGuest] = useState({
    name: "", 
    gender: "", // Added Gender Field
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
      
      {/* Top Navbar */}
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
        
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.profileCard}>
            <div style={styles.avatarPlaceholder}>
              {guest.name ? guest.name.charAt(0).toUpperCase() : "G"}
            </div>
            <h3 style={styles.sidebarName}>{guest.name || "New Guest"}</h3>
            <p style={styles.sidebarId}>ID: <span style={{fontStyle: 'italic', color: '#94a3b8'}}>Auto-generated</span></p>
            <div style={styles.statusBadge(guest.status)}>
               {guest.status ? "Active Resident" : "Inactive"}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div style={styles.formContainer}>
          <form style={styles.formGrid}>
            
            {/* Identity Section */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Personal Identity</h3>
              
              <div style={styles.row}>
                {/* Name takes 70%, Gender takes 30% */}
                <FloatingInput label="Full Name" name="name" value={guest.name} onChange={handleChange} width="65%" />
                
                <FloatingSelect 
                  label="Gender" 
                  name="gender" 
                  value={guest.gender} 
                  onChange={handleChange} 
                  width="35%"
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHERS", label: "Others" }
                  ]}
                />
              </div>

              <div style={styles.row}>
                <FloatingInput label="Date of Birth" type="date" name="dateOfBirth" value={guest.dateOfBirth} onChange={handleChange} width="48%" />
                <FloatingInput label="Age" value={guest.age} readOnly width="48%" bg="#f8fafc" />
              </div>
              
              <div style={styles.row}>
                <FloatingInput label="Aadhaar Number" name="aadhaarNo" value={guest.aadhaarNo} onChange={handleChange} width="100%" />
              </div>
            </div>

            {/* Contact Section */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Contact Info</h3>
              <div style={styles.row}>
                <FloatingInput label="Phone Number" name="phoneNo" value={guest.phoneNo} onChange={handleChange} width="48%" />
                <FloatingInput label="Email Address" type="email" name="email" value={guest.email} onChange={handleChange} width="48%" />
              </div>
              <FloatingInput label="Permanent Address" name="address" value={guest.address} onChange={handleChange} width="100%" />
            </div>

            {/* Stay Section */}
            <div style={styles.group}>
              <h3 style={styles.groupTitle}>Residency Details</h3>
              <div style={styles.row}>
                 <FloatingInput label="Room Number" name="roomId" value={guest.roomId} onChange={handleChange} width="30%" />
                 <FloatingInput label="Joining Date" type="date" name="joiningDate" value={guest.joiningDate} onChange={handleChange} width="33%" />
                 <FloatingInput label="Advance (₹)" type="number" name="advancePaid" value={guest.advancePaid} onChange={handleChange} width="33%" />
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
  </MainLayout>)
}

// --- COMPONENTS ---

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

// NEW: Floating Select Component for Gender
const FloatingSelect = ({ label, options, width = "100%", bg = "#fff", ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value !== "";

  return (
    <div style={{ ...styles.inputWrapper, width, backgroundColor: bg }}>
      <label style={{
        ...styles.floatingLabel,
        top: (focused || hasValue) ? '6px' : '14px',
        fontSize: (focused || hasValue) ? '10px' : '14px',
        color: focused ? '#6366f1' : '#64748b',
        zIndex: 1 
      }}>
        {label}
      </label>
      <select 
        style={{...styles.floatingField, appearance: 'none', backgroundColor: 'transparent'}} // 'appearance: none' hides default arrow in some browsers
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props} 
      >
        <option value="" disabled hidden></option> {/* Empty placeholder option */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      {/* Custom Chevron Icon for Dropdown */}
      <div style={{position: 'absolute', right: '14px', top: '18px', pointerEvents: 'none'}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
};

const styles = {
  // ... (Same styles as previous response)
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "40px" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 },
  navLeft: { display: "flex", alignItems: "center", gap: "16px" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  breadcrumb: { fontSize: "14px", display: "flex", alignItems: "center" },
  navRight: { display: "flex", gap: "12px" },
  cancelBtn: { padding: "8px 16px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#475569", fontWeight: "500", cursor: "pointer" },
  saveBtn: { padding: "8px 20px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" },
  mainLayout: { display: "flex", maxWidth: "1100px", margin: "32px auto", gap: "32px", padding: "0 20px", alignItems: "flex-start" },
  sidebar: { width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "24px" },
  profileCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "32px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" },
  avatarPlaceholder: { width: "80px", height: "80px", backgroundColor: "#f8fafc", color: "#cbd5e1", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700", border: "2px dashed #e2e8f0" },
  sidebarName: { margin: "0 0 4px", fontSize: "18px", color: "#0f172a" },
  sidebarId: { margin: "0 0 16px", fontSize: "13px", color: "#64748b" },
  statusBadge: (isActive) => ({ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: isActive ? "#dcfce7" : "#f1f5f9", color: isActive ? "#166534" : "#64748b" }),
  formContainer: { flex: 1, backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", padding: "32px" },
  formGrid: { display: "flex", flexDirection: "column", gap: "40px" },
  group: { display: "flex", flexDirection: "column", gap: "20px" },
  groupTitle: { fontSize: "16px", fontWeight: "600", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "4px" },
  row: { display: "flex", gap: "20px", alignItems: "flex-start" },
  
  // Input Styles
  inputWrapper: { position: "relative", border: "1px solid #e2e8f0", borderRadius: "8px", height: "56px", transition: "border-color 0.2s" },
  floatingLabel: { position: "absolute", left: "14px", transition: "all 0.2s ease", pointerEvents: "none", fontWeight: "500" },
  floatingField: { width: "100%", height: "100%", border: "none", background: "transparent", padding: "20px 14px 4px", fontSize: "15px", color: "#1e293b", outline: "none", fontWeight: "500" },
};

export default AddGuest;