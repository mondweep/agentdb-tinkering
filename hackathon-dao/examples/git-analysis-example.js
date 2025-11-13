/**
 * Git Analysis Example
 * Demonstrates automatic contribution tracking from git repositories
 */

const HackathonDAO = require('../src/core/dao');
const path = require('path');

async function runGitAnalysisExample() {
  console.log('='.repeat(80));
  console.log('HACKATHON DAO - GIT ANALYSIS EXAMPLE');
  console.log('='.repeat(80));

  const dao = new HackathonDAO({
    name: "Open Source Hackathon",
    startDate: new Date('2025-01-01').getTime(),
    endDate: new Date('2025-12-31').getTime()
  });

  await dao.initialize();

  // Create a team
  console.log('\n📋 Setting up team and members...\n');

  const team = await dao.createTeam({
    name: "Open Source Contributors",
    description: "Building amazing open source tools",
    maxMembers: 10,
    createdBy: "admin",
    repository: "https://github.com/example/project"
  });

  // Register team members with their GitHub usernames
  const alice = await dao.registerMember({
    name: "Alice Johnson",
    email: "alice@example.com",
    wallet: "0x1111111111111111111111111111111111111111",
    role: "team_lead",
    skills: ['javascript', 'nodejs', 'git'],
    github: "alice" // GitHub username for commit matching
  });

  const bob = await dao.registerMember({
    name: "Bob Smith",
    email: "bob@example.com",
    wallet: "0x2222222222222222222222222222222222222222",
    role: "member",
    skills: ['python', 'django', 'postgresql'],
    github: "bob"
  });

  // Add members to team
  await dao.addMemberToTeam(alice.id, team.id);
  await dao.addMemberToTeam(bob.id, team.id);

  // Analyze git repository
  // NOTE: Replace with actual repository path
  const repoPath = path.join(__dirname, '../..'); // Current repository

  console.log('\n📊 Analyzing git repository...\n');
  console.log(`Repository path: ${repoPath}`);
  console.log(`Analyzing commits since: ${new Date(dao.config.startDate).toISOString()}\n`);

  try {
    // This will analyze all commits by team members since the start date
    const contributions = await dao.analyzeRepository(repoPath, team.id);

    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS RESULTS');
    console.log('='.repeat(80) + '\n');

    // Generate contribution report
    const report = dao.analyzer.generateContributionReport(
      contributions.map(c => ({
        linesAdded: c.data.linesAdded || 0,
        linesRemoved: c.data.linesRemoved || 0,
        files: c.metadata.fileChanges || [],
        timestamp: c.timestamp
      }))
    );

    console.log('Git Repository Analysis:');
    console.log(`  Total Commits: ${report.totalCommits}`);
    console.log(`  Lines Added: ${report.totalLinesAdded}`);
    console.log(`  Lines Removed: ${report.totalLinesRemoved}`);
    console.log(`  Files Changed: ${report.totalFilesChanged}`);
    console.log(`  Average Commit Size: ${report.averageCommitSize.toFixed(2)} lines`);

    if (Object.keys(report.languageDistribution).length > 0) {
      console.log('\nLanguage Distribution:');
      Object.entries(report.languageDistribution)
        .sort(([, a], [, b]) => b - a)
        .forEach(([lang, lines]) => {
          console.log(`  ${lang}: ${lines} lines`);
        });
    }

    // Show contribution breakdown by member
    console.log('\n' + '-'.repeat(80));
    console.log('CONTRIBUTION BREAKDOWN BY MEMBER');
    console.log('-'.repeat(80) + '\n');

    for (const memberId of team.members) {
      const member = await dao.members.getMember(memberId);
      const memberStats = await dao.members.getMemberStats(memberId);

      console.log(`${member.name} (@${member.github}):`);
      console.log(`  Total Contributions: ${memberStats.totalContributions}`);
      console.log(`  Total Score: ${memberStats.totalScore}`);
      console.log(`  Average Score: ${memberStats.averageScore.toFixed(2)}`);

      if (Object.keys(memberStats.contributionsByType).length > 0) {
        console.log('  By Type:');
        Object.entries(memberStats.contributionsByType).forEach(([type, data]) => {
          console.log(`    ${type}: ${data.count} (${data.totalScore} points)`);
        });
      }
      console.log('');
    }

    // Propose contributions for verification
    console.log('-'.repeat(80));
    console.log('CREATING VERIFICATION PROPOSALS');
    console.log('-'.repeat(80) + '\n');

    // Create proposals for significant contributions
    const significantContributions = contributions.filter(c => c.score > 50);

    for (const contrib of significantContributions.slice(0, 3)) {
      const member = await dao.members.getMember(contrib.memberId);
      const proposal = await dao.proposals.createContributionVerificationProposal(
        contrib.id,
        alice.id, // Proposed by team lead
        team.id
      );

      console.log(`✓ Created verification proposal for ${member.name}'s contribution`);
      console.log(`  Type: ${contrib.type}, Score: ${contrib.score}`);
      console.log(`  Proposal ID: ${proposal.id}\n`);
    }

    // Create royalty distribution based on contributions
    console.log('-'.repeat(80));
    console.log('ROYALTY DISTRIBUTION SIMULATION');
    console.log('-'.repeat(80) + '\n');

    const royaltyResult = await dao.distributeRoyalties(
      team.id,
      5000, // $5,000 prize
      {
        name: "Monthly Contribution Rewards",
        currency: 'USD',
        model: 'weighted',
        periodStart: dao.config.startDate,
        periodEnd: Date.now(),
        source: 'monthly_rewards',
        proposedBy: alice.id,
        requireApproval: false // Auto-approve for demo
      }
    );

    const report = await dao.royalty.getDistributionReport(royaltyResult.pool.id);

    console.log('Royalty Distribution:');
    report.distributions.forEach((dist, index) => {
      console.log(`  ${index + 1}. ${dist.memberName}: $${dist.amount.toFixed(2)} (${dist.percentage.toFixed(1)}%)`);
      console.log(`     Based on ${dist.contributionCount} verified contributions`);
      console.log(`     Wallet: ${dist.memberWallet}\n`);
    });

  } catch (error) {
    console.error('Error analyzing repository:', error.message);
    console.log('\nNote: This example requires a valid git repository.');
    console.log('To use with your own repository:');
    console.log('  1. Update the repoPath variable');
    console.log('  2. Ensure team members have correct GitHub usernames');
    console.log('  3. Adjust the start date to match your project timeline\n');
  }

  console.log('='.repeat(80));
  console.log('GIT ANALYSIS EXAMPLE COMPLETED');
  console.log('='.repeat(80) + '\n');

  await dao.close();
}

if (require.main === module) {
  runGitAnalysisExample().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = runGitAnalysisExample;
