require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Holiday = require('./Holiday');
const Vacation = require('./Vacation');
const axios = require('axios');
const Team = require('./Team');
const LeaveBalance = require('./LeaveBalance');
const User = require('./User');
const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Custom Prometheus metrics
const holidaysAddedCounter = new client.Counter({
  name: 'holidays_added_total',
  help: 'Total number of holidays added'
});
const holidaysDeletedCounter = new client.Counter({
  name: 'holidays_deleted_total',
  help: 'Total number of holidays deleted'
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Get all holidays
app.get('/holidays', async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new holiday
app.post('/holidays', async (req, res) => {
  try {
    const { name, date } = req.body;
    const holiday = new Holiday({ name, date });
    await holiday.save();
    holidaysAddedCounter.inc(); // Increment counter
    res.status(201).json(holiday);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a holiday by id
app.delete('/holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Holiday.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Holiday not found' });
    holidaysDeletedCounter.inc(); // Increment counter
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new endpoint to get the count of holidays per month
app.get('/holidays/monthly-count', async (req, res) => {
  try {
    const result = await Holiday.aggregate([
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Extract YYYY-MM from date
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory cache for official holidays
const officialHolidaysCache = {};
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// Endpoint to fetch official Indian national holidays from Calendarific
app.get('/holidays/official', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const now = Date.now();
    // Serve from cache if available and not expired
    if (
      officialHolidaysCache[year] &&
      (now - officialHolidaysCache[year].timestamp < CACHE_DURATION_MS)
    ) {
      return res.json({ holidays: officialHolidaysCache[year].data });
    }
    const apiKey = '7R5Hm4xdqTBGRJPSS3kGnIzOAVjg5STq';
    const url = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=IN&year=${year}`;
    const response = await axios.get(url);
    // Filter for national holidays
    const nationalHolidays = response.data.response.holidays.filter(
      h => h.type && h.type.includes('National holiday')
    );
    // Cache the result
    officialHolidaysCache[year] = {
      data: nationalHolidays,
      timestamp: now
    };
    res.json({ holidays: nationalHolidays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all teams
app.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add a new team
app.post('/teams', async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const team = new Team({ name, description, members });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete a team by id
app.delete('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Team not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vacation API endpoints

// Get all vacations for the authenticated user
app.get('/vacations', authenticateToken, async (req, res) => {
  try {
    // First try to find user-specific vacations
    let vacations = await Vacation.find({ user: req.user.userId }).sort({ fromDate: 1 });
    
    // If no user-specific vacations exist, check for global vacations (without user field)
    if (vacations.length === 0) {
      vacations = await Vacation.find({ user: { $exists: false } }).sort({ fromDate: 1 });
    }
    res.json(vacations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new vacation for the authenticated user
app.post('/vacations', authenticateToken, async (req, res) => {
  try {
    const { name, fromDate, toDate, leaveType, days } = req.body;
    
    // Try to create with user ID first, fallback to global if schema allows
    let vacation;
    try {
      vacation = new Vacation({ 
        user: req.user.userId,
        name, 
        fromDate, 
        toDate, 
        leaveType, 
        days 
      });
    } catch (schemaError) {
      // If schema validation fails for user field, create without it
      vacation = new Vacation({ 
        name, 
        fromDate, 
        toDate, 
        leaveType, 
        days 
      });
    }
    await vacation.save();
    res.status(201).json(vacation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a vacation (only for the authenticated user)
app.put('/vacations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fromDate, toDate, leaveType, days } = req.body;
    const vacation = await Vacation.findOneAndUpdate(
      { _id: id, user: req.user.userId }, 
      { name, fromDate, toDate, leaveType, days }, 
      { new: true, runValidators: true }
    );
    if (!vacation) return res.status(404).json({ error: 'Vacation not found' });
    res.json(vacation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a vacation by id (only for the authenticated user)
app.delete('/vacations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vacation.findOneAndDelete({ _id: id, user: req.user.userId });
    if (!deleted) return res.status(404).json({ error: 'Vacation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leave Balance API endpoints

// Get all leave balances for the authenticated user
app.get('/leave-balances', authenticateToken, async (req, res) => {
  try {
<<<<<<< HEAD
    // First try to find user-specific leave balances
    let leaveBalances = await LeaveBalance.find({ user: req.user.userId });
    
    // If no user-specific balances exist, check for global balances (without user field)
    if (leaveBalances.length === 0) {
      leaveBalances = await LeaveBalance.find({ user: { $exists: false } });
      
          // If global balances exist, return them (don't create duplicates)
    if (leaveBalances.length > 0) {
      console.log('Found global leave balances, returning them');
      console.log('Global balances found:', leaveBalances);
    } else {
        // Only create default ones if absolutely no balances exist anywhere
        console.log('No leave balances found anywhere, creating defaults');
        const defaultBalances = [
          { user: req.user.userId, leaveType: 'EL', balance: 15, description: 'Earned Leave' },
          { user: req.user.userId, leaveType: 'SL', balance: 7, description: 'Sick Leave' },
          { user: req.user.userId, leaveType: 'CL', balance: 3, description: 'Casual Leave' }
        ];
        
        for (const balance of defaultBalances) {
          const newBalance = new LeaveBalance(balance);
          await newBalance.save();
        }
        
        leaveBalances = await LeaveBalance.find({ user: req.user.userId });
      }
    }
    
    console.log('About to send response with leaveBalances:', leaveBalances);
    res.json(leaveBalances);
  } catch (err) {
    console.error('Error in GET /leave-balances:', err);
=======
    let leaveBalances = await LeaveBalance.find({ user: req.user.userId });
    
    // If no leave balances exist, create default ones for this user
    if (leaveBalances.length === 0) {
      const defaultBalances = [
        { user: req.user.userId, leaveType: 'EL', balance: 15, description: 'Earned Leave' },
        { user: req.user.userId, leaveType: 'SL', balance: 7, description: 'Sick Leave' },
        { user: req.user.userId, leaveType: 'CL', balance: 3, description: 'Casual Leave' }
      ];
      
      for (const balance of defaultBalances) {
        const newBalance = new LeaveBalance(balance);
        await newBalance.save();
      }
      
      leaveBalances = await LeaveBalance.find({ user: req.user.userId });
    }
    
    res.json(leaveBalances);
  } catch (err) {
>>>>>>> 71efb41ef4b12863e379382ab3336578a2548197
    res.status(500).json({ error: err.message });
  }
});

// Update leave balance for the authenticated user
app.put('/leave-balances/:leaveType', authenticateToken, async (req, res) => {
  try {
    const { leaveType } = req.params;
    const { balance } = req.body;
    
    if (balance < 0) {
      return res.status(400).json({ error: 'Leave balance cannot be negative' });
    }
    
<<<<<<< HEAD
    // First try to update existing global document (without user field)
    let updatedBalance = await LeaveBalance.findOneAndUpdate(
      { user: { $exists: false }, leaveType },
      { balance },
      { new: true, runValidators: true }
    );
    
    // If no global document exists, create a new one with user ID
    if (!updatedBalance) {
      updatedBalance = await LeaveBalance.findOneAndUpdate(
        { user: req.user.userId, leaveType },
        { balance, description: leaveType === 'EL' ? 'Earned Leave' : leaveType === 'SL' ? 'Sick Leave' : 'Casual Leave' },
        { new: true, upsert: true, runValidators: true }
      );
    }
    
=======
    const updatedBalance = await LeaveBalance.findOneAndUpdate(
      { user: req.user.userId, leaveType },
      { balance },
      { new: true, upsert: true, runValidators: true }
    );
    
>>>>>>> 71efb41ef4b12863e379382ab3336578a2548197
    res.json(updatedBalance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset leave balances to default values for the authenticated user
app.post('/leave-balances/reset', authenticateToken, async (req, res) => {
  try {
    const defaultBalances = [
      { user: req.user.userId, leaveType: 'EL', balance: 15, description: 'Earned Leave' },
      { user: req.user.userId, leaveType: 'SL', balance: 7, description: 'Sick Leave' },
      { user: req.user.userId, leaveType: 'CL', balance: 3, description: 'Casual Leave' }
    ];
    
    for (const balance of defaultBalances) {
      await LeaveBalance.findOneAndUpdate(
        { user: req.user.userId, leaveType: balance.leaveType },
        balance,
        { upsert: true, runValidators: true }
      );
    }
    
    const updatedBalances = await LeaveBalance.find({ user: req.user.userId });
    res.json(updatedBalances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Authentication Routes

// User Registration
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ name, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// For Vercel deployment, export the app
module.exports = app;

// Only start server if running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} 