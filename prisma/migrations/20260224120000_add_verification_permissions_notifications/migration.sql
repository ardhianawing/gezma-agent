-- Add verificationCode to pilgrims
ALTER TABLE "pilgrims" ADD COLUMN "verificationCode" TEXT UNIQUE;

-- Add permissions JSON to users
ALTER TABLE "users" ADD COLUMN "permissions" JSONB;

-- Create notification_preferences table
CREATE TABLE "notification_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "preferences" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_preferences_userId_key" UNIQUE ("userId"),
  CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
