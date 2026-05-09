using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class test_migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int[]>(
                name: "WrongAnswers",
                table: "TestSubmissionEntity",
                type: "integer[]",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int[]>(
                name: "CorrectAnswers",
                table: "TestSubmissionEntity",
                type: "integer[]",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "TestSubmissionEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "TestSubmissionEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatrixConfig",
                table: "TestQuestionEntity",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "TestQuestionEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ViewConfig",
                table: "TestQuestionEntity",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "TestSubmissionEntity");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "TestSubmissionEntity");

            migrationBuilder.DropColumn(
                name: "MatrixConfig",
                table: "TestQuestionEntity");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "TestQuestionEntity");

            migrationBuilder.DropColumn(
                name: "ViewConfig",
                table: "TestQuestionEntity");

            migrationBuilder.AlterColumn<int>(
                name: "WrongAnswers",
                table: "TestSubmissionEntity",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int[]),
                oldType: "integer[]",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CorrectAnswers",
                table: "TestSubmissionEntity",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int[]),
                oldType: "integer[]",
                oldNullable: true);
        }
    }
}
