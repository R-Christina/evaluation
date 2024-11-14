using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class HistoryNonCadre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HistoryUserCompetenceFOs",
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
                    table.PrimaryKey("PK_HistoryUserCompetenceFOs", x => x.HistoryUserCompetenceId);
                    table.ForeignKey(
                        name: "FK_HistoryUserCompetenceFOs_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoryUserIndicatorFOs",
                columns: table => new
                {
                    HistoryUserIndicatorFOId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ResultText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Result = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryUserIndicatorFOs", x => x.HistoryUserIndicatorFOId);
                    table.ForeignKey(
                        name: "FK_HistoryUserIndicatorFOs_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCompetences",
                columns: table => new
                {
                    UserCompetenceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    CompetenceId = table.Column<int>(type: "int", nullable: false),
                    Performance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompetences", x => x.UserCompetenceId);
                    table.ForeignKey(
                        name: "FK_UserCompetences_Competences_CompetenceId",
                        column: x => x.CompetenceId,
                        principalTable: "Competences",
                        principalColumn: "CompetenceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCompetences_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoryUserCompetenceFOs_UserEvalId",
                table: "HistoryUserCompetenceFOs",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryUserIndicatorFOs_UserEvalId",
                table: "HistoryUserIndicatorFOs",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetences_CompetenceId",
                table: "UserCompetences",
                column: "CompetenceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetences_UserEvalId",
                table: "UserCompetences",
                column: "UserEvalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoryUserCompetenceFOs");

            migrationBuilder.DropTable(
                name: "HistoryUserIndicatorFOs");

            migrationBuilder.DropTable(
                name: "UserCompetences");
        }
    }
}
