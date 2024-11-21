using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class ValidateBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValidatedBy",
                table: "HistoryObjectiveColumnValuesMps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ValidatedBy",
                table: "HistoryObjectiveColumnValuesFos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ValidatedBy",
                table: "HistoryCMps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidatedBy",
                table: "HistoryObjectiveColumnValuesMps");

            migrationBuilder.DropColumn(
                name: "ValidatedBy",
                table: "HistoryObjectiveColumnValuesFos");

            migrationBuilder.DropColumn(
                name: "ValidatedBy",
                table: "HistoryCMps");
        }
    }
}
