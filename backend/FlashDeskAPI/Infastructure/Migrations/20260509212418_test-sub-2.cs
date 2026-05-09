using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class testsub2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid[]>(
                name: "WrongAnswers",
                table: "TestSubmissionEntity",
                type: "uuid[]",
                nullable: true,
                oldClrType: typeof(int[]),
                oldType: "integer[]",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid[]>(
                name: "CorrectAnswers",
                table: "TestSubmissionEntity",
                type: "uuid[]",
                nullable: true,
                oldClrType: typeof(int[]),
                oldType: "integer[]",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int[]>(
                name: "WrongAnswers",
                table: "TestSubmissionEntity",
                type: "integer[]",
                nullable: true,
                oldClrType: typeof(Guid[]),
                oldType: "uuid[]",
                oldNullable: true);

            migrationBuilder.AlterColumn<int[]>(
                name: "CorrectAnswers",
                table: "TestSubmissionEntity",
                type: "integer[]",
                nullable: true,
                oldClrType: typeof(Guid[]),
                oldType: "uuid[]",
                oldNullable: true);
        }
    }
}
