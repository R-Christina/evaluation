using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNofificationAgainAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "senderName",
                table: "Notifications",
                newName: "SenderName");

            migrationBuilder.RenameColumn(
                name: "senderId",
                table: "Notifications",
                newName: "SenderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SenderName",
                table: "Notifications",
                newName: "senderName");

            migrationBuilder.RenameColumn(
                name: "SenderId",
                table: "Notifications",
                newName: "senderId");
        }
    }
}
