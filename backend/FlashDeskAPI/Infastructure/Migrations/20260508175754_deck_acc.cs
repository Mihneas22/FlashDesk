using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class deck_acc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TestEntity",
                columns: table => new
                {
                    TestId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Topic = table.Column<string>(type: "text", nullable: true),
                    Time = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestEntity", x => x.TestId);
                });

            migrationBuilder.CreateTable(
                name: "UserEntity",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Password = table.Column<string>(type: "text", nullable: true),
                    Elo = table.Column<int>(type: "integer", nullable: true),
                    Roles = table.Column<string[]>(type: "text[]", nullable: true),
                    Plan = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEntity", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "TestQuestionEntity",
                columns: table => new
                {
                    TestQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: true),
                    PossibleAnswers = table.Column<string[]>(type: "text[]", nullable: true),
                    Explications = table.Column<string[]>(type: "text[]", nullable: true),
                    CorrectAnswerIndex = table.Column<int>(type: "integer", nullable: true),
                    Hints = table.Column<string[]>(type: "text[]", nullable: true),
                    Quest_TestId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestQuestionEntity", x => x.TestQuestionId);
                    table.ForeignKey(
                        name: "FK_TestQuestionEntity_TestEntity_Quest_TestId",
                        column: x => x.Quest_TestId,
                        principalTable: "TestEntity",
                        principalColumn: "TestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyStatsEntity",
                columns: table => new
                {
                    DailyStatsId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardsReview = table.Column<int>(type: "integer", nullable: true),
                    CardsMastered = table.Column<int>(type: "integer", nullable: true),
                    MinSpent = table.Column<int>(type: "integer", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyStatsEntity", x => x.DailyStatsId);
                    table.ForeignKey(
                        name: "FK_DailyStatsEntity_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeckEntity",
                columns: table => new
                {
                    DeckId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Topic = table.Column<string>(type: "text", nullable: true),
                    DeckUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false),
                    RolesAccess = table.Column<string[]>(type: "text[]", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeckEntity", x => x.DeckId);
                    table.ForeignKey(
                        name: "FK_DeckEntity_UserEntity_DeckUserId",
                        column: x => x.DeckUserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StreakEntity",
                columns: table => new
                {
                    StreakId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentStreak = table.Column<int>(type: "integer", nullable: true),
                    MaxStreak = table.Column<int>(type: "integer", nullable: true),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreakEntity", x => x.StreakId);
                    table.ForeignKey(
                        name: "FK_StreakEntity_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestSubmissionEntity",
                columns: table => new
                {
                    TestSubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: true),
                    WrongAnswers = table.Column<int>(type: "integer", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: true),
                    Subm_UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Subm_TestId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestSubmissionEntity", x => x.TestSubmissionId);
                    table.ForeignKey(
                        name: "FK_TestSubmissionEntity_TestEntity_Subm_TestId",
                        column: x => x.Subm_TestId,
                        principalTable: "TestEntity",
                        principalColumn: "TestId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TestSubmissionEntity_UserEntity_Subm_UserId",
                        column: x => x.Subm_UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CardEntity",
                columns: table => new
                {
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    Question = table.Column<string>(type: "text", nullable: true),
                    Answer = table.Column<string>(type: "text", nullable: true),
                    Tips = table.Column<string[]>(type: "text[]", nullable: true),
                    DeckId = table.Column<Guid>(type: "uuid", nullable: false),
                    ViewConfig = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardEntity", x => x.CardId);
                    table.ForeignKey(
                        name: "FK_CardEntity_DeckEntity_DeckId",
                        column: x => x.DeckId,
                        principalTable: "DeckEntity",
                        principalColumn: "DeckId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CardReviewEntity",
                columns: table => new
                {
                    CardReviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Rating = table.Column<string>(type: "text", nullable: true),
                    TimeSpent = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardReviewEntity", x => x.CardReviewId);
                    table.ForeignKey(
                        name: "FK_CardReviewEntity_CardEntity_CardId",
                        column: x => x.CardId,
                        principalTable: "CardEntity",
                        principalColumn: "CardId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CardReviewEntity_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCardStateEntity",
                columns: table => new
                {
                    UserCardStateId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    NextReview = table.Column<DateOnly>(type: "date", nullable: true),
                    IntervalDays = table.Column<float>(type: "real", nullable: true),
                    EaseFactor = table.Column<float>(type: "real", nullable: true),
                    MasteryLevel = table.Column<string>(type: "text", nullable: true),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCardStateEntity", x => x.UserCardStateId);
                    table.ForeignKey(
                        name: "FK_UserCardStateEntity_CardEntity_CardId",
                        column: x => x.CardId,
                        principalTable: "CardEntity",
                        principalColumn: "CardId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCardStateEntity_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CardEntity_DeckId",
                table: "CardEntity",
                column: "DeckId");

            migrationBuilder.CreateIndex(
                name: "IX_CardReviewEntity_CardId",
                table: "CardReviewEntity",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_CardReviewEntity_UserId",
                table: "CardReviewEntity",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyStatsEntity_UserId",
                table: "DailyStatsEntity",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeckEntity_DeckUserId",
                table: "DeckEntity",
                column: "DeckUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StreakEntity_UserId",
                table: "StreakEntity",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TestQuestionEntity_Quest_TestId",
                table: "TestQuestionEntity",
                column: "Quest_TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TestSubmissionEntity_Subm_TestId",
                table: "TestSubmissionEntity",
                column: "Subm_TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TestSubmissionEntity_Subm_UserId",
                table: "TestSubmissionEntity",
                column: "Subm_UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCardStateEntity_CardId",
                table: "UserCardStateEntity",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCardStateEntity_UserId",
                table: "UserCardStateEntity",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardReviewEntity");

            migrationBuilder.DropTable(
                name: "DailyStatsEntity");

            migrationBuilder.DropTable(
                name: "StreakEntity");

            migrationBuilder.DropTable(
                name: "TestQuestionEntity");

            migrationBuilder.DropTable(
                name: "TestSubmissionEntity");

            migrationBuilder.DropTable(
                name: "UserCardStateEntity");

            migrationBuilder.DropTable(
                name: "TestEntity");

            migrationBuilder.DropTable(
                name: "CardEntity");

            migrationBuilder.DropTable(
                name: "DeckEntity");

            migrationBuilder.DropTable(
                name: "UserEntity");
        }
    }
}
