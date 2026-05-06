# Pool Occupancy Dashboard

Web application for monitoring real-time pool occupancy and analytics across multiple swimming facilities in Brno, Czech Republic. Built with Nuxt 3, TypeScript, and Tailwind CSS.

![Pool Occupancy Dashboard](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=github&logoColor=white)

## 🏊‍♂️ Features

### 📊 Real-time Pool Monitoring

- **Current Occupancy**: Live tracking of people currently in each pool
- **Pool Status**: Real-time open/closed status with opening hours
- **Capacity Visualization**: Visual progress bars showing occupancy percentages
- **Multi-pool Support**: Monitor multiple pools across different facilities

### 📈 Advanced Analytics

- **Interactive Heatmaps**: Visualize occupancy patterns by day and hour
- **Multiple View Modes**:
  - Overall average across all weeks
  - Weekly average occupancy
  - Weekly min/max values
- **Customizable Thresholds**: Adjust visualization thresholds for better insights
- **Historical Data**: Access weeks of historical occupancy data

### 🎨 Modern User Experience

- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Mode**: Full theme support with system preference detection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/VitekHub/pool-occupancy-dashboard-nuxt.git
   cd pool-occupancy-dashboard-nuxt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)

   ```bash
   cp .env.example .env
   # Edit .env if you need to customize the CSV data source
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🛠️ Development

### Testing

The project includes unit tests for data processing and CSV parsing utility functions.

Tests are located in the `tests/unit/` directory and use Vitest as the testing framework.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:check   # Check linting without fixing
npm run format       # Format code with Prettier
npm run format:check # Check formatting

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI interface
npm run test:run     # Run tests once
```

### Project Structure

```
├── assets/css/           # Global styles and Tailwind imports
├── components/           # Vue components
│   ├── card/             # Card components
│   ├── heatmap/          # Heatmap selection and visualization components
│   └── ui/               # UI components
├── composables/          # Vue composables
├── layouts/              # Nuxt layouts
├── pages/                # Nuxt pages
├── stores/               # Pinia stores
├── tests/                # Test files
│   └── unit/             # Unit tests
│       └── utils/        # Utility function tests
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── .github/workflows/    # GitHub Actions
```

## 🚀 Deployment

### GitHub Pages (Automated)

The project includes automated deployment to GitHub Pages:

1. **Configure repository name** in `nuxt.config.ts`:

   ```typescript
   app: {
     baseURL: '/pool-occupancy-dashboard-nuxt/', // Update this if needed for GitHub Pages
   }
   ```

2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

3. **Deploy automatically** on push to main:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

### Manual Deployment

For other hosting providers:

```bash
# Generate static files
npm run generate

# Upload .output/public/ directory to your hosting provider
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```bash
# Pool configuration URL
VITE_POOL_OCCUPANCY_CONFIG_URL=https://raw.githubusercontent.com/VitekHub/pool-occupancy-tracker/main/data/pool_occupancy_config.json

# Data source URL (for CSV and JSON files)
VITE_DATA_BASE_URL=https://raw.githubusercontent.com/VitekHub/pool-occupancy-tracker/main/data/
```

### Pool Configuration

Pool configuration is now loaded from an external URL. The configuration format is:

```json
{
  "name": "Pool Name",
  "url": "https://pool-website.com",
  "pattern": "regex_pattern_for_occupancy",
  "maximumCapacity": 135,
  "totalLanes": 6, // for pools with lanes
  "weekdaysOpeningHours": "6-22",
  "weekendOpeningHours": "8-21",
  "collectStats": true,
  "viewStats": true,
  "data": {
    "occupancy": {
      "raw": "output_filename.csv",
      "overall": "overall/output_filename.json",
      "weekly": "weekly/output_filename.json"
    },
    "capacity": {
      "raw": "capacity.csv",
      "forecast": "week_capacity.csv"
    }
  }
}
```

## 📊 Data Sources

Pool occupancy data is sourced from:

- Official pool websites with real-time occupancy
- CSV files and JSON aggregated files updated regularly via automated scraping
- Historical data spanning multiple weeks/months

Data format: Date, Day, Time, Occupancy count

## 🔧 Technology Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **UI Library**: Nuxt UI for consistent components
- **State Management**: Pinia for reactive state
- **Build Tool**: Vite for fast development
- **Deployment**: GitHub Actions + GitHub Pages
- **Data Processing**: Custom CSV parsing and analytics
- **Icons**: Heroicons via Nuxt Icon

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or issues:

- Open an issue on GitHub
- Check existing documentation
- Review configuration examples

---

**Live Demo**: [Pool Occupancy Dashboard](https://vitekhub.github.io/pool-occupancy-dashboard-nuxt/)
