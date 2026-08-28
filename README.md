# SyncWrite

A real-time collaborative document editor built with Next.js, Tiptap, Liveblocks, Clerk, and Convex.

## Features

- Real-time collaborative editing with multiple users
- Rich-text document editing powered by Tiptap
- Organization-based document access control
- Real-time threaded comments
- User presence and collaborator avatars
- Text formatting:
  - Bold
  - Italic
  - Underline
  - Text color
  - Highlighting
  - Font family
  - Font size
  - Headings
  - Text alignment
  - Line height
- Task lists with nested tasks
- Tables with resizable columns
- Hyperlink support
- Image insertion and resizing
- Undo / redo
- Print support
- Document search and pagination
- Custom document ruler and page margins
- Responsive editor workspace
- Authentication and organizations with Clerk
- Persistent document data with Convex
- Client-side state management with Zustand
- Reusable UI components with shadcn/ui

## Tech Stack

### Frontend

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React**

### Rich Text Editor

- **Tiptap**
- Tiptap StarterKit
- Tiptap Task List
- Tiptap Task Item
- Tiptap Table
- Tiptap Image
- Tiptap Image Resize
- Tiptap Text Align
- Tiptap Link
- Tiptap Color
- Tiptap Highlight
- Tiptap Font Family
- Tiptap Text Style
- Tiptap Underline
- Custom Font Size extension
- Custom Line Height extension

### Collaboration

- **Liveblocks**
- `@liveblocks/react`
- `@liveblocks/react-tiptap`
- Real-time document synchronization
- Collaborative comments and threads

### Backend / Data

- **Convex**
- **Clerk**
- **Zustand**

## Architecture

```text
                         ┌──────────────────────┐
                         │       Next.js        │
                         │   App Router / UI    │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
        ┌──────────┐          ┌──────────┐          ┌────────────┐
        │  Clerk   │          │  Convex  │          │ Liveblocks │
        │   Auth   │          │  Data    │          │ Realtime   │
        └──────────┘          └──────────┘          └─────┬──────┘
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │   Tiptap    │
                                                   │   Editor    │
                                                   └─────────────┘
````

## Collaboration Flow

Each document is mapped to a Liveblocks room using its document ID.

```text
User A ──────────┐
                 │
User B ──────────┼──► Liveblocks Room ──► Tiptap Document
                 │
User C ──────────┘
```

When a user opens a document:

1. Clerk authenticates the user.
2. The application retrieves the document from Convex.
3. The document ID is used as the Liveblocks room ID.
4. `/api/liveblocks-auth` validates access to the document.
5. The authenticated user is granted access to the Liveblocks room.
6. Tiptap synchronizes document changes in real time.
7. Comments and threads are synchronized through Liveblocks.

## Authentication & Authorization

Clerk handles user authentication and organization membership.

Documents store:

* `ownerId`
* `organizationId`
* document title
* initial content

Before a user joins a Liveblocks room, the server verifies that the user is either:

* the document owner, or
* associated with the document's organization.

The Liveblocks authentication endpoint then grants access only after the authorization check succeeds.

## Rich Text Editor

The editor is built using Tiptap and extended with multiple extensions for document-editing functionality.

The editor supports:

```text
Text formatting
├── Bold
├── Italic
├── Underline
├── Text color
├── Highlight
├── Font family
├── Font size
├── Headings
├── Text alignment
└── Line height

Document elements
├── Paragraphs
├── Links
├── Images
├── Tables
├── Task lists
└── Nested tasks

Collaboration
├── Real-time editing
├── Comments
├── Threads
└── Multi-user synchronization
```

Custom Tiptap extensions are used for font size and line height functionality.

## Document Workspace

The editor provides a document-style workspace with:

* Fixed A4-like editing canvas
* Horizontal ruler
* Configurable left and right margins
* Print-friendly styling
* Horizontal scrolling for smaller screens
* Toolbar-based formatting controls

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── liveblocks-auth/
│   │       └── route.ts
│   │
│   ├── documents/
│   │   └── [documentId]/
│   │       ├── ...
│   │       ├── avatars.tsx
│   │       ├── ruler.tsx
│   │       ├── threads.tsx
│   │       └── ...
│   │
│   └── ...
│
├── components/
│   ├── ui/
│   └── ...
│
├── extensions/
│   ├── font-size.ts
│   └── line-height.ts
│
├── store/
│   └── use-editor-store.ts
│
└── ...
│
├── convex/
│   ├── documents.ts
│   └── ...
│
└── ...
```

## Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* A Clerk application
* A Convex deployment
* A Liveblocks project

### Clone the repository

```bash
git clone https://github.com/dasmaitreya87/docs-project.git
cd docs-project
```

### Install dependencies

```bash
npm install
```

If npm reports React peer-dependency conflicts:

```bash
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_CONVEX_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

LIVEBLOCKS_SECRET_KEY=
```

Add any additional environment variables required by your Clerk and Convex configuration.

### Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
```

## Deployment

The application can be deployed as a Next.js application on Vercel.

Before deploying, configure the required production environment variables for:

* Clerk
* Convex
* Liveblocks

Make sure the production deployment uses the correct production Convex deployment and Liveblocks credentials.

## Security

Authentication is handled through Clerk.

Document access is validated server-side before a user is granted access to a Liveblocks room. This prevents unauthorized users from joining collaborative document sessions.

## Future Improvements

* Persistent cloud-based image storage
* Document version history
* More granular document permissions
* Document sharing by individual users
* Export to PDF / DOCX
* Improved offline collaboration
* Document templates
* Advanced comment management

## Author

**Maitreya Das**
