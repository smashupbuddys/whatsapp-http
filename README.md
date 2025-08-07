# WhatsApp HTTP API

A Docker container that provides a RESTful API for WhatsApp Web, enabling easy integration with WhatsApp for messaging automation and other services.

![WhatsApp API](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Features

- 💬 Send and receive WhatsApp messages
- 📁 Media support (images, documents, audio, video)
- 🔄 Multiple client sessions support
- 📊 Webhook notifications for incoming messages
- 📝 Fully documented REST API with Swagger
- 🐳 Easy Docker deployment
- 🔒 Session persistence
- 🚀 Built with TypeScript for type safety

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- Node.js 16+ (for development)

### Quick Start

1. **Run with Docker** (recommended):
   ```bash
   docker run -d \
     --name whatshttp \
     -p 3000:3000 \
     -v whatsapp-sessions:/app/data \
     crazynds/whatshttp:latest
   ```

2. **Access the API documentation**:
   Open your browser and navigate to `http://localhost:3000/docs`

## 📚 Documentation

### API Reference

Detailed API documentation is available at `/docs` when the server is running. The documentation includes:

- Available endpoints
- Request/response schemas
- Example requests
- Authentication requirements

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server will listen on |
| `DB_PATH` | `:memory:` | Path to SQLite database file (use `:memory:` for in-memory) |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |

### Volumes

| Path | Description |
|------|-------------|
| `/app/data` | Directory where WhatsApp sessions are stored |

## 🔧 Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Docker (for containerized development)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/crazynds/whatshttp.git
   cd whatshttp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The API will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the Docker image
docker build -t whatshttp .

# Run the container
docker run -d -p 3000:3000 whatshttp
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can contribute to the project:

### Prerequisites
- A GitHub account
- Git installed on your system
- Node.js and npm/yarn (for development)

### Fork the Repository
1. Visit the [GitHub repository](https://github.com/crazynds/whatshttp)
2. Click the "Fork" button in the top-right corner
3. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/whatshttp.git
   cd whatshttp
   ```
4. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/crazynds/whatshttp.git
   ```

### Create a Branch
1. Make sure your fork is up to date:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

### Make Your Changes
1. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
2. Make your changes following the project's code style
3. Add tests if applicable
4. Run tests to make sure everything works:
   ```bash
   npm test
   # or
   yarn test
   ```

### Commit and Push
1. Stage your changes:
   ```bash
   git add .
   ```
2. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with message sending"
   ```
3. Push to your forked repository:
   ```bash
   git push origin your-branch-name
   ```

### Create a Pull Request
1. Go to your forked repository on GitHub
2. Click on "Compare & pull request"
3. Fill in the PR template with details about your changes
4. Submit the pull request

### After Submitting
- Wait for the CI/CD pipeline to run
- Address any feedback or requested changes
- Once approved, your changes will be merged into the main branch

### Code Review Process
- All pull requests will be reviewed by the maintainers
- We use "Squash and Merge" to keep the commit history clean
- Your contribution will be credited in the project's changelog

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API
- [Express](https://expressjs.com/) - Web framework for Node.js
- [TypeScript](https://www.typescriptlang.org/) - TypeScript is JavaScript with syntax for types

## 📬 Contact

- [Crazynds](https://github.com/crazynds)
- [ArturCSegat](https://github.com/ArturCSegat)

## 🔗 Links

- [GitHub Repository](https://github.com/crazynds/whatshttp)
- [Docker Hub](https://hub.docker.com/r/crazynds/whatshttp)
- [Report Bug](https://github.com/crazynds/whatshttp/issues)

