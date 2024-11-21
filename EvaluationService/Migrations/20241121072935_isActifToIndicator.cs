using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class isActifToIndicator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Indicators",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Indicators");
        }
    }
}
