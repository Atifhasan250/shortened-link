# Shortened Link: A Simple & Powerful URL Shortener

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-github-username%2Fyour-repo-name)

Transform your long, unwieldy URLs into short, memorable, and shareable links with Shortened Link. Built with modern technologies, this app provides a fast, reliable, and easy-to-use platform for all your link shortening needs.

## ✨ Features

- **Custom Short Links:** Create personalized, easy-to-remember short links.
- **Instant Redirects:** Fast and efficient URL redirection.
- **Dynamic Link Previews:** Automatically displays your custom domain in the UI.
- **Responsive Design:** A seamless experience across all devices, from desktops to mobile phones.
- **Light & Dark Mode:** Choose the theme that suits your style.
- **Error Handling:** Smart error messages guide you if a link or custom name is already taken.
- **SEO Optimized:** Enhanced metadata for better search engine visibility.
- **One-Click Copy:** Easily copy your shortened link to the clipboard.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Deployment:** [Vercel](https://vercel.com/)

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/atifhasan-web/shortend-link.git
    cd shortend-link
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```
3.  **Set up Firebase:**
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - Create a new web app and copy the `firebaseConfig` object.
    - Paste your `firebaseConfig` into `src/lib/firebase.ts`.
    - In the Firestore Database section, create a new database in production mode and create a collection named `links`.

4.  **Run the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚢 Deployment

This project is configured for seamless deployment with [Vercel](https://vercel.com/).

1.  **Push your code to GitHub.**
2.  **Import your project into Vercel:**
    - Go to your Vercel dashboard and click "Add New... > Project".
    - Select your GitHub repository.
    - Vercel will automatically detect the Next.js framework and configure the build settings.
3.  **Deploy!**
    - Click the "Deploy" button. Vercel will handle the rest.

Your URL shortener will be live on a Vercel domain, which you can then map to your own custom domain.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
