# LearnFlow AI

## Project Description

LearnFlow AI is a personal AI assistant for learning, designed especially for developers and learners. It acts as a "second brain" that helps organize and process notes and code snippets. The platform accepts text notes, Markdown files, and code snippets, and leverages AI through the OpenRouter platform (initially using the `gpt-4o-mini` model) to generate concise summaries, automatically categorize content into user-defined groups, and create multiple-choice test questions (Q&A) to reinforce learning.

## Tech Stack

- **Frontend:**
  - [React 19](https://reactjs.org/)
  - [TypeScript 5](https://www.typescriptlang.org/)
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [Shadcn/ui](https://ui.shadcn.com/)
- **Backend:**
  - [Supabase](https://supabase.com/) (using PostgreSQL with built-in authentication and storage)
- **AI Integration:**
  - [OpenRouter](https://openrouter.ai/) for access to various AI models
- **Additional Integrations:**
  - Exporting Q&A sets as CSV for [Notion](https://www.notion.so/)
  - Task creation in [Todoist](https://todoist.com/) with the `learning` tag

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd LearnFlowAI
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Open your browser and navigate to:** [http://localhost:3000](http://localhost:3000)
5. **Optional:** Configure any required environment variables as needed.

## Available Scripts

- **dev:** Runs the development server using Vite
- **build:** Compiles TypeScript and builds the production bundle
- **lint:** Lints the codebase using ESLint
- **preview:** Previews the production build using Vite

## Project Scope

The project focuses on the following key areas:

- Accepting user input in the form of text notes, Markdown files, and code snippets.
- Generating concise summaries of user-provided content using AI.
- Automatically categorizing content based on predefined user groups.
- Creating multiple-choice Q&A sets for self-assessment and reinforcement of learning.
- Providing integrations for exporting Q&A sets to CSV (for Notion) and automatic task creation in Todoist.
- Implementing a simple backend for data persistence using Supabase.

## Project Status

This project is currently in the MVP stage, focusing on validating core functionalities with a minimal feature set. Future development includes further integrations, UI enhancements, and scalability improvements.

## License

This project is licensed under the MIT License.
