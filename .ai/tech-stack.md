# Tech Stack Overview

This document outlines the technology stack for the LearnFlowAI project, combining both the product requirements outlined in the PRD and our chosen technical components.

## Frontend

- **Framework**: Astro 5 – A modern web framework focused on performance and content delivery. Used for building the overall site structure, pages, and layouts.
- **UI Components (Interactive)**: React 19 – Used within Astro islands for building dynamic and interactive user interface components. Facilitates potential future mobile application development.
- **Language**: TypeScript 5 – Ensures strong static type checking across both Astro and React components, leading to robust code and enhanced IDE support.
- **Styling**: Tailwind CSS 4 – A utility-first CSS framework that allows for efficient and customizable styling within Astro and React.
- **UI Components (Base)**: Shadcn/ui – Provides a library of accessible, pre-built React components, integrated within Astro islands for rapid UI development.

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

## Testing Framework

- **Unit Testing**:
  - **Vitest** – Fast testing framework compatible with Vite, used for unit testing React components and service functions.
  - **React Testing Library** – Testing utilities for React that encourage good testing practices by focusing on user interactions rather than implementation details.
- **E2E Testing**:
  - **Playwright** – Cross-browser testing framework for end-to-end testing, simulating real user scenarios across different browsers.
  - **Accessibility Testing** – Integration of accessibility testing tools like axe with Playwright.
- **Quality Tools**:
  - **ESLint & Prettier** – Ensuring code quality and consistency.

## Additional Integrations

- **Notion Integration**: Export generated Q&A sets to CSV for easy import into Notion.
- **Todoist Integration**: Automatically create tasks tagged with `learning` after processing each note.

This tech stack is designed to support rapid development, scalability, and a seamless user experience, fully aligning with the MVP outlined in the product requirements document.
