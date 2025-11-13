/**
 * Lightweight Netlify Serverless Function for Hackathon DAO API
 * Uses in-memory data store instead of AgentDB for smaller bundle size
 */

const serverless = require('serverless-http');
const express = require('express');

const app = express();
app.use(express.json());

// In-memory data store (resets on cold starts)
let data = {
  dao: {
    name: "Global Hackathon Platform",
    startDate: Date.now() - (30 * 24 * 60 * 60 * 1000),
    endDate: Date.now() + (60 * 24 * 60 * 60 * 1000)
  },
  teams: [],
  members: [],
  contributions: [],
  proposals: [],
  votes: [],
  royaltyPools: []
};

// Initialize with sample data
function initializeSampleData() {
  if (data.teams.length > 0) return; // Already initialized

  // Create teams
  const team1 = {
    id: 'team_1',
    name: "AI Innovators",
    description: "Building the future of AI",
    maxMembers: 5,
    createdBy: "admin",
    tags: ['ai', 'ml', 'innovation'],
    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
    memberCount: 2,
    totalContributions: 2,
    totalScore: 430
  };

  const team2 = {
    id: 'team_2',
    name: "Blockchain Builders",
    description: "Decentralized solutions",
    maxMembers: 4,
    createdBy: "admin",
    tags: ['blockchain', 'web3'],
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
    memberCount: 1,
    totalContributions: 0,
    totalScore: 0
  };

  // Create members
  const alice = {
    id: 'member_1',
    name: "Alice Johnson",
    email: "alice@example.com",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    role: "team_lead",
    skills: ['javascript', 'react', 'nodejs'],
    github: "alice_j",
    reputation: 120,
    joinedAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
    teams: ['team_1'],
    totalContributions: 1,
    totalScore: 300
  };

  const bob = {
    id: 'member_2',
    name: "Bob Smith",
    email: "bob@example.com",
    wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
    role: "member",
    skills: ['python', 'ml', 'data-science'],
    github: "bob_s",
    reputation: 100,
    joinedAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
    teams: ['team_1'],
    totalContributions: 1,
    totalScore: 130
  };

  const charlie = {
    id: 'member_3',
    name: "Charlie Davis",
    email: "charlie@example.com",
    wallet: "0x234567890abcdef234567890abcdef2345678901",
    role: "member",
    skills: ['rust', 'blockchain', 'smart-contracts'],
    github: "charlie_d",
    reputation: 100,
    joinedAt: Date.now() - (6 * 24 * 60 * 60 * 1000),
    teams: ['team_2'],
    totalContributions: 0,
    totalScore: 0
  };

  // Create contributions
  const contrib1 = {
    id: 'contrib_1',
    teamId: 'team_1',
    memberId: 'member_1',
    type: 'code',
    description: 'Implemented authentication system',
    score: 300,
    verified: true,
    verifiedBy: 'member_1',
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
    data: {
      linesAdded: 350,
      filesChanged: 5,
      complexity: 4,
      hasTests: true
    }
  };

  const contrib2 = {
    id: 'contrib_2',
    teamId: 'team_1',
    memberId: 'member_2',
    type: 'research',
    description: 'ML model research',
    score: 130,
    verified: true,
    verifiedBy: 'member_1',
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
    data: {
      sourcesCount: 10,
      hasAnalysis: true,
      isComprehensive: true
    }
  };

  // Store data
  data.teams = [team1, team2];
  data.members = [alice, bob, charlie];
  data.contributions = [contrib1, contrib2];

  console.log('Sample data initialized');
}

// Initialize on cold start
initializeSampleData();

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hackathon DAO API Lite is running',
    timestamp: new Date().toISOString(),
    dataInitialized: data.teams.length > 0
  });
});

