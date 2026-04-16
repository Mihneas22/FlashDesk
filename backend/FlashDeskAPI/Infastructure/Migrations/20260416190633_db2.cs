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
            migrationBuilder.RenameColumn(
                name: "FlashCardId",
                table: "DeckEntity",
                newName: "DeckId");

            migrationBuilder.AddColumn<bool>(
                name: "Status",
                table: "DeckEntity",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string[]>(
                name: "Tips",
                table: "CardEntity",
                type: "text[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "DeckEntity");

            migrationBuilder.DropColumn(
                name: "Tips",
                table: "CardEntity");

            migrationBuilder.RenameColumn(
                name: "DeckId",
                table: "DeckEntity",
                newName: "FlashCardId");
        }
    }
}
