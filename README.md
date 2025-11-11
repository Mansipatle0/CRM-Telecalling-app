# CRM & Telecalling Application

A full-stack, production-ready CRM and telecalling management system with role-based dashboards, contact management, Excel import, and integrated calling capabilities.

## Features

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Manager, Telecaller)
- Token refresh and session management
- Secure API endpoints with middleware protection

### Admin Dashboard
- User management and role assignment
- System analytics and KPI tracking
- Settings and Twilio integration configuration
- Contact management and bulk operations
- Excel file import with validation

### Manager Dashboard
- Team overview and performance tracking
- Individual team member analytics
- Call tracking and reporting
- Real-time activity monitoring
- Performance metrics and targets

### Telecaller Dashboard
- Contact list and assignment tracking
- In-app calling interface with timer
- Call history and notes
- Personal statistics and KPI tracking
- Daily performance metrics

### Calling System
- Simulated calling interface (Twilio-ready)
- Call duration tracking
- Contact status updates based on calls
- Call notes and follow-up tracking
- Twilio integration support

### Analytics & Reporting
- Real-time KPI tracking
- Call performance metrics
- Conversion rate analytics
- Team performance comparison
- Daily and weekly reporting

### Contact Management
- Create, read, update, delete contacts
- Bulk Excel/CSV import
- Contact status tracking (new, contacted, qualified, converted, lost)
- Contact assignment to telecallers
- Company and contact notes

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS v4** - Utility-first CSS
- **Shadcn/ui** - Component library
- **Recharts** - Data visualization
- **SWR** - Data fetching and caching
- **Framer Motion** - Animations

### Backend
- **Express.js** - REST API server
- **SQLite** - Lightweight database (upgradeable to PostgreSQL)
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Multer** - File upload handling
- **XLSX** - Excel file parsing

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Extract the project files**
   \`\`\`bash
   cd crm-telecalling-app
   npm install
   \`\`\`

2. **Create environment file**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. **Configure variables**
   Edit `.env.local`:
   \`\`\`
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   
   # Optional: Twilio
   # TWILIO_ACCOUNT_SID=your_sid
   # TWILIO_AUTH_TOKEN=your_token
   # TWILIO_PHONE_NUMBER=your_number
   \`\`\`

4. **Start the backend**
   \`\`\`bash
   npm run dev
   \`\`\`
   The API runs on `http://localhost:5000`

5. **Start the frontend** (in another terminal)
   \`\`\`bash
   cd ..
   npm run dev
   \`\`\`
   The app runs on `http://localhost:3000`

## Default Users

For testing, create users with these roles during registration:

- **Admin**: Full system access
- **Manager**: Team management and reporting
- **Telecaller**: Contact calling and personal stats

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### Users
- `GET /api/users` - List all users (admin)
- `GET /api/users/team` - Get team members (manager)
- `PATCH /api/users/:id` - Update user (admin)

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `POST /api/contacts/upload` - Bulk upload Excel
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Calls
- `GET /api/calls` - Get call history
- `POST /api/calls` - Log a call
- `PATCH /api/calls/:id` - Update call

### Analytics
- `GET /api/analytics/kpis` - Get user KPIs
- `GET /api/analytics/team` - Get team analytics
- `GET /api/analytics/contacts` - Get contact stats

## Database Schema

### Users
- id, email, password, name, role, manager_id, status, created_at

### Contacts
- id, name, email, phone, company, status, assigned_to, source, notes, created_at

### Calls
- id, contact_id, user_id, duration, status, call_type, notes, twilio_sid, created_at

### KPIs
- id, user_id, date, calls_made, calls_connected, calls_converted, total_talk_time

### Call Logs
- id, call_id, action, timestamp, details

## Excel Import Format

Create an Excel file with the following columns:
- **Name** - Contact name (required)
- **Email** - Contact email
- **Phone** - Contact phone number (required)
- **Company** - Company name

## Twilio Integration

To enable live calling:

1. Get credentials from [Twilio Console](https://console.twilio.com)
2. Update `.env.local`:
   \`\`\`
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   \`\`\`
3. Restart the backend

## Deployment

### Frontend (Vercel)
\`\`\`bash
npm run build
vercel deploy
\`\`\`

### Backend (Render/Railway)
\`\`\`bash
git push <backend-repo>
\`\`\`

Set environment variables in your hosting platform's dashboard.

## Features Roadmap

- [ ] Real Twilio integration
- [ ] Call recording and playback
- [ ] SMS messaging
- [ ] Custom reports and exports
- [ ] Advanced filtering and search
- [ ] Mobile app
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Automated calling campaigns
- [ ] AI-powered call insights

## Troubleshooting

### Backend won't start
- Check port 5000 is available
- Verify Node.js version (18+)
- Clear `node_modules` and reinstall

### Can't login
- Ensure backend is running
- Check `.env.local` API URL
- Verify database initialization

### Calls not logging
- Check API connectivity
- Verify JWT token in localStorage
- Check browser console for errors

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response errors
3. Check browser and server console logs

## License

This project is provided as-is for educational and commercial use.

## Notes for Production

- Change `JWT_SECRET` to a strong random value
- Upgrade SQLite to PostgreSQL for production
- Enable HTTPS in API configuration
- Implement rate limiting on API endpoints
- Add request validation and sanitization
- Set up proper error logging and monitoring
- Configure CORS properly for your domain
- Use environment-specific configurations
- Implement database backups
- Add comprehensive unit and integration tests
