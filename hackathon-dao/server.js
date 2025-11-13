/**
 * Hackathon DAO Web Server
 * REST API server for the Hackathon DAO system
 */

const express = require('express');
const path = require('path');
const HackathonDAO = require('./src/core/dao');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DAO
let dao;

async function initializeDAO() {
  dao = new HackathonDAO({
    name: "Global Hackathon Platform",
    startDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
    filename: 'hackathon_dao.db'
  });

  await dao.initialize();
  console.log('✓ DAO initialized');

  // Seed with sample data if empty
  const teams = await dao.teams.listTeams();
  if (teams.length === 0) {
    await seedSampleData();
  }
}

async function seedSampleData() {
  console.log('Seeding sample data...');

  // Create teams
  const team1 = await dao.createTeam({
    name: "AI Innovators",
    description: "Building the future of AI",
    maxMembers: 5,
    createdBy: "admin",
    tags: ['ai', 'ml', 'innovation']
  });

  const team2 = await dao.createTeam({
    name: "Blockchain Builders",
    description: "Decentralized solutions",
    maxMembers: 4,
    createdBy: "admin",
    tags: ['blockchain', 'web3']
  });

  // Create members
  const alice = await dao.registerMember({
    name: "Alice Johnson",
    email: "alice@example.com",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    role: "team_lead",
    skills: ['javascript', 'react', 'nodejs'],
    github: "alice_j"
  });

  const bob = await dao.registerMember({
    name: "Bob Smith",
    email: "bob@example.com",
    wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
    role: "member",
    skills: ['python', 'ml', 'data-science'],
    github: "bob_s"
  });

  const charlie = await dao.registerMember({
    name: "Charlie Davis",
    email: "charlie@example.com",
    wallet: "0x234567890abcdef234567890abcdef2345678901",
    role: "member",
    skills: ['rust', 'blockchain', 'smart-contracts'],
    github: "charlie_d"
  });

  // Add to teams
  await dao.addMemberToTeam(alice.id, team1.id);
  await dao.addMemberToTeam(bob.id, team1.id);
  await dao.addMemberToTeam(charlie.id, team2.id);

  // Add some contributions
  await dao.trackContribution({
    teamId: team1.id,
    memberId: alice.id,
    type: 'code',
    description: 'Implemented authentication system',
    data: { linesAdded: 350, filesChanged: 5, complexity: 4, hasTests: true }
  });

  await dao.trackContribution({
    teamId: team1.id,
    memberId: bob.id,
    type: 'research',
    description: 'ML model research',
    data: { sourcesCount: 10, hasAnalysis: true, isComprehensive: true }
  });

  // Verify contributions
  const contributions = await dao.contributions.getContributionsByTeam(team1.id);
  for (const contrib of contributions) {
    await dao.contributions.verifyContribution(contrib.id, alice.id);
  }

  console.log('✓ Sample data seeded');
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// -------------------- DAO Info --------------------
app.get('/api/dao', async (req, res) => {
  try {
    const stats = await dao.getDAOStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- Teams --------------------
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await dao.teams.listTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const dashboard = await dao.getTeamDashboard(req.params.id);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const team = await dao.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teams/:id/stats', async (req, res) => {
  try {
    const stats = await dao.teams.getTeamStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams/:teamId/members/:memberId', async (req, res) => {
  try {
    await dao.addMemberToTeam(req.params.memberId, req.params.teamId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teams/leaderboard', async (req, res) => {
  try {
    const leaderboard = await dao.teams.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- Members --------------------
app.get('/api/members', async (req, res) => {
  try {
    const members = await dao.members.listMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const dashboard = await dao.getMemberDashboard(req.params.id);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = await dao.registerMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/members/leaderboard', async (req, res) => {
  try {
    const leaderboard = await dao.members.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- Contributions --------------------
app.get('/api/contributions', async (req, res) => {
  try {
    const contributions = await dao.contributions.listContributions({ limit: 100 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contributions/team/:teamId', async (req, res) => {
  try {
    const contributions = await dao.contributions.getContributionsByTeam(req.params.teamId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contributions/member/:memberId', async (req, res) => {
  try {
    const contributions = await dao.contributions.getContributionsByMember(req.params.memberId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contributions', async (req, res) => {
  try {
    const contribution = await dao.trackContribution(req.body);
    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/contributions/:id/verify', async (req, res) => {
  try {
    const { verifierId } = req.body;
    const contribution = await dao.contributions.verifyContribution(req.params.id, verifierId);
    res.json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------- Proposals --------------------
app.get('/api/proposals', async (req, res) => {
  try {
    const proposals = await dao.proposals.getActiveProposals();
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proposals/:id', async (req, res) => {
  try {
    const proposal = await dao.proposals.getProposal(req.params.id);
    const stats = await dao.proposals.getProposalStats(req.params.id);
    const votes = await dao.voting.getProposalVotesWithDetails(req.params.id);
    res.json({ proposal, stats, votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proposals', async (req, res) => {
  try {
    const proposal = await dao.createProposal(req.body);
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/proposals/:id/vote', async (req, res) => {
  try {
    const { voterId, vote, reason } = req.body;
    const result = await dao.vote(req.params.id, voterId, vote, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------- Royalties --------------------
app.get('/api/royalties/team/:teamId', async (req, res) => {
  try {
    const pools = await dao.royalty.getTeamRoyaltyPools(req.params.teamId);
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/royalties/member/:memberId', async (req, res) => {
  try {
    const royalties = await dao.royalty.getMemberTotalRoyalties(req.params.memberId);
    res.json(royalties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/royalties/pool/:poolId', async (req, res) => {
  try {
    const report = await dao.royalty.getDistributionReport(req.params.poolId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/royalties/distribute', async (req, res) => {
  try {
    const { teamId, amount, ...options } = req.body;
    const result = await dao.distributeRoyalties(teamId, amount, options);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------- Serve Frontend --------------------
// Catch-all route for SPA - must be last
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

initializeDAO().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Hackathon DAO Server running on http://localhost:${PORT}`);
    console.log(`   API available at http://localhost:${PORT}/api`);
    console.log(`   Web UI at http://localhost:${PORT}\n`);
  });
}).catch(error => {
  console.error('Failed to initialize DAO:', error);
  process.exit(1);
});
