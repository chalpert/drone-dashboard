import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.DATABASE_URL = 'file:./test.db'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:3003'
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'
