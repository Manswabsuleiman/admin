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

// ================= ROOT ROUTE (FIX) =================
app.get("/", (req, res) => {
  res.send("🚀 Medicore Backend is running");
});

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.post('/api/auth/login', (req, res) => {
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

    return res.json({
      token,
      role: 'doctor',
      user: { name: doctor.name }
    });
  }

  res.status(401).json({ message: "Invalid credentials" });
});
io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit('initialData', doctors);
  socket.emit('updateTotalPatients', totalPatientsCount);

  socket.on('appointmentBooked', (newAppt) => {
    totalPatientsCount += 1;

    io.emit('newAppointment', {
      ...newAppt,
      id: Date.now()
    });

    io.emit('updateTotalPatients', totalPatientsCount);
  });

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
