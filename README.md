# Quick Web Lookup

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.55.0-green.svg)](https://playwright.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF.svg)](https://vitejs.dev/)

A modern Contentstack marketplace app that automatically extracts URLs from entry content and generates rich link previews with metadata, images, and descriptions. This React-based application provides an intuitive link preview interface that integrates seamlessly with Contentstack's content management system.

## 🚀 Features

- **Automatic URL Detection**: Extracts URLs from content fields automatically
- **Rich Link Previews**: Generates previews with titles, descriptions, and images
- **Responsive Design**: Adapts to different sidebar widths and screen sizes
- **Real-time Updates**: Refreshes previews when content is saved
- **Error Handling**: Graceful fallbacks with retry options
- **TypeScript**: Fully typed for better development experience
- **Modern UI**: Clean, professional interface using modern CSS modules

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm
- Contentstack account (for marketplace deployment)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/contentstack/quick-web-lookup.git
cd quick-web-lookup

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

### Building for Production

```bash
# Build the application
npm run build

# The built files will be in the `dist` directory
```

## 🏗️ Project Structure

```
quick-web-lookup/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AppFailed.tsx   # Error boundary component
│   │   ├── ErrorBoundary.tsx
│   │   └── LinkPreview/    # Link preview components
│   ├── containers/          # Main app containers
│   │   ├── App/            # Main app component
│   │   ├── AppConfiguration/ # App configuration
│   │   ├── SidebarWidget/  # Entry sidebar widget
│   │   └── 404/           # 404 error page
│   ├── common/
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── locales/        # Internationalization
│   │   ├── providers/      # Context providers
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── services/           # API services
│   ├── types/              # Type definitions
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── e2e/                    # End-to-end tests
├── public/                 # Public assets
└── config files...
```

## 🧪 Testing

This project includes comprehensive testing:

### E2E Tests

```bash
npm run test:e2e          # Run all E2E tests
npm run test:chrome       # Run E2E tests in Chrome
npm run test:firefox      # Run E2E tests in Firefox
npm run test:safari       # Run E2E tests in Safari
npm run test:chrome-headed # Run E2E tests in Chrome with UI
```

### Code Quality

```bash
npm run lint              # Run ESLint
npm run typecheck         # TypeScript type checking
npm run format            # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_PUBLIC_KEY_BASE_URL=https://app.contentstack.com
```

### App Configuration

The app configuration is defined in the manifest and deployment files for Contentstack marketplace integration.

## 🛠️ Development

### Adding New Features

1. Create feature branch from `main`
2. Implement your changes
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **CSS Modules** for styling

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new link preview feature
fix: resolve URL extraction issue
docs: update README with new features
test: add E2E tests for link previews
```

## 📦 Deployment

### Contentstack Marketplace

1. Build the application: `npm run build`
2. Package the `dist` directory
3. Upload to Contentstack marketplace
4. Install in your Contentstack stack

### Using Contentstack Launch

1. **Go to Contentstack Launch Dashboard**

   - Navigate to your Contentstack organization
   - Access the Launch section

2. **Connect GitHub Repository**

   - Click "Connect Repository"
   - Select GitHub and authorize access
   - Choose your repository: `quick-web-lookup`
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Configure Deployment**

   - Enable automatic deployments on push to main branch
   - Set up environment variables if needed
   - Configure build settings

4. **Deploy**
   - Push changes to your main branch to trigger automatic deployment
   - Or manually trigger deployment from the Launch dashboard

### Local Development

For local development with Contentstack:

1. Use Contentstack's local development tools
2. Configure your environment variables
3. Run `npm run dev` for development server

## 📱 Usage

1. Install from Contentstack marketplace
2. Navigate to entry with URL content
3. Open sidebar to see link previews
4. Click previews to open links in new tabs
5. Refresh previews when content changes

## 🤝 Contributing

We welcome contributions!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Contentstack](https://www.contentstack.com/) for the marketplace platform
- [Peekalink API](https://peekalink.io/) for link preview generation
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- [Playwright](https://playwright.dev/) for E2E testing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/contentstack/quick-web-lookup/issues)
- **Documentation**: [Contentstack Developer Hub](https://www.contentstack.com/docs/)
- **Community**: [Contentstack Community](https://community.contentstack.com/)

---

Made with ❤️ by the Contentstack team
