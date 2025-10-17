# RelocateWise Deployment Guide 🚀

This guide will walk you through deploying RelocateWise to production using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- MongoDB Atlas account
- Cloudinary account
- Vercel account
- Render account

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Configure Database**
   - Create a database user with read/write permissions
   - Whitelist your IP address (use 0.0.0.0/0 for Render)
   - Get your connection string

3. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/relocatewise?retryWrites=true&w=majority
   ```

## Step 2: Set Up Cloudinary

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account
   - Get your cloud name, API key, and API secret from the dashboard

2. **Configure Upload Preset**
   - Go to Settings > Upload
   - Create a new unsigned upload preset
   - Set the folder to "relocatewise"

## Step 3: Deploy Backend to Render

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure Render Service**
   - **Name**: `relocatewise-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables in Render**
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-super-secret-jwt-key>
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   FRONTEND_URL=https://relocatewise.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://relocatewise-backend.onrender.com`)

## Step 4: Deploy Frontend to Vercel

1. **Create Vercel Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder

2. **Configure Vercel Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Set Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_API_URL=https://relocatewise-backend.onrender.com/api
   NEXT_PUBLIC_APP_NAME=RelocateWise
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://relocatewise.vercel.app`

## Step 5: Seed Database with Sample Data

1. **Connect to Your Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Set Environment Variables Locally**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Run Seed Script**
   ```bash
   npm run seed
   ```

## Step 6: Configure CORS

Update your backend's CORS settings to allow your Vercel domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://relocatewise.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Step 7: Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### For Render (Backend)
1. Go to your service settings in Render
2. Navigate to "Custom Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Step 8: SSL and Security

Both Vercel and Render provide SSL certificates automatically. Ensure your environment variables are secure and never commit them to version control.

## Step 9: Monitoring and Maintenance

### Backend Monitoring
- Monitor your Render service for uptime
- Check logs for any errors
- Monitor MongoDB Atlas for database performance

### Frontend Monitoring
- Use Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Set up error tracking (optional)

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/relocatewise
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://relocatewise.vercel.app
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://relocatewise-backend.onrender.com/api
NEXT_PUBLIC_APP_NAME=RelocateWise
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend URL is added to CORS origins
   - Check that credentials are properly configured

2. **Database Connection Issues**
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check connection string format
   - Ensure database user has proper permissions

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check upload preset configuration
   - Ensure CORS is configured for Cloudinary

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debugging Steps

1. **Check Backend Logs**
   - Go to Render dashboard > Your service > Logs
   - Look for error messages

2. **Check Frontend Build Logs**
   - Go to Vercel dashboard > Your project > Deployments
   - Click on failed deployment to see logs

3. **Test API Endpoints**
   - Use tools like Postman or curl to test your backend
   - Verify endpoints are responding correctly

## Performance Optimization

### Backend
- Enable MongoDB Atlas monitoring
- Use connection pooling
- Implement caching for frequently accessed data
- Optimize database queries

### Frontend
- Enable Vercel Analytics
- Optimize images with Next.js Image component
- Implement code splitting
- Use CDN for static assets

## Security Checklist

- [ ] Environment variables are secure
- [ ] CORS is properly configured
- [ ] JWT secrets are strong and unique
- [ ] Database access is restricted
- [ ] File uploads are validated
- [ ] Input validation is implemented
- [ ] HTTPS is enabled
- [ ] Security headers are configured

## Backup Strategy

1. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Consider additional backup solutions for critical data

2. **Code Backups**
   - Use Git for version control
   - Regular commits and pushes to GitHub
   - Tag releases for easy rollback

## Scaling Considerations

### When to Scale
- High traffic volume
- Database performance issues
- Slow response times
- Resource constraints

### Scaling Options
- Upgrade Render plan for more resources
- Use MongoDB Atlas dedicated clusters
- Implement caching layers
- Use CDN for static assets

---

Your RelocateWise app should now be live and accessible! 🎉

For support or questions, refer to the main README.md or create an issue in the repository.
