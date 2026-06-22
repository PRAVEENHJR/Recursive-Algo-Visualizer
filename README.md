# Recursion Tree Visualizer

An interactive, high-fidelity web application built with **React**, **TypeScript**, and **Tailwind CSS** designed to visualize recursive algorithms step-by-step. It helps developers and students understand recursive depth, branching, execution logs, and call stacks in real time.

---

## 🚀 Key Features

*   **Interactive Visualizations**: Watch tree structures form dynamically as recursion branches split and return values.
*   **Step-by-Step Control**: Step forward, backward, or auto-run animations at adjustable speeds.
*   **Call Stack & Log Panels**: Highly detailed trackings of active call frames and past outcomes.
*   **Multiple Classical Algorithms**: Included presets such as Fibonacci, Factorial, Tower of Hanoi, Binary Search, Merge Sort, Quick Sort, and Pathfinding.
*   **Multi-language Support**: View corresponding code blocks in Pseudo-code, C++, Java, Python, JavaScript, or TypeScript with line-level highlighting.

---

## 💻 Running Locally (VS Code)

Follow these simple steps to run this project directly in your local development environment:

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### Setup & Run

1.  **Extract / Clean Directory**: Open the folder containing these files in VS Code.
2.  **Install Dependencies**: Run the following command in your terminal to install the clean, AI-free package definitions:
    ```bash
    npm install
    ```
3.  **Launch Dev Server**: Start the local Vite development server:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**: Ctrl+Click or navigate to the local URL shown in your terminal (typically `http://localhost:3000` or `http://localhost:5173`).

---

## 📦 Building for Production

To create a highly optimized, production-ready static bundle of the visualizer:

```bash
npm run build
```

The compiled assets will be built inside the `./dist` folder, which is fully ready to be deployed to static hosting platforms such as GitHub Pages, Vercel, Netlify, or AWS Sentry.

---

## 🎨 Technologies Used

*   **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (for strict type-safety)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations**: [Motion](https://motion.dev/)
*   **Icons**: [Lucide React](https://lucide.dev/)
