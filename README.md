# RadiusX Chat Client

A responsive web client for RadiusX using AWS Bedrock, designed for seamless and efficient conversational interactions. The application provides a streamlined chat interface with core messaging capabilities and simplified API integration.

## Features

- Clean, responsive UI optimized for desktop and mobile
- Support for multiple RadiusX models (Claude 3 Haiku, Sonnet, Opus, and 3.5 models)
- Dark/light mode theme support with automatic system detection
- Message history and conversation management
- Real-time chat with simulated responses

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Data Handling**: TanStack Query
- **Routing**: Wouter
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/claude-ai-chat-client.git
   cd claude-ai-chat-client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `/client` - React frontend application
  - `/src` - Source code
    - `/components` - UI components
    - `/hooks` - Custom React hooks
    - `/lib` - Utility functions and types
    - `/pages` - Application pages
- `/server` - Express backend
- `/shared` - Shared types and schemas

## Configuration

To use this application with AWS Bedrock:

1. Update the API endpoint in `client/src/lib/api.ts`
2. Ensure your AWS credentials are properly configured

## License

[MIT](LICENSE)

## Acknowledgments

- [Claude AI](https://www.anthropic.com/claude) by Anthropic
- [AWS Bedrock](https://aws.amazon.com/bedrock/) for AI model hosting
- [shadcn/ui](https://ui.shadcn.com/) for UI components