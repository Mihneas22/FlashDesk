using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class user_stats_new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "DailyStats",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AlterColumn<string>(
                name: "Rating",
                table: "CardReview",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "UserCardState",
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
                    table.PrimaryKey("PK_UserCardState", x => x.UserCardStateId);
                    table.ForeignKey(
                        name: "FK_UserCardState_CardEntity_CardId",
                        column: x => x.CardId,
                        principalTable: "CardEntity",
                        principalColumn: "CardId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCardState_UserEntity_UserId",
                        column: x => x.UserId,
                        principalTable: "UserEntity",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCardState_CardId",
                table: "UserCardState",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCardState_UserId",
                table: "UserCardState",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCardState");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "DailyStats");

            migrationBuilder.AlterColumn<int>(
                name: "Rating",
                table: "CardReview",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
