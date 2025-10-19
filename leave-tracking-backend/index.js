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
const RoleChangeLog = require('./RoleChangeLog');
const Notification = require('./Notification');
const app = express();
// Remove PORT for Vercel serverless functions
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const { exec } = require('child_process');
const path = require('path');
const { getCachedInsights, cacheInsights, invalidateCache, getCacheStats } = require('./redis-client');
const WeatherAnalyzer = require('./weather-analyzer');
const { requireManager, requireAdmin } = require('./roleMiddleware');

// Notification helper function
const createNotification = async (userId, type, title, message, data = {}, relatedId = null, relatedType = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      relatedId,
      relatedType,
      priority: type.includes('urgent') || type.includes('rejected') ? 'high' : 'medium'
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Initialize Weather AI
const weatherAnalyzer = new WeatherAnalyzer();

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

// Updated CORS for production - allow Vercel frontend and all subdomains
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3006',
    'https://leave-tracking-frontend.vercel.app',
    'https://leave-tracking-frontend-git-main-sanil-git.vercel.app',
    'https://leave-tracking-frontend-ejjjaqums-sanil-manaktalas-projects.vercel.app',
    /^https:\/\/leave-tracking-frontend.*\.vercel\.app$/ // Allow all Vercel subdomains
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
    const { name, destination, fromDate, toDate, leaveType, days } = req.body;
    
    // Get user details to find their manager
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create vacation with manager assignment
    const vacation = new Vacation({ 
      user: req.user.userId,
      name, 
      destination,
      fromDate, 
      toDate, 
      leaveType, 
      days,
      managerId: user.managerId || user._id, // Use user's manager or self if no manager
      status: 'pending',
      submittedAt: new Date()
    });
    
    await vacation.save();
    
    // Create notification for manager
    if (user.managerId && user.managerId.toString() !== user._id.toString()) {
      await createNotification(
        user.managerId,
        'leave_submitted',
        'New Leave Request',
        `${user.name} has submitted a leave request for ${days} day(s) from ${fromDate} to ${toDate}`,
        {
          vacationId: vacation._id,
          userName: user.name,
          userEmail: user.email,
          leaveType,
          days,
          fromDate,
          toDate,
          destination
        },
        vacation._id,
        'vacation'
      );
    }
    
    // Create notification for user
    await createNotification(
      req.user.userId,
      'leave_submitted',
      'Leave Request Submitted',
      `Your leave request for ${days} day(s) from ${fromDate} to ${toDate} has been submitted for approval`,
      {
        vacationId: vacation._id,
        leaveType,
        days,
        fromDate,
        toDate,
        destination
      },
      vacation._id,
      'vacation'
    );
    
    res.status(201).json(vacation);
  } catch (err) {
    console.error('Create vacation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Leave Approval API endpoints

// Get pending leave requests for manager
app.get('/api/leaves/pending', authenticateToken, requireManager, async (req, res) => {
  try {
    const pendingLeaves = await Vacation.find({ 
      status: 'pending',
      managerId: req.user.userId 
    })
    .populate('user', 'name email')
    .sort({ submittedAt: -1 });
    
    res.json(pendingLeaves);
  } catch (error) {
    console.error('Get pending leaves error:', error);
    res.status(500).json({ error: 'Failed to fetch pending leaves' });
  }
});

// Approve a leave request
app.put('/api/leaves/:leaveId/approve', authenticateToken, requireManager, async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { reason } = req.body;
    
    const leave = await Vacation.findById(leaveId)
      .populate('user', 'name email')
      .populate('managerId', 'name email');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    // Check if user is the manager of this leave request
    if (leave.managerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to approve this leave request' });
    }
    
    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request is not pending' });
    }
    
    // Update leave status
    leave.status = 'approved';
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();
    await leave.save();
    
    // Create notification for employee
    await createNotification(
      leave.user._id,
      'leave_approved',
      'Leave Request Approved',
      `Your leave request for ${leave.days} day(s) from ${leave.fromDate} to ${leave.toDate} has been approved`,
      {
        vacationId: leave._id,
        leaveType: leave.leaveType,
        days: leave.days,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        destination: leave.destination,
        approvedBy: leave.managerId.name
      },
      leave._id,
      'vacation'
    );
    
    res.json({
      message: 'Leave request approved successfully',
      leave: {
        _id: leave._id,
        status: leave.status,
        approvedBy: leave.approvedBy,
        approvedAt: leave.approvedAt
      }
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

// Reject a leave request
app.put('/api/leaves/:leaveId/reject', authenticateToken, requireManager, async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const leave = await Vacation.findById(leaveId)
      .populate('user', 'name email')
      .populate('managerId', 'name email');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    // Check if user is the manager of this leave request
    if (leave.managerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to reject this leave request' });
    }
    
    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request is not pending' });
    }
    
    // Update leave status
    leave.status = 'rejected';
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();
    leave.rejectionReason = reason;
    await leave.save();
    
    // Create notification for employee
    await createNotification(
      leave.user._id,
      'leave_rejected',
      'Leave Request Rejected',
      `Your leave request for ${leave.days} day(s) from ${leave.fromDate} to ${leave.toDate} has been rejected. Reason: ${reason}`,
      {
        vacationId: leave._id,
        leaveType: leave.leaveType,
        days: leave.days,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        destination: leave.destination,
        rejectedBy: leave.managerId.name,
        rejectionReason: reason
      },
      leave._id,
      'vacation'
    );
    
    res.json({
      message: 'Leave request rejected successfully',
      leave: {
        _id: leave._id,
        status: leave.status,
        approvedBy: leave.approvedBy,
        approvedAt: leave.approvedAt,
        rejectionReason: leave.rejectionReason
      }
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
});

// Get user's notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { userId: req.user.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.userId, 
      isRead: false 
    });
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: skip + notifications.length < total,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ 
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Update a vacation (only for the authenticated user)
app.put('/vacations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fromDate, toDate, leaveType, days, destination } = req.body;
    
    // NEW: Invalidate cache if critical fields changed
    if (fromDate || toDate || destination) {
      await invalidateCache(id);
    }
    
    const vacation = await Vacation.findOneAndUpdate(
      { _id: id, user: req.user.userId }, 
      { name, fromDate, toDate, leaveType, days, destination }, 
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
    
    // NEW: Invalidate cache before deleting
    await invalidateCache(id);
    
    const deleted = await Vacation.findOneAndDelete({ _id: id, user: req.user.userId });
    if (!deleted) return res.status(404).json({ error: 'Vacation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Management API endpoints

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamName: user.teamId?.name || 'Unassigned',
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (Admin only)
app.put('/api/admin/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, reason } = req.body;
    
    // Validate role
    if (!['employee', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const oldRole = user.role;
    user.role = role;
    await user.save();
    
    // Create audit log entry
    const roleChangeLog = new RoleChangeLog({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      oldRole: oldRole,
      newRole: role,
      changedBy: req.user._id,
      changedByEmail: req.user.email,
      reason: reason || 'No reason provided',
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    await roleChangeLog.save();
    
    // Log the role change to console as well
    console.log(`Admin ${req.user.email} changed user ${user.email} role from ${oldRole} to ${role}. Reason: ${reason || 'No reason provided'}`);
    
    res.json({
      message: 'Role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      change: {
        from: oldRole,
        to: role,
        changedBy: req.user.email,
        reason: reason || 'No reason provided',
        timestamp: new Date()
      },
      auditLogId: roleChangeLog._id
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Temporary Password Management API endpoints

// Get users with temporary passwords (for managers/admins to view)
app.get('/api/users/temp-passwords', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    let query = {
      tempPassword: { $exists: true, $ne: null },
      tempPasswordCreatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    };
    
    // Managers can only see users they created
    if (role === 'manager') {
      query.tempPasswordCreatedBy = req.user.userId;
    }
    // Admins can see all temporary passwords
    
    const users = await User.find(query)
      .select('name email role tempPassword tempPasswordCreatedAt teamId')
      .populate('tempPasswordCreatedBy', 'name email')
      .populate('teamId', 'name')
      .sort({ tempPasswordCreatedAt: -1 });
    
    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tempPassword: user.tempPassword,
        tempPasswordCreatedAt: user.tempPasswordCreatedAt,
        createdBy: user.tempPasswordCreatedBy,
        team: user.teamId
      }))
    });
  } catch (error) {
    console.error('Get temp passwords error:', error);
    res.status(500).json({ error: 'Failed to fetch temporary passwords' });
  }
});

// Clear temporary password (when user changes password)
app.put('/api/users/:userId/clear-temp-password', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only allow the user themselves, their manager, or an admin to clear temp password
    if (userId !== req.user.userId && user.managerId?.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    user.tempPassword = null;
    user.tempPasswordCreatedBy = null;
    user.tempPasswordCreatedAt = null;
    user.needsPasswordReset = false;
    
    await user.save();
    
    res.json({ success: true, message: 'Temporary password cleared' });
  } catch (error) {
    console.error('Clear temp password error:', error);
    res.status(500).json({ error: 'Failed to clear temporary password' });
  }
});

// Team Management API endpoints

// Create a new team (for managers/admins)
app.post('/api/teams', authenticateToken, requireManager, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    // Check if user already has a team as manager
    const existingTeam = await Team.findOne({ managerId: req.user.userId });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already manage a team' });
    }
    
    // Create new team
    const team = new Team({
      name: name.trim(),
      description: description?.trim() || '',
      managerId: req.user.userId,
      members: [req.user.userId] // Add the manager as the first member
    });
    
    await team.save();
    
    // Update user's teamId and managerId
    await User.findByIdAndUpdate(req.user.userId, {
      teamId: team._id,
      managerId: req.user.userId
    });
    
    // Populate the response
    await team.populate([
      { path: 'members', select: 'name email role' },
      { path: 'managerId', select: 'name email' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: {
        teamId: team._id,
        teamName: team.name,
        description: team.description,
        manager: team.managerId,
        members: team.members,
        memberCount: team.members.length,
        createdAt: team.createdAt
      }
    });
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get manager's team info and members
app.get('/api/teams/my-team', authenticateToken, requireManager, async (req, res) => {
  try {
    // Find team where current user is the manager OR where user is a member (for admins who are also managers)
    let team = await Team.findOne({ managerId: req.user.userId })
      .populate('members', 'name email role')
      .populate('managerId', 'name email');
    
    // If no team found as manager, check if user is a member of any team (for admins)
    if (!team && req.user.role === 'admin') {
      const user = await User.findById(req.user.userId);
      if (user && user.teamId) {
        team = await Team.findById(user.teamId)
          .populate('members', 'name email role')
          .populate('managerId', 'name email');
      }
    }
    
    if (!team) {
      return res.status(404).json({ 
        error: 'No team found',
        message: 'You are not currently managing any team'
      });
    }
    
    console.log('Team data being returned:', {
      teamId: team._id,
      teamName: team.name,
      description: team.description,
      manager: team.managerId,
      memberCount: team.members.length
    });
    
    res.json({
      teamId: team._id,
      teamName: team.name,
      description: team.description,
      manager: team.managerId,
      members: team.members,
      memberCount: team.members.length,
      createdAt: team.createdAt
    });
  } catch (err) {
    console.error('Get my team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all team members (with details)
app.get('/api/teams/:teamId/members', authenticateToken, requireManager, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify team exists and user is the manager (or admin)
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is the manager of this team or an admin
    if (team.managerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - not your team' });
    }
    
    // Get all members with their details
    const members = await User.find({ 
      _id: { $in: team.members } 
    }).select('name email role createdAt');
    
    res.json({
      teamId: team._id,
      teamName: team.name,
      members: members
    });
  } catch (err) {
    console.error('Get team members error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all leaves for team members
app.get('/api/teams/:teamId/leaves', authenticateToken, requireManager, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify team exists and user is the manager (or admin)
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is the manager of this team or an admin
    if (team.managerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - not your team' });
    }
    
    // Get all vacations for team members (only approved ones)
    const teamVacations = await Vacation.find({
      user: { $in: team.members },
      status: 'approved'
    }).populate('user', 'name email').sort({ fromDate: 1 });
    
    console.log('Team leaves query:', {
      teamId,
      teamMembers: team.members.length,
      approvedVacations: teamVacations.length,
      vacations: teamVacations.map(v => ({
        id: v._id,
        user: v.user?.name,
        status: v.status,
        fromDate: v.fromDate,
        toDate: v.toDate
      }))
    });
    
    // Transform data for frontend
    const leaves = teamVacations.map(vacation => ({
      id: vacation._id,
      memberName: vacation.user.name,
      memberEmail: vacation.user.email,
      memberId: vacation.user._id,
      vacationName: vacation.name,
      destination: vacation.destination,
      fromDate: vacation.fromDate,
      toDate: vacation.toDate,
      days: vacation.days,
      leaveType: vacation.leaveType,
      // Determine status: current, upcoming, or past
      status: (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(vacation.fromDate);
        const endDate = new Date(vacation.toDate);
        
        if (today >= startDate && today <= endDate) {
          return 'current';
        } else if (startDate > today) {
          return 'upcoming';
        } else {
          return 'past';
        }
      })()
    }));
    
    // Calculate team statistics
    const currentLeaves = leaves.filter(l => l.status === 'current');
    const upcomingLeaves = leaves.filter(l => l.status === 'upcoming');
    const onLeaveCount = currentLeaves.length;
    const availabilityPercent = team.members.length > 0 
      ? Math.round(((team.members.length - onLeaveCount) / team.members.length) * 100)
      : 100;
    
    res.json({
      teamId: team._id,
      teamName: team.name,
      leaves: leaves,
      statistics: {
        totalMembers: team.members.length,
        currentlyOnLeave: onLeaveCount,
        availabilityPercent: availabilityPercent,
        upcomingLeaves: upcomingLeaves.length,
        totalLeaves: leaves.length
      }
    });
  } catch (err) {
    console.error('Get team leaves error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add member to team
app.post('/api/teams/:teamId/members', authenticateToken, requireManager, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userEmail, position } = req.body;
    
    console.log('Add team member request:', { userEmail, position });
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    // Verify team exists and user is the manager (or admin)
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is the manager of this team or an admin
    if (team.managerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - not your team' });
    }
    
    // Find user by email or create if doesn't exist
    let userToAdd = await User.findOne({ email: userEmail.toLowerCase() });
    
    let tempPassword = null;
    let isNewUser = false;
    
    if (!userToAdd) {
      // Create new user if doesn't exist
      isNewUser = true;
      const name = userEmail.split('@')[0]; // Use email prefix as name
      tempPassword = Math.random().toString(36).slice(-8); // Generate temp password
      
      userToAdd = new User({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        email: userEmail.toLowerCase(),
        password: await bcrypt.hash(tempPassword, 10), // Hash the temp password
        role: 'employee', // All new team members start as employees
        position: position || 'Employee',
        teamId: team._id,
        managerId: team.managerId,
        needsPasswordReset: true, // Flag to indicate they should change password
        tempPassword: tempPassword, // Store temp password (unhashed) temporarily
        tempPasswordCreatedBy: req.user.userId, // Who created this temp password
        tempPasswordCreatedAt: new Date() // When it was created
      });
      
      await userToAdd.save();
      
      // Log the creation for admin tracking
      console.log(`New user created for team: ${userEmail} with temp password: ${tempPassword}`);
    }
    
    // Check if user is already a member
    if (team.members.includes(userToAdd._id)) {
      return res.status(400).json({ error: 'User is already a team member' });
    }
    
    // Add user to team
    team.members.push(userToAdd._id);
    await team.save();
    
    // Update user's teamId and managerId (if not already set during creation)
    if (!userToAdd.teamId) {
      userToAdd.teamId = team._id;
    }
    if (!userToAdd.managerId) {
      userToAdd.managerId = team.managerId;
    }
    // Role is automatically set to 'employee' for new team members
    // Role changes are handled through the admin panel
    if (position) {
      userToAdd.position = position; // Update position if provided
    }
    await userToAdd.save();
    
    res.json({
      success: true,
      message: isNewUser ? 'New user created and added to team successfully' : 'Member added successfully',
      member: {
        id: userToAdd._id,
        name: userToAdd.name,
        email: userToAdd.email,
        role: userToAdd.role,
        position: userToAdd.position
      },
      wasNewUser: isNewUser,
      tempPassword: isNewUser ? tempPassword : null // Only include temp password for new users
    });
  } catch (err) {
    console.error('Add team member error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove member from team
app.delete('/api/teams/:teamId/members/:userId', authenticateToken, requireManager, async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    // Verify team exists and user is the manager (or admin)
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is the manager of this team or an admin
    if (team.managerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - not your team' });
    }
    
    // Check if user is a member
    if (!team.members.includes(userId)) {
      return res.status(400).json({ error: 'User is not a team member' });
    }
    
    // Remove user from team
    team.members = team.members.filter(memberId => memberId.toString() !== userId);
    await team.save();
    
    // Update user's teamId and managerId to null
    await User.findByIdAndUpdate(userId, {
      teamId: null,
      managerId: null
    });
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    console.error('Remove team member error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Leave Balance API endpoints

// Get all leave balances for the authenticated user
app.get('/leave-balances', authenticateToken, async (req, res) => {
  try {
    // First try to find user-specific leave balances
    let leaveBalances = await LeaveBalance.find({ user: req.user.userId });
    
    // If no user-specific balances exist, create default zero balances for new users
    if (leaveBalances.length === 0) {
      const leaveTypes = [
        { leaveType: 'EL', description: 'Earned Leave' },
        { leaveType: 'SL', description: 'Sick Leave' },
        { leaveType: 'CL', description: 'Casual Leave' }
      ];
      
      // Create each balance individually using findOneAndUpdate with upsert
      leaveBalances = [];
      for (const type of leaveTypes) {
        try {
          const balance = await LeaveBalance.findOneAndUpdate(
            { user: req.user.userId, leaveType: type.leaveType },
            { 
              $setOnInsert: { 
                balance: 0, 
                description: type.description,
                user: req.user.userId,
                leaveType: type.leaveType
              }
            },
            { upsert: true, new: true }
          );
          leaveBalances.push(balance);
        } catch (error) {
          console.error(`Error creating ${type.leaveType} balance:`, error.message);
        }
      }
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
        // Update the global balance instead of creating a duplicate
        updatedBalance = await LeaveBalance.findOneAndUpdate(
          { user: { $exists: false }, leaveType },
          { balance },
          { new: true, runValidators: true }
        );
      } else {
        // Create a new user-specific balance only if no global exists
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
      { expiresIn: '1h' }
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
      { expiresIn: '1h' }
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

// Cache statistics endpoint (for monitoring)
app.get('/api/cache-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Debug endpoint to check vacation data (temporary)
app.get('/debug/vacations', authenticateToken, async (req, res) => {
  try {
    // Get all vacations (user-specific and global)
    const userVacations = await Vacation.find({ user: req.user.userId }).sort({ fromDate: 1 });
    const globalVacations = await Vacation.find({ user: { $exists: false } }).sort({ fromDate: 1 });
    const allVacations = await Vacation.find({}).sort({ fromDate: 1 });
    
    res.json({
      current_user_id: req.user.userId,
      user_vacations: userVacations,
      global_vacations: globalVacations,
      all_vacations: allVacations,
      total_count: allVacations.length,
      user_count: userVacations.length,
      global_count: globalVacations.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weather AI Forecast endpoint
app.post('/api/weather-forecast', authenticateToken, async (req, res) => {
  try {
    const { destination, startDate, endDate } = req.body;
    
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'Destination, start date, and end date are required' });
    }
    
    // Weather service now uses Open-Meteo (free, no API key required)
    // OpenWeatherMap is available as fallback if API key is provided
    
    // Get weather forecast with AI analysis
    let weatherForecast;
    
    try {
      // Try OpenWeatherMap first
      weatherForecast = await weatherAnalyzer.getWeatherForecast(destination, startDate, endDate);
    } catch (error) {
      console.log('OpenWeatherMap failed, trying ChatGPT fallback...');
      
      // Fallback to ChatGPT if OpenWeatherMap fails
      weatherForecast = await weatherAnalyzer.getChatGPTWeatherForecast(destination, startDate, endDate);
      
      if (!weatherForecast) {
        throw new Error('Both OpenWeatherMap and ChatGPT weather services unavailable');
      }
    }
    
    res.json({
      success: true,
      ...weatherForecast
    });
    
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get weather forecast',
      details: error.message 
    });
  }
});

// AI-Powered Destination Insights endpoint (with Redis caching)
app.post('/api/vacation-insights', authenticateToken, async (req, res) => {
  try {
    const { vacationId, startDate, endDate, destination, vacationName } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    // NEW: Check Redis cache first (if vacationId provided)
    if (vacationId) {
      const cachedInsights = await getCachedInsights(vacationId);
      if (cachedInsights) {
        const cacheAgeSeconds = Math.floor(
          (Date.now() - new Date(cachedInsights.cached_at)) / 1000
        );
        return res.json({
          ...cachedInsights,
          from_cache: true,
          cache_age_seconds: cacheAgeSeconds,
          cache_age_readable: `${Math.floor(cacheAgeSeconds / 60)} minutes ago`
        });
      }
    }
    
    // Cache miss - check if future vacation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vacationStartDate = new Date(startDate);
    
    if (vacationStartDate < today) {
      return res.status(400).json({ 
        error: 'AI insights only available for future vacations',
        message: 'Historical vacation analysis not supported'
      });
    }
    
    // Path to the Python script
    const scriptPath = path.join(__dirname, 'vacation-timing-ai', 'vacation_destination_analyzer.py');
    
    // Build the Python command
    let command = `python3 "${scriptPath}" --start-date "${startDate}" --end-date "${endDate}" --output json`;
    
    // Add current destination if provided
    if (destination) {
      command += ` --current-destination "${destination}"`;
    }
    
    console.log(`🐍 Executing Python script (cache miss): ${command}`);
    
    // Execute the Python script
    exec(command, { timeout: 30000 }, async (error, stdout, stderr) => {
      if (error) {
        console.error('Python script error:', error);
        return res.status(500).json({ 
          error: 'Failed to generate insights', 
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Python script stderr:', stderr);
      }
      
      try {
        // Parse the JSON output from Python script
        const insights = JSON.parse(stdout);
        
        // Format for frontend consumption
        const response = {
          vacation_info: {
            name: vacationName || 'Your Vacation',
            start_date: startDate,
            end_date: endDate,
            destination: destination
          },
          ai_analysis: insights,
          generated_at: new Date().toISOString(),
          from_cache: false
        };
        
        // NEW: Cache the results in Redis (if vacationId and endDate provided)
        if (vacationId && endDate) {
          await cacheInsights(vacationId, endDate, response);
        }
        
        res.json(response);
        
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        console.error('Python stdout:', stdout);
        return res.status(500).json({ 
          error: 'Failed to process insights', 
          details: 'Invalid response from analysis engine' 
        });
      }
    });
    
  } catch (error) {
    console.error('Vacation insights endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role change audit logs (Admin only)
app.get('/api/admin/role-change-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    
    const logs = await RoleChangeLog.find(query)
      .populate('userId', 'name email')
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await RoleChangeLog.countDocuments(query);
    
    res.json({
      logs: logs.map(log => ({
        _id: log._id,
        userId: log.userId,
        userEmail: log.userEmail,
        userName: log.userName,
        oldRole: log.oldRole,
        newRole: log.newRole,
        changedBy: log.changedBy,
        changedByEmail: log.changedByEmail,
        reason: log.reason,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: skip + logs.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get role change logs error:', error);
    res.status(500).json({ error: 'Failed to fetch role change logs' });
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