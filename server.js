const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "users.json";

// ✅ Load users from file
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// ✅ Save users to file
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ---------------- ROUTES ----------------

// ✅ Register
app.post("/register", (req, res) => {
  let { fname, lname, email, username, password } = req.body;

  let users = loadUsers();
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  let newUser = { fname, lname, email, username, password }; // password stored but not exposed
  users.push(newUser);
  saveUsers(users);

  res.json({ message: "Registration successful" });
});

// ✅ Login
app.post("/login", (req, res) => {
  let { username, password } = req.body;

  let users = loadUsers();
  let user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Don’t send password back
  let safeUser = { ...user };
  delete safeUser.password;

  res.json({ message: "Login successful", user: safeUser });
});

// ✅ Update Profile
app.post("/updateProfile", (req, res) => {
  let { username, address, district, mobile } = req.body;

  let users = loadUsers();
  let index = users.findIndex(u => u.username === username);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Update only allowed fields
  users[index].address = address;
  users[index].district = district;
  users[index].mobile = mobile;

  saveUsers(users);

  res.json({ message: "Profile updated successfully" });
});

// ✅ Customer Details (Admin)
app.get("/customers", (req, res) => {
  let users = loadUsers();

  // hide passwords
  let safeUsers = users.map(u => {
    let copy = { ...u };
    delete copy.password;
    return copy;
  });

  res.json(safeUsers);
});

// ---------------- SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});