# Vacation Planner - Startup Guide

## 🎨 **NEW MODERN DESIGN!**

The app has been completely redesigned with a beautiful, modern interface featuring:
- Clean Material Design with Inter font
- Responsive grid layout
- Material Icons throughout
- Modern cards and components
- Enhanced user experience

## 🚀 Quick Start

### 1. Start the Backend Server

First, you need to start the backend server to enable vacation and leave balance functionality.

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Create a .env file with your MongoDB connection string
echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/leave-tracking?retryWrites=true&w=majority" > .env

# Start the backend server
npm start
```

**Note**: Replace the MongoDB connection string with your actual MongoDB Atlas connection string.

### 2. Start the Frontend

In a new terminal window:

```bash
# Navigate to leave-tracking directory
cd leave-tracking

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm start
```

## 🔧 Troubleshooting

### Backend Connection Issues

If you see "Backend Disconnected" in the UI:

1. **Check if backend is running**: Make sure the backend server is running on port 5050
2. **Check MongoDB connection**: Ensure your MongoDB connection string is correct
3. **Check console errors**: Look at the browser console for specific error messages

### Common Issues

1. **"Cannot connect to backend"**: Backend server not running or wrong port
2. **"MongoDB connection error"**: Invalid MongoDB connection string
3. **"Failed to add vacation"**: Backend not responding or validation errors

## 📱 Features Now Working

✅ **Vacation Management**: Add, edit, and delete vacations  
✅ **Leave Balance Tracking**: View and edit EL, SL, CL balances  
✅ **Holiday Management**: Add and remove custom holidays  
✅ **Calendar Integration**: All events display on the calendar  
✅ **Real-time Updates**: Changes reflect immediately  

## 🎯 Next Steps

1. **Set up MongoDB Atlas**: Create a free MongoDB Atlas account
2. **Configure Environment**: Add your MongoDB connection string to `.env`
3. **Test Features**: Try adding a vacation and editing leave balances
4. **Customize**: Modify leave types, default balances, or UI as needed

## 🔗 API Endpoints

- `GET /leave-balances` - Fetch leave balances
- `PUT /leave-balances/:type` - Update leave balance
- `GET /vacations` - Fetch all vacations
- `POST /vacations` - Create new vacation
- `DELETE /vacations/:id` - Remove vacation
- `GET /holidays` - Fetch all holidays
- `POST /holidays` - Create new holiday

## 💡 Tips

- The app automatically calculates vacation duration
- Leave balances are automatically deducted when adding vacations
- Use the status indicator to verify backend connection
- All data is persisted in MongoDB
