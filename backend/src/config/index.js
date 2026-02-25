import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // JWT (for custom auth if needed)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    starterPriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    businessPriceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
  },
  
  // Frontend URL (for CORS and redirects)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // PDF Generation
  pdf: {
    // Use Puppeteer locally or external service in production
    useExternalService: process.env.USE_EXTERNAL_PDF_SERVICE === 'true',
    externalApiKey: process.env.DPDF_API_KEY || '',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  },
};

// Validate required config
export function validateConfig() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
}