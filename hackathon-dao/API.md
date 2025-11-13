# Hackathon DAO API Documentation

Complete API reference for the Hackathon DAO system.

## Table of Contents

1. [HackathonDAO](#hackathondao)
2. [TeamManager](#teammanager)
3. [MemberManager](#membermanager)
4. [ContributionTracker](#contributiontracker)
5. [ContributionAnalyzer](#contributionanalyzer)
6. [RoyaltyEngine](#royaltyengine)
7. [ProposalManager](#proposalmanager)
8. [VotingSystem](#votingsystem)

---

## HackathonDAO

Main orchestration class for the entire DAO system.

### Constructor

```javascript
const dao = new HackathonDAO(config)
```

**Parameters:**
- `config.name` (string): Name of the hackathon
- `config.startDate` (timestamp): Hackathon start date
- `config.endDate` (timestamp): Hackathon end date

### Methods

#### initialize()
Initialize the DAO and all subsystems.

```javascript
await dao.initialize()
```

#### createTeam(teamData)
Create a new team.

```javascript
const team = await dao.createTeam({
  name: "Team Name",
  description: "Team description",
  maxMembers: 5,
  createdBy: "userId",
  tags: ['tag1', 'tag2'],
  repository: "https://github.com/..."
})
```

#### registerMember(memberData)
Register a new member.

```javascript
const member = await dao.registerMember({
  name: "Member Name",
  email: "email@example.com",
  wallet: "0x...",
  role: "member", // member, team_lead, admin
  skills: ['skill1', 'skill2'],
  github: "github_username"
})
```

#### addMemberToTeam(memberId, teamId)
Add a member to a team.

```javascript
await dao.addMemberToTeam(memberId, teamId)
```

#### trackContribution(contributionData)
Track a new contribution.

```javascript
await dao.trackContribution({
  teamId: "team_id",
  memberId: "member_id",
  type: "code", // code, review, documentation, design, testing, research, ideation, presentation
  description: "What was done",
  data: {
    linesAdded: 100,
    linesRemoved: 50,
    filesChanged: 5,
    complexity: 3,
    hasTests: true,
    hasDocumentation: true
  }
})
```

#### analyzeRepository(repoPath, teamId)
Analyze git repository and automatically track contributions.

```javascript
const contributions = await dao.analyzeRepository('/path/to/repo', teamId)
```

#### createProposal(proposalData)
Create a governance proposal.

```javascript
const proposal = await dao.createProposal({
  type: "contribution_verification",
  title: "Proposal title",
  description: "Proposal description",
  proposedBy: "member_id",
  teamId: "team_id",
  metadata: {}
})
```

#### vote(proposalId, voterId, vote, reason)
Vote on a proposal.

```javascript
await dao.vote(proposalId, voterId, 'for', 'Reason for vote')
// Options: 'for', 'against', 'abstain'
```

#### distributeRoyalties(teamId, amount, options)
Create and distribute royalties.

```javascript
const result = await dao.distributeRoyalties(teamId, 10000, {
  name: "Pool name",
  currency: 'USD',
  model: 'weighted', // linear, weighted, milestone, hybrid
  periodStart: timestamp,
  periodEnd: timestamp,
  source: 'hackathon_prize',
  proposedBy: "member_id",
  requireApproval: true
})
```

#### getDAOStats()
Get overall DAO statistics.

```javascript
const stats = await dao.getDAOStats()
```

#### getTeamDashboard(teamId)
Get comprehensive team dashboard.

```javascript
const dashboard = await dao.getTeamDashboard(teamId)
```

#### getMemberDashboard(memberId)
Get member dashboard with all their data.

```javascript
const dashboard = await dao.getMemberDashboard(memberId)
```

#### close()
Close DAO and cleanup resources.

```javascript
await dao.close()
```

---

## TeamManager

Manages team operations.

### Methods

#### createTeam(teamData)
Create a new team.

#### getTeam(teamId)
Get team by ID.

#### updateTeam(teamId, updates)
Update team information.

#### deleteTeam(teamId)
Delete a team (must have no members).

#### addMember(teamId, memberId)
Add member to team.

#### removeMember(teamId, memberId)
Remove member from team.

#### listTeams(options)
List all teams with pagination.

#### searchTeams(query, limit)
Search teams using semantic search.

#### getTeamStats(teamId)
Get team statistics including contribution metrics.

#### addMilestone(teamId, milestone)
Add milestone to team.

```javascript
await teams.addMilestone(teamId, {
  title: "Milestone title",
  description: "Description",
  dueDate: timestamp
})
```

#### completeMilestone(teamId, milestoneId)
Mark milestone as completed.

#### getLeaderboard(limit)
Get team leaderboard sorted by score.

---

## MemberManager

Manages individual members.

### Methods

#### createMember(memberData)
Register new member.

#### getMember(memberId)
Get member by ID.

#### getMemberByEmail(email)
Get member by email address.

#### getMemberByWallet(wallet)
Get member by wallet address.

#### updateMember(memberId, updates)
Update member information.

#### deleteMember(memberId)
Delete member (must not be in teams).

#### joinTeam(memberId, teamId)
Member joins a team.

#### leaveTeam(memberId, teamId)
Member leaves a team.

#### recordContribution(memberId, contributionId, score)
Record contribution to member's profile.

#### updateReputation(memberId, change, reason)
Update member's reputation score.

#### getMemberStats(memberId)
Get detailed member statistics.

#### listMembers(options)
List all members.

#### searchMembers(query, limit)
Search members using semantic search.

#### getLeaderboard(limit)
Get member leaderboard.

#### awardBadge(memberId, badge)
Award badge to member.

```javascript
await members.awardBadge(memberId, {
  name: "Top Contributor",
  description: "Awarded for exceptional contributions",
  icon: "🏆"
})
```

---

## ContributionTracker

Tracks all types of contributions.

### Contribution Types
- `CODE`: Code contributions
- `REVIEW`: Code reviews
- `DOCUMENTATION`: Documentation
- `DESIGN`: UI/UX design
- `TESTING`: Tests and QA
- `RESEARCH`: Research work
- `IDEATION`: Ideas and planning
- `PRESENTATION`: Presentations and demos

### Methods

#### trackContribution(contributionData)
Track new contribution with automatic scoring.

#### calculateScore(contribution)
Calculate contribution score based on type and data.

#### getContribution(contributionId)
Get contribution by ID.

#### updateContribution(contributionId, updates)
Update contribution.

#### verifyContribution(contributionId, verifierId)
Mark contribution as verified.

#### getContributionsByMember(memberId)
Get all contributions by a member.

#### getContributionsByTeam(teamId)
Get all contributions for a team.

#### getContributionsByType(type)
Get contributions by type.

#### getContributionStats(startDate, endDate)
Get contribution statistics for time period.

#### listContributions(options)
List all contributions.

---

## ContributionAnalyzer

Analyzes git repositories and code.

### Methods

#### analyzeGitCommits(repoPath, author, since)
Analyze git commits by author.

```javascript
const commits = await analyzer.analyzeGitCommits(
  '/path/to/repo',
  'author_name',
  timestamp
)
```

#### parseGitLog(output)
Parse git log output into structured data.

#### analyzeComplexity(code)
Analyze code complexity (1-5 scale).

#### detectLanguage(filePath)
Detect programming language from file path.

#### calculateWeightedScore(files)
Calculate weighted score based on language and changes.

#### analyzeCodeQuality(code)
Analyze code quality indicators.

Returns:
```javascript
{
  hasTests: boolean,
  hasDocumentation: boolean,
  followsStandards: boolean,
  testCoverage: number,
  commentRatio: number
}
```

#### generateContributionReport(commits)
Generate comprehensive contribution report.

#### analyzePRImpact(prData)
Analyze pull request impact.

#### extractContributionData(commit, repoPath)
Extract contribution data from commit.

---

## RoyaltyEngine

Manages royalty calculations and distributions.

### Distribution Models
- `LINEAR`: Direct proportion to contribution score
- `WEIGHTED`: Weighted by role and contribution type
- `MILESTONE`: Based on milestone completion
- `HYBRID`: Combination of methods

### Methods

#### createRoyaltyPool(poolData)
Create new royalty pool.

```javascript
const pool = await royalty.createRoyaltyPool({
  name: "Pool name",
  teamId: "team_id",
  totalAmount: 10000,
  currency: 'USD',
  distributionModel: 'weighted',
  periodStart: timestamp,
  periodEnd: timestamp,
  source: 'hackathon_prize',
  description: "Description"
})
```

#### calculateDistribution(poolId)
Calculate royalty distribution.

#### calculateLinearDistribution(pool, contributions)
Linear distribution calculation.

#### calculateWeightedDistribution(pool, contributions)
Weighted distribution calculation.

#### calculateMilestoneDistribution(pool, contributions)
Milestone-based distribution.

#### calculateHybridDistribution(pool, contributions)
Hybrid distribution (70% contribution, 30% equal).

#### getContributionsForPeriod(teamId, startDate, endDate)
Get verified contributions for period.

#### executeDistribution(poolId)
Execute distribution (simulate payment).

#### getDistributionReport(poolId)
Get detailed distribution report.

#### getTeamRoyaltyPools(teamId)
Get all royalty pools for team.

#### getMemberTotalRoyalties(memberId)
Get member's total royalties across pools.

---

## ProposalManager

Manages governance proposals.

### Proposal Types
- `CONTRIBUTION_VERIFICATION`: Verify contributions
- `ROYALTY_DISTRIBUTION`: Approve royalty distribution
- `TEAM_DECISION`: Team decisions
- `MEMBER_REMOVAL`: Remove members
- `MILESTONE_APPROVAL`: Approve milestones
- `RULE_CHANGE`: Change DAO rules

### Methods

#### createProposal(proposalData)
Create new proposal.

```javascript
const proposal = await proposals.createProposal({
  type: 'contribution_verification',
  title: "Title",
  description: "Description",
  proposedBy: "member_id",
  teamId: "team_id",
  expiresAt: timestamp,
  metadata: {},
  quorumRequired: 0.5, // 50%
  approvalThreshold: 0.66 // 66%
})
```

#### getProposal(proposalId)
Get proposal by ID.

#### getTeamProposals(teamId, options)
Get proposals for team.

#### getActiveProposals()
Get all active proposals.

#### checkQuorum(proposalId)
Check if proposal has reached quorum.

#### checkApproval(proposalId)
Check if proposal has passed.

#### finalizeProposal(proposalId)
Finalize proposal (auto-called on expiry or completion).

#### getProposalStats(proposalId)
Get detailed proposal statistics.

#### createContributionVerificationProposal(contributionId, proposedBy, teamId)
Create contribution verification proposal.

#### createRoyaltyDistributionProposal(poolId, proposedBy, teamId)
Create royalty distribution proposal.

#### createMilestoneApprovalProposal(teamId, milestoneId, proposedBy)
Create milestone approval proposal.

#### getMemberProposals(memberId)
Get proposals created by member.

#### executeProposal(proposalId)
Execute approved proposal.

---

## VotingSystem

Manages voting on proposals.

### Vote Options
- `FOR`: Vote in favor
- `AGAINST`: Vote against
- `ABSTAIN`: Abstain from voting

### Methods

#### castVote(voteData)
Cast a vote on proposal.

```javascript
await voting.castVote({
  proposalId: "proposal_id",
  voterId: "member_id",
  vote: 'for',
  reason: "Reason for vote"
})
```

#### checkVoterEligibility(proposalId, voterId)
Check if member can vote on proposal.

#### calculateVoteWeight(voterId, teamId)
Calculate vote weight based on reputation and contributions.

#### getProposalVotes(proposalId)
Get all votes for proposal.

#### getProposalVotesWithDetails(proposalId)
Get votes with voter information.

#### getMemberVotingHistory(memberId)
Get member's voting history.

#### getMemberVotingStats(memberId)
Get member's voting statistics.

#### delegateVote(delegatorId, delegateId, proposalId)
Delegate voting power.

#### getVotingPowerBreakdown(proposalId)
Get voting power breakdown for proposal.

#### requestVotingExtension(proposalId, requestedBy, reason, extensionDays)
Request voting deadline extension.

---

## Data Structures

### Team
```javascript
{
  id: string,
  name: string,
  description: string,
  maxMembers: number,
  members: string[],
  createdBy: string,
  status: 'active' | 'inactive',
  createdAt: timestamp,
  updatedAt: timestamp,
  tags: string[],
  repository: string,
  milestones: Milestone[],
  totalContributions: number
}
```

### Member
```javascript
{
  id: string,
  name: string,
  email: string,
  wallet: string,
  role: 'member' | 'team_lead' | 'admin',
  skills: string[],
  bio: string,
  github: string,
  teams: string[],
  contributions: string[],
  totalScore: number,
  reputation: number,
  badges: Badge[],
  createdAt: timestamp,
  status: 'active' | 'inactive'
}
```

### Contribution
```javascript
{
  id: string,
  teamId: string,
  memberId: string,
  type: string,
  description: string,
  data: object,
  score: number,
  verified: boolean,
  verifiedBy: string,
  verifiedAt: timestamp,
  timestamp: timestamp,
  metadata: object
}
```

### Proposal
```javascript
{
  id: string,
  type: string,
  title: string,
  description: string,
  proposedBy: string,
  teamId: string,
  status: 'active' | 'passed' | 'rejected' | 'expired',
  votesFor: number,
  votesAgainst: number,
  votesAbstain: number,
  voters: string[],
  createdAt: timestamp,
  expiresAt: timestamp,
  executedAt: timestamp,
  metadata: object,
  quorumRequired: number,
  approvalThreshold: number
}
```

### RoyaltyPool
```javascript
{
  id: string,
  name: string,
  teamId: string,
  totalAmount: number,
  currency: string,
  distributionModel: string,
  status: 'pending' | 'calculated' | 'distributed',
  createdAt: timestamp,
  distributedAt: timestamp,
  distributions: Distribution[],
  metadata: object
}
```
