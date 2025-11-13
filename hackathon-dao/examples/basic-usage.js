/**
 * Basic Usage Example
 * Demonstrates the core functionality of Hackathon DAO
 */

const HackathonDAO = require('../src/core/dao');

async function runExample() {
  console.log('='.repeat(80));
  console.log('HACKATHON DAO - BASIC USAGE EXAMPLE');
  console.log('='.repeat(80));

  // Initialize the DAO
  const dao = new HackathonDAO({
    name: "Global AI Hackathon 2025",
    startDate: new Date('2025-01-01').getTime(),
    endDate: new Date('2025-01-31').getTime()
  });

  await dao.initialize();

  // Create teams
  console.log('\n📋 Creating teams...\n');

  const team1 = await dao.createTeam({
    name: "AI Innovators",
    description: "Building the future of AI-powered applications",
    maxMembers: 5,
    createdBy: "admin",
    tags: ['ai', 'ml', 'innovation'],
    repository: "https://github.com/ai-innovators/project"
  });

  const team2 = await dao.createTeam({
    name: "Code Warriors",
    description: "Crafting elegant solutions to complex problems",
    maxMembers: 4,
    createdBy: "admin",
    tags: ['fullstack', 'web3', 'blockchain']
  });

  // Register members
  console.log('\n👥 Registering members...\n');

  const alice = await dao.registerMember({
    name: "Alice Johnson",
    email: "alice@example.com",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    role: "team_lead",
    skills: ['javascript', 'react', 'nodejs'],
    github: "alice_j",
    bio: "Full-stack developer with passion for AI"
  });

  const bob = await dao.registerMember({
    name: "Bob Smith",
    email: "bob@example.com",
    wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
    role: "member",
    skills: ['python', 'machine-learning', 'data-science'],
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

  const diana = await dao.registerMember({
    name: "Diana Lee",
    email: "diana@example.com",
    wallet: "0x34567890abcdef34567890abcdef345678901234",
    role: "member",
    skills: ['ui/ux', 'design', 'figma'],
    github: "diana_l"
  });

  // Add members to teams
  console.log('\n🤝 Adding members to teams...\n');

  await dao.addMemberToTeam(alice.id, team1.id);
  await dao.addMemberToTeam(bob.id, team1.id);
  await dao.addMemberToTeam(charlie.id, team2.id);
  await dao.addMemberToTeam(diana.id, team1.id);

  // Track various contributions
  console.log('\n📊 Tracking contributions...\n');

  // Alice's code contribution
  await dao.trackContribution({
    teamId: team1.id,
    memberId: alice.id,
    type: 'code',
    description: 'Implemented core API endpoints with authentication',
    data: {
      linesAdded: 450,
      linesRemoved: 120,
      filesChanged: 8,
      complexity: 4,
      hasTests: true,
      hasDocumentation: true,
      followsStandards: true
    }
  });

  // Bob's research contribution
  await dao.trackContribution({
    teamId: team1.id,
    memberId: bob.id,
    type: 'research',
    description: 'Comprehensive analysis of ML model architectures',
    data: {
      sourcesCount: 15,
      hasAnalysis: true,
      hasRecommendations: true,
      isComprehensive: true,
      ledToImplementation: true
    }
  });

  // Diana's design contribution
  await dao.trackContribution({
    teamId: team1.id,
    memberId: diana.id,
    type: 'design',
    description: 'Created complete UI/UX design system',
    data: {
      designCount: 12,
      isInteractive: true,
      hasSpecifications: true,
      isResponsive: true,
      professionalTool: true
    }
  });

  // Bob's code review
  await dao.trackContribution({
    teamId: team1.id,
    memberId: bob.id,
    type: 'review',
    description: 'Thorough code review with security improvements',
    data: {
      comments: 25,
      foundBugs: 3,
      suggestedImprovements: 10,
      thoroughness: 5,
      timeSpent: 90
    }
  });

  // Charlie's blockchain contribution
  await dao.trackContribution({
    teamId: team2.id,
    memberId: charlie.id,
    type: 'code',
    description: 'Implemented smart contract for royalty distribution',
    data: {
      linesAdded: 320,
      linesRemoved: 50,
      filesChanged: 4,
      complexity: 5,
      hasTests: true,
      hasDocumentation: true,
      followsStandards: true
    }
  });

  // Add team milestone
  console.log('\n🎯 Adding milestones...\n');

  const milestone1 = await dao.teams.addMilestone(team1.id, {
    title: "MVP Development",
    description: "Complete minimum viable product with core features",
    dueDate: new Date('2025-01-15').getTime()
  });

  // Create proposal to approve milestone
  console.log('\n📝 Creating governance proposals...\n');

  const milestoneProposal = await dao.proposals.createMilestoneApprovalProposal(
    team1.id,
    milestone1.id,
    alice.id
  );

  // Team members vote on milestone completion
  console.log('\n🗳️  Voting on proposals...\n');

  await dao.vote(milestoneProposal.id, alice.id, 'for', 'Milestone completed successfully');
  await dao.vote(milestoneProposal.id, bob.id, 'for', 'All criteria met');

  // Check if proposal is still active before third vote
  const proposalStatus = await dao.proposals.getProposal(milestoneProposal.id);
  if (proposalStatus.status === 'active') {
    await dao.vote(milestoneProposal.id, diana.id, 'for', 'Great work team!');
  } else {
    console.log(`  Proposal already finalized with status: ${proposalStatus.status}`);
  }

  // Create proposal to verify a contribution
  const verificationProposal = await dao.proposals.createContributionVerificationProposal(
    (await dao.contributions.getContributionsByMember(alice.id))[0].id,
    bob.id,
    team1.id
  );

  await dao.vote(verificationProposal.id, alice.id, 'abstain', 'My own contribution');
  await dao.vote(verificationProposal.id, bob.id, 'for', 'Quality work');

  // Check again for verification proposal
  const verifyStatus = await dao.proposals.getProposal(verificationProposal.id);
  if (verifyStatus.status === 'active') {
    await dao.vote(verificationProposal.id, diana.id, 'for', 'Verified');
  } else {
    console.log(`  Proposal already finalized with status: ${verifyStatus.status}`);
  }

  // Execute passed proposals
  console.log('\n⚙️  Executing approved proposals...\n');

  if (proposalStatus.status === 'passed') {
    await dao.proposals.executeProposal(milestoneProposal.id);
  }

  if (verifyStatus.status === 'passed') {
    await dao.proposals.executeProposal(verificationProposal.id);
  }

  // Manually verify all contributions for the demo
  const allContributions = await dao.contributions.getContributionsByTeam(team1.id);
  for (const contrib of allContributions) {
    if (!contrib.verified) {
      await dao.contributions.verifyContribution(contrib.id, alice.id);
    }
  }

  // Create and distribute royalties
  console.log('\n💰 Creating royalty distribution...\n');

  const royaltyResult = await dao.distributeRoyalties(
    team1.id,
    10000, // $10,000
    {
      name: "Hackathon Prize Pool - Team 1",
      currency: 'USD',
      model: 'weighted',
      periodStart: dao.config.startDate,
      periodEnd: Date.now(),
      source: 'hackathon_prize',
      description: 'Prize money for winning team',
      proposedBy: alice.id,
      requireApproval: true
    }
  );

  // Vote on royalty distribution
  if (royaltyResult.proposal) {
    console.log('\n🗳️  Voting on royalty distribution...\n');
    await dao.vote(royaltyResult.proposal.id, alice.id, 'for', 'Fair distribution');
    await dao.vote(royaltyResult.proposal.id, bob.id, 'for', 'Approved');

    // Check if still active before third vote
    const royaltyProposalStatus = await dao.proposals.getProposal(royaltyResult.proposal.id);
    if (royaltyProposalStatus.status === 'active') {
      await dao.vote(royaltyResult.proposal.id, diana.id, 'for', 'Looks good');
    } else {
      console.log(`  Proposal already finalized with status: ${royaltyProposalStatus.status}`);
    }

    // Execute distribution after approval
    const finalProposalStatus = await dao.proposals.getProposal(royaltyResult.proposal.id);
    if (finalProposalStatus.status === 'passed') {
      await dao.proposals.executeProposal(royaltyResult.proposal.id);
      await dao.royalty.executeDistribution(royaltyResult.pool.id);
    }
  }

  // Display comprehensive statistics
  console.log('\n' + '='.repeat(80));
  console.log('DAO STATISTICS');
  console.log('='.repeat(80) + '\n');

  const daoStats = await dao.getDAOStats();
  console.log('Overall DAO Stats:');
  console.log(JSON.stringify(daoStats, null, 2));

  console.log('\n' + '-'.repeat(80));
  console.log('TEAM 1 DASHBOARD');
  console.log('-'.repeat(80) + '\n');

  const team1Dashboard = await dao.getTeamDashboard(team1.id);
  console.log(`Team: ${team1Dashboard.team.name}`);
  console.log(`Members: ${team1Dashboard.members.length}`);
  console.log(`Total Contributions: ${team1Dashboard.stats.totalContributions}`);
  console.log(`Total Score: ${team1Dashboard.stats.totalScore}`);
  console.log('\nTop Contributors:');
  team1Dashboard.members
    .sort((a, b) => b.totalScore - a.totalScore)
    .forEach((member, index) => {
      console.log(`  ${index + 1}. ${member.name}: ${member.totalScore} points`);
    });

  console.log('\n' + '-'.repeat(80));
  console.log('MEMBER DASHBOARDS');
  console.log('-'.repeat(80) + '\n');

  const aliceDashboard = await dao.getMemberDashboard(alice.id);
  console.log(`Member: ${aliceDashboard.member.name}`);
  console.log(`Total Score: ${aliceDashboard.member.totalScore}`);
  console.log(`Reputation: ${aliceDashboard.member.reputation}`);
  console.log(`Contributions: ${aliceDashboard.stats.totalContributions}`);
  console.log(`Voting Participation: ${aliceDashboard.votingStats.participationRate.toFixed(1)}%`);
  console.log(`Total Royalties Earned: $${aliceDashboard.royalties.totalEarned.toFixed(2)}`);

  // Display royalty distribution report
  console.log('\n' + '-'.repeat(80));
  console.log('ROYALTY DISTRIBUTION REPORT');
  console.log('-'.repeat(80) + '\n');

  const royaltyReport = await dao.royalty.getDistributionReport(royaltyResult.pool.id);
  console.log(`Pool: ${royaltyReport.poolName}`);
  console.log(`Total Amount: ${royaltyReport.totalAmount} ${royaltyReport.currency}`);
  console.log(`Status: ${royaltyReport.status.toUpperCase()}`);
  console.log(`Recipients: ${royaltyReport.recipientCount}\n`);

  console.log('Distribution Breakdown:');
  royaltyReport.distributions.forEach((dist, index) => {
    console.log(`  ${index + 1}. ${dist.memberName}`);
    console.log(`     Amount: $${dist.amount.toFixed(2)} (${dist.percentage.toFixed(2)}%)`);
    console.log(`     Wallet: ${dist.memberWallet}`);
    console.log(`     Contributions: ${dist.contributionCount}`);
    console.log('');
  });

  // Get leaderboards
  console.log('-'.repeat(80));
  console.log('LEADERBOARDS');
  console.log('-'.repeat(80) + '\n');

  const teamLeaderboard = await dao.teams.getLeaderboard(5);
  console.log('Top Teams:');
  teamLeaderboard.forEach((team, index) => {
    console.log(`  ${index + 1}. ${team.name}: ${team.stats.totalScore} points`);
  });

  const memberLeaderboard = await dao.members.getLeaderboard(5);
  console.log('\nTop Contributors:');
  memberLeaderboard.forEach((member) => {
    console.log(`  ${member.rank}. ${member.name}: ${member.totalScore} points (${member.contributionsCount} contributions)`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80) + '\n');

  // Cleanup
  await dao.close();
}

// Run the example
if (require.main === module) {
  runExample().catch(error => {
    console.error('Error running example:', error);
    process.exit(1);
  });
}

module.exports = runExample;
