/**
 * Netlify Serverless Function for Hackathon DAO API
 * Wraps the Express app for serverless deployment
 */

const serverless = require('serverless-http');
const express = require('express');
const path = require('path');

// Import DAO modules
const HackathonDAO = require('../../hackathon-dao/src/core/dao');

const app = express();

// Middleware
app.use(express.json());

// Initialize DAO (will be cached between invocations)
let dao;

async function getDAO() {
  if (!dao) {
    dao = new HackathonDAO({
      name: "Global Hackathon Platform",
      startDate: Date.now() - (30 * 24 * 60 * 60 * 1000),
      endDate: Date.now() + (60 * 24 * 60 * 60 * 1000),
      filename: ':memory:' // Use in-memory database for serverless
    });

    await dao.initialize();

    // Seed sample data
    const teams = await dao.teams.listTeams();
    if (teams.length === 0) {
      await seedSampleData(dao);
    }
  }
  return dao;
}

async function seedSampleData(dao) {
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

  // Add contributions
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
}

// ============================================================================
// API ROUTES
// ============================================================================

// DAO Info
app.get('/dao', async (req, res) => {
  try {
    const dao = await getDAO();
    const stats = await dao.getDAOStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teams
app.get('/teams', async (req, res) => {
  try {
    const dao = await getDAO();
    const teams = await dao.teams.listTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific routes must come before parameterized routes
app.get('/teams/leaderboard', async (req, res) => {
  try {
    const dao = await getDAO();
    const leaderboard = await dao.teams.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/teams', async (req, res) => {
  try {
    const dao = await getDAO();
    const team = await dao.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/teams/:id/stats', async (req, res) => {
  try {
    const dao = await getDAO();
    const stats = await dao.teams.getTeamStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/teams/:teamId/members/:memberId', async (req, res) => {
  try {
    const dao = await getDAO();
    await dao.addMemberToTeam(req.params.memberId, req.params.teamId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/teams/:id', async (req, res) => {
  try {
    const dao = await getDAO();
    const dashboard = await dao.getTeamDashboard(req.params.id);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Members
app.get('/members', async (req, res) => {
  try {
    const dao = await getDAO();
    const members = await dao.members.listMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific routes must come before parameterized routes
app.get('/members/leaderboard', async (req, res) => {
  try {
    const dao = await getDAO();
    const leaderboard = await dao.members.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/members', async (req, res) => {
  try {
    const dao = await getDAO();
    const member = await dao.registerMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/members/:id', async (req, res) => {
  try {
    const dao = await getDAO();
    const dashboard = await dao.getMemberDashboard(req.params.id);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contributions
app.get('/contributions', async (req, res) => {
  try {
    const dao = await getDAO();
    const contributions = await dao.contributions.listContributions({ limit: 100 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/contributions/team/:teamId', async (req, res) => {
  try {
    const dao = await getDAO();
    const contributions = await dao.contributions.getContributionsByTeam(req.params.teamId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/contributions/member/:memberId', async (req, res) => {
  try {
    const dao = await getDAO();
    const contributions = await dao.contributions.getContributionsByMember(req.params.memberId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/contributions', async (req, res) => {
  try {
    const dao = await getDAO();
    const contribution = await dao.trackContribution(req.body);
    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/contributions/:id/verify', async (req, res) => {
  try {
    const dao = await getDAO();
    const { verifierId } = req.body;
    const contribution = await dao.contributions.verifyContribution(req.params.id, verifierId);
    res.json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Proposals
app.get('/proposals', async (req, res) => {
  try {
    const dao = await getDAO();
    const proposals = await dao.proposals.getActiveProposals();
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/proposals/:id', async (req, res) => {
  try {
    const dao = await getDAO();
    const proposal = await dao.proposals.getProposal(req.params.id);
    const stats = await dao.proposals.getProposalStats(req.params.id);
    const votes = await dao.voting.getProposalVotesWithDetails(req.params.id);
    res.json({ proposal, stats, votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/proposals', async (req, res) => {
  try {
    const dao = await getDAO();
    const proposal = await dao.createProposal(req.body);
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/proposals/:id/vote', async (req, res) => {
  try {
    const dao = await getDAO();
    const { voterId, vote, reason } = req.body;
    const result = await dao.vote(req.params.id, voterId, vote, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Royalties
app.get('/royalties/team/:teamId', async (req, res) => {
  try {
    const dao = await getDAO();
    const pools = await dao.royalty.getTeamRoyaltyPools(req.params.teamId);
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/royalties/member/:memberId', async (req, res) => {
  try {
    const dao = await getDAO();
    const royalties = await dao.royalty.getMemberTotalRoyalties(req.params.memberId);
    res.json(royalties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/royalties/pool/:poolId', async (req, res) => {
  try {
    const dao = await getDAO();
    const report = await dao.royalty.getDistributionReport(req.params.poolId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/royalties/distribute', async (req, res) => {
  try {
    const dao = await getDAO();
    const { teamId, amount, ...options } = req.body;
    const result = await dao.distributeRoyalties(teamId, amount, options);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export handler for Netlify
exports.handler = serverless(app);
