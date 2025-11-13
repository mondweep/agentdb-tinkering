/**
 * Team Manager
 * Handles team creation, management, and operations
 */

class TeamManager {
  constructor(database) {
    this.db = database;
  }

  /**
   * Create a new team
   */
  async createTeam(teamData) {
    const team = {
      id: this.db.generateId(),
      name: teamData.name,
      description: teamData.description || '',
      maxMembers: teamData.maxMembers || 10,
      members: [],
      createdBy: teamData.createdBy,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: teamData.tags || [],
      repository: teamData.repository || null,
      milestones: [],
      totalContributions: 0
    };

    await this.db.insert('teams', team);
    console.log(`✓ Team created: ${team.name} (${team.id})`);
    return team;
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId) {
    return await this.db.get('teams', teamId);
  }

  /**
   * Update team information
   */
  async updateTeam(teamId, updates) {
    return await this.db.update('teams', teamId, updates);
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    // Check if team has members
    if (team.members.length > 0) {
      throw new Error('Cannot delete team with active members. Remove all members first.');
    }

    await this.db.delete('teams', teamId);
    console.log(`✓ Team deleted: ${teamId}`);
    return true;
  }

  /**
   * Add member to team
   */
  async addMember(teamId, memberId) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is at maximum capacity');
    }

    if (team.members.includes(memberId)) {
      throw new Error('Member already in team');
    }

    team.members.push(memberId);
    await this.updateTeam(teamId, { members: team.members });
    console.log(`✓ Member ${memberId} added to team ${team.name}`);
    return team;
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId, memberId) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const index = team.members.indexOf(memberId);
    if (index === -1) {
      throw new Error('Member not in team');
    }

    team.members.splice(index, 1);
    await this.updateTeam(teamId, { members: team.members });
    console.log(`✓ Member ${memberId} removed from team ${team.name}`);
    return team;
  }

  /**
   * List all teams
   */
  async listTeams(options = {}) {
    return await this.db.list('teams', options);
  }

  /**
   * Search teams by query
   */
  async searchTeams(query, limit = 10) {
    return await this.db.search('teams', query, limit);
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    // Get all contributions for this team
    const contributions = await this.db.query('contributions', {
      teamId: teamId
    });

    const stats = {
      teamId: team.id,
      teamName: team.name,
      memberCount: team.members.length,
      totalContributions: contributions.length,
      contributionsByType: {},
      totalScore: 0,
      averageScore: 0
    };

    // Aggregate contribution statistics
    contributions.forEach(contrib => {
      const type = contrib.type;
      if (!stats.contributionsByType[type]) {
        stats.contributionsByType[type] = 0;
      }
      stats.contributionsByType[type]++;
      stats.totalScore += contrib.score || 0;
    });

    stats.averageScore = contributions.length > 0
      ? stats.totalScore / contributions.length
      : 0;

    return stats;
  }

  /**
   * Add milestone to team
   */
  async addMilestone(teamId, milestone) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const newMilestone = {
      id: this.db.generateId(),
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate,
      status: 'pending',
      createdAt: Date.now(),
      completedAt: null
    };

    team.milestones.push(newMilestone);
    await this.updateTeam(teamId, { milestones: team.milestones });
    console.log(`✓ Milestone added to team ${team.name}: ${newMilestone.title}`);
    return newMilestone;
  }

  /**
   * Complete milestone
   */
  async completeMilestone(teamId, milestoneId) {
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const milestone = team.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found`);
    }

    milestone.status = 'completed';
    milestone.completedAt = Date.now();
    await this.updateTeam(teamId, { milestones: team.milestones });
    console.log(`✓ Milestone completed: ${milestone.title}`);
    return milestone;
  }

  /**
   * Get team leaderboard
   */
  async getLeaderboard(limit = 10) {
    const teams = await this.listTeams({ limit: 100 });

    // Get stats for each team
    const teamsWithStats = await Promise.all(
      teams.map(async team => {
        const stats = await this.getTeamStats(team.id);
        return {
          ...team,
          stats
        };
      })
    );

    // Sort by total score
    teamsWithStats.sort((a, b) => b.stats.totalScore - a.stats.totalScore);

    return teamsWithStats.slice(0, limit);
  }
}

module.exports = TeamManager;
