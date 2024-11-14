using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserIndicatorResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Result",
                table: "UserIndicatorResults",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "HistoryUserCompetenceMPs",
                columns: table => new
                {
                    HistoryUserCompetenceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    CompetenceName = table.Column<int>(type: "int", nullable: false),
                    Performance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryUserCompetenceMPs", x => x.HistoryUserCompetenceId);
                    table.ForeignKey(
                        name: "FK_HistoryUserCompetenceMPs_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoryUserIndicatorMPs",
                columns: table => new
                {
                    HistoryUserIndicatorMPId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ResultText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Result = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryUserIndicatorMPs", x => x.HistoryUserIndicatorMPId);
                    table.ForeignKey(
                        name: "FK_HistoryUserIndicatorMPs_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoryUserCompetenceMPs_UserEvalId",
                table: "HistoryUserCompetenceMPs",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryUserIndicatorMPs_UserEvalId",
                table: "HistoryUserIndicatorMPs",
                column: "UserEvalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoryUserCompetenceMPs");

            migrationBuilder.DropTable(
                name: "HistoryUserIndicatorMPs");

            migrationBuilder.AlterColumn<int>(
                name: "Result",
                table: "UserIndicatorResults",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }
    }
}
