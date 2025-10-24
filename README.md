# AgentDB Learning Journey

A practical, project-based learning portfolio demonstrating hands-on experience with AgentDB, vector databases, and modern web development.

## 🎯 Overview

This repository documents a structured learning journey through 8 progressive modules, from web fundamentals to advanced AI integration with AgentDB. The approach emphasizes **learning by building** - each module is a real, working project that builds upon previous knowledge.

## 🚀 Live Portfolio

View the portfolio website: [AgentDB Learning Portfolio](https://mondweep.github.io/agentdb-tinkering)

## 📚 Learning Modules

### Phase 1: Foundation (Weeks 1-4)
1. **Personal Portfolio Website** (Beginner)
   - Skills: HTML5, CSS3, JavaScript, Responsive Design, Git
   - Duration: 2 weeks
   - ✅ Status: Completed

2. **Weather Dashboard with API** (Beginner)
   - Skills: REST APIs, Async/Await, JSON, Charts, Error Handling
   - Duration: 2 weeks
   - ✅ Status: Completed

### Phase 2: Backend & Database (Weeks 5-8)
3. **Task Manager with Backend** (Intermediate)
   - Skills: Node.js, Express, MongoDB, JWT Auth, RESTful API
   - Duration: 2 weeks
   - 🔄 Status: In Progress

4. **Vector Search Engine** (Intermediate)
   - Skills: AgentDB, Vector Embeddings, K-NN Search, Cosine Similarity, OpenAI API
   - Duration: 2 weeks
   - ⏳ Status: Upcoming

### Phase 3: AI Integration (Weeks 9-12)
5. **AI Document Assistant** (Advanced)
   - Skills: RAG Pipeline, LLM Integration, Document Processing, Vector Storage
   - Duration: 2 weeks
   - ⏳ Status: Upcoming

6. **Learning Pattern System** (Advanced)
   - Skills: ReasoningBank, Pattern Storage, Metadata, Success Tracking, Analytics
   - Duration: 2 weeks
   - ⏳ Status: Upcoming

### Phase 4: Optimization & Capstone (Weeks 13-16)
7. **High-Performance Vector DB** (Advanced)
   - Skills: Quantization, Query Caching, Batch Processing, Performance Tuning
   - Duration: 2 weeks
   - ⏳ Status: Upcoming

8. **AI-Powered Code Assistant** (Expert)
   - Skills: Full-Stack, Code Analysis, AI Integration, Real-time Updates, Deployment
   - Duration: 2 weeks
   - ⏳ Status: Upcoming (Capstone Project)

## 🛠️ Technologies Used

### Core Technologies
- **AgentDB**: Vector database with ReasoningBank capabilities
- **Vector Operations**: K-NN search, cosine similarity, embeddings
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express, Python
- **Databases**: MongoDB, AgentDB (Vector DB)

### AI & ML
- Vector embeddings and similarity search
- RAG (Retrieval-Augmented Generation)
- LLM integration (OpenAI API)
- Pattern storage and retrieval
- Query optimization and caching

### Development Tools
- Git & GitHub
- npm/yarn package management
- RESTful API design
- Authentication (JWT)
- Performance monitoring

## 📊 Progress Tracking

- **Overall Completion**: 25% (2 of 8 modules)
- **Web Fundamentals**: 85%
- **Backend Development**: 60%
- **AgentDB & Vector Search**: 40%
- **AI Integration**: 20%

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mondweep/agentdb-tinkering.git
cd agentdb-tinkering
```

2. Open the portfolio website:
```bash
# Simply open index.html in your browser
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

3. Or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

Then navigate to `http://localhost:8000`

## 📁 Project Structure

```
agentdb-tinkering/
├── index.html              # Main portfolio page
├── style.css               # Styling and animations
├── script.js               # Interactive features
├── README.md               # This file
├── LEARNING_PLAN.md        # Detailed module breakdown
├── AGENTDB-SKILL.md        # Learning curriculum (Claude SKILL format)
├── agentdb-export.json     # Machine-readable learning plan export
├── .gitignore              # Git ignore configuration
└── projects/               # Individual project folders (coming soon)
    ├── module-1-portfolio/
    ├── module-2-weather/
    ├── module-3-task-manager/
    └── ...
```

## 🎨 Features

### Portfolio Website
- ✨ Modern, responsive design
- 🎯 Interactive module cards
- 📊 Progress tracking visualizations
- 🌓 Dark theme optimized
- ⚡ Smooth animations and transitions
- 📱 Mobile-friendly navigation
- ♿ Accessibility features

### Learning Features
- Structured progression from beginner to expert
- Real-world project-based learning
- Comprehensive skill development
- Portfolio-ready projects
- Best practices and patterns

## 🔧 AgentDB Integration

This learning journey extensively uses AgentDB for:

1. **Vector Search**: Implementing semantic search using embeddings
2. **ReasoningBank**: Storing and retrieving problem-solving patterns
3. **Performance Optimization**: Query caching and vector quantization
4. **AI Applications**: RAG pipelines and intelligent assistants

### Example AgentDB Usage

```javascript
// Initialize AgentDB
const db = await agentdb.init({
  backend: 'native',
  memoryMode: false,
  enableQuantization: true,
  enableQueryCache: true
});

// Insert vectors with metadata
await db.insert({
  embedding: [0.1, 0.2, 0.3, ...],
  metadata: {
    type: 'learning_module',
    difficulty: 'intermediate',
    skills: ['agentdb', 'vectors']
  }
});

// Semantic search
const results = await db.search({
  queryEmbedding: [0.15, 0.25, 0.35, ...],
  k: 5,
  threshold: 0.8
});
```

## 📖 Documentation

- [Detailed Learning Plan](LEARNING_PLAN.md) - Complete module breakdown
- [AgentDB Learning Curriculum](AGENTDB-SKILL.md) - Structured learning guide in Claude SKILL format
- [Learning Plan Export](agentdb-export.json) - Machine-readable JSON export with all modules and patterns
- [AgentDB Documentation](https://agentdb.dev/docs) - Official docs
- [Project Wiki](https://github.com/mondweep/agentdb-tinkering/wiki) - Additional resources

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **AgentDB Team** - For creating an excellent vector database
- **Anthropic** - For Claude and the learning resources
- **Open Source Community** - For the amazing tools and libraries

## 📫 Contact

- GitHub: [@mondweep](https://github.com/mondweep)
- Project Link: [https://github.com/mondweep/agentdb-tinkering](https://github.com/mondweep/agentdb-tinkering)

## 🎯 Learning Goals

By the end of this 16-week journey, you will have:

- ✅ Built 8 production-ready projects
- ✅ Mastered AgentDB and vector databases
- ✅ Implemented AI-powered applications
- ✅ Developed full-stack development skills
- ✅ Created a comprehensive portfolio
- ✅ Learned performance optimization techniques
- ✅ Gained experience with modern development practices

---

**Start Date**: October 2025  
**Expected Completion**: February 2026  
**Current Status**: 25% Complete (Module 3 of 8)

*Built with 💜 and lots of learning*
