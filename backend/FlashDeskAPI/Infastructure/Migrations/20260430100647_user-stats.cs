using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class userstats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
