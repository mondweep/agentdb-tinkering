/**
 * Contribution Tracker
 * Tracks and records all types of contributions from team members
 */

class ContributionTracker {
  constructor(database) {
    this.db = database;
    this.contributionTypes = {
      CODE: 'code',
      REVIEW: 'review',
      DOCUMENTATION: 'documentation',
      DESIGN: 'design',
      TESTING: 'testing',
      RESEARCH: 'research',
      IDEATION: 'ideation',
      PRESENTATION: 'presentation'
    };
  }

  /**
   * Track a new contribution
   */
  async trackContribution(contributionData) {
    const contribution = {
      id: this.db.generateId(),
      teamId: contributionData.teamId,
      memberId: contributionData.memberId,
      type: contributionData.type,
      description: contributionData.description || '',
      data: contributionData.data || {},
      score: 0, // Will be calculated
      verified: false,
      verifiedBy: null,
      verifiedAt: null,
      timestamp: Date.now(),
      metadata: {
        repository: contributionData.repository || null,
        commitHash: contributionData.commitHash || null,
        prNumber: contributionData.prNumber || null,
        fileChanges: contributionData.fileChanges || [],
        reviewComments: contributionData.reviewComments || []
      }
    };

    // Calculate initial score based on contribution type
    contribution.score = await this.calculateScore(contribution);

    await this.db.insert('contributions', contribution);
    console.log(`✓ Contribution tracked: ${contribution.type} by member ${contribution.memberId} (score: ${contribution.score})`);
    return contribution;
  }

  /**
   * Calculate contribution score based on type and data
   */
  async calculateScore(contribution) {
    let score = 0;

    switch (contribution.type) {
      case this.contributionTypes.CODE:
        score = this.calculateCodeScore(contribution.data);
        break;

      case this.contributionTypes.REVIEW:
        score = this.calculateReviewScore(contribution.data);
        break;

      case this.contributionTypes.DOCUMENTATION:
        score = this.calculateDocumentationScore(contribution.data);
        break;

      case this.contributionTypes.DESIGN:
        score = this.calculateDesignScore(contribution.data);
        break;

      case this.contributionTypes.TESTING:
        score = this.calculateTestingScore(contribution.data);
        break;

      case this.contributionTypes.RESEARCH:
        score = this.calculateResearchScore(contribution.data);
        break;

      case this.contributionTypes.IDEATION:
        score = contribution.data.impactScore || 50;
        break;

      case this.contributionTypes.PRESENTATION:
        score = contribution.data.qualityScore || 75;
        break;

      default:
        score = 10; // Base score
    }

    return Math.round(score);
  }

  /**
   * Calculate score for code contributions
   */
  calculateCodeScore(data) {
    let score = 0;

    // Lines of code added (diminishing returns)
    const linesAdded = data.linesAdded || 0;
    score += Math.min(linesAdded * 0.5, 200);

    // Complexity bonus
    if (data.complexity) {
      score += data.complexity * 20; // 1-5 scale
    }

    // Files changed (multi-file changes are more valuable)
    const filesChanged = data.filesChanged || 1;
    score += filesChanged * 10;

    // Quality factors
    if (data.hasTests) score += 30;
    if (data.hasDocumentation) score += 20;
    if (data.followsStandards) score += 15;

    // Subtract for lines removed (refactoring)
    const linesRemoved = data.linesRemoved || 0;
    if (linesRemoved > linesAdded * 0.5) {
      score += 25; // Bonus for good refactoring
    }

    return score;
  }

  /**
   * Calculate score for code reviews
   */
  calculateReviewScore(data) {
    let score = 0;

    // Number of comments
    const comments = data.comments || 0;
    score += comments * 5;

    // Quality of review
    if (data.foundBugs) score += data.foundBugs * 20;
    if (data.suggestedImprovements) score += data.suggestedImprovements * 10;
    if (data.thoroughness) score += data.thoroughness * 15; // 1-5 scale

    // Time spent
    const timeSpent = data.timeSpent || 0; // in minutes
    score += Math.min(timeSpent * 0.5, 50);

    return score;
  }

  /**
   * Calculate score for documentation
   */
  calculateDocumentationScore(data) {
    let score = 0;

    // Word count (diminishing returns)
    const words = data.wordCount || 0;
    score += Math.min(words * 0.1, 100);

    // Type of documentation
    if (data.type === 'api') score += 30;
    if (data.type === 'tutorial') score += 40;
    if (data.type === 'architecture') score += 50;

    // Has examples
    if (data.hasExamples) score += 25;
    if (data.hasDiagrams) score += 20;

    return score;
  }