// DAO Info
app.get('/api/dao', (req, res) => {
  try {
    const stats = {
      ...data.dao,
      totalTeams: data.teams.length,
      totalMembers: data.members.length,
      totalContributions: data.contributions.length,
      activeProposals: data.proposals.filter(p => p.status === 'active').length,
      totalRoyaltyPools: data.royaltyPools.length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teams
app.get('/api/teams', (req, res) => {
  try {
    res.json(data.teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teams/leaderboard', (req, res) => {
  try {
    const leaderboard = [...data.teams]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((team, index) => ({
        rank: index + 1,
        ...team
      }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', (req, res) => {
  try {
    const team = {
      id: `team_${data.teams.length + 1}`,
      ...req.body,
      createdAt: Date.now(),
      memberCount: 0,
      totalContributions: 0,
      totalScore: 0
    };
    data.teams.push(team);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teams/:id', (req, res) => {
  try {
    const team = data.teams.find(t => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = data.members.filter(m => m.teams.includes(req.params.id));
    const contributions = data.contributions.filter(c => c.teamId === req.params.id);

    res.json({
      team,
      members,
      contributions,
      stats: {
        memberCount: members.length,
        contributionCount: contributions.length,
        totalScore: contributions.reduce((sum, c) => sum + c.score, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teams/:id/stats', (req, res) => {
  try {
    const team = data.teams.find(t => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams/:teamId/members/:memberId', (req, res) => {
  try {
    const member = data.members.find(m => m.id === req.params.memberId);
    const team = data.teams.find(t => t.id === req.params.teamId);

    if (!member || !team) {
      return res.status(404).json({ error: 'Member or team not found' });
    }

    if (!member.teams.includes(req.params.teamId)) {
      member.teams.push(req.params.teamId);
      team.memberCount++;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Members
app.get('/api/members', (req, res) => {
  try {
    res.json(data.members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/leaderboard', (req, res) => {
  try {
    const leaderboard = [...data.members]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((member, index) => ({
        rank: index + 1,
        ...member
      }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', (req, res) => {
  try {
    const member = {
      id: `member_${data.members.length + 1}`,
      ...req.body,
      reputation: 100,
      joinedAt: Date.now(),
      teams: [],
      totalContributions: 0,
      totalScore: 0
    };
    data.members.push(member);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/members/:id', (req, res) => {
  try {
    const member = data.members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const contributions = data.contributions.filter(c => c.memberId === req.params.id);
    const teams = data.teams.filter(t => member.teams.includes(t.id));

    res.json({
      member,
      teams,
      contributions,
      stats: {
        teamCount: teams.length,
        contributionCount: contributions.length,
        totalScore: contributions.reduce((sum, c) => sum + c.score, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contributions
app.get('/api/contributions', (req, res) => {
  try {
    const contributions = data.contributions.slice(0, 100);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contributions/team/:teamId', (req, res) => {
  try {
    const contributions = data.contributions.filter(c => c.teamId === req.params.teamId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contributions/member/:memberId', (req, res) => {
  try {
    const contributions = data.contributions.filter(c => c.memberId === req.params.memberId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contributions', (req, res) => {
  try {
    const contribution = {
      id: `contrib_${data.contributions.length + 1}`,
      ...req.body,
      score: calculateScore(req.body.type, req.body.data),
      verified: false,
      timestamp: Date.now()
    };
    data.contributions.push(contribution);

    // Update team and member stats
    const team = data.teams.find(t => t.id === contribution.teamId);
    const member = data.members.find(m => m.id === contribution.memberId);
    if (team) {
      team.totalContributions++;
      team.totalScore += contribution.score;
    }
    if (member) {
      member.totalContributions++;
      member.totalScore += contribution.score;
    }

    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/contributions/:id/verify', (req, res) => {
  try {
    const contribution = data.contributions.find(c => c.id === req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    contribution.verified = true;
    contribution.verifiedBy = req.body.verifierId;
    contribution.verifiedAt = Date.now();

    res.json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Proposals
app.get('/api/proposals', (req, res) => {
  try {
    const activeProposals = data.proposals.filter(p => p.status === 'active');
    res.json(activeProposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proposals/:id', (req, res) => {
  try {
    const proposal = data.proposals.find(p => p.id === req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const votes = data.votes.filter(v => v.proposalId === req.params.id);
    const stats = {
      totalVotes: votes.length,
      votesFor: votes.filter(v => v.vote === 'for').length,
      votesAgainst: votes.filter(v => v.vote === 'against').length,
      votesAbstain: votes.filter(v => v.vote === 'abstain').length
    };

    res.json({ proposal, stats, votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proposals', (req, res) => {
  try {
    const proposal = {
      id: `proposal_${data.proposals.length + 1}`,
      ...req.body,
      status: 'active',
      createdAt: Date.now()
    };
    data.proposals.push(proposal);
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/proposals/:id/vote', (req, res) => {
  try {
    const proposal = data.proposals.find(p => p.id === req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const vote = {
      id: `vote_${data.votes.length + 1}`,
      proposalId: req.params.id,
      voterId: req.body.voterId,
      vote: req.body.vote,
      reason: req.body.reason,
      weight: 1.0,
      timestamp: Date.now()
    };
    data.votes.push(vote);

    res.json(vote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Royalties
app.get('/api/royalties/team/:teamId', (req, res) => {
  try {
    const pools = data.royaltyPools.filter(p => p.teamId === req.params.teamId);
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/royalties/member/:memberId', (req, res) => {
  try {
    const royalties = {
      memberId: req.params.memberId,
      totalEarned: 0,
      pools: []
    };
    res.json(royalties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/royalties/pool/:poolId', (req, res) => {
  try {
    const pool = data.royaltyPools.find(p => p.id === req.params.poolId);
    if (!pool) {
      return res.status(404).json({ error: 'Royalty pool not found' });
    }
    res.json(pool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/royalties/distribute', (req, res) => {
  try {
    const pool = {
      id: `pool_${data.royaltyPools.length + 1}`,
      teamId: req.body.teamId,
      amount: req.body.amount,
      model: req.body.model || 'linear',
      status: 'pending',
      createdAt: Date.now()
    };
    data.royaltyPools.push(pool);
    res.status(201).json({ pool });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
function calculateScore(type, data) {
  switch (type) {
    case 'code':
      return Math.min((data.linesAdded || 0) * 0.5, 200) +
             (data.complexity || 1) * 20 +
             (data.filesChanged || 1) * 10 +
             (data.hasTests ? 30 : 0) +
             (data.hasDocumentation ? 20 : 0);
    case 'research':
      return (data.sourcesCount || 1) * 10 +
             (data.hasAnalysis ? 30 : 0) +
             (data.isComprehensive ? 20 : 0);
    case 'review':
      return (data.filesReviewed || 1) * 5 +
             (data.commentsCount || 1) * 3 +
             (data.isDetailed ? 20 : 0);
    default:
      return 50;
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message
  });
});

// Export handler for Netlify
const handler = serverless(app);

exports.handler = async (event, context) => {
  // Re-initialize data on cold starts
  initializeSampleData();

  try {
    return await handler(event, context);
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Function error',
        message: error.message
      })
    };
  }
};
