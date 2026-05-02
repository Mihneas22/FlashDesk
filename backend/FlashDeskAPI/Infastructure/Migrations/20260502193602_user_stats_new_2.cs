using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infastructure.Migrations
{
    /// <inheritdoc />
    public partial class user_stats_new_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardReview_CardEntity_CardId",
                table: "CardReview");

            migrationBuilder.DropForeignKey(
                name: "FK_CardReview_UserEntity_UserId",
                table: "CardReview");

            migrationBuilder.DropForeignKey(
                name: "FK_DailyStats_UserEntity_UserId",
                table: "DailyStats");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCardState_CardEntity_CardId",
                table: "UserCardState");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCardState_UserEntity_UserId",
                table: "UserCardState");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserCardState",
                table: "UserCardState");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailyStats",
                table: "DailyStats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CardReview",
                table: "CardReview");

            migrationBuilder.RenameTable(
                name: "UserCardState",
                newName: "UserCardStateEntity");

            migrationBuilder.RenameTable(
                name: "DailyStats",
                newName: "DailyStatsEntity");

            migrationBuilder.RenameTable(
                name: "CardReview",
                newName: "CardReviewEntity");

            migrationBuilder.RenameIndex(
                name: "IX_UserCardState_UserId",
                table: "UserCardStateEntity",
                newName: "IX_UserCardStateEntity_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserCardState_CardId",
                table: "UserCardStateEntity",
                newName: "IX_UserCardStateEntity_CardId");

            migrationBuilder.RenameIndex(
                name: "IX_DailyStats_UserId",
                table: "DailyStatsEntity",
                newName: "IX_DailyStatsEntity_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CardReview_UserId",
                table: "CardReviewEntity",
                newName: "IX_CardReviewEntity_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CardReview_CardId",
                table: "CardReviewEntity",
                newName: "IX_CardReviewEntity_CardId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserCardStateEntity",
                table: "UserCardStateEntity",
                column: "UserCardStateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailyStatsEntity",
                table: "DailyStatsEntity",
                column: "DailyStatsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardReviewEntity",
                table: "CardReviewEntity",
                column: "CardReviewId");

            migrationBuilder.AddForeignKey(
                name: "FK_CardReviewEntity_CardEntity_CardId",
                table: "CardReviewEntity",
                column: "CardId",
                principalTable: "CardEntity",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CardReviewEntity_UserEntity_UserId",
                table: "CardReviewEntity",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DailyStatsEntity_UserEntity_UserId",
                table: "DailyStatsEntity",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCardStateEntity_CardEntity_CardId",
                table: "UserCardStateEntity",
                column: "CardId",
                principalTable: "CardEntity",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCardStateEntity_UserEntity_UserId",
                table: "UserCardStateEntity",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardReviewEntity_CardEntity_CardId",
                table: "CardReviewEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_CardReviewEntity_UserEntity_UserId",
                table: "CardReviewEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_DailyStatsEntity_UserEntity_UserId",
                table: "DailyStatsEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCardStateEntity_CardEntity_CardId",
                table: "UserCardStateEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCardStateEntity_UserEntity_UserId",
                table: "UserCardStateEntity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserCardStateEntity",
                table: "UserCardStateEntity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailyStatsEntity",
                table: "DailyStatsEntity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CardReviewEntity",
                table: "CardReviewEntity");

            migrationBuilder.RenameTable(
                name: "UserCardStateEntity",
                newName: "UserCardState");

            migrationBuilder.RenameTable(
                name: "DailyStatsEntity",
                newName: "DailyStats");

            migrationBuilder.RenameTable(
                name: "CardReviewEntity",
                newName: "CardReview");

            migrationBuilder.RenameIndex(
                name: "IX_UserCardStateEntity_UserId",
                table: "UserCardState",
                newName: "IX_UserCardState_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserCardStateEntity_CardId",
                table: "UserCardState",
                newName: "IX_UserCardState_CardId");

            migrationBuilder.RenameIndex(
                name: "IX_DailyStatsEntity_UserId",
                table: "DailyStats",
                newName: "IX_DailyStats_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CardReviewEntity_UserId",
                table: "CardReview",
                newName: "IX_CardReview_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CardReviewEntity_CardId",
                table: "CardReview",
                newName: "IX_CardReview_CardId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserCardState",
                table: "UserCardState",
                column: "UserCardStateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailyStats",
                table: "DailyStats",
                column: "DailyStatsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardReview",
                table: "CardReview",
                column: "CardReviewId");

            migrationBuilder.AddForeignKey(
                name: "FK_CardReview_CardEntity_CardId",
                table: "CardReview",
                column: "CardId",
                principalTable: "CardEntity",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CardReview_UserEntity_UserId",
                table: "CardReview",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DailyStats_UserEntity_UserId",
                table: "DailyStats",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCardState_CardEntity_CardId",
                table: "UserCardState",
                column: "CardId",
                principalTable: "CardEntity",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCardState_UserEntity_UserId",
                table: "UserCardState",
                column: "UserId",
                principalTable: "UserEntity",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
