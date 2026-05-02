using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class user_stats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedDecks",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "HeatmapData",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "MasteredCards",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "TotalCards",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "TotalDecks",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "WeeklyGoalMet",
                table: "UserEntity");

            migrationBuilder.CreateTable(
                name: "CardReview",
                columns: table => new
                {
                    CardReviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: true),
                    TimeSpent = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardReview", x => x.CardReviewId);
                    table.ForeignKey(
                        name: "FK_CardReview_CardEntity_CardId",
                        column: x => x.CardId,
                        principalTable: "CardEntity",
                        principalColumn: "CardId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CardReview_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyStats",
                columns: table => new
                {
                    DailyStatsId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardsReview = table.Column<int>(type: "integer", nullable: true),
                    CardsMastered = table.Column<int>(type: "integer", nullable: true),
                    MinSpent = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyStats", x => x.DailyStatsId);
                    table.ForeignKey(
                        name: "FK_DailyStats_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CardReview_CardId",
                table: "CardReview",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_CardReview_UserId",
                table: "CardReview",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyStats_UserId",
                table: "DailyStats",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardReview");

            migrationBuilder.DropTable(
                name: "DailyStats");

            migrationBuilder.AddColumn<int>(
                name: "CompletedDecks",
                table: "UserEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeatmapData",
                table: "UserEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MasteredCards",
                table: "UserEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalCards",
                table: "UserEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalDecks",
                table: "UserEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WeeklyGoalMet",
                table: "UserEntity",
                type: "integer",
                nullable: true);
        }
    }
}
