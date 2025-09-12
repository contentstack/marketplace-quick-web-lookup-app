# Quick Web Lookup

A Contentstack marketplace app that automatically extracts URLs from entry content and generates rich link previews with metadata, images, and descriptions.

## 🚀 Features

- **Automatic URL Detection**: Extracts URLs from content fields
- **Rich Link Previews**: Generates previews with titles, descriptions, and images
- **Responsive Design**: Adapts to different sidebar widths
- **Real-time Updates**: Refreshes previews when content saved.
- **Error Handling**: Graceful fallbacks with retry options

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite 6
- CSS Modules
- Playwright for E2E testing

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quick-web-lookup
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Available Scripts

| Script             | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run test:e2e` | Run E2E tests             |
| `npm run lint`     | Run ESLint                |
| `npm run format`   | Format code with Prettier |

## 🔧 Configuration

Create a `.env` file:

```env
VITE_PUBLIC_KEY_BASE_URL= #Add public key base URL. Defaults to 'https://app.contentstack.com'
```

## 📱 Usage

1. Install from Contentstack marketplace
2. Navigate to entry with URL content
3. Open sidebar to see link previews
4. Click previews to open links

## 🚀 Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:e2e`
5. Submit a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.
