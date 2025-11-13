# Hackathon DAO - Web UI

A complete web interface for the Hackathon DAO system with real-time contribution tracking, DAO governance, and royalty distribution management.

## Features

### 🎯 Dashboard
- Real-time statistics (teams, members, contributions, proposals)
- Top teams and contributors leaderboards
- Recent contributions timeline
- Visual metrics and charts

### 👥 Team Management
- Create and manage teams
- View team statistics and members
- Track team progress and milestones
- Team contribution breakdown

### 🙋 Member Management
- Register new members with wallet addresses
- View member profiles and statistics
- Track member contributions across teams
- Reputation and skill management

### 📊 Contributions Tracking
- Track 8 types of contributions (code, review, docs, design, testing, research, ideation, presentation)
- Automatic scoring based on complexity and quality
- Contribution verification system
- Filter by status (all, verified, unverified)

### 🗳️ DAO Governance
- Create and view proposals
- Vote on active proposals with weighted voting
- Real-time vote counting and progress bars
- Automatic proposal finalization
- 6 proposal types supported

### 💰 Royalty Distributions
- Create royalty pools with multiple distribution models
- Track distributions by team and member
- View payment breakdowns and percentages
- 4 distribution models (linear, weighted, milestone, hybrid)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on http://localhost:3000

### 3. Access the Web UI

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

The server exposes a full REST API:

### DAO Info
- `GET /api/dao` - Get overall DAO statistics

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team dashboard
- `POST /api/teams` - Create new team
- `GET /api/teams/:id/stats` - Get team statistics
- `POST /api/teams/:teamId/members/:memberId` - Add member to team
- `GET /api/teams/leaderboard` - Get team leaderboard

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member dashboard
- `POST /api/members` - Register new member
- `GET /api/members/leaderboard` - Get member leaderboard

### Contributions
- `GET /api/contributions` - List all contributions
- `GET /api/contributions/team/:teamId` - Get team contributions
- `GET /api/contributions/member/:memberId` - Get member contributions
- `POST /api/contributions` - Track new contribution
- `POST /api/contributions/:id/verify` - Verify contribution

### Proposals
- `GET /api/proposals` - List active proposals
- `GET /api/proposals/:id` - Get proposal details
- `POST /api/proposals` - Create new proposal
- `POST /api/proposals/:id/vote` - Vote on proposal

### Royalties
- `GET /api/royalties/team/:teamId` - Get team royalty pools
- `GET /api/royalties/member/:memberId` - Get member royalties
- `GET /api/royalties/pool/:poolId` - Get distribution report
- `POST /api/royalties/distribute` - Create distribution

## Architecture

### Backend (server.js)
- Express.js REST API server
- AgentDB integration for data persistence
- Automatic sample data seeding
- CORS enabled for development

### Frontend (public/)
- **index.html** - Main SPA layout
- **styles.css** - Modern, responsive CSS with gradient backgrounds
- **app.js** - Frontend JavaScript (Vanilla JS, no framework)

### File Structure
```
hackathon-dao/
├── server.js                  # Express server with REST API
├── public/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # Stylesheets
│   └── app.js                # Frontend JavaScript
├── src/
│   ├── core/
│   │   ├── dao.js            # Main DAO controller
│   │   ├── database.js       # AgentDB integration
│   │   └── royalty.js        # Royalty engine
│   ├── teams/
│   │   ├── team-manager.js   # Team operations
│   │   └── member-manager.js # Member operations
│   ├── contributions/
│   │   ├── tracker.js        # Contribution tracking
│   │   └── analyzer.js       # Git/code analysis
│   └── governance/
│       ├── proposals.js      # Proposal management
│       └── voting.js         # Voting system
└── examples/
    ├── basic-usage.js        # CLI example
    └── git-analysis-example.js
```

## Technology Stack

### Backend
- **Express.js 5** - Web server and API
- **AgentDB** - Vector database with sql.js (WASM SQLite)
- **Node.js** - Runtime environment

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests
- **CSS3** - Modern styling with gradients and animations
- **Responsive Design** - Mobile-friendly layout

## Sample Data

The server automatically seeds sample data on first run:
- 2 teams (AI Innovators, Blockchain Builders)
- 3 members (Alice, Bob, Charlie)
- 2 verified contributions
- Ready for immediate use and testing

## UI Features

### Design
- Modern gradient background (purple/blue)
- Card-based layout
- Smooth animations and transitions
- Responsive grid system
- Modal dialogs for forms
- Badge system for statuses

### UX
- Single Page Application (SPA) with client-side routing
- Real-time updates
- Loading states
- Empty states for new users
- Form validation
- Success/error notifications

## Development

### Running in Development
```bash
npm start
```

### Environment Variables
- `PORT` - Server port (default: 3000)

### Database
The system uses an in-memory database by default. For persistence, the data is stored in `hackathon_dao.db` in the hackathon-dao directory.

## Production Deployment

### Option 1: Node.js Server
```bash
npm start
```

### Option 2: Docker
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY hackathon-dao ./hackathon-dao
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Serverless (Vercel, Netlify, etc.)
Deploy the API as serverless functions and serve the static frontend.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

For production deployment:
1. Add authentication/authorization
2. Implement rate limiting
3. Add input validation and sanitization
4. Use HTTPS
5. Set up CORS properly
6. Add CSRF protection
7. Implement proper session management

## Future Enhancements

- [ ] User authentication and sessions
- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Data visualization with charts
- [ ] Export data to CSV/JSON
- [ ] Email notifications
- [ ] Blockchain integration for actual payments
- [ ] Mobile app
- [ ] Multi-language support

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`

### API returns errors
- Check server logs for details
- Verify database initialization

### UI not loading
- Check browser console for JavaScript errors
- Verify static files are being served from `/public`

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the main README.md
- Review API.md for API documentation
- See INTEGRATION_GUIDE.md for integration examples
