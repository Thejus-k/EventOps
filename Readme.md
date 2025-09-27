# EventOps

Deployed in : https://event-ops-xasg.vercel.app/

EventOps is a web-based platform for managing and streamlining event
operations.\
This repository contains the frontend code built with **Vite**,
**React/TypeScript**, and **Tailwind CSS**.

## 📂 Project Structure

    EventOps-main/
    ├─ frontend-event-ops/      # Frontend Vite + React + Tailwind application
    │  ├─ public/               # Static assets
    │  ├─ src/                  # Application source code
    │  │  ├─ components/        # Reusable UI components
    │  │  ├─ pages/             # Page-level components/routes
    │  │  ├─ assets/            # Images, icons, etc.
    │  │  └─ ...                # Other frontend logic
    │  ├─ index.html            # App entry HTML
    │  ├─ package.json          # Frontend dependencies & scripts
    │  └─ vite.config.ts        # Vite configuration
    └─ other files              # .gitignore, docs, etc.

## 🚀 Features

-   ⚡ **Vite** for fast development and build.
-   💅 **Tailwind CSS** for modern, responsive styling.
-   🧩 **Component-based architecture** with reusable React components.
-   ✅ TypeScript for type-safe development.

## 🛠️ Tech Stack

-   **Framework**: React + Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Build Tools**: Vite, PostCSS
-   **Linting**: ESLint

## 📦 Installation & Setup

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+ recommended)
-   npm or bun (if you prefer bun)

### Steps

1.  **Clone the repository**

    ``` bash
    git clone https://github.com/your-username/EventOps.git
    cd EventOps-main/frontend-event-ops
    ```

2.  **Install dependencies**

    ``` bash
    npm install
    # or
    bun install
    ```

3.  **Run the development server**

    ``` bash
    npm run dev
    # or
    bun dev
    ```

    The app will be available at: `http://localhost:5173`

4.  **Build for production**

    ``` bash
    npm run build
    ```

5.  **Preview production build**

    ``` bash
    npm run preview
    ```

## 🧩 Scripts

  Command             Description
  ------------------- --------------------------
  `npm run dev`       Start development server
  `npm run build`     Build for production
  `npm run preview`   Preview production build
  `npm run lint`      Run ESLint checks

## 📁 Environment Variables

If the project requires API keys or environment settings, create a
`.env` file in `frontend-event-ops/` and add required keys as:

    VITE_API_URL=https://your-api-endpoint

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull
request.

## 📄 License

This project is licensed under the MIT License -- see the
[LICENSE](LICENSE) file for details.

