using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class HistoryHelp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "UserHelpContents");

            migrationBuilder.AddColumn<string>(
                name: "WriterUserId",
                table: "UserHelpContents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "AllowedUserLevel",
                table: "Helps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Helps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "Helps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "HistoryUserHelpContents",
                columns: table => new
                {
                    HistoryContentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HelpId = table.Column<int>(type: "int", nullable: false),
                    HelpName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentId = table.Column<int>(type: "int", nullable: false),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    WriterUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryUserHelpContents", x => x.HistoryContentId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Helps_TemplateId",
                table: "Helps",
                column: "TemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Helps_FormTemplates_TemplateId",
                table: "Helps",
                column: "TemplateId",
                principalTable: "FormTemplates",
                principalColumn: "TemplateId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Helps_FormTemplates_TemplateId",
                table: "Helps");

            migrationBuilder.DropTable(
                name: "HistoryUserHelpContents");

            migrationBuilder.DropIndex(
                name: "IX_Helps_TemplateId",
                table: "Helps");

            migrationBuilder.DropColumn(
                name: "WriterUserId",
                table: "UserHelpContents");

            migrationBuilder.DropColumn(
                name: "AllowedUserLevel",
                table: "Helps");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Helps");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Helps");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "UserHelpContents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
