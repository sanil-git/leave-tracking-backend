# RelocateWise 🏠✈️

A comprehensive fullstack web application that helps users plan city relocations with smart checklists, photo documentation, city-specific suggestions, and timeline management.

## Features

### 🎯 Core Features
- **Smart Checklist Builder** - Create personalized checklists for housing, documents, packing, utilities, and local setup
- **Photo Documentation** - Upload and organize photos of apartment visits, receipts, and important documents
- **City-Specific Suggestions** - Get tailored recommendations based on destination city (Bangalore vs Tokyo, etc.)
- **Timeline View** - Visualize your move with pre-move, move day, and post-move phases
- **Travel Mode Toggle** - Switch between relocation and short-term trip planning
- **Journaling Module** - Record your relocation journey with location and date tagging

### 🌍 City Selection & Geolocation
- **BookMyShow-style Interface** - Modern, clean city selection modal with search functionality
- **Automatic Location Detection** - Detect user's city from 10 major Indian cities using browser geolocation
- **Supported Cities** - Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Chandigarh, Ahmedabad, Kochi
- **Dashboard Preview** - Shows actual dashboard layout in background (dulled) to create anticipation
- **Seamless Experience** - Auto-redirect without popups, local storage persistence

### 🛠️ Technical Features
- **Authentication** - JWT-based auth with secure user management
- **Real-time Updates** - Live progress tracking and notifications
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Cloud Storage** - Secure photo storage with Cloudinary
- **Database** - MongoDB Atlas for scalable data storage
- **API** - RESTful API with comprehensive error handling

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v3** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Geolocation API** - Browser-based location detection

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and optimization
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

## Project Structure

```
relocatewise-app/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── server.js           # Main server file
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd relocatewise-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your MongoDB and Cloudinary credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.local.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```
   
   The frontend will run on http://localhost:3003 (or next available port)

4. **Environment Variables**

   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/relocatewise
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_NAME=RelocateWise
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   ```

### Development

- **Backend**: `npm run dev` (runs on http://localhost:5001)
- **Frontend**: `npm run dev` (runs on http://localhost:3003)

### Quick Start

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open App**: Visit http://localhost:3003
4. **Select City**: Use geolocation or search for your city
5. **Start Planning**: Access the dashboard with your selected city

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy!

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set framework to Next.js
3. Add environment variables in Vercel dashboard
4. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Checklists
- `GET /api/checklists` - Get user's checklists
- `POST /api/checklists` - Create new checklist
- `PUT /api/checklists/:id` - Update checklist
- `DELETE /api/checklists/:id` - Delete checklist
- `POST /api/checklists/:id/items` - Add item to checklist
- `PUT /api/checklists/:id/items/:itemId` - Update checklist item
- `DELETE /api/checklists/:id/items/:itemId` - Delete checklist item

### Photos
- `GET /api/photos` - Get user's photos
- `POST /api/photos` - Upload photo
- `GET /api/photos/:id` - Get single photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### Suggestions
- `GET /api/suggestions` - Get city-specific suggestions
- `GET /api/suggestions/categories` - Get available categories
- `GET /api/suggestions/priority` - Get high priority suggestions
- `GET /api/suggestions/search` - Search suggestions

### Timeline
- `GET /api/timeline` - Get user's timeline
- `GET /api/timeline/phase/:phase` - Get timeline for specific phase
- `GET /api/timeline/upcoming` - Get upcoming tasks
- `GET /api/timeline/overdue` - Get overdue tasks

### Journal
- `GET /api/journal` - Get journal entries
- `POST /api/journal` - Create journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `GET /api/journal/tags` - Get all tags
- `GET /api/journal/stats` - Get journal statistics

## Database Models

### User
- Personal information and preferences
- Current and destination locations
- Move date and travel mode settings

### Checklist
- User's relocation checklists
- Items with priorities, due dates, and completion status
- Categories and phases

### Photo
- Uploaded photos with metadata
- Cloudinary integration for storage
- Categorization and tagging

### Journal
- User's relocation journal entries
- Location and mood tracking
- Text search capabilities for RAG

### Suggestion
- City-specific recommendations
- Categorized by type and priority
- Applicable for different user types

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@relocatewise.com or join our Discord community.

---

Built with ❤️ for people who are ready to make their next big move! 🚀
