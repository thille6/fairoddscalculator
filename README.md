# Fair Odds Calculator

A calculator for fair odds in sports betting.

## Features

- Calculate fair odds for 1X2 (Home/Draw/Away) markets
- Calculate fair odds for Asian Handicap markets
- Calculate fair odds for Over/Under markets
- Determine bookmaker's margin (overround)
- Calculate Expected Value (EV) for bets

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run start
   ```

## Deployment to GitHub Pages

This project is configured with GitHub Actions for automatic deployment to GitHub Pages.

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. Push to the `main` branch to trigger deployment

The GitHub Actions workflow will automatically build and deploy the project to GitHub Pages.

## Manual Deployment

If you prefer to deploy manually:

1. Build the project:
   ```
   npm run build
   ```

2. Deploy the contents of the `dist` folder to your hosting provider.