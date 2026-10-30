-- Record the table already present in the Neon database so migration history
-- matches the existing schema. On a new database, this migration creates it.
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);
