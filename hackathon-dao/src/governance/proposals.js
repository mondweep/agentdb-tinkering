/**
 * DAO Proposals
 * Manages proposal creation and lifecycle
 */

class ProposalManager {
  constructor(database) {
    this.db = database;
    this.proposalTypes = {
      CONTRIBUTION_VERIFICATION: 'contribution_verification',
      ROYALTY_DISTRIBUTION: 'royalty_distribution',
      TEAM_DECISION: 'team_decision',
      MEMBER_REMOVAL: 'member_removal',
      MILESTONE_APPROVAL: 'milestone_approval',
      RULE_CHANGE: 'rule_change'
    };
  }

  /**
   * Create a new proposal
   */
  async createProposal(proposalData) {
    const proposal = {
      id: this.db.generateId(),
      type: proposalData.type,
      title: proposalData.title,
      description: proposalData.description,
      proposedBy: proposalData.proposedBy,
      teamId: proposalData.teamId,
      status: 'active', // active, passed, rejected, expired
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      voters: [],
      createdAt: Date.now(),
      expiresAt: proposalData.expiresAt || Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      executedAt: null,
      metadata: proposalData.metadata || {},
      quorumRequired: proposalData.quorumRequired || 0.5, // 50% of eligible voters
      approvalThreshold: proposalData.approvalThreshold || 0.66 // 66% approval needed
    };

    await this.db.insert('proposals', proposal);
    console.log(`✓ Proposal created: ${proposal.title} (${proposal.id})`);
    return proposal;
  }

  /**
   * Get proposal by ID
   */
  async getProposal(proposalId) {
    return await this.db.get('proposals', proposalId);
  }

  /**
   * List proposals by team
   */
  async getTeamProposals(teamId, options = {}) {
    const proposals = await this.db.query('proposals', { teamId });

    if (options.status) {
      return proposals.filter(p => p.status === options.status);
    }

    return proposals;
  }

  /**
   * List active proposals
   */
  async getActiveProposals() {
    const allProposals = await this.db.list('proposals', { limit: 1000 });
    return allProposals.filter(p => p.status === 'active' && p.expiresAt > Date.now());
  }

  /**
   * Check if proposal has reached quorum
   */
  async checkQuorum(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    // Get team size to calculate quorum
    const team = await this.db.get('teams', proposal.teamId);
    if (!team) {
      throw new Error(`Team ${proposal.teamId} not found`);
    }

    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    const eligibleVoters = team.members.length;
    const quorum = eligibleVoters * proposal.quorumRequired;

    return {
      reached: totalVotes >= quorum,
      current: totalVotes,
      required: quorum,
      percentage: (totalVotes / eligibleVoters) * 100
    };
  }

  /**
   * Check if proposal has passed
   */
  async checkApproval(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    if (totalVotes === 0) {
      return { passed: false, percentage: 0 };
    }

    const approvalPercentage = proposal.votesFor / totalVotes;

    return {
      passed: approvalPercentage >= proposal.approvalThreshold,
      percentage: approvalPercentage * 100,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      votesAbstain: proposal.votesAbstain
    };
  }

  /**
   * Finalize proposal (called when expired or conditions met)
   */
  async finalizeProposal(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }

    const quorum = await this.checkQuorum(proposalId);
    const approval = await this.checkApproval(proposalId);

    let status = 'rejected';

    if (quorum.reached && approval.passed) {
      status = 'passed';
      proposal.executedAt = Date.now();
    } else if (Date.now() > proposal.expiresAt) {
      status = 'expired';
    }

    proposal.status = status;
    await this.db.update('proposals', proposalId, proposal);

    console.log(`✓ Proposal finalized: ${proposal.title} - ${status.toUpperCase()}`);
    return proposal;
  }

  /**
   * Get proposal statistics
   */
  async getProposalStats(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const quorum = await this.checkQuorum(proposalId);
    const approval = await this.checkApproval(proposalId);

    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;

    return {
      proposalId: proposal.id,
      title: proposal.title,
      status: proposal.status,
      quorum: quorum,
      approval: approval,
      votes: {
        total: totalVotes,
        for: proposal.votesFor,
        against: proposal.votesAgainst,
        abstain: proposal.votesAbstain
      },
      timeRemaining: Math.max(0, proposal.expiresAt - Date.now()),
      canExecute: quorum.reached && approval.passed
    };
  }

  /**
   * Create contribution verification proposal
   */
  async createContributionVerificationProposal(contributionId, proposedBy, teamId) {
    const contribution = await this.db.get('contributions', contributionId);
    if (!contribution) {
      throw new Error(`Contribution ${contributionId} not found`);
    }

    return await this.createProposal({
      type: this.proposalTypes.CONTRIBUTION_VERIFICATION,
      title: `Verify contribution: ${contribution.type} by ${contribution.memberId}`,
      description: `Vote to verify contribution (Score: ${contribution.score})`,
      proposedBy,
      teamId,
      metadata: {
        contributionId,
        contributionType: contribution.type,
        score: contribution.score
      }
    });
  }

  /**
   * Create royalty distribution proposal
   */
  async createRoyaltyDistributionProposal(poolId, proposedBy, teamId) {
    const pool = await this.db.get('royalties', poolId);
    if (!pool) {
      throw new Error(`Royalty pool ${poolId} not found`);
    }

    return await this.createProposal({
      type: this.proposalTypes.ROYALTY_DISTRIBUTION,
      title: `Approve royalty distribution: ${pool.name}`,
      description: `Vote to approve distribution of ${pool.totalAmount} ${pool.currency}`,
      proposedBy,
      teamId,
      metadata: {
        poolId,
        amount: pool.totalAmount,
        currency: pool.currency,
        recipientCount: pool.distributions.length
      }
    });
  }

  /**
   * Create milestone approval proposal
   */
  async createMilestoneApprovalProposal(teamId, milestoneId, proposedBy) {
    const team = await this.db.get('teams', teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const milestone = team.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found`);
    }

    return await this.createProposal({
      type: this.proposalTypes.MILESTONE_APPROVAL,
      title: `Approve milestone completion: ${milestone.title}`,
      description: `Vote to approve completion of milestone: ${milestone.description}`,
      proposedBy,
      teamId,
      metadata: {
        milestoneId,
        milestoneTitle: milestone.title
      }
    });
  }

  /**
   * List proposals by member (created by)
   */
  async getMemberProposals(memberId) {
    return await this.db.query('proposals', { proposedBy: memberId });
  }

  /**
   * Execute proposal action (after approval)
   */
  async executeProposal(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'passed') {
      throw new Error('Only passed proposals can be executed');
    }

    console.log(`Executing proposal: ${proposal.title}`);

    // Execute based on proposal type
    switch (proposal.type) {
      case this.proposalTypes.CONTRIBUTION_VERIFICATION:
        await this.executeContributionVerification(proposal);
        break;

      case this.proposalTypes.ROYALTY_DISTRIBUTION:
        await this.executeRoyaltyDistribution(proposal);
        break;

      case this.proposalTypes.MILESTONE_APPROVAL:
        await this.executeMilestoneApproval(proposal);
        break;

      default:
        console.log(`No automatic execution for proposal type: ${proposal.type}`);
    }

    return proposal;
  }

  /**
   * Execute contribution verification
   */
  async executeContributionVerification(proposal) {
    const contributionId = proposal.metadata.contributionId;
    const contribution = await this.db.get('contributions', contributionId);

    if (contribution) {
      contribution.verified = true;
      contribution.verifiedBy = 'dao_vote';
      contribution.verifiedAt = Date.now();
      await this.db.update('contributions', contributionId, contribution);
      console.log(`✓ Contribution ${contributionId} verified by DAO vote`);
    }
  }

  /**
   * Execute royalty distribution
   */
  async executeRoyaltyDistribution(proposal) {
    console.log(`✓ Royalty distribution approved: ${proposal.metadata.poolId}`);
    // In production, trigger actual distribution
  }

  /**
   * Execute milestone approval
   */
  async executeMilestoneApproval(proposal) {
    const team = await this.db.get('teams', proposal.teamId);
    if (team) {
      const milestone = team.milestones.find(m => m.id === proposal.metadata.milestoneId);
      if (milestone) {
        milestone.status = 'completed';
        milestone.completedAt = Date.now();
        await this.db.update('teams', proposal.teamId, team);
        console.log(`✓ Milestone ${milestone.title} approved by DAO vote`);
      }
    }
  }
}

module.exports = ProposalManager;
