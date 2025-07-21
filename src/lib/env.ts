import { z } from 'zod';

export const validStringSchema = z.string().trim().min(1);

const envSchema = z.object({
  NEXT_PUBLIC_URL: validStringSchema.optional(),
  NEXT_PUBLIC_BACKEND_URL: validStringSchema.optional(),
  NEXT_PUBLIC_OWNER_BEARER_TOKEN: validStringSchema.optional()
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  let { data, error } = envSchema.safeParse({
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_OWNER_BEARER_TOKEN: process.env.NEXT_PUBLIC_OWNER_BEARER_TOKEN
  });

  const runningOnCi = process.env.CI === 'true';
  const runningOnVercel = process.env.VERCEL === '1';

  if (runningOnCi || runningOnVercel) {
    data = process.env as unknown as EnvSchema;
  }

  const shouldThrowError = error && !runningOnCi && !runningOnVercel;

  if (shouldThrowError) {
    console.warn(`Environment validation warning: ${error.message}`);
    // Don't throw error, just use defaults
    data = {
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://localhost:3000',
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3000',
      NEXT_PUBLIC_OWNER_BEARER_TOKEN: process.env.NEXT_PUBLIC_OWNER_BEARER_TOKEN || 'default-token'
    };
  }

  return data as EnvSchema;
}

export const frontendEnv = validateEnv();

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
