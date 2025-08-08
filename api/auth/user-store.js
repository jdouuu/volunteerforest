const fs = require('fs');
const path = require('path');

// Path to shared user data (in production, use a database)
const USERS_FILE = path.join('/tmp', 'users.json');

// Default users
const defaultUsers = [
  {
    id: '1',
    email: 'admin@volunteer.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2', 
    email: 'volunteer@test.com',
    password: 'test123',
    role: 'volunteer',
    name: 'Test Volunteer'
  }
];

const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [...defaultUsers];
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

const findUser = (email, role) => {
  const users = loadUsers();
  return users.find(u => u.email === email && u.role === role);
};

const addUser = (userData) => {
  const users = loadUsers();
  const newUser = {
    id: String(Date.now()), // Use timestamp as ID
    ...userData
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

const generateSimpleToken = (id) => {
  return `simple_token_${id}_${Date.now()}`;
};

module.exports = {
  loadUsers,
  saveUsers,
  findUser,
  addUser,
  generateSimpleToken
};
