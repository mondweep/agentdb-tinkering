/**
 * Hackathon DAO - Main Controller
 * Orchestrates all DAO operations
 */

const HackathonDatabase = require('./database');
const TeamManager = require('../teams/team-manager');
const MemberManager = require('../teams/member-manager');
const ContributionTracker = require('../contributions/tracker');
const ContributionAnalyzer = require('../contributions/analyzer');
const RoyaltyEngine = require('./royalty');
const ProposalManager = require('../governance/proposals');
const VotingSystem = require('../governance/voting');

class HackathonDAO {
  constructor(config = {}) {
    this.config = {
      name: config.name || 'Hackathon DAO',
      startDate: config.startDate || Date.now(),
      endDate: config.endDate || Date.now() + (30 * 24 * 60 * 60 * 1000),
      ...config
    };

    // Initialize database
    this.db = new HackathonDatabase({
      name: this.config.name.toLowerCase().replace(/\s+/g, '_')
    });

    // Initialize managers
    this.teams = null;
    this.members = null;
    this.contributions = null;
    this.analyzer = null;
    this.royalty = null;
    this.proposals = null;
    this.voting = null;

    this.initialized = false;
  }

  /**
   * Initialize the DAO
   */
  async initialize() {
    if (this.initialized) {
      console.log('DAO already initialized');
      return;
    }

    console.log(`\n🚀 Initializing Hackathon DAO: ${this.config.name}`);
    console.log(`Period: ${new Date(this.config.startDate).toISOString()} to ${new Date(this.config.endDate).toISOString()}\n`);

    await this.db.initialize();

    // Initialize all managers
    this.teams = new TeamManager(this.db);
    this.members = new MemberManager(this.db);
    this.contributions = new ContributionTracker(this.db);
    this.analyzer = new ContributionAnalyzer();
    this.royalty = new RoyaltyEngine(this.db);
    this.proposals = new ProposalManager(this.db);
    this.voting = new VotingSystem(this.db);

    this.initialized = true;
    console.log('✓ DAO initialization complete\n');
  }

  /**
   * Create a new team
   */
  async createTeam(teamData) {
    this.ensureInitialized();
    return await this.teams.createTeam(teamData);
  }

  /**
   * Register a new member
   */
  async registerMember(memberData) {
    this.ensureInitialized();
    return await this.members.createMember(memberData);
  }

  /**
   * Add member to team
   */
  async addMemberToTeam(memberId, teamId) {
    this.ensureInitialized();
    await this.teams.addMember(teamId, memberId);
    await this.members.joinTeam(memberId, teamId);
    return { teamId, memberId };
  }

  /**
   * Track a contribution
   */
  async trackContribution(contributionData) {
    this.ensureInitialized();
    const contribution = await this.contributions.trackContribution(contributionData);

    // Update member's contribution record
    await this.members.recordContribution(
      contributionData.memberId,
      contribution.id,
      contribution.score
    );

    return contribution;
  }

  /**
   * Analyze git repository and track contributions
   */
  async analyzeRepository(repoPath, teamId) {
    this.ensureInitialized();

    console.log(`\n📊 Analyzing repository: ${repoPath}`);

    const team = await this.teams.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const contributions = [];

    // Analyze commits for each team member
    for (const memberId of team.members) {
      const member = await this.members.getMember(memberId);
      if (!member || !member.github) continue;

      console.log(`  Analyzing commits for ${member.name}...`);

      const commits = await this.analyzer.analyzeGitCommits(
        repoPath,
        member.github,
        this.config.startDate
      );

      for (const commit of commits) {
        const contributionData = this.analyzer.extractContributionData(commit, repoPath);

        const contribution = await this.trackContribution({
          teamId,
          memberId,
          type: 'code',
          description: commit.message,
          data: contributionData,
          repository: repoPath,
          commitHash: commit.hash
        });

        contributions.push(contribution);
      }
    }

    console.log(`✓ Analysis complete: ${contributions.length} contributions tracked\n`);
    return contributions;
  }

  /**
   * Create a proposal
   */
  async createProposal(proposalData) {
    this.ensureInitialized();
    return await this.proposals.createProposal(proposalData);
  }

