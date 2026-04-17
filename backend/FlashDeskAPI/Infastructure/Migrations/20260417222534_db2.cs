using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class db2 : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TestQuestionEntity");

            migrationBuilder.DropTable(
                name: "TestSubmissionEntity");

            migrationBuilder.DropTable(
                name: "TestEntity");
        }
    }
}
