/**
 * Royalty Distribution Engine
 * Calculates and manages royalty distributions based on contributions
 */

class RoyaltyEngine {
  constructor(database) {
    this.db = database;
    this.distributionModels = {
      LINEAR: 'linear',           // Direct proportion to contribution score
      WEIGHTED: 'weighted',       // Weighted by role and contribution type
      MILESTONE: 'milestone',     // Based on milestone completion
      HYBRID: 'hybrid'           // Combination of methods
    };
  }

  /**
   * Create a royalty pool
   */
  async createRoyaltyPool(poolData) {
    const pool = {
      id: this.db.generateId(),
      name: poolData.name,
      teamId: poolData.teamId,
      totalAmount: poolData.totalAmount || 0,
      currency: poolData.currency || 'USD',
      distributionModel: poolData.distributionModel || this.distributionModels.LINEAR,
      status: 'pending', // pending, calculated, distributed
      createdAt: Date.now(),
      distributedAt: null,
      distributions: [],
      metadata: {
        source: poolData.source || 'hackathon_prize',
        description: poolData.description || '',
        period: {
          start: poolData.periodStart,
          end: poolData.periodEnd
        }
      }
    };

    await this.db.insert('royalties', pool);
    console.log(`✓ Royalty pool created: ${pool.name} (${pool.totalAmount} ${pool.currency})`);
    return pool;
  }

  /**
   * Calculate royalty distribution for a team
   */
  async calculateDistribution(poolId) {
    const pool = await this.db.get('royalties', poolId);
    if (!pool) {
      throw new Error(`Royalty pool ${poolId} not found`);
    }

    // Get all contributions for the team in the period
    const contributions = await this.getContributionsForPeriod(
      pool.teamId,
      pool.metadata.period.start,
      pool.metadata.period.end
    );

    if (contributions.length === 0) {
      throw new Error('No contributions found for this period');
    }

    let distributions = [];

    switch (pool.distributionModel) {
      case this.distributionModels.LINEAR:
        distributions = this.calculateLinearDistribution(pool, contributions);
        break;

      case this.distributionModels.WEIGHTED:
        distributions = await this.calculateWeightedDistribution(pool, contributions);
        break;

      case this.distributionModels.MILESTONE:
        distributions = await this.calculateMilestoneDistribution(pool, contributions);
        break;

      case this.distributionModels.HYBRID:
        distributions = await this.calculateHybridDistribution(pool, contributions);
        break;

      default:
        distributions = this.calculateLinearDistribution(pool, contributions);
    }

    // Update pool with distributions
    pool.distributions = distributions;
    pool.status = 'calculated';
    await this.db.update('royalties', poolId, pool);

    console.log(`✓ Royalty distribution calculated for pool ${pool.name}`);
    return distributions;
  }