  /**
   * Calculate score for design contributions
   */
  calculateDesignScore(data) {
    let score = 0;

    // Number of designs/mockups
    const designs = data.designCount || 1;
    score += designs * 30;

    // Quality and completeness
    if (data.isInteractive) score += 25;
    if (data.hasSpecifications) score += 20;
    if (data.isResponsive) score += 15;

    // Tools used
    if (data.professionalTool) score += 10;

    return score;
  }

  /**
   * Calculate score for testing contributions
   */
  calculateTestingScore(data) {
    let score = 0;

    // Number of tests
    const tests = data.testCount || 0;
    score += tests * 5;

    // Coverage improvement
    const coverageImprovement = data.coverageImprovement || 0;
    score += coverageImprovement * 2;

    // Type of tests
    if (data.hasUnitTests) score += 20;
    if (data.hasIntegrationTests) score += 30;
    if (data.hasE2ETests) score += 40;

    // Found bugs
    if (data.bugsFound) score += data.bugsFound * 15;

    return score;
  }

  /**
   * Calculate score for research contributions
   */
  calculateResearchScore(data) {
    let score = 0;

    // Depth of research
    const sources = data.sourcesCount || 0;
    score += sources * 10;

    // Quality
    if (data.hasAnalysis) score += 30;
    if (data.hasRecommendations) score += 25;
    if (data.isComprehensive) score += 35;

    // Impact
    if (data.ledToImplementation) score += 50;

    return score;
  }

  /**
   * Get contribution by ID
   */
  async getContribution(contributionId) {
    return await this.db.get('contributions', contributionId);
  }

  /**
   * Update contribution
   */
  async updateContribution(contributionId, updates) {
    return await this.db.update('contributions', contributionId, updates);
  }

  /**
   * Verify contribution
   */
  async verifyContribution(contributionId, verifierId) {
    const contribution = await this.getContribution(contributionId);
    if (!contribution) {
      throw new Error(`Contribution ${contributionId} not found`);
    }

    contribution.verified = true;
    contribution.verifiedBy = verifierId;
    contribution.verifiedAt = Date.now();

    await this.updateContribution(contributionId, contribution);
    console.log(`✓ Contribution ${contributionId} verified by ${verifierId}`);
    return contribution;
  }

  /**
   * Get contributions by member
   */
  async getContributionsByMember(memberId) {
    return await this.db.query('contributions', { memberId });
  }

  /**
   * Get contributions by team
   */
  async getContributionsByTeam(teamId) {
    return await this.db.query('contributions', { teamId });
  }

  /**
   * Get contributions by type
   */
  async getContributionsByType(type) {
    return await this.db.query('contributions', { type });
  }

  /**
   * Get contribution statistics for a time period
   */
  async getContributionStats(startDate, endDate) {
    const allContributions = await this.db.list('contributions', { limit: 10000 });

    const filtered = allContributions.filter(c => {
      return c.timestamp >= startDate && c.timestamp <= endDate;
    });

    const stats = {
      total: filtered.length,
      totalScore: 0,
      byType: {},
      byTeam: {},
      byMember: {},
      verified: 0,
      unverified: 0
    };

    filtered.forEach(contrib => {
      stats.totalScore += contrib.score;

      // By type
      if (!stats.byType[contrib.type]) {
        stats.byType[contrib.type] = { count: 0, totalScore: 0 };
      }
      stats.byType[contrib.type].count++;
      stats.byType[contrib.type].totalScore += contrib.score;

      // By team
      if (!stats.byTeam[contrib.teamId]) {
        stats.byTeam[contrib.teamId] = { count: 0, totalScore: 0 };
      }
      stats.byTeam[contrib.teamId].count++;
      stats.byTeam[contrib.teamId].totalScore += contrib.score;

      // By member
      if (!stats.byMember[contrib.memberId]) {
        stats.byMember[contrib.memberId] = { count: 0, totalScore: 0 };
      }
      stats.byMember[contrib.memberId].count++;
      stats.byMember[contrib.memberId].totalScore += contrib.score;

      // Verification status
      if (contrib.verified) {
        stats.verified++;
      } else {
        stats.unverified++;
      }
    });

    return stats;
  }

  /**
   * List all contributions
   */
  async listContributions(options = {}) {
    return await this.db.list('contributions', options);
  }
}

module.exports = ContributionTracker;
