# URL Shortener – Next.js Tech Test

A modern, full-stack URL shortening service built with [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Material UI](https://mui.com/), and [Tailwind CSS](https://tailwindcss.com/). This project demonstrates best practices in React, API design, and UI/UX for a technical assessment.

## Overview

This application allows users to shorten long URLs, optionally customize their shortcodes, set expiry times, and view analytics for each link. It is designed for clarity, maintainability, and scalability, making it suitable for both demonstration and further development.

---

## Features

- **Shorten URLs:** Instantly generate a short link for any valid URL.
- **Custom Shortcodes:** Optionally specify your own memorable shortcode.
- **Expiry Control:** Set how long each short URL remains valid.
- **Analytics:** Track click counts, referrers, and (placeholder) location data.
- **Responsive UI:** Clean, accessible interface using Material UI and Tailwind CSS.
- **Centralized Logging:** Middleware for consistent event logging.
- **TypeScript:** End-to-end type safety.

---

## Demo & Expected Outcomes

### What You Can Do

- **Shorten a URL:**  
  Enter a long URL, optionally set a custom shortcode and expiry. Receive a unique short URL.
- **Use the Short URL:**  
  Share or visit the short URL. It will redirect to the original link and record analytics.
- **View Analytics:**  
  See how many times your short URL was used, with basic referrer and location info.
- **Experience a Modern UI:**  
  Enjoy a responsive, accessible, and visually appealing interface.

### Example Workflow

1. **Input:**  
   `https://www.example.com/very/long/link`
2. **Output:**  
   `https://yourdomain.com/abc123` (or your custom shortcode)
3. **Analytics:**  
   - Clicks: 5  
   - Last Accessed: 2025-08-11  
   - Referrers: google.com, twitter.com

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd tech_test
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
tech_test/
├── public/                # Static assets (SVGs, images)
├── src/
│   ├── app/               # Next.js app directory (pages, API routes)
│   ├── components/        # React UI components
│   └── lib/               # Utilities, storage, logging, and theme
├── .next/                 # Next.js build output (auto-generated)
├── package.json           # Project metadata and scripts
├── tsconfig.json          # TypeScript configuration
├── postcss.config.mjs     # PostCSS/Tailwind config
└── README.md              # Project documentation
```

---

## Usage Guide

### 1. Shorten a URL

- Go to the homepage.
- Enter your long URL.
- (Optional) Enter a custom shortcode and set expiry.
- Click **Shorten**.
- Copy and use the generated short URL.

### 2. Redirect & Analytics

- Visit the short URL in your browser.
- You will be redirected to the original URL.
- Analytics (click count, referrer, etc.) are updated.

### 3. View Analytics

- Use the analytics section or API endpoint to view stats for your short URL.

---

## API Reference

### Create Short URL

- **POST** `/api/shorturls`
- **Body:**  
  ```json
  {
    "url": "https://www.example.com",
    "validity": 7,
    "shortcode": "custom123" // optional
  }
  ```
- **Response:**  
  ```json
  {
    "shortcode": "custom123",
    "shortUrl": "http://localhost:3000/custom123",
    "expiry": "2025-08-18T12:00:00Z"
  }
  ```

### Get Analytics

- **GET** `/api/shorturls/[shortcode]`
- **Response:**  
  ```json
  {
    "shortcode": "custom123",
    "clicks": 5,
    "lastAccessed": "2025-08-11T12:00:00Z",
    "referrers": ["google.com", "twitter.com"]
  }
  ```

### Redirect

- **GET** `/[shortcode]`  
  Redirects to the original URL and records the click.

---

## Customization

- **Theme:**  
  Edit [`src/lib/theme.ts`](src/lib/theme.ts) for Material UI theme customization.
- **URL Storage:**  
  In-memory storage logic in [`src/lib/url-storage.ts`](src/lib/url-storage.ts).
- **Logging:**  
  Centralized logging in [`src/lib/logging-middleware.ts`](src/lib/logging-middleware.ts).

---

## Troubleshooting

- **Port in use:**  
  Change the port with `PORT=4000 npm run dev`
- **Build errors:**  
  Ensure Node.js and dependencies are up to date.
- **Analytics not updating:**  
  Check browser cache or try in incognito mode.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Docs](https://mui.com/material-ui/getting-started/overview/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs/installation)

---

## License

This project is for educational and evaluation purposes only.

---

*Built with ❤️ using Next.js, TypeScript, and Material
