# Hackathon DAO Integration Guide

Step-by-step guide for integrating Hackathon DAO into your global hackathon.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Integration Scenarios](#integration-scenarios)
5. [Best Practices](#best-practices)
6. [Blockchain Integration](#blockchain-integration)
7. [Troubleshooting](#troubleshooting)

## Overview

The Hackathon DAO system provides:
- **Transparent Contribution Tracking**: Automated git analysis and manual contribution logging
- **Fair Royalty Distribution**: Multiple distribution models (linear, weighted, milestone, hybrid)
- **Democratic Governance**: Proposal and voting system for team decisions
- **Reputation System**: Merit-based voting weights and badges
- **Multi-Team Support**: Manage multiple teams in a single hackathon

## Prerequisites

### Required
- Node.js 16+
- Git repository for each team
- AgentDB (installed via npm)

### Optional
- Blockchain wallet addresses for royalty distribution
- GitHub API token for enhanced git analysis
- PostgreSQL for production database (AgentDB can use persistent storage)

## Setup

### 1. Installation

```bash
npm install agentdb claude-flow@alpha research-swarm
```

### 2. Basic Initialization

```javascript
const HackathonDAO = require('./hackathon-dao/src/core/dao');

const dao = new HackathonDAO({
  name: "Your Hackathon Name",
  startDate: new Date('2025-01-01').getTime(),
  endDate: new Date('2025-01-31').getTime()
});

await dao.initialize();
```

### 3. Configuration Options

```javascript
const config = {
  // Basic info
  name: "Global AI Hackathon 2025",
  startDate: Date.now(),
  endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),

  // Database config
  database: {
    name: 'hackathon_db',
    dimensions: 1536,
    indexType: 'hnsw'
  },

  // Governance settings
  governance: {
    defaultQuorum: 0.5,        // 50% participation required
    defaultThreshold: 0.66,    // 66% approval required
    proposalDuration: 7 * 24 * 60 * 60 * 1000  // 7 days
  },

  // Royalty settings
  royalty: {
    defaultModel: 'weighted',
    requireApproval: true
  }
};
```

## Integration Scenarios

### Scenario 1: Single Team Hackathon

Perfect for focused hackathons with one team building a specific project.

```javascript
// Setup
const dao = new HackathonDAO({ name: "Single Team Hackathon" });
await dao.initialize();

// Create team
const team = await dao.createTeam({
  name: "The Builders",
  description: "Building an AI-powered tool",
  maxMembers: 10,
  createdBy: "admin"
});

// Register members
const members = [];
for (const memberData of teamMembers) {
  const member = await dao.registerMember(memberData);
  await dao.addMemberToTeam(member.id, team.id);
  members.push(member);
}

// Track contributions automatically from git
await dao.analyzeRepository('/path/to/repo', team.id);

// Distribute prize money
await dao.distributeRoyalties(team.id, 10000, {
  model: 'weighted',
  requireApproval: true
});
```

### Scenario 2: Multi-Team Competition

For hackathons with multiple competing teams.

```javascript
const dao = new HackathonDAO({ name: "Multi-Team Hackathon" });
await dao.initialize();

// Create multiple teams
const teams = [];
for (const teamData of teamsData) {
  const team = await dao.createTeam(teamData);
  teams.push(team);
}

// Distribute members across teams
for (const [memberId, teamId] of assignments) {
  await dao.addMemberToTeam(memberId, teamId);
}

// Track contributions for all teams
for (const team of teams) {
  await dao.analyzeRepository(team.repository, team.id);
}

// Get leaderboard
const leaderboard = await dao.teams.getLeaderboard(10);

// Award prizes to top teams
for (const [index, team] of leaderboard.slice(0, 3).entries()) {
  const prizes = [10000, 5000, 2500];
  await dao.distributeRoyalties(team.id, prizes[index], {
    name: `Prize - ${index + 1}${['st', 'nd', 'rd'][index]} Place`,
    model: 'hybrid'
  });
}
```

### Scenario 3: Open Source Contribution Tracking

For ongoing open source projects with continuous contributions.

```javascript
const dao = new HackathonDAO({
  name: "Open Source Project",
  startDate: Date.now(),
  endDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
});

await dao.initialize();

// Single team for all contributors
const project = await dao.createTeam({
  name: "Project Contributors",
  maxMembers: 100,
  repository: "https://github.com/org/project"
});

// Weekly contribution analysis
setInterval(async () => {
  await dao.analyzeRepository('/path/to/repo', project.id);

  // Monthly royalty distribution from sponsorship
  const now = new Date();
  if (now.getDate() === 1) {
    await dao.distributeRoyalties(project.id, monthlyBudget, {
      name: `Monthly Distribution - ${now.toISOString().slice(0, 7)}`,
      model: 'weighted',
      periodStart: now.getTime() - (30 * 24 * 60 * 60 * 1000),
      periodEnd: now.getTime()
    });
  }
}, 7 * 24 * 60 * 60 * 1000); // Weekly
```

### Scenario 4: Milestone-Based Funding

For projects with defined milestones and staged funding.

```javascript
const dao = new HackathonDAO({ name: "Milestone-Based Project" });
await dao.initialize();

const team = await dao.createTeam({
  name: "Product Development Team",
  maxMembers: 8
});

// Define milestones
const milestones = [
  { title: "MVP", amount: 5000 },
  { title: "Beta Release", amount: 10000 },
  { title: "Production Launch", amount: 15000 }
];

for (const ms of milestones) {
  const milestone = await dao.teams.addMilestone(team.id, {
    title: ms.title,
    description: `Complete ${ms.title}`,
    dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000)
  });

  // When milestone completed
  const proposal = await dao.proposals.createMilestoneApprovalProposal(
    team.id,
    milestone.id,
    teamLeadId
  );

  // Team votes
  // ... voting process ...

  // After approval
  await dao.distributeRoyalties(team.id, ms.amount, {
    name: `${ms.title} Completion Bonus`,
    model: 'milestone'
  });
}
```

### Scenario 5: Hybrid Governance Model

Combining contribution tracking with democratic decision-making.

```javascript
const dao = new HackathonDAO({ name: "Democratic Hackathon" });
await dao.initialize();

// Create team with governance
const team = await dao.createTeam({
  name: "Governed Team",
  maxMembers: 10
});

// Members register and join
// ... member registration ...

// Proposal: Should we change our tech stack?
const techProposal = await dao.createProposal({
  type: 'team_decision',
  title: "Switch to TypeScript",
  description: "Proposal to migrate codebase from JavaScript to TypeScript",
  proposedBy: memberId,
  teamId: team.id,
  quorumRequired: 0.6,
  approvalThreshold: 0.7
});

// All team members vote (weighted by contribution)
for (const member of teamMembers) {
  await dao.vote(techProposal.id, member.id, member.preference, member.reason);
}

// Proposal automatically finalizes when conditions met
// Execute based on result

// Proposal: Verify major contribution
const contribution = await dao.trackContribution({
  teamId: team.id,
  memberId: aliceId,
  type: 'code',
  description: "Complete rewrite of authentication system",
  data: { linesAdded: 2000, complexity: 5 }
});

const verifyProposal = await dao.proposals.createContributionVerificationProposal(
  contribution.id,
  teamLeadId,
  team.id
);

// Team votes to verify
// ... voting process ...
```

## Best Practices

### 1. Regular Git Analysis

Run git analysis regularly to keep contributions up-to-date:

```javascript
// Daily cron job
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const teams = await dao.teams.listTeams();

  for (const team of teams) {
    if (team.repository) {
      await dao.analyzeRepository(team.repository, team.id);
    }
  }
});
```

### 2. Contribution Verification Workflow

Implement a verification process for significant contributions:

```javascript
async function verifyMajorContributions(teamId, threshold = 100) {
  const contributions = await dao.contributions.getContributionsByTeam(teamId);

  const unverified = contributions.filter(c =>
    !c.verified && c.score > threshold
  );

  for (const contrib of unverified) {
    const proposal = await dao.proposals.createContributionVerificationProposal(
      contrib.id,
      teamLeadId,
      teamId
    );

    // Notify team members to vote
    await notifyTeamMembers(teamId, proposal.id);
  }
}
```

### 3. Transparent Royalty Distribution

Always use governance for large distributions:

```javascript
async function distributeWithApproval(teamId, amount, description) {
  const result = await dao.distributeRoyalties(teamId, amount, {
    name: description,
    model: 'hybrid', // Fair for most scenarios
    requireApproval: true
  });

  if (result.proposal) {
    // Notify team to vote
    await notifyTeamMembers(teamId, result.proposal.id);

    // Wait for voting period
    await waitForVotingCompletion(result.proposal.id);

    // Execute if approved
    const stats = await dao.proposals.getProposalStats(result.proposal.id);
    if (stats.canExecute) {
      await dao.proposals.executeProposal(result.proposal.id);
      await dao.royalty.executeDistribution(result.pool.id);

      // Notify members of distribution
      const report = await dao.royalty.getDistributionReport(result.pool.id);
      await notifyDistribution(report);
    }
  }
}
```

### 4. Reputation Management

Reward active participation:

```javascript
async function updateReputations(teamId) {
  const team = await dao.teams.getTeam(teamId);

  for (const memberId of team.members) {
    const stats = await dao.members.getMemberStats(memberId);
    const votingStats = await dao.voting.getMemberVotingStats(memberId);

    // Reward high contribution
    if (stats.totalContributions > 20) {
      await dao.members.updateReputation(memberId, 10, 'High activity');
    }

    // Reward participation
    if (votingStats.participationRate > 0.8) {
      await dao.members.updateReputation(memberId, 5, 'Active governance');
    }

    // Award badges
    if (stats.totalScore > 1000) {
      await dao.members.awardBadge(memberId, {
        name: "Super Contributor",
        description: "Exceeded 1000 contribution points",
        icon: "🌟"
      });
    }
  }
}
```

## Blockchain Integration

### Connecting Wallet Addresses

```javascript
// Register member with wallet
const member = await dao.registerMember({
  name: "Alice",
  email: "alice@example.com",
  wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Ethereum address
  // ... other fields
});
```

### Smart Contract Integration

For production, integrate with actual blockchain for royalty payments:

```javascript
const { ethers } = require('ethers');

async function executeBlockchainDistribution(poolId) {
  const report = await dao.royalty.getDistributionReport(poolId);

  // Connect to blockchain
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Execute transfers
  for (const dist of report.distributions) {
    if (dist.memberWallet) {
      const tx = await wallet.sendTransaction({
        to: dist.memberWallet,
        value: ethers.utils.parseEther(dist.amount.toString())
      });

      await tx.wait();
      console.log(`Paid ${dist.amount} to ${dist.memberName}`);
    }
  }
}
```

### Multi-Signature Approval

Require multiple approvals for large distributions:

```javascript
async function createMultisigDistribution(teamId, amount) {
  const result = await dao.distributeRoyalties(teamId, amount, {
    requireApproval: true,
    quorumRequired: 0.75, // Higher threshold
    approvalThreshold: 0.8
  });

  return result;
}
```

## Troubleshooting

### Common Issues

#### 1. Git Analysis Not Finding Commits

**Problem**: Repository analysis returns empty results.

**Solution**:
- Verify repository path is correct
- Check that member GitHub usernames match git author names
- Ensure date range includes the commits
- Verify git is installed and accessible

```javascript
// Debug git analysis
const commits = await dao.analyzer.analyzeGitCommits(
  repoPath,
  authorName,
  startDate
);
console.log(`Found ${commits.length} commits`);
```

#### 2. Low Contribution Scores

**Problem**: Contributions receiving unexpectedly low scores.

**Solution**:
- Check contribution data completeness
- Verify contribution type is correct
- Add quality indicators (hasTests, hasDocumentation)
- Consider using weighted distribution model

#### 3. Proposals Not Finalizing

**Problem**: Proposals remain active after voting.

**Solution**:
- Check quorum requirements
- Verify voting deadline hasn't passed
- Manually finalize if needed

```javascript
const stats = await dao.proposals.getProposalStats(proposalId);
console.log('Quorum reached:', stats.quorum.reached);
console.log('Can execute:', stats.canExecute);

if (stats.canExecute) {
  await dao.proposals.finalizeProposal(proposalId);
}
```

#### 4. Database Connection Issues

**Problem**: AgentDB failing to initialize.

**Solution**:
- Check AgentDB installation
- Verify database configuration
- Ensure proper permissions

```javascript
try {
  await dao.initialize();
} catch (error) {
  console.error('Initialization failed:', error);
  // Retry with different config
}
```

## Production Considerations

### Scaling

For large hackathons (100+ teams):

1. **Database**: Use persistent storage instead of in-memory
2. **Caching**: Implement Redis for frequently accessed data
3. **Queue**: Use job queue for git analysis
4. **API**: Build REST API for concurrent access

### Security

1. **Authentication**: Implement proper auth system
2. **Authorization**: Role-based access control
3. **Validation**: Input validation on all operations
4. **Audit Trail**: Log all significant actions

### Monitoring

```javascript
const metrics = {
  teams: await dao.teams.listTeams().then(t => t.length),
  members: await dao.members.listMembers().then(m => m.length),
  contributions: await dao.contributions.listContributions().then(c => c.length),
  activeProposals: await dao.proposals.getActiveProposals().then(p => p.length)
};

// Send to monitoring service
console.log('DAO Metrics:', metrics);
```

## Support

For issues and questions:
- GitHub Issues: [Report issues](https://github.com/your-org/hackathon-dao/issues)
- Documentation: [API Docs](./API.md)
- Examples: See `examples/` directory

## License

MIT License - See LICENSE file for details
