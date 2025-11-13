/**
 * Member Manager
 * Handles individual member operations and profiles
 */

class MemberManager {
  constructor(database) {
    this.db = database;
  }

  /**
   * Create a new member
   */
  async createMember(memberData) {
    const member = {
      id: this.db.generateId(),
      name: memberData.name,
      email: memberData.email,
      wallet: memberData.wallet, // For royalty distribution
      role: memberData.role || 'member', // member, team_lead, admin
      skills: memberData.skills || [],
      bio: memberData.bio || '',
      avatar: memberData.avatar || null,
      github: memberData.github || null,
      linkedin: memberData.linkedin || null,
      teams: [],
      contributions: [],
      totalScore: 0,
      reputation: 100, // Starting reputation
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active'
    };

    await this.db.insert('members', member);
    console.log(`✓ Member created: ${member.name} (${member.id})`);
    return member;
  }

  /**
   * Get member by ID
   */
  async getMember(memberId) {
    return await this.db.get('members', memberId);
  }

  /**
   * Get member by email
   */
  async getMemberByEmail(email) {
    const members = await this.db.query('members', { email });
    return members.length > 0 ? members[0] : null;
  }

  /**
   * Get member by wallet address
   */
  async getMemberByWallet(wallet) {
    const members = await this.db.query('members', { wallet });
    return members.length > 0 ? members[0] : null;
  }

  /**
   * Update member information
   */
  async updateMember(memberId, updates) {
    return await this.db.update('members', memberId, updates);
  }

  /**
   * Delete member
   */
  async deleteMember(memberId) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    // Check if member is in any teams
    if (member.teams.length > 0) {
      throw new Error('Cannot delete member who is in active teams. Remove from teams first.');
    }

    await this.db.delete('members', memberId);
    console.log(`✓ Member deleted: ${memberId}`);
    return true;
  }

  /**
   * Join team
   */
  async joinTeam(memberId, teamId) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    if (member.teams.includes(teamId)) {
      throw new Error('Member already in this team');
    }

    member.teams.push(teamId);
    await this.updateMember(memberId, { teams: member.teams });
    console.log(`✓ Member ${member.name} joined team ${teamId}`);
    return member;
  }

  /**
   * Leave team
   */
  async leaveTeam(memberId, teamId) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    const index = member.teams.indexOf(teamId);
    if (index === -1) {
      throw new Error('Member not in this team');
    }

    member.teams.splice(index, 1);
    await this.updateMember(memberId, { teams: member.teams });
    console.log(`✓ Member ${member.name} left team ${teamId}`);
    return member;
  }

  /**
   * Add contribution to member's profile
   */
  async recordContribution(memberId, contributionId, score) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    member.contributions.push(contributionId);
    member.totalScore += score;
    await this.updateMember(memberId, {
      contributions: member.contributions,
      totalScore: member.totalScore
    });

    return member;
  }

  /**
   * Update member reputation
   */
  async updateReputation(memberId, change, reason) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    const newReputation = Math.max(0, Math.min(1000, member.reputation + change));
    await this.updateMember(memberId, { reputation: newReputation });

    console.log(`✓ Reputation updated for ${member.name}: ${member.reputation} -> ${newReputation} (${reason})`);
    return member;
  }

  /**
   * Get member statistics
   */
  async getMemberStats(memberId) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    // Get all contributions
    const contributions = await this.db.query('contributions', {
      memberId: memberId
    });

    const stats = {
      memberId: member.id,
      memberName: member.name,
      totalContributions: contributions.length,
      totalScore: member.totalScore,
      reputation: member.reputation,
      teamsCount: member.teams.length,
      contributionsByType: {},
      averageScore: 0,
      recentActivity: []
    };

    // Aggregate by type
    contributions.forEach(contrib => {
      const type = contrib.type;
      if (!stats.contributionsByType[type]) {
        stats.contributionsByType[type] = { count: 0, totalScore: 0 };
      }
      stats.contributionsByType[type].count++;
      stats.contributionsByType[type].totalScore += contrib.score || 0;
    });

    stats.averageScore = contributions.length > 0
      ? member.totalScore / contributions.length
      : 0;

    // Get recent contributions (last 10)
    stats.recentActivity = contributions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(c => ({
        type: c.type,
        score: c.score,
        timestamp: c.timestamp,
        description: c.description
      }));

    return stats;
  }

  /**
   * List all members
   */
  async listMembers(options = {}) {
    return await this.db.list('members', options);
  }

  /**
   * Search members by query
   */
  async searchMembers(query, limit = 10) {
    return await this.db.search('members', query, limit);
  }

  /**
   * Get member leaderboard
   */
  async getLeaderboard(limit = 10) {
    const members = await this.listMembers({ limit: 100 });

    // Sort by total score
    members.sort((a, b) => b.totalScore - a.totalScore);

    return members.slice(0, limit).map((member, index) => ({
      rank: index + 1,
      id: member.id,
      name: member.name,
      totalScore: member.totalScore,
      reputation: member.reputation,
      contributionsCount: member.contributions.length,
      teamsCount: member.teams.length
    }));
  }

  /**
   * Award badge to member
   */
  async awardBadge(memberId, badge) {
    const member = await this.getMember(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    if (!member.badges) {
      member.badges = [];
    }

    const newBadge = {
      id: this.db.generateId(),
      name: badge.name,
      description: badge.description,
      icon: badge.icon || '🏆',
      awardedAt: Date.now()
    };

    member.badges.push(newBadge);
    await this.updateMember(memberId, { badges: member.badges });

    console.log(`✓ Badge awarded to ${member.name}: ${badge.name}`);
    return newBadge;
  }
}

module.exports = MemberManager;