  /**
   * Linear distribution - proportional to contribution scores
   */
  calculateLinearDistribution(pool, contributions) {
    // Aggregate contributions by member
    const memberContributions = {};

    contributions.forEach(contrib => {
      if (!memberContributions[contrib.memberId]) {
        memberContributions[contrib.memberId] = {
          memberId: contrib.memberId,
          totalScore: 0,
          contributionCount: 0,
          contributions: []
        };
      }
      memberContributions[contrib.memberId].totalScore += contrib.score;
      memberContributions[contrib.memberId].contributionCount++;
      memberContributions[contrib.memberId].contributions.push(contrib.id);
    });

    // Calculate total score
    const totalScore = Object.values(memberContributions).reduce(
      (sum, member) => sum + member.totalScore,
      0
    );

    // Calculate distributions
    const distributions = [];
    for (const [memberId, data] of Object.entries(memberContributions)) {
      const percentage = data.totalScore / totalScore;
      const amount = pool.totalAmount * percentage;

      distributions.push({
        memberId,
        amount,
        percentage: percentage * 100,
        contributionScore: data.totalScore,
        contributionCount: data.contributionCount,
        contributionIds: data.contributions
      });
    }

    return distributions.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Weighted distribution - considers role and contribution type
   */
  async calculateWeightedDistribution(pool, contributions) {
    const roleWeights = {
      team_lead: 1.5,
      senior: 1.3,
      member: 1.0,
      junior: 0.8
    };

    const typeWeights = {
      code: 1.2,
      review: 1.0,
      documentation: 0.9,
      design: 1.1,
      testing: 1.0,
      research: 1.0,
      ideation: 0.8,
      presentation: 0.9
    };

    // Aggregate with weights
    const memberContributions = {};

    for (const contrib of contributions) {
      const member = await this.db.get('members', contrib.memberId);
      if (!member) continue;

      const roleWeight = roleWeights[member.role] || 1.0;
      const typeWeight = typeWeights[contrib.type] || 1.0;
      const weightedScore = contrib.score * roleWeight * typeWeight;

      if (!memberContributions[contrib.memberId]) {
        memberContributions[contrib.memberId] = {
          memberId: contrib.memberId,
          totalWeightedScore: 0,
          contributionCount: 0,
          contributions: []
        };
      }

      memberContributions[contrib.memberId].totalWeightedScore += weightedScore;
      memberContributions[contrib.memberId].contributionCount++;
      memberContributions[contrib.memberId].contributions.push(contrib.id);
    }

    // Calculate total weighted score
    const totalWeightedScore = Object.values(memberContributions).reduce(
      (sum, member) => sum + member.totalWeightedScore,
      0
    );

    // Calculate distributions
    const distributions = [];
    for (const [memberId, data] of Object.entries(memberContributions)) {
      const percentage = data.totalWeightedScore / totalWeightedScore;
      const amount = pool.totalAmount * percentage;

      distributions.push({
        memberId,
        amount,
        percentage: percentage * 100,
        weightedScore: data.totalWeightedScore,
        contributionCount: data.contributionCount,
        contributionIds: data.contributions
      });
    }

    return distributions.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Milestone-based distribution
   */
  async calculateMilestoneDistribution(pool, contributions) {
    const team = await this.db.get('teams', pool.teamId);
    if (!team || !team.milestones) {
      throw new Error('Team or milestones not found');
    }

    // Get completed milestones in period
    const completedMilestones = team.milestones.filter(m =>
      m.status === 'completed' &&
      m.completedAt >= pool.metadata.period.start &&
      m.completedAt <= pool.metadata.period.end
    );

    if (completedMilestones.length === 0) {
      throw new Error('No completed milestones in period');
    }

    // Distribute equally among milestones, then by contribution
    const amountPerMilestone = pool.totalAmount / completedMilestones.length;

    // For now, use linear distribution
    // In production, you'd track milestone-specific contributions
    return this.calculateLinearDistribution(
      { ...pool, totalAmount: pool.totalAmount },
      contributions
    );
  }

  /**
   * Hybrid distribution - combines multiple methods
   */
  async calculateHybridDistribution(pool, contributions) {
    // 70% weighted by contribution, 30% equal split
    const weightedDist = await this.calculateWeightedDistribution(pool, contributions);
    const memberIds = new Set(contributions.map(c => c.memberId));
    const equalShare = pool.totalAmount * 0.3 / memberIds.size;
    const weightedAmount = pool.totalAmount * 0.7;

    const distributions = [];
    const processedMembers = new Set();

    for (const dist of weightedDist) {
      if (processedMembers.has(dist.memberId)) continue;
      processedMembers.add(dist.memberId);

      const contributionAmount = (dist.amount / pool.totalAmount) * weightedAmount;
      const totalAmount = contributionAmount + equalShare;

      distributions.push({
        memberId: dist.memberId,
        amount: totalAmount,
        percentage: (totalAmount / pool.totalAmount) * 100,
        breakdown: {
          contribution: contributionAmount,
          equalShare: equalShare
        },
        contributionCount: dist.contributionCount,
        contributionIds: dist.contributionIds
      });
    }

    return distributions.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get contributions for a specific period
   */
  async getContributionsForPeriod(teamId, startDate, endDate) {
    const allContributions = await this.db.query('contributions', { teamId });

    return allContributions.filter(c =>
      c.timestamp >= startDate && c.timestamp <= endDate && c.verified
    );
  }

  /**
   * Execute distribution (simulate payment)
   */
  async executeDistribution(poolId) {
    const pool = await this.db.get('royalties', poolId);
    if (!pool) {
      throw new Error(`Royalty pool ${poolId} not found`);
    }

    if (pool.status !== 'calculated') {
      throw new Error('Distribution must be calculated before execution');
    }

    // Simulate payment processing
    console.log(`\n💰 Executing royalty distribution: ${pool.name}`);
    console.log(`Total amount: ${pool.totalAmount} ${pool.currency}`);
    console.log(`Recipients: ${pool.distributions.length}\n`);

    for (const dist of pool.distributions) {
      const member = await this.db.get('members', dist.memberId);
      if (member && member.wallet) {
        console.log(`  → ${member.name}: ${dist.amount.toFixed(2)} ${pool.currency} (${dist.percentage.toFixed(2)}%)`);
        // In production: integrate with payment gateway or blockchain
        // await this.processPayment(member.wallet, dist.amount, pool.currency);
      }
    }

    // Update pool status
    pool.status = 'distributed';
    pool.distributedAt = Date.now();
    await this.db.update('royalties', poolId, pool);

    console.log(`\n✓ Distribution completed successfully`);
    return pool;
  }

  /**
   * Get distribution report
   */
  async getDistributionReport(poolId) {
    const pool = await this.db.get('royalties', poolId);
    if (!pool) {
      throw new Error(`Royalty pool ${poolId} not found`);
    }

    const report = {
      poolId: pool.id,
      poolName: pool.name,
      totalAmount: pool.totalAmount,
      currency: pool.currency,
      status: pool.status,
      distributionModel: pool.distributionModel,
      recipientCount: pool.distributions.length,
      distributions: []
    };

    // Enrich distributions with member data
    for (const dist of pool.distributions) {
      const member = await this.db.get('members', dist.memberId);
      report.distributions.push({
        ...dist,
        memberName: member ? member.name : 'Unknown',
        memberWallet: member ? member.wallet : null
      });
    }

    return report;
  }

  /**
   * Get all royalty pools for a team
   */
  async getTeamRoyaltyPools(teamId) {
    return await this.db.query('royalties', { teamId });
  }

  /**
   * Get member's total royalties across all pools
   */
  async getMemberTotalRoyalties(memberId) {
    const allPools = await this.db.list('royalties', { limit: 1000 });

    let total = 0;
    const pools = [];

    for (const pool of allPools) {
      const dist = pool.distributions.find(d => d.memberId === memberId);
      if (dist) {
        total += dist.amount;
        pools.push({
          poolId: pool.id,
          poolName: pool.name,
          amount: dist.amount,
          currency: pool.currency,
          status: pool.status,
          distributedAt: pool.distributedAt
        });
      }
    }

    return {
      memberId,
      totalEarned: total,
      poolCount: pools.length,
      pools
    };
  }
}

module.exports = RoyaltyEngine;
