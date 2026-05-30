const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const appDir = path.join(srcDir, 'app');

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

const mapRoute = (name) => {
  const map = {
    'Login.jsx': 'login',
    'Register.jsx': 'register',
    'Detector.jsx': 'dashboard',
    'Result.jsx': 'result',
    'Report.jsx': 'report',
    'Subscription.jsx': 'subscription',
    'Payment.jsx': 'payment'
  };
  return map[name];
};

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const routeName = mapRoute(file);
    if (!routeName) return;

    const routeDir = path.join(appDir, routeName);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

    // Make it a client component
    content = '"use client";\n\n' + content;

    // React Router DOM to Next Navigation
    content = content.replace(/import \{.*useNavigate.*\} from 'react-router-dom';/g, "import { useRouter } from 'next/navigation';");
    content = content.replace(/import \{.*useLocation,.*useNavigate.*\} from 'react-router-dom';/g, "import { useRouter, useSearchParams } from 'next/navigation';");
    
    // Replace useNavigate hook
    content = content.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");

    // Replace typical navigate calls
    content = content.replace(/navigate\(-1\)/g, "router.back()");
    content = content.replace(/navigate\('([^']+)'\)/g, "router.push('$1')");
    
    // Subscription to Payment state passing fix
    if (file === 'Subscription.jsx') {
      content = content.replace(/navigate\('\/payment', \{ state: \{ plan \} \}\)/g, "router.push(`/payment?planName=${encodeURIComponent(plan.name)}&planPrice=${encodeURIComponent(plan.price)}`)");
    }

    // Payment receive state fix
    if (file === 'Payment.jsx') {
      content = content.replace("const location = useLocation();", "const searchParams = useSearchParams();");
      content = content.replace("const plan = location.state?.plan || { name: 'Monthly Plan', price: '$20' };", "const plan = { name: searchParams.get('planName') || 'Monthly Plan', price: searchParams.get('planPrice') || '$20' };");
    }
    
    // Handle image and CSS imports if they use Vite-specific routes, which they don't here mostly.

    fs.writeFileSync(path.join(routeDir, 'page.jsx'), content);
  }
});

// Update Navbar
const navbarPath = path.join(srcDir, 'components', 'Navbar.jsx');
if (fs.existsSync(navbarPath)) {
  let navContent = fs.readFileSync(navbarPath, 'utf8');
  navContent = '"use client";\n\n' + navContent;
  navContent = navContent.replace(/import \{.*useNavigate.*\} from 'react-router-dom';/g, "import { useRouter } from 'next/navigation';");
  navContent = navContent.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");
  navContent = navContent.replace(/navigate\(-1\)/g, "router.back()");
  navContent = navContent.replace(/navigate\('([^']+)'\)/g, "router.push('$1')");
  fs.writeFileSync(navbarPath, navContent);
}

// Create layout.jsx
const layoutContent = `import '../index.css';

export const metadata = {
  title: 'TruthLens | AI Content & Misinformation Detector',
  description: 'AI detection software',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-bg-grey text-gray-800">
        {children}
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(appDir, 'layout.jsx'), layoutContent);

// Create root page.jsx (redirect to login)
const rootPageContent = `import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
`;
fs.writeFileSync(path.join(appDir, 'page.jsx'), rootPageContent);

console.log("Refactoring absolute completed.");
