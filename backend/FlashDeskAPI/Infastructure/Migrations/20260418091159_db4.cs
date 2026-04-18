using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class db4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Elo",
                table: "UserEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "Roles",
                table: "UserEntity",
                type: "text[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Elo",
                table: "UserEntity");

            migrationBuilder.DropColumn(
                name: "Roles",
                table: "UserEntity");
        }
    }
}
