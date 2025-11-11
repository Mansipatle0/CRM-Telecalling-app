# Backend Deployment Guide

## Option 1: Render.com

1. Create GitHub repository for backend:
   \`\`\`bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend setup"
   \`\`\`

2. Push to GitHub

3. On Render.com:
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: \`npm install\`
   - Set start command: \`node server.js\`
   - Add environment variables:
     - PORT=10000
     - JWT_SECRET=your-strong-secret
     - DATABASE_URL=./backend/db/crm.db
     - NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api

4. Deploy

## Option 2: Railway.app

1. Push backend to GitHub

2. On Railway.app:
   - Create new project
   - Add GitHub repo
   - Set NODE_ENV=production
   - Add PORT environment variable

3. Configure environment variables in Railway dashboard

4. Deploy

## Option 3: AWS EC2

1. SSH into EC2 instance
2. Install Node.js
3. Clone repository
4. Install dependencies: \`npm install\`
5. Configure PM2 for process management
6. Setup nginx reverse proxy
7. Configure SSL certificate
8. Start application: \`pm2 start server.js\`

## Environment Variables for Deployment

\`\`\`
PORT=10000
JWT_SECRET=generate-a-strong-random-string
DATABASE_URL=./backend/db/crm.db
NODE_ENV=production
TWILIO_ACCOUNT_SID=your_sid (optional)
TWILIO_AUTH_TOKEN=your_token (optional)
TWILIO_PHONE_NUMBER=your_number (optional)
\`\`\`

## Frontend Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable:
   - NEXT_PUBLIC_API_URL=https://your-backend-url/api
4. Deploy

## Database Setup

For production, upgrade from SQLite to PostgreSQL:

1. Create PostgreSQL database
2. Update connection string in environment
3. Migrate schema using SQL scripts
