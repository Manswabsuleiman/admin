const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const SECRET_KEY = "MEDICORE_ADMIN_SECRET";


let doctors = [
  { id: 1, name: "Dr. Shantel Kristen", email: "manswab@medicore.co.ke", password: "123", status: "Online", service: "General", startTime: null },
  { id: 2, name: "Dr. Selem", email: "shamim@medicore.co.ke", password: "123", status: "Online", service: "Surgery", startTime: null }
];

let totalPatientsCount = 0; 

const admins = [
  { email: "admin@medicore.co.ke", password: "adminpassword" }
];

// --- AUTH ROUTE ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const adminAccount = admins.find(a => a.email === email && a.password === password);
  if (adminAccount) {
    const token = jwt.sign({ email: adminAccount.email, role: 'admin' }, SECRET_KEY, { expiresIn: '12h' });
    return res.json({ token, role: 'admin' });
  }

  const doctor = doctors.find(d => d.email === email && d.password === password);
  if (doctor) {
    doctor.status = 'available'; 
    doctor.startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const token = jwt.sign({ id: doctor.id, role: 'doctor' }, SECRET_KEY, { expiresIn: '12h' });
    
    io.emit('doctorStatusUpdate', doctor); 
    return res.json({ token, role: 'doctor', user: { name: doctor.name } });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

// --- SOCKET LOGICS ---
io.on('connection', (socket) => {
  socket.emit('initialData', doctors);
  socket.emit('updateTotalPatients', totalPatientsCount);

  socket.on('appointmentBooked', (newAppt) => {
    totalPatientsCount += 1;
    io.emit('newAppointment', { ...newAppt, id: Date.now() });
    io.emit('updateTotalPatients', totalPatientsCount);
  });
});

server.listen(5000, () => console.log("🚀 Server updated and running on Port 5000"));