# Choco - Premium Chocolates Web App

A modern, responsive web application for a premium chocolate wholesale business built with React, TypeScript, and Vanilla CSS.

## Features

- **Modern Design**: Clean, professional layout with warm color palette
- **Responsive**: Fully responsive design that works on all devices
- **Interactive Components**: Hover effects, smooth transitions, and interactive elements
- **Product Showcase**: Beautiful product cards with images and pricing
- **Category Browsing**: Easy navigation through product categories
- **Newsletter Signup**: Email subscription with discount offer
- **Social Integration**: Social media links and app download buttons

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vanilla CSS** - Custom styling with CSS Grid and Flexbox
- **Responsive Design** - Mobile-first approach

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation header with logo and search
│   ├── Hero.tsx            # Hero section with main banner
│   ├── Categories.tsx      # Product categories section
│   ├── Products.tsx        # Product showcase grid
│   └── Footer.tsx          # Footer with links and newsletter
├── App.tsx                 # Main app component
├── index.tsx               # React entry point
├── index.css               # Global styles and CSS variables
└── App.css                 # App-specific styles
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Assets

The project includes the following asset folders:
- `/Assets/Category/` - Category images
- `/Assets/Products/` - Product images
- `/Assets/icons/` - UI icons and graphics
- `/Assets/header/` - Header banner images
- `/Assets/font/` - Custom fonts (Inter, Poppins)

## Design Features

### Color Palette
- **Primary Brown**: #8B4513 (Logo, accents)
- **Accent Pink**: #E91E63 (Buttons, highlights)
- **Dark Text**: #2C1810 (Headings)
- **Light Background**: #FDF6E3 (Hero, products)
- **Warm Beige**: #F5E6D3 (Footer)

### Typography
- **Headings**: Inter (Extra Bold, Semi Bold)
- **Body Text**: Poppins (Regular, Medium)

### Components

#### Header
- Logo with underline accent
- Navigation menu
- Search bar with icon
- Action icons (wishlist, cart, profile)

#### Hero Section
- Large typography with color accents
- Animated ingredient jars
- Scattered natural ingredients
- Carousel indicators

#### Categories
- Grid layout with hover effects
- Category images and names
- Navigation arrows

#### Products
- Product cards with images
- Action buttons (heart, eye icons)
- Product details and pricing
- Responsive grid layout

#### Footer
- Newsletter subscription
- Support information
- Account links
- Quick links
- App download section
- Social media icons
- QR code placeholder

## Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## Customization

### Colors
Update the CSS custom properties in `src/index.css` to change the color scheme.

### Fonts
Replace the Google Fonts imports in `src/index.css` with your preferred fonts.

### Content
Update the data arrays in each component to customize:
- Product information
- Category names
- Footer links
- Contact information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

### Code Style

The project follows:
- TypeScript strict mode
- ESLint configuration
- Prettier formatting (recommended)
- Component-based architecture
- CSS custom properties for theming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
