# Tech Stack Overview

This document outlines the technology stack for the LearnFlowAI project, combining both the product requirements outlined in the PRD and our chosen technical components.

## Frontend

- **Framework**: React 19 – used for building the user interface and facilitating future mobile application development.
- **Language**: TypeScript 5 – ensures strong static type checking, leading to robust code and enhanced IDE support.
- **Styling**: Tailwind CSS 4 – a utility-first CSS framework that allows for efficient and customizable styling.
- **UI Components**: Shadcn/ui – provides a library of accessible, pre-built React components for rapid UI development.

## Backend

- **Platform**: Supabase – serves as a comprehensive backend solution, featuring:
  - **Database**: PostgreSQL – for storing original notes, generated summaries, Q&A sets, user feedback, and more.
  - **Backend-as-a-Service**: Offers SDKs in multiple languages for flexible integration.
  - **Authentication**: Built-in user authentication system.
  - **Deployment Flexibility**: Can be hosted locally or on dedicated servers.

## AI Integration

- **Service**: Openrouter.ai – provides access to a wide range of AI models (including OpenAI, Anthropic, and Google), which will be used for:
  - Generating concise summaries.
  - Automated categorization of content.
  - Creating multiple-choice Q&A sets.
- **Cost Management**: Enables setting financial limits on API keys to ensure cost-effectiveness.

## CI/CD and Hosting

- **CI/CD Pipeline**: GitHub Actions – automates building, testing, and deployment processes.
- **Hosting**: Docker-based deployment on a dedicated VPS – ensures scalable and reliable hosting.

## Additional Integrations

- **Notion Integration**: Export generated Q&A sets to CSV for easy import into Notion.
- **Todoist Integration**: Automatically create tasks tagged with `learning` after processing each note.

This tech stack is designed to support rapid development, scalability, and a seamless user experience, fully aligning with the MVP outlined in the product requirements document.
