CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "TestEntity" (
    "TestId" uuid NOT NULL,
    "Title" text,
    "Description" text,
    "Topic" text,
    "Time" integer,
    "CreatedAt" timestamp with time zone,
    CONSTRAINT "PK_TestEntity" PRIMARY KEY ("TestId")
);

CREATE TABLE "UserEntity" (
    "UserId" uuid NOT NULL,
    "Username" text,
    "Email" text,
    "Password" text,
    "Elo" integer,
    "Roles" text[],
    "Plan" text,
    "CreatedAt" timestamp with time zone,
    CONSTRAINT "PK_UserEntity" PRIMARY KEY ("UserId")
);

CREATE TABLE "TestQuestionEntity" (
    "TestQuestionId" uuid NOT NULL,
    "QuestionText" text,
    "PossibleAnswers" text[],
    "Explications" text[],
    "CorrectAnswerIndex" integer,
    "Hints" text[],
    "Quest_TestId" uuid NOT NULL,
    CONSTRAINT "PK_TestQuestionEntity" PRIMARY KEY ("TestQuestionId"),
    CONSTRAINT "FK_TestQuestionEntity_TestEntity_Quest_TestId" FOREIGN KEY ("Quest_TestId") REFERENCES "TestEntity" ("TestId") ON DELETE CASCADE
);

CREATE TABLE "DailyStatsEntity" (
    "DailyStatsId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CardsReview" integer,
    "CardsMastered" integer,
    "MinSpent" integer,
    "Date" date NOT NULL,
    CONSTRAINT "PK_DailyStatsEntity" PRIMARY KEY ("DailyStatsId"),
    CONSTRAINT "FK_DailyStatsEntity_UserEntity_UserId" FOREIGN KEY ("UserId") REFERENCES "UserEntity" ("UserId") ON DELETE CASCADE
);

CREATE TABLE "DeckEntity" (
    "DeckId" uuid NOT NULL,
    "Title" text,
    "Description" text,
    "Topic" text,
    "DeckUserId" uuid,
    "Status" boolean NOT NULL,
    "RolesAccess" text[],
    "CreatedAt" timestamp with time zone,
    CONSTRAINT "PK_DeckEntity" PRIMARY KEY ("DeckId"),
    CONSTRAINT "FK_DeckEntity_UserEntity_DeckUserId" FOREIGN KEY ("DeckUserId") REFERENCES "UserEntity" ("UserId") ON DELETE SET NULL
);

CREATE TABLE "StreakEntity" (
    "StreakId" uuid NOT NULL,
    "CurrentStreak" integer,
    "MaxStreak" integer,
    "LastActivityDate" timestamp with time zone,
    "UserId" uuid NOT NULL,
    CONSTRAINT "PK_StreakEntity" PRIMARY KEY ("StreakId"),
    CONSTRAINT "FK_StreakEntity_UserEntity_UserId" FOREIGN KEY ("UserId") REFERENCES "UserEntity" ("UserId") ON DELETE CASCADE
);

CREATE TABLE "TestSubmissionEntity" (
    "TestSubmissionId" uuid NOT NULL,
    "CorrectAnswers" integer,
    "WrongAnswers" integer,
    "Points" integer,
    "Subm_UserId" uuid NOT NULL,
    "Subm_TestId" uuid NOT NULL,
    CONSTRAINT "PK_TestSubmissionEntity" PRIMARY KEY ("TestSubmissionId"),
    CONSTRAINT "FK_TestSubmissionEntity_TestEntity_Subm_TestId" FOREIGN KEY ("Subm_TestId") REFERENCES "TestEntity" ("TestId") ON DELETE CASCADE,
    CONSTRAINT "FK_TestSubmissionEntity_UserEntity_Subm_UserId" FOREIGN KEY ("Subm_UserId") REFERENCES "UserEntity" ("UserId") ON DELETE CASCADE
);

CREATE TABLE "CardEntity" (
    "CardId" uuid NOT NULL,
    "Question" text,
    "Answer" text,
    "Tips" text[],
    "DeckId" uuid NOT NULL,
    "ViewConfig" jsonb,
    "CreatedAt" timestamp with time zone,
    CONSTRAINT "PK_CardEntity" PRIMARY KEY ("CardId"),
    CONSTRAINT "FK_CardEntity_DeckEntity_DeckId" FOREIGN KEY ("DeckId") REFERENCES "DeckEntity" ("DeckId") ON DELETE CASCADE
);

CREATE TABLE "CardReviewEntity" (
    "CardReviewId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CardId" uuid NOT NULL,
    "ReviewAt" timestamp with time zone,
    "Rating" text,
    "TimeSpent" integer,
    CONSTRAINT "PK_CardReviewEntity" PRIMARY KEY ("CardReviewId"),
    CONSTRAINT "FK_CardReviewEntity_CardEntity_CardId" FOREIGN KEY ("CardId") REFERENCES "CardEntity" ("CardId") ON DELETE CASCADE,
    CONSTRAINT "FK_CardReviewEntity_UserEntity_UserId" FOREIGN KEY ("UserId") REFERENCES "UserEntity" ("UserId") ON DELETE CASCADE
);

CREATE TABLE "UserCardStateEntity" (
    "UserCardStateId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CardId" uuid NOT NULL,
    "NextReview" date,
    "IntervalDays" real,
    "EaseFactor" real,
    "MasteryLevel" text,
    "ReviewCount" integer NOT NULL,
    CONSTRAINT "PK_UserCardStateEntity" PRIMARY KEY ("UserCardStateId"),
    CONSTRAINT "FK_UserCardStateEntity_CardEntity_CardId" FOREIGN KEY ("CardId") REFERENCES "CardEntity" ("CardId") ON DELETE CASCADE,
    CONSTRAINT "FK_UserCardStateEntity_UserEntity_UserId" FOREIGN KEY ("UserId") REFERENCES "UserEntity" ("UserId") ON DELETE CASCADE
);

CREATE INDEX "IX_CardEntity_DeckId" ON "CardEntity" ("DeckId");

CREATE INDEX "IX_CardReviewEntity_CardId" ON "CardReviewEntity" ("CardId");

CREATE INDEX "IX_CardReviewEntity_UserId" ON "CardReviewEntity" ("UserId");

CREATE INDEX "IX_DailyStatsEntity_UserId" ON "DailyStatsEntity" ("UserId");

CREATE INDEX "IX_DeckEntity_DeckUserId" ON "DeckEntity" ("DeckUserId");

CREATE UNIQUE INDEX "IX_StreakEntity_UserId" ON "StreakEntity" ("UserId");

CREATE INDEX "IX_TestQuestionEntity_Quest_TestId" ON "TestQuestionEntity" ("Quest_TestId");

CREATE INDEX "IX_TestSubmissionEntity_Subm_TestId" ON "TestSubmissionEntity" ("Subm_TestId");

CREATE INDEX "IX_TestSubmissionEntity_Subm_UserId" ON "TestSubmissionEntity" ("Subm_UserId");

CREATE INDEX "IX_UserCardStateEntity_CardId" ON "UserCardStateEntity" ("CardId");

CREATE INDEX "IX_UserCardStateEntity_UserId" ON "UserCardStateEntity" ("UserId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260508175754_deck_acc', '10.0.7');

COMMIT;

START TRANSACTION;
ALTER TABLE "CardEntity" ADD "MatrixConfig" jsonb;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260509080148_AddMatrixTr', '10.0.7');

COMMIT;

