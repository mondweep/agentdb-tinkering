# Hackathon DAO - Decentralized Contribution Tracking System

A comprehensive system for organizing global hackathons with transparent contribution tracking and automated royalty distribution using AgentDB.

## Overview

This system enables:
- **Multi-team collaboration** across global hackathons
- **Transparent contribution tracking** for all team members
- **Automated royalty distribution** based on verified contributions
- **DAO governance** for fair decision-making
- **Immutable audit trail** using AgentDB vector database

## Features

### 1. Team Management
- Create and manage hackathon teams
- Invite members with role-based permissions
- Track team progress and deliverables

### 2. Contribution Tracking
- Automatic git commit analysis
- Code quality scoring
- Pull request reviews
- Documentation contributions
- Design and ideation credits

### 3. DAO Governance
- Proposal creation and voting
- Contribution validation
- Dispute resolution
- Milestone approval

### 4. Royalty Distribution
- Transparent contribution scoring
- Automated royalty calculations
- Multi-stakeholder payouts
- Historical contribution records

## Architecture

```
hackathon-dao/
├── src/
│   ├── core/
│   │   ├── database.js        # AgentDB integration
│   │   ├── dao.js             # DAO governance logic
│   │   └── royalty.js         # Royalty calculation engine
│   ├── teams/
│   │   ├── team-manager.js    # Team CRUD operations
│   │   └── member-manager.js  # Member management
│   ├── contributions/
│   │   ├── tracker.js         # Contribution tracking
│   │   ├── analyzer.js        # Git/code analysis
│   │   └── scorer.js          # Contribution scoring
│   └── governance/
│       ├── proposals.js       # Proposal management
│       └── voting.js          # Voting mechanisms
├── examples/
│   └── usage-examples.js
├── tests/
│   └── integration.test.js
└── README.md
```

## Installation

```bash
npm install
```

## Quick Start

```javascript
const HackathonDAO = require('./src/core/dao');

// Initialize the DAO
const dao = new HackathonDAO({
  name: "Global AI Hackathon 2025",
  startDate: "2025-01-01",
  endDate: "2025-01-31"
});

// Create a team
const team = await dao.createTeam({
  name: "AI Innovators",
  description: "Building the future of AI",
  maxMembers: 5
});

// Add members
await team.addMember({
  name: "Alice",
  role: "team_lead",
  wallet: "0x123..."
});

// Track contribution
await dao.trackContribution({
  teamId: team.id,
  memberId: "alice_id",
  type: "code",
  data: {
    commits: 15,
    linesAdded: 500,
    linesRemoved: 100
  }
});

// Calculate royalties
const royalties = await dao.calculateRoyalties(team.id);
console.log(royalties);
```

## Use Cases

1. **Global Hackathons**: Track contributions from distributed teams worldwide
2. **Open Source Projects**: Fair compensation for contributors
3. **Innovation Challenges**: Corporate challenges with prize distribution
4. **Educational Programs**: Student project collaboration with credit tracking
5. **Research Collaborations**: Academic partnerships with IP sharing

## Technology Stack

- **AgentDB**: Vector database for contribution storage and semantic search
- **Claude Flow**: AI agent orchestration for code analysis
- **Research Swarm**: Multi-agent research and validation
- **HNSW**: Fast similarity search for matching contributions
- **ReasoningBank**: Learning from past hackathons

## License

MIT
