# Weather Intel Dashboard

A precision weather intelligence application built with React, Vite, Tailwind CSS v4, and Recharts, fetching real-time meteorological data and geocoding forecasts from Open-Meteo infrastructure.

## Key Features

- **Live City Search & Geocoding**: Defensive API queries with instant fallback handling for empty or missing search responses.
- **Current Conditions & Day Metrics**: Detailed metrics including temperature, feels-like, UV index, wind speed, pressure, and humidity.
- **Interactive Trends**: Visual 7-day temperature range and 24-hour precipitation probability charts powered by Recharts.
- **Smart Outdoor Planning**: Dynamic activity scoring (running, cycling, hiking, stargazing) and safety recommendations.
- **Unit Customization**: Seamless switching between Celsius (°C) / Fahrenheit (°F) and km/h / mph with local persistence.

---

## Connecting Google AI Studio to GitHub

To sync and transfer this project from Google AI Studio into your GitHub repository:

1. **Open AI Studio Settings**: Click the **Share / Export** button or settings icon in the top header of the Google AI Studio interface.
2. **Select Export Option**: Choose **Export to GitHub**.
3. **Authorize GitHub**: If prompted, authorize Google AI Studio to access your GitHub account.
4. **Choose Repository**:
   - Enter a name for a new repository (e.g., `aether-intel-weather`) or select an existing repository.
   - Select the destination branch (default is `main`).
5. **Push Code**: Click **Export / Push**. Google AI Studio will commit and push the entire repository codebase to GitHub.

---

## Deploying to Cloudflare Pages

To deploy your exported repository directly to Cloudflare Pages for fast global distribution:

### Step 1: Connect Git Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, navigate to **Workers & Pages** → **Create application** → **Pages**.
3. Select **Connect to Git** and authorize Cloudflare to access your GitHub account.
4. Choose your repository (`aether-intel-weather`) and select the `main` branch.

### Step 2: Build & Deployment Settings
Configure the build preset as follows:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Build Output Directory** | `dist` |
| **Root Directory** | `/` (leave empty) |

### Step 3: Environment Variables (Optional)
If required, add `NODE_VERSION` = `20` in the **Environment variables** section under build settings.

### Step 4: Save & Deploy
Click **Save and Deploy**. Cloudflare Pages will run `npm run build`, bundle all assets into `dist/`, and publish your app globally on a `*.pages.dev` domain. Every future push to your `main` branch on GitHub will trigger an automated build and continuous deployment.

---

## Local Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (runs on http://localhost:3000)
npm run dev

# 3. Compile production build into dist/
npm run build

# 4. Preview compiled production build locally
npm run preview
```
