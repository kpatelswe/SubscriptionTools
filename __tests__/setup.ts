import dotenv from 'dotenv';

// Load test environment variables first
dotenv.config({ path: '.env.test' });

// Fall back to development env for DATABASE_URL if not set in test env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env' });
}

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite complete.');
});
