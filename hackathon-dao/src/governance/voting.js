/**
 * Voting System
 * Manages voting on proposals
 */

class VotingSystem {
  constructor(database) {
    this.db = database;
    this.voteOptions = {
      FOR: 'for',
      AGAINST: 'against',
      ABSTAIN: 'abstain'
    };
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(voteData) {
    const { proposalId, voterId, vote, reason } = voteData;

    // Validate proposal
    const proposal = await this.db.get('proposals', proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }

    if (Date.now() > proposal.expiresAt) {
      throw new Error('Proposal has expired');
    }

    // Validate voter eligibility
    const isEligible = await this.checkVoterEligibility(proposalId, voterId);
    if (!isEligible) {
      throw new Error('Voter is not eligible for this proposal');
    }

    // Check if already voted
    if (proposal.voters.includes(voterId)) {
      throw new Error('Voter has already cast a vote on this proposal');
    }

    // Validate vote option
    if (!Object.values(this.voteOptions).includes(vote)) {
      throw new Error(`Invalid vote option: ${vote}`);
    }

    // Record the vote
    const voteRecord = {
      id: this.db.generateId(),
      proposalId,
      voterId,
      vote,
      reason: reason || '',
      weight: await this.calculateVoteWeight(voterId, proposal.teamId),
      timestamp: Date.now()
    };

    await this.db.insert('votes', voteRecord);

    // Update proposal vote counts
    proposal.voters.push(voterId);

    switch (vote) {
      case this.voteOptions.FOR:
        proposal.votesFor += voteRecord.weight;
        break;
      case this.voteOptions.AGAINST:
        proposal.votesAgainst += voteRecord.weight;
        break;
      case this.voteOptions.ABSTAIN:
        proposal.votesAbstain += voteRecord.weight;
        break;
    }

    await this.db.update('proposals', proposalId, proposal);

    console.log(`✓ Vote recorded: ${voterId} voted ${vote} on proposal ${proposalId}`);
    return voteRecord;
  }

  /**
   * Check if a member is eligible to vote on a proposal
   */
  async checkVoterEligibility(proposalId, voterId) {
    const proposal = await this.db.get('proposals', proposalId);
    if (!proposal) {
      return false;
    }

    // Check if voter is a member of the team
    const team = await this.db.get('teams', proposal.teamId);
    if (!team) {
      return false;
    }

    return team.members.includes(voterId);
  }

  /**
   * Calculate vote weight based on member's reputation and contributions
   */
  async calculateVoteWeight(voterId, teamId) {
    const member = await this.db.get('members', voterId);
    if (!member) {
      return 1; // Default weight
    }

    // Base weight
    let weight = 1;

    // Reputation bonus (up to 50% increase)
    const reputationBonus = (member.reputation - 100) / 1000;
    weight += Math.max(0, Math.min(0.5, reputationBonus));

    // Contribution bonus based on verified contributions to this team
    const contributions = await this.db.query('contributions', {
      memberId: voterId,
      teamId: teamId
    });

    const verifiedContributions = contributions.filter(c => c.verified).length;
    const contributionBonus = Math.min(0.3, verifiedContributions * 0.02);
    weight += contributionBonus;

    // Role bonus
    const roleBonus = {
      team_lead: 0.2,
      senior: 0.1,
      member: 0,
      junior: 0
    };
    weight += roleBonus[member.role] || 0;

    return Math.round(weight * 100) / 100; // Round to 2 decimals
  }

  /**
   * Get all votes for a proposal
   */
  async getProposalVotes(proposalId) {
    return await this.db.query('votes', { proposalId });
  }

  /**
   * Get vote details with voter information
   */
  async getProposalVotesWithDetails(proposalId) {
    const votes = await this.getProposalVotes(proposalId);

    const votesWithDetails = [];
    for (const vote of votes) {
      const member = await this.db.get('members', vote.voterId);
      votesWithDetails.push({
        ...vote,
        voterName: member ? member.name : 'Unknown',
        voterRole: member ? member.role : 'Unknown'
      });
    }

    return votesWithDetails;
  }

  /**
   * Get member's voting history
   */
  async getMemberVotingHistory(memberId) {
    return await this.db.query('votes', { voterId: memberId });
  }

  /**
   * Get member's voting statistics
   */
  async getMemberVotingStats(memberId) {
    const votes = await this.getMemberVotingHistory(memberId);

    const stats = {
      totalVotes: votes.length,
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      participationRate: 0,
      averageWeight: 0
    };

    let totalWeight = 0;

    votes.forEach(vote => {
      totalWeight += vote.weight;

      switch (vote.vote) {
        case this.voteOptions.FOR:
          stats.votesFor++;
          break;
        case this.voteOptions.AGAINST:
          stats.votesAgainst++;
          break;
        case this.voteOptions.ABSTAIN:
          stats.votesAbstain++;
          break;
      }
    });

    stats.averageWeight = votes.length > 0 ? totalWeight / votes.length : 0;

    // Calculate participation rate
    const member = await this.db.get('members', memberId);
    if (member && member.teams.length > 0) {
      // Get all proposals for member's teams
      let eligibleProposals = 0;
      for (const teamId of member.teams) {
        const teamProposals = await this.db.query('proposals', { teamId });
        eligibleProposals += teamProposals.length;
      }

      stats.participationRate = eligibleProposals > 0
        ? (votes.length / eligibleProposals) * 100
        : 0;
    }

    return stats;
  }

  /**
   * Delegate voting power to another member
   */
  async delegateVote(delegatorId, delegateId, proposalId) {
    // Verify both members exist
    const delegator = await this.db.get('members', delegatorId);
    const delegate = await this.db.get('members', delegateId);

    if (!delegator || !delegate) {
      throw new Error('Invalid delegator or delegate');
    }

    const delegation = {
      id: this.db.generateId(),
      delegatorId,
      delegateId,
      proposalId,
      createdAt: Date.now(),
      status: 'active'
    };

    // Store delegation (you'd need a delegations collection)
    console.log(`✓ Vote delegated: ${delegatorId} -> ${delegateId} for proposal ${proposalId}`);
    return delegation;
  }

  /**
   * Get voting power breakdown for a proposal
   */
  async getVotingPowerBreakdown(proposalId) {
    const votes = await this.getProposalVotesWithDetails(proposalId);

    const breakdown = {
      totalVotingPower: 0,
      for: { power: 0, voters: [] },
      against: { power: 0, voters: [] },
      abstain: { power: 0, voters: [] }
    };

    votes.forEach(vote => {
      breakdown.totalVotingPower += vote.weight;

      const voterInfo = {
        voterId: vote.voterId,
        voterName: vote.voterName,
        weight: vote.weight,
        timestamp: vote.timestamp
      };

      switch (vote.vote) {
        case this.voteOptions.FOR:
          breakdown.for.power += vote.weight;
          breakdown.for.voters.push(voterInfo);
          break;
        case this.voteOptions.AGAINST:
          breakdown.against.power += vote.weight;
          breakdown.against.voters.push(voterInfo);
          break;
        case this.voteOptions.ABSTAIN:
          breakdown.abstain.power += vote.weight;
          breakdown.abstain.voters.push(voterInfo);
          break;
      }
    });

    return breakdown;
  }

  /**
   * Check if voting deadline should be extended (emergency extension)
   */
  async requestVotingExtension(proposalId, requestedBy, reason, extensionDays = 3) {
    const proposal = await this.db.get('proposals', proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    // Check if requester has authority (e.g., team lead)
    const member = await this.db.get('members', requestedBy);
    if (!member || member.role !== 'team_lead') {
      throw new Error('Only team leads can request voting extensions');
    }

    const extensionMs = extensionDays * 24 * 60 * 60 * 1000;
    proposal.expiresAt += extensionMs;

    await this.db.update('proposals', proposalId, proposal);

    console.log(`✓ Voting period extended by ${extensionDays} days: ${reason}`);
    return proposal;
  }
}

module.exports = VotingSystem;
