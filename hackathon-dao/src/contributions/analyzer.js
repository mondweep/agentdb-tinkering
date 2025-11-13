/**
 * Git and Code Analyzer
 * Analyzes git repositories and code contributions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ContributionAnalyzer {
  constructor() {
    this.languageWeights = {
      javascript: 1.0,
      typescript: 1.2,
      python: 1.1,
      rust: 1.5,
      go: 1.3,
      java: 1.1,
      cpp: 1.4,
      c: 1.3,
      html: 0.5,
      css: 0.5,
      markdown: 0.3
    };
  }

  /**
   * Analyze git commits for a repository
   */
  async analyzeGitCommits(repoPath, author, since = null) {
    try {
      if (!fs.existsSync(repoPath)) {
        throw new Error(`Repository path does not exist: ${repoPath}`);
      }

      const sinceDateArg = since ? `--since="${since}"` : '--all';
      const command = `git -C "${repoPath}" log --author="${author}" ${sinceDateArg} --pretty=format:"%H|%an|%ae|%at|%s" --numstat`;

      const output = execSync(command, { encoding: 'utf8' });
      const commits = this.parseGitLog(output);

      return commits;
    } catch (error) {
      console.error('Error analyzing git commits:', error.message);
      return [];
    }
  }

  /**
   * Parse git log output
   */
  parseGitLog(output) {
    const commits = [];
    const lines = output.split('\n');
    let currentCommit = null;

    for (const line of lines) {
      if (line.includes('|')) {
        // Commit header line
        if (currentCommit) {
          commits.push(currentCommit);
        }

        const [hash, author, email, timestamp, message] = line.split('|');
        currentCommit = {
          hash,
          author,
          email,
          timestamp: parseInt(timestamp) * 1000,
          message,
          files: [],
          linesAdded: 0,
          linesRemoved: 0
        };
      } else if (line.trim() && currentCommit) {
        // File change line
        const parts = line.trim().split('\t');
        if (parts.length === 3) {
          const added = parseInt(parts[0]) || 0;
          const removed = parseInt(parts[1]) || 0;
          const file = parts[2];

          currentCommit.files.push({ file, added, removed });
          currentCommit.linesAdded += added;
          currentCommit.linesRemoved += removed;
        }
      }
    }

    if (currentCommit) {
      commits.push(currentCommit);
    }

    return commits;
  }

  /**
   * Analyze code complexity
   */
  analyzeComplexity(code) {
    let complexity = 1; // Base complexity

    // Count control flow statements
    const controlFlowPatterns = [
      /\bif\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcatch\s*\(/g,
      /\bcase\b/g,
      /&&/g,
      /\|\|/g
    ];

    for (const pattern of controlFlowPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // Count function definitions (nested functions increase complexity)
    const functionPatterns = [
      /function\s+\w+/g,
      /=>\s*{/g,
      /\basync\s+function/g
    ];

    for (const pattern of functionPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length * 0.5;
      }
    }

    return Math.min(5, Math.round(complexity / 5)); // Scale to 1-5
  }

  /**
   * Detect programming language
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      cc: 'cpp',
      c: 'c',
      h: 'c',
      hpp: 'cpp',
      html: 'html',
      css: 'css',
      md: 'markdown'
    };

    return languageMap[ext] || 'unknown';
  }

  /**
   * Calculate weighted score for file changes
   */
  calculateWeightedScore(files) {
    let totalScore = 0;

    for (const file of files) {
      const language = this.detectLanguage(file.file);
      const weight = this.languageWeights[language] || 1.0;
      const changes = file.added + file.removed;
      totalScore += changes * weight;
    }

    return totalScore;
  }

  /**
   * Analyze code quality indicators
   */
  analyzeCodeQuality(code) {
    const quality = {
      hasTests: false,
      hasDocumentation: false,
      followsStandards: true,
      testCoverage: 0,
      commentRatio: 0
    };

    // Check for tests
    quality.hasTests = /describe\(|it\(|test\(|@Test/i.test(code);

    // Check for documentation
    quality.hasDocumentation = /\/\*\*[\s\S]*?\*\/|#\s+.+|""".+"""/m.test(code);

    // Calculate comment ratio
    const lines = code.split('\n');
    const commentLines = lines.filter(line =>
      /^\s*(\/\/|#|\/\*|\*)/.test(line)
    ).length;
    quality.commentRatio = lines.length > 0 ? commentLines / lines.length : 0;

    // Check for common issues (very basic)
    const hasConsoleLog = /console\.log/.test(code);
    const hasTODO = /TODO|FIXME|HACK/.test(code);
    const hasLongLines = lines.some(line => line.length > 120);

    quality.followsStandards = !hasConsoleLog && !hasTODO && !hasLongLines;

    return quality;
  }

  /**
   * Generate contribution report from git analysis
   */
  generateContributionReport(commits) {
    const report = {
      totalCommits: commits.length,
      totalLinesAdded: 0,
      totalLinesRemoved: 0,
      totalFilesChanged: 0,
      languageDistribution: {},
      commitFrequency: {},
      averageCommitSize: 0
    };

    const allFiles = new Set();

    for (const commit of commits) {
      report.totalLinesAdded += commit.linesAdded;
      report.totalLinesRemoved += commit.linesRemoved;

      // Track unique files
      commit.files.forEach(f => allFiles.add(f.file));

      // Language distribution
      commit.files.forEach(f => {
        const lang = this.detectLanguage(f.file);
        if (!report.languageDistribution[lang]) {
          report.languageDistribution[lang] = 0;
        }
        report.languageDistribution[lang] += f.added + f.removed;
      });

      // Commit frequency by day
      const date = new Date(commit.timestamp).toISOString().split('T')[0];
      if (!report.commitFrequency[date]) {
        report.commitFrequency[date] = 0;
      }
      report.commitFrequency[date]++;
    }

    report.totalFilesChanged = allFiles.size;
    report.averageCommitSize = commits.length > 0
      ? (report.totalLinesAdded + report.totalLinesRemoved) / commits.length
      : 0;

    return report;
  }

  /**
   * Analyze pull request impact
   */
  analyzePRImpact(prData) {
    const impact = {
      complexity: 1,
      risk: 'low',
      value: 50
    };

    // Analyze based on files changed
    if (prData.filesChanged > 20) {
      impact.complexity = 5;
      impact.risk = 'high';
    } else if (prData.filesChanged > 10) {
      impact.complexity = 3;
      impact.risk = 'medium';
    }

    // Analyze based on lines changed
    const totalLines = prData.additions + prData.deletions;
    if (totalLines > 1000) {
      impact.complexity = Math.max(impact.complexity, 4);
      impact.risk = 'high';
    } else if (totalLines > 500) {
      impact.complexity = Math.max(impact.complexity, 3);
      impact.risk = 'medium';
    }

    // Calculate value
    impact.value = Math.min(200, totalLines * 0.1 + prData.filesChanged * 5);

    return impact;
  }

  /**
   * Extract contribution data from commit
   */
  extractContributionData(commit, repoPath = null) {
    let quality = { hasTests: false, hasDocumentation: false, followsStandards: true };

    // If repo path provided, try to analyze code quality
    if (repoPath && commit.files.length > 0) {
      try {
        const firstFile = commit.files[0].file;
        const filePath = path.join(repoPath, firstFile);
        if (fs.existsSync(filePath)) {
          const code = fs.readFileSync(filePath, 'utf8');
          quality = this.analyzeCodeQuality(code);
        }
      } catch (error) {
        // Ignore errors reading files
      }
    }

    return {
      commits: 1,
      linesAdded: commit.linesAdded,
      linesRemoved: commit.linesRemoved,
      filesChanged: commit.files.length,
      complexity: this.calculateCommitComplexity(commit),
      hasTests: quality.hasTests,
      hasDocumentation: quality.hasDocumentation,
      followsStandards: quality.followsStandards,
      weightedScore: this.calculateWeightedScore(commit.files)
    };
  }

  /**
   * Calculate commit complexity
   */
  calculateCommitComplexity(commit) {
    const filesCount = commit.files.length;
    const totalChanges = commit.linesAdded + commit.linesRemoved;

    // More files and changes = higher complexity
    let complexity = 1;

    if (filesCount > 10 || totalChanges > 500) {
      complexity = 5;
    } else if (filesCount > 5 || totalChanges > 200) {
      complexity = 4;
    } else if (filesCount > 3 || totalChanges > 100) {
      complexity = 3;
    } else if (filesCount > 1 || totalChanges > 50) {
      complexity = 2;
    }

    return complexity;
  }
}

module.exports = ContributionAnalyzer;
