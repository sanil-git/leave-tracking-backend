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
// Remove PORT for Vercel serverless functions
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

// Updated CORS for production - allow Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://leave-tracking-frontend.vercel.app',
    'https://leave-tracking-frontend-git-main-sanil-git.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB Atlas with better error handling for serverless functions
let cachedDb = null;

const connectToDatabase = async () => {
  try {
    // If we already have a connection and it's ready, use it
    if (cachedDb && mongoose.connection.readyState === 1) {
      return cachedDb;
    }

    // Close existing connection if it exists but isn't ready
    if (cachedDb) {
      await mongoose.disconnect();
      cachedDb = null;
    }

    // Create new connection with very short timeouts for serverless
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 1, // Limit connections for serverless
      serverSelectionTimeoutMS: 2000, // 2 second timeout for serverless
      socketTimeoutMS: 10000, // 10 second timeout
      bufferCommands: true, // Enable buffering for compatibility
      connectTimeoutMS: 2000, // 2 second connection timeout
    });
    
    cachedDb = connection;
    console.log('Connected to MongoDB Atlas!');
    return connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Ensure database connection for each request with aggressive timeout
const ensureConnection = async () => {
  try {
    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    // For serverless, always try a fresh connection with very short timeout
    const connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 3000, // 3 seconds max
      socketTimeoutMS: 8000, // 8 seconds max
      connectTimeoutMS: 3000, // 3 seconds max
      bufferCommands: false, // Disable buffering for immediate feedback
    });

    // Race against a 4-second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout - serverless function limit')), 4000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('Connection established successfully');
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  }
};

// Initialize database connection and wait for it to be ready
const initializeDatabase = async () => {
  try {
    await connectToDatabase();
    console.log('MongoDB connection is ready!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Start database initialization
initializeDatabase();

// Wait for connection to be ready before handling requests
mongoose.connection.once('open', () => {
  console.log('MongoDB connection is open and ready!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

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
    // First try to find user-specific leave balances
    let leaveBalances = await LeaveBalance.find({ user: req.user.userId });
    
    // If no user-specific balances exist, check for global balances (without user field)
    if (leaveBalances.length === 0) {
      const globalBalances = await LeaveBalance.find({ user: { $exists: false } });
      leaveBalances = globalBalances;
    }
    
    res.json(leaveBalances);
  } catch (err) {
    console.error('Leave balances error:', err);
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
    
    // First try to find and update existing user-specific balance
    let updatedBalance = await LeaveBalance.findOneAndUpdate(
      { user: req.user.userId, leaveType },
      { balance },
      { new: true, runValidators: true }
    );
    
    // If no user-specific balance exists, check for global balance
    if (!updatedBalance) {
      const globalBalance = await LeaveBalance.findOne({ user: { $exists: false }, leaveType });
      
      if (globalBalance) {
        // Create a user-specific copy of the global balance
        updatedBalance = new LeaveBalance({
          user: req.user.userId,
          leaveType: globalBalance.leaveType,
          balance: balance,
          description: globalBalance.description
        });
        await updatedBalance.save();
      } else {
        // Create a new user-specific balance
        updatedBalance = new LeaveBalance({
          user: req.user.userId,
          leaveType,
          balance,
          description: `${leaveType} Leave`
        });
        await updatedBalance.save();
      }
    }
    
    res.json(updatedBalance);
  } catch (err) {
    console.error('Update leave balance error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Reset leave balances for the authenticated user
app.post('/leave-balances/reset', authenticateToken, async (req, res) => {
  try {
    // Delete user-specific leave balances
    await LeaveBalance.deleteMany({ user: req.user.userId });
    
    // Return empty array since no defaults are created
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to see all leave balances in database
app.get('/debug/leave-balances', async (req, res) => {
  try {
    const allBalances = await LeaveBalance.find({});
    res.json({
      total: allBalances.length,
      balances: allBalances.map(b => ({
        id: b._id,
        leaveType: b.leaveType,
        user: b.user || 'global',
        balance: b.balance,
        description: b.description
      }))
    });
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
    // Ensure database connection is ready
    await ensureConnection();
    
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
    // Ensure database connection is ready with timeout
    const isConnected = await ensureConnection();
    
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'Database connection failed. Please try again in a few seconds.',
        details: 'Serverless function connection timeout'
      });
    }
    
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
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed due to server error',
      details: err.message 
    });
  }
});

// Get current user profile
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    // Ensure database connection is ready
    await ensureConnection();
    
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

// Health check endpoint to test database connection
app.get('/health', async (req, res) => {
  try {
    // Ensure we have a connection
    const isConnected = await ensureConnection();
    
    if (!isConnected) {
      return res.status(503).json({ 
        status: 'unhealthy', 
        database: 'connection_failed',
        readyState: mongoose.connection.readyState,
        message: 'Failed to establish database connection',
        timestamp: new Date().toISOString()
      });
    }

    // Test database connection
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      readyState: mongoose.connection.readyState,
      message: 'Database connection is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'error',
      readyState: mongoose.connection.readyState,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed connection test endpoint
app.get('/test-connection', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test 1: Check if we can reach the MongoDB URI
    const mongoUri = process.env.MONGO_URI;
    const hasMongoUri = !!mongoUri;
    
    // Test 2: Try to connect with detailed logging
    let connectionResult = 'not_attempted';
    let connectionError = null;
    let connectionTime = 0;
    
    try {
      const connectStart = Date.now();
      await mongoose.connect(mongoUri, {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000,
      });
      connectionTime = Date.now() - connectStart;
      connectionResult = 'success';
    } catch (err) {
      connectionError = err.message;
      connectionResult = 'failed';
    }
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      status: 'connection_test',
      mongoUri: hasMongoUri ? 'present' : 'missing',
      connectionResult,
      connectionTime: `${connectionTime}ms`,
      totalTime: `${totalTime}ms`,
      error: connectionError,
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'test_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// For Vercel deployment, export the app
module.exports = app;

// Start server for Render deployment
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://0.0.0.0:${PORT}`);
}); 