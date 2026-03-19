import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarCheck, Stethoscope, 
  LogOut, Users, MoreHorizontal, X, Bell, CheckCircle2
} from 'lucide-react';

const socket = io('https://admin-server-n95q.onrender.com');

const Dashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [showList, setShowList] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0); 
  
  const navigate = useNavigate();

  const playSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => console.log("Sound interaction required."));
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) navigate('/login');

    const saved = localStorage.getItem('local_appts');
    if (saved) setAppointmentsData(JSON.parse(saved));

    socket.on('initialData', (data) => setDoctors(data));

    socket.on('newAppointment', (newAppt) => {
      playSound();
      setAppointmentsData((prev) => {
        const updated = [newAppt, ...prev];
        localStorage.setItem('local_appts', JSON.stringify(updated));
        return updated;
      });
    });

    socket.on('doctorStatusUpdate', (updatedDoc) => {
      setDoctors((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    });

    socket.on('updateTotalPatients', (count) => setTotalPatients(count));

    return () => {
        socket.off('newAppointment');
        socket.off('doctorStatusUpdate');
        socket.off('updateTotalPatients');
    };
  }, [navigate]);

  // Action: Remove patient from list
  const completeAppointment = (id) => {
    const updated = appointmentsData.filter(appt => appt.id !== id);
    setAppointmentsData(updated);
    localStorage.setItem('local_appts', JSON.stringify(updated));
  };

  const styles = {
    layout: { display: 'flex', height: '100vh', backgroundColor: '#f4f7fe', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #eef2f6', padding: '24px' },
    main: { flex: 1, padding: '30px 40px', overflowY: 'auto' },
    logoContainer: { display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '12px' },
    navItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderRadius: '50px',
      backgroundColor: active ? '#99f6e4' : 'transparent', color: '#000',
      fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginBottom: '4px'
    }),
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' },
    summaryCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' },
    summaryValue: { fontSize: '24px', fontWeight: '800', color: '#000' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    doctorCard: { backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9' },
    badge: (status) => ({
      padding: '6px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: '800',
      backgroundColor: status === 'available' ? '#ecfdf5' : '#fef2f2',
      color: status === 'available' ? '#059669' : '#dc2626',
      display: 'flex', alignItems: 'center', gap: '6px'
    }),
    completeBtn: { 
      padding: '6px 12px', borderRadius: '8px', border: 'none', 
      backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', 
      alignItems: 'center', gap: '5px', color: '#475569', fontSize: '11px', fontWeight: '700'
    }
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img src="/Pictures/favicon.png" alt="logo" style={{ width: '28px' }} />
          <h2 style={{ color: '#000', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>MEDICORE</h2>
        </div>
        <nav>
          <div style={styles.navItem(true)}><LayoutDashboard size={18} /> Dashboard</div>
          <div style={styles.navItem(false)} onClick={() => setShowList(!showList)}><CalendarCheck size={18} /> Appointments</div>
          <div style={styles.navItem(false)}><Users size={18} /> Doctors</div>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ marginTop: '40px', border: 'none', background: 'none', color: '#f43f5e', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontWeight: '800', margin: 0 }}>Live Staff Overview</h1>
            <p style={{ color: '#666' }}>Real-time hospital monitoring</p>
          </div>
          <Bell size={24} color="#666" cursor="pointer" />
        </header>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>TOTAL PATIENTS <MoreHorizontal size={14}/></div>
            <div style={styles.summaryValue}>{totalPatients}</div>
          </div>
          <div style={styles.summaryCard} onClick={() => setShowList(!showList)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>LIVE QUEUE <MoreHorizontal size={14}/></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={styles.summaryValue}>{appointmentsData.length}</div>
              <span style={{ fontSize: '10px', color: '#0d9488', background: '#ccfbf1', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' }}>MANAGE</span>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>AVAILABLE BEDS <MoreHorizontal size={14}/></div>
            <div style={styles.summaryValue}>315</div>
          </div>
        </div>

        {showList && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', marginBottom: '30px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Live Appointment Queue</h3>
              <X size={20} cursor="pointer" onClick={() => setShowList(false)} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '11px', borderBottom: '2px solid #f8fafc' }}>
                  <th style={{ padding: '12px' }}>PATIENT NAME</th>
                  <th>SERVICE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsData.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Queue is empty</td></tr> : 
                  appointmentsData.map((appt) => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{appt.patientName}</td>
                      <td>{appt.doctor}</td>
                      <td>{appt.date}</td>
                      <td><span style={{ color: '#059669', fontWeight: 'bold', fontSize: '11px' }}>{appt.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button style={styles.completeBtn} onClick={() => completeAppointment(appt.id)}>
                          <CheckCircle2 size={14} /> Clear
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>On-Duty Doctors</h2>
        <div style={styles.cardGrid}>
          {doctors.map((doc) => (
            <div key={doc.id} style={styles.doctorCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stethoscope size={20} color={doc.status === 'available' ? '#0f172a' : '#cbd5e1'} />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: doc.status === 'available' ? '#0f172a' : '#64748b' }}>{doc.name}</h3>
                </div>
                <span style={styles.badge(doc.status)}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: doc.status === 'available' ? '#10b981' : '#ef4444' }} />
                  {doc.status === 'available' ? 'Online' : 'Offline'}
                </span>
              </div>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Specialty</span>
                  <span style={{ fontWeight: '700' }}>{doc.service}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Shift Start</span>
                  <span style={{ fontWeight: '700' }}>{doc.startTime || '--:--'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
