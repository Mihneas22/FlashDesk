using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class db1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardEntity_DeckEntity_CardId",
                table: "CardEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckEntity_UserEntity_DeckUserId",
                table: "DeckEntity");

            migrationBuilder.CreateIndex(
                name: "IX_CardEntity_DeckId",
                table: "CardEntity",
                column: "DeckId");

            migrationBuilder.AddForeignKey(
                name: "FK_CardEntity_DeckEntity_DeckId",
                table: "CardEntity",
                column: "DeckId",
                principalTable: "DeckEntity",
                principalColumn: "DeckId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckEntity_UserEntity_DeckUserId",
                table: "DeckEntity",
                column: "DeckUserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardEntity_DeckEntity_DeckId",
                table: "CardEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckEntity_UserEntity_DeckUserId",
                table: "DeckEntity");

            migrationBuilder.DropIndex(
                name: "IX_CardEntity_DeckId",
                table: "CardEntity");

            migrationBuilder.AddForeignKey(
                name: "FK_CardEntity_DeckEntity_CardId",
                table: "CardEntity",
                column: "CardId",
                principalTable: "DeckEntity",
                principalColumn: "DeckId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckEntity_UserEntity_DeckUserId",
                table: "DeckEntity",
                column: "DeckUserId",
                principalTable: "UserEntity",
                principalColumn: "UserId");
        }
    }
}
