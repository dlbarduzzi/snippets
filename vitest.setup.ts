/* eslint-disable node/no-process-env */
process.env.LOG_LEVEL = "silent"
process.env.APP_URL = "http://localhost:3000"
process.env.APP_PORT = "3000"
process.env.IS_LOG_STACK_ALLOWED = "false"
process.env.DATABASE_URL = "postgresql://test_user:test_pass@localhost:5432/test_db"
process.env.SNIPPETS_SECRET = "testSnippetsSecret123456789"
process.env.RESEND_API_KEY = "testResendSecret123456789"
process.env.APP_EMAIL_ONBOARDING = "onboarding@company.com"
process.env.ALLOW_UNVERIFIED_EMAIL = "true"
/* eslint-enable node/no-process-env */
