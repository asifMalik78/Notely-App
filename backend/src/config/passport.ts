/**
 * Passport.js Configuration
 * OAuth strategies for Google and GitHub
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { env } from './env.js';

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
}

// Find or create user from OAuth profile
async function findOrCreateUser(profile: OAuthProfile) {
  console.log('[OAuth] Finding or creating user:', profile.email);

  // First check if user exists with this provider + providerId
  let user = await db.query.users.findFirst({
    where: and(eq(users.provider, profile.provider), eq(users.providerId, profile.id)),
  });

  if (user) {
    console.log('[OAuth] Found existing user by provider:', user.id);
    return user;
  }

  // Check if user exists with same email (could be registered via email/password)
  user = await db.query.users.findFirst({
    where: eq(users.email, profile.email),
  });

  if (user) {
    console.log('[OAuth] Found existing user by email, updating OAuth info:', user.id);
    // Update existing user with OAuth provider info
    await db
      .update(users)
      .set({
        provider: profile.provider,
        providerId: profile.id,
        avatarUrl: user.avatarUrl || profile.avatarUrl,
      })
      .where(eq(users.id, user.id));

    return {
      ...user,
      provider: profile.provider,
      providerId: profile.id,
      avatarUrl: user.avatarUrl || profile.avatarUrl,
    };
  }

  // Create new user
  console.log('[OAuth] Creating new user:', profile.email);
  const userId = uuidv4();
  await db.insert(users).values({
    id: userId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl || null,
    provider: profile.provider,
    providerId: profile.id,
    password: null,
  });

  console.log('[OAuth] User created successfully:', userId);

  return {
    id: userId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl || null,
    provider: profile.provider,
    providerId: profile.id,
    dob: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log('[Google OAuth] Received profile:', profile.id);
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('[Google OAuth] No email found in profile');
          return done(new Error('No email found in Google profile'), undefined);
        }

        const oauthProfile: OAuthProfile = {
          id: profile.id,
          email,
          name: profile.displayName || email.split('@')[0],
          avatarUrl: profile.photos?.[0]?.value,
          provider: 'google',
        };

        const user = await findOrCreateUser(oauthProfile);
        console.log('[Google OAuth] User authenticated:', user.id);
        done(null, user);
      } catch (error) {
        console.error('[Google OAuth] Error:', error);
        done(error as Error, undefined);
      }
    }
  )
);

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID || 'not-configured',
      clientSecret: env.GITHUB_CLIENT_SECRET || 'not-configured',
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: {
        id: string;
        username?: string;
        displayName?: string;
        emails?: { value: string }[];
        photos?: { value: string }[];
      },
      done: (error: Error | null, user?: Record<string, unknown>) => void
    ) => {
      try {
        console.log('[GitHub OAuth] Received profile:', profile.id);
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

        const oauthProfile: OAuthProfile = {
          id: profile.id,
          email,
          name: profile.displayName || profile.username || email.split('@')[0],
          avatarUrl: profile.photos?.[0]?.value,
          provider: 'github',
        };

        const user = await findOrCreateUser(oauthProfile);
        console.log('[GitHub OAuth] User authenticated:', user.id);
        done(null, user);
      } catch (error) {
        console.error('[GitHub OAuth] Error:', error);
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
