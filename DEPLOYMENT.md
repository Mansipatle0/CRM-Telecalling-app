# Complete Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (frontend)
- Render/Railway account (backend)
- PostgreSQL database (optional, for production)

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
\`\`\`bash
cd frontend
npm run build
\`\`\`

### Step 2: Push to GitHub
\`\`\`bash
git add .
git commit -m "Production ready"
git push origin main
\`\`\`

### Step 3: Deploy on Vercel
1. Go to vercel.com and sign in
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Set environment variable:
   - Key: \`NEXT_PUBLIC_API_URL\`
   - Value: \`https://your-backend-url/api\` (will get this from backend deployment)
5. Click "Deploy"

## Backend Deployment (Render.com)

### Step 1: Prepare Backend
\`\`\`bash
# Ensure your package.json has start script
# "start": "node server.js"
\`\`\`

### Step 2: Create Render Web Service
1. Go to render.com
2. Create new "Web Service"
3. Connect your GitHub repository (backend folder)
4. Configure:
   - Build Command: \`npm install\`
   - Start Command: \`node server.js\`
   - Environment: Node.js
   - Plan: Standard (free trial available)

### Step 3: Add Environment Variables
In Render dashboard, add:
- \`PORT\` = \`10000\`
- \`JWT_SECRET\` = Generate a strong random string
- \`NODE_ENV\` = \`production\`
- \`NEXT_PUBLIC_API_URL\` = Your Render URL + \`/api\`

### Step 4: Deploy
Click "Create Web Service" to deploy

### Step 5: Copy Backend URL
Once deployed, copy your service URL (e.g., \`https://your-service.onrender.com\`)

## Connect Frontend & Backend

1. Go back to Vercel project settings
2. Update \`NEXT_PUBLIC_API_URL\` to your Render backend URL
3. Redeploy frontend

## Testing Production

1. Visit your Vercel frontend URL
2. Register a new account
3. Test login/logout
4. Create and manage contacts
5. Test calling interface

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] API URL in frontend matches backend
- [ ] JWT_SECRET is strong and secret
- [ ] CORS configured for your domains
- [ ] Database backups configured
- [ ] Error logging set up
- [ ] Monitor performance
- [ ] Set up custom domain (optional)

## Scaling for Production

### Database
Replace SQLite with PostgreSQL:
1. Create PostgreSQL database on AWS RDS or Railway
2. Update backend to use PostgreSQL connection
3. Run migration scripts

### Backend
- Use pm2 for process management
- Implement Redis for caching
- Set up load balancing
- Configure auto-scaling

### Frontend
- Enable Vercel Edge Network
- Configure CDN caching
- Set up monitoring and analytics

## Troubleshooting

### Frontend can't connect to backend
- Check \`NEXT_PUBLIC_API_URL\` environment variable
- Verify backend is running and accessible
- Check CORS configuration in backend
- Look for network errors in browser console

### Backend database errors
- Verify database file permissions
- Check database schema was initialized
- View backend logs for detailed errors

### Authentication failing
- Ensure JWT_SECRET is same in all environments
- Check token expiration
- Verify localStorage is enabled in browser

## Support Resources
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Next.js Docs: https://nextjs.org/docs