  /**
   * Vote on a proposal
   */
  async vote(proposalId, voterId, vote, reason) {
    this.ensureInitialized();
    const voteRecord = await this.voting.castVote({
      proposalId,
      voterId,
      vote,
      reason
    });

    // Check if proposal should be finalized
    const proposal = await this.proposals.getProposal(proposalId);
    const stats = await this.proposals.getProposalStats(proposalId);

    if (stats.canExecute || Date.now() > proposal.expiresAt) {
      await this.proposals.finalizeProposal(proposalId);
    }

    return voteRecord;
  }

  /**
   * Create and distribute royalties
   */
  async distributeRoyalties(teamId, amount, options = {}) {
    this.ensureInitialized();

    console.log(`\n💰 Creating royalty distribution for team ${teamId}`);

    // Create royalty pool
    const pool = await this.royalty.createRoyaltyPool({
      name: options.name || `Royalty Pool - ${new Date().toISOString()}`,
      teamId,
      totalAmount: amount,
      currency: options.currency || 'USD',
      distributionModel: options.model || 'weighted',
      periodStart: options.periodStart || this.config.startDate,
      periodEnd: options.periodEnd || Date.now(),
      source: options.source,
      description: options.description
    });

    // Calculate distribution
    await this.royalty.calculateDistribution(pool.id);

    // Create approval proposal if governance enabled
    if (options.requireApproval !== false) {
      const team = await this.teams.getTeam(teamId);
      const proposal = await this.proposals.createRoyaltyDistributionProposal(
        pool.id,
        options.proposedBy || team.createdBy,
        teamId
      );

      console.log(`📝 Approval proposal created: ${proposal.id}`);
      return { pool, proposal };
    }

    // Execute immediately if no approval needed
    await this.royalty.executeDistribution(pool.id);
    return { pool };
  }

  /**
   * Get comprehensive DAO statistics
   */
  async getDAOStats() {
    this.ensureInitialized();

    const teams = await this.teams.listTeams();
    const members = await this.members.listMembers();
    const contributions = await this.contributions.listContributions();
    const proposals = await this.proposals.getActiveProposals();

    const stats = {
      dao: {
        name: this.config.name,
        startDate: this.config.startDate,
        endDate: this.config.endDate,
        isActive: Date.now() >= this.config.startDate && Date.now() <= this.config.endDate
      },
      teams: {
        total: teams.length,
        active: teams.filter(t => t.status === 'active').length
      },
      members: {
        total: members.length,
        active: members.filter(m => m.status === 'active').length
      },
      contributions: {
        total: contributions.length,
        verified: contributions.filter(c => c.verified).length,
        totalScore: contributions.reduce((sum, c) => sum + c.score, 0)
      },
      governance: {
        activeProposals: proposals.length,
        totalProposals: (await this.db.list('proposals')).length
      }
    };

    return stats;
  }

  /**
   * Get team dashboard
   */
  async getTeamDashboard(teamId) {
    this.ensureInitialized();

    const team = await this.teams.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const teamStats = await this.teams.getTeamStats(teamId);
    const contributions = await this.contributions.getContributionsByTeam(teamId);
    const proposals = await this.proposals.getTeamProposals(teamId);
    const royaltyPools = await this.royalty.getTeamRoyaltyPools(teamId);

    const memberDetails = [];
    for (const memberId of team.members) {
      const member = await this.members.getMember(memberId);
      const memberStats = await this.members.getMemberStats(memberId);
      memberDetails.push({ ...member, stats: memberStats });
    }

    return {
      team,
      stats: teamStats,
      members: memberDetails,
      recentContributions: contributions.slice(-10),
      proposals: proposals.filter(p => p.status === 'active'),
      royaltyPools
    };
  }

  /**
   * Get member dashboard
   */
  async getMemberDashboard(memberId) {
    this.ensureInitialized();

    const member = await this.members.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    const memberStats = await this.members.getMemberStats(memberId);
    const votingStats = await this.voting.getMemberVotingStats(memberId);
    const royalties = await this.royalty.getMemberTotalRoyalties(memberId);

    const teams = [];
    for (const teamId of member.teams) {
      const team = await this.teams.getTeam(teamId);
      if (team) teams.push(team);
    }

    return {
      member,
      stats: memberStats,
      votingStats,
      royalties,
      teams
    };
  }

  /**
   * Close the DAO and cleanup
   */
  async close() {
    if (this.db) {
      await this.db.close();
    }
    this.initialized = false;
  }

  /**
   * Ensure DAO is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('DAO not initialized. Call initialize() first.');
    }
  }
}

module.exports = HackathonDAO;
