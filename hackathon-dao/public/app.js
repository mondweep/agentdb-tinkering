/**
 * Hackathon DAO Frontend Application
 */

// Global state
let currentPage = 'dashboard';
let teams = [];
let members = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadDashboard();
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Update pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === `${page}-page`);
  });

  currentPage = page;

  // Load page data
  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'teams':
      loadTeams();
      break;
    case 'members':
      loadMembers();
      break;
    case 'contributions':
      loadContributions();
      break;
    case 'proposals':
      loadProposals();
      break;
    case 'royalties':
      loadRoyalties();
      break;
  }
}

// ============================================================================
// API CALLS
// ============================================================================

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// DASHBOARD
// ============================================================================

async function loadDashboard() {
  try {
    const [daoStats, teamLeaderboard, memberLeaderboard, contributions] = await Promise.all([
      apiCall('/dao'),
      apiCall('/teams/leaderboard'),
      apiCall('/members/leaderboard'),
      apiCall('/contributions')
    ]);

    // Update stats
    document.getElementById('stat-teams').textContent = daoStats.teams.total;
    document.getElementById('stat-members').textContent = daoStats.members.total;
    document.getElementById('stat-contributions').textContent = daoStats.contributions.total;
    document.getElementById('stat-proposals').textContent = daoStats.governance.activeProposals;

    // Update top teams
    const topTeamsList = document.getElementById('top-teams-list');
    topTeamsList.innerHTML = teamLeaderboard.slice(0, 5).map((team, index) => `
      <div class="list-item">
        <span class="list-item-name">${index + 1}. ${team.name}</span>
        <span class="list-item-score">${team.stats.totalScore} pts</span>
      </div>
    `).join('');

    // Update top contributors
    const topContributorsList = document.getElementById('top-contributors-list');
    topContributorsList.innerHTML = memberLeaderboard.slice(0, 5).map((member, index) => `
      <div class="list-item">
        <span class="list-item-name">${index + 1}. ${member.name}</span>
        <span class="list-item-score">${member.totalScore} pts</span>
      </div>
    `).join('');

    // Update recent contributions
    const recentContributions = document.getElementById('recent-contributions');
    recentContributions.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Score</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${contributions.slice(0, 10).map(contrib => `
            <tr>
              <td><span class="badge badge-primary">${contrib.type}</span></td>
              <td>${contrib.description || 'N/A'}</td>
              <td><strong>${contrib.score}</strong></td>
              <td>
                ${contrib.verified
                  ? '<span class="badge badge-success">✓ Verified</span>'
                  : '<span class="badge badge-warning">Pending</span>'
                }
              </td>
              <td>${new Date(contrib.timestamp).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// ============================================================================
// TEAMS
// ============================================================================

async function loadTeams() {
  try {
    teams = await apiCall('/teams');
    const teamsGrid = document.getElementById('teams-grid');

    if (teams.length === 0) {
      teamsGrid.innerHTML = '<div class="empty-state"><h3>No teams yet</h3><p>Create your first team to get started!</p></div>';
      return;
    }

    teamsGrid.innerHTML = teams.map(team => `
      <div class="team-card" onclick="viewTeam('${team.id}')">
        <h3>${team.name}</h3>
        <p class="description">${team.description || 'No description'}</p>
        ${team.tags && team.tags.length > 0 ? `
          <div class="tags">
            ${team.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div class="team-stats">
          <div class="stat-item">
            <div class="value">${team.members.length}</div>
            <div class="label">Members</div>
          </div>
          <div class="stat-item">
            <div class="value">${team.totalContributions || 0}</div>
            <div class="label">Contributions</div>
          </div>
          <div class="stat-item">
            <div class="value">${team.status}</div>
            <div class="label">Status</div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load teams:', error);
  }
}

function viewTeam(teamId) {
  alert(`Team details view coming soon! Team ID: ${teamId}`);
  // TODO: Implement detailed team view
}

async function showCreateTeamModal() {
  document.getElementById('create-team-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
}

async function handleCreateTeam(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const teamData = {
    name: formData.get('name'),
    description: formData.get('description'),
    maxMembers: parseInt(formData.get('maxMembers')),
    tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
    createdBy: 'web_user'
  };

  try {
    await apiCall('/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });

    closeModals();
    form.reset();
    loadTeams();
    alert('Team created successfully!');
  } catch (error) {
    alert('Failed to create team: ' + error.message);
  }
}

// ============================================================================
// MEMBERS
// ============================================================================

async function loadMembers() {
  try {
    members = await apiCall('/members');
    const membersGrid = document.getElementById('members-grid');

    if (members.length === 0) {
      membersGrid.innerHTML = '<div class="empty-state"><h3>No members yet</h3><p>Register your first member!</p></div>';
      return;
    }

    membersGrid.innerHTML = members.map(member => `
      <div class="member-card" onclick="viewMember('${member.id}')">
        <h3>${member.name}</h3>
        <p class="email">${member.email}</p>
        ${member.skills && member.skills.length > 0 ? `
          <div class="tags">
            ${member.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
          </div>
        ` : ''}
        <div class="member-stats">
          <div class="stat-item">
            <div class="value">${member.totalScore || 0}</div>
            <div class="label">Score</div>
          </div>
          <div class="stat-item">
            <div class="value">${member.reputation || 100}</div>
            <div class="label">Reputation</div>
          </div>
          <div class="stat-item">
            <div class="value">${member.teams.length}</div>
            <div class="label">Teams</div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load members:', error);
  }
}

function viewMember(memberId) {
  alert(`Member details view coming soon! Member ID: ${memberId}`);
  // TODO: Implement detailed member view
}

async function showCreateMemberModal() {
  document.getElementById('create-member-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
}

async function handleCreateMember(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const memberData = {
    name: formData.get('name'),
    email: formData.get('email'),
    wallet: formData.get('wallet'),
    github: formData.get('github'),
    skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
    role: 'member'
  };

  try {
    await apiCall('/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });

    closeModals();
    form.reset();
    loadMembers();
    alert('Member registered successfully!');
  } catch (error) {
    alert('Failed to register member: ' + error.message);
  }
}

// ============================================================================
// CONTRIBUTIONS
// ============================================================================

async function loadContributions() {
  try {
    const filter = document.getElementById('contribution-filter')?.value || 'all';
    const contributions = await apiCall('/contributions');

    let filtered = contributions;
    if (filter === 'verified') {
      filtered = contributions.filter(c => c.verified);
    } else if (filter === 'unverified') {
      filtered = contributions.filter(c => !c.verified);
    }

    const contributionsList = document.getElementById('contributions-list');
    contributionsList.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Team</th>
            <th>Member</th>
            <th>Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(contrib => `
            <tr>
              <td><span class="badge badge-primary">${contrib.type}</span></td>
              <td>${contrib.description || 'N/A'}</td>
              <td>${contrib.teamId.substring(0, 8)}...</td>
              <td>${contrib.memberId.substring(0, 8)}...</td>
              <td><strong>${contrib.score}</strong></td>
              <td>
                ${contrib.verified
                  ? '<span class="badge badge-success">✓ Verified</span>'
                  : '<span class="badge badge-warning">Pending</span>'
                }
              </td>
              <td>
                ${!contrib.verified
                  ? `<button class="btn btn-small btn-success" onclick="verifyContribution('${contrib.id}')">Verify</button>`
                  : '<span class="badge badge-success">Verified</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load contributions:', error);
  }
}

async function showAddContributionModal() {
  // Load teams and members for dropdowns
  if (teams.length === 0) teams = await apiCall('/teams');
  if (members.length === 0) members = await apiCall('/members');

  const teamSelect = document.getElementById('contribution-team-select');
  const memberSelect = document.getElementById('contribution-member-select');

  teamSelect.innerHTML = teams.map(team =>
    `<option value="${team.id}">${team.name}</option>`
  ).join('');

  memberSelect.innerHTML = members.map(member =>
    `<option value="${member.id}">${member.name}</option>`
  ).join('');

  document.getElementById('add-contribution-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
}

async function handleAddContribution(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const contributionData = {
    teamId: formData.get('teamId'),
    memberId: formData.get('memberId'),
    type: formData.get('type'),
    description: formData.get('description'),
    data: {
      linesAdded: parseInt(formData.get('linesAdded')) || 0,
      filesChanged: parseInt(formData.get('filesChanged')) || 1,
      complexity: 3,
      hasTests: false
    }
  };

  try {
    await apiCall('/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contributionData)
    });

    closeModals();
    form.reset();
    loadContributions();
    alert('Contribution tracked successfully!');
  } catch (error) {
    alert('Failed to track contribution: ' + error.message);
  }
}

async function verifyContribution(contributionId) {
  // In a real app, you'd get the current user's ID
  const verifierId = members[0]?.id || 'admin';

  try {
    await apiCall(`/contributions/${contributionId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifierId })
    });

    loadContributions();
    alert('Contribution verified!');
  } catch (error) {
    alert('Failed to verify contribution: ' + error.message);
  }
}

// ============================================================================
// PROPOSALS
// ============================================================================

async function loadProposals() {
  try {
    const proposals = await apiCall('/proposals');
    const proposalsList = document.getElementById('proposals-list');

    if (proposals.length === 0) {
      proposalsList.innerHTML = '<div class="empty-state"><h3>No active proposals</h3><p>Create a proposal to get started!</p></div>';
      return;
    }

    proposalsList.innerHTML = proposals.map(proposal => `
      <div class="proposal-card">
        <div class="proposal-header">
          <div>
            <h3 class="proposal-title">${proposal.title}</h3>
            <p class="proposal-meta">Type: ${proposal.type} | Status: ${proposal.status}</p>
          </div>
          <span class="badge badge-${getProposalStatusBadge(proposal.status)}">${proposal.status.toUpperCase()}</span>
        </div>
        <p>${proposal.description}</p>
        <div class="vote-section">
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>For: ${proposal.votesFor}</span>
              <span>Against: ${proposal.votesAgainst}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${getVotePercentage(proposal)}%"></div>
            </div>
          </div>
          ${proposal.status === 'active' ? `
            <button class="btn btn-success btn-small" onclick="voteOnProposal('${proposal.id}', 'for')">Vote For</button>
            <button class="btn btn-danger btn-small" onclick="voteOnProposal('${proposal.id}', 'against')">Vote Against</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load proposals:', error);
  }
}

function getProposalStatusBadge(status) {
  const badges = {
    active: 'primary',
    passed: 'success',
    rejected: 'danger',
    expired: 'warning'
  };
  return badges[status] || 'primary';
}

function getVotePercentage(proposal) {
  const total = proposal.votesFor + proposal.votesAgainst;
  if (total === 0) return 0;
  return (proposal.votesFor / total) * 100;
}

async function voteOnProposal(proposalId, vote) {
  // In a real app, you'd get the current user's ID
  const voterId = members[0]?.id || 'admin';

  try {
    await apiCall(`/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterId,
        vote,
        reason: `Voted ${vote} via web UI`
      })
    });

    loadProposals();
    alert(`Vote cast: ${vote}`);
  } catch (error) {
    alert('Failed to vote: ' + error.message);
  }
}

function showCreateProposalModal() {
  alert('Proposal creation coming soon!');
  // TODO: Implement proposal creation modal
}

// ============================================================================
// ROYALTIES
// ============================================================================

async function loadRoyalties() {
  try {
    // For demo, get royalty pools for all teams
    const royaltiesList = document.getElementById('royalties-list');
    royaltiesList.innerHTML = '<div class="loading">Loading royalty distributions</div>';

    // This is a simplified view - in production you'd have a better API
    const allTeams = teams.length > 0 ? teams : await apiCall('/teams');
    const allPools = [];

    for (const team of allTeams) {
      try {
        const pools = await apiCall(`/royalties/team/${team.id}`);
        allPools.push(...pools.map(p => ({ ...p, teamName: team.name })));
      } catch (e) {
        // Team might not have pools yet
      }
    }

    if (allPools.length === 0) {
      royaltiesList.innerHTML = '<div class="empty-state"><h3>No royalty distributions yet</h3><p>Create a distribution to reward contributors!</p></div>';
      return;
    }

    royaltiesList.innerHTML = allPools.map(pool => `
      <div class="royalty-card">
        <div class="royalty-header">
          <div>
            <h3 class="royalty-title">${pool.name}</h3>
            <p class="royalty-meta">Team: ${pool.teamName} | ${pool.totalAmount} ${pool.currency}</p>
          </div>
          <span class="badge badge-${getRoyaltyStatusBadge(pool.status)}">${pool.status.toUpperCase()}</span>
        </div>
        <p>Distribution Model: ${pool.distributionModel}</p>
        ${pool.distributions && pool.distributions.length > 0 ? `
          <div style="margin-top: 1rem;">
            <strong>Recipients (${pool.distributions.length}):</strong>
            ${pool.distributions.slice(0, 3).map(dist => `
              <div class="list-item" style="margin-top: 0.5rem;">
                <span>${dist.memberId.substring(0, 8)}...</span>
                <span><strong>${dist.amount.toFixed(2)} ${pool.currency}</strong> (${dist.percentage.toFixed(1)}%)</span>
              </div>
            `).join('')}
            ${pool.distributions.length > 3 ? `<p style="margin-top: 0.5rem; color: var(--gray);">+${pool.distributions.length - 3} more</p>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load royalties:', error);
  }
}

function getRoyaltyStatusBadge(status) {
  const badges = {
    pending: 'warning',
    calculated: 'primary',
    distributed: 'success'
  };
  return badges[status] || 'primary';
}

function showCreateRoyaltyModal() {
  alert('Royalty distribution creation coming soon!');
  // TODO: Implement royalty distribution modal
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  document.getElementById('modal-overlay').classList.remove('active');
}

// Make functions globally accessible
window.navigateTo = navigateTo;
window.viewTeam = viewTeam;
window.viewMember = viewMember;
window.showCreateTeamModal = showCreateTeamModal;
window.handleCreateTeam = handleCreateTeam;
window.showCreateMemberModal = showCreateMemberModal;
window.handleCreateMember = handleCreateMember;
window.showAddContributionModal = showAddContributionModal;
window.handleAddContribution = handleAddContribution;
window.verifyContribution = verifyContribution;
window.voteOnProposal = voteOnProposal;
window.showCreateProposalModal = showCreateProposalModal;
window.showCreateRoyaltyModal = showCreateRoyaltyModal;
window.closeModals = closeModals;
window.loadContributions = loadContributions;
