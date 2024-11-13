using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvaluationService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Etats",
                columns: table => new
                {
                    EtatId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EtatDesignation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Etats", x => x.EtatId);
                });

            migrationBuilder.CreateTable(
                name: "FormTemplates",
                columns: table => new
                {
                    TemplateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormTemplates", x => x.TemplateId);
                });

            migrationBuilder.CreateTable(
                name: "Helps",
                columns: table => new
                {
                    HelpId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Helps", x => x.HelpId);
                });

            migrationBuilder.CreateTable(
                name: "Levels",
                columns: table => new
                {
                    LevelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LevelName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Levels", x => x.LevelId);
                });

            migrationBuilder.CreateTable(
                name: "ObjectiveColumns",
                columns: table => new
                {
                    ColumnId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectiveColumns", x => x.ColumnId);
                });

            migrationBuilder.CreateTable(
                name: "Competences",
                columns: table => new
                {
                    CompetenceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competences", x => x.CompetenceId);
                    table.ForeignKey(
                        name: "FK_Competences_FormTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evaluations",
                columns: table => new
                {
                    EvalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvalAnnee = table.Column<int>(type: "int", nullable: false),
                    FixationObjectif = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MiParcours = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Final = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EtatId = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: false),
                    Titre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.EvalId);
                    table.ForeignKey(
                        name: "FK_Evaluations_Etats_EtatId",
                        column: x => x.EtatId,
                        principalTable: "Etats",
                        principalColumn: "EtatId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Evaluations_FormTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Indicators",
                columns: table => new
                {
                    IndicatorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxResults = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Indicators", x => x.IndicatorId);
                    table.ForeignKey(
                        name: "FK_Indicators_FormTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateStrategicPriorities",
                columns: table => new
                {
                    TemplatePriorityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MaxObjectives = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateStrategicPriorities", x => x.TemplatePriorityId);
                    table.ForeignKey(
                        name: "FK_TemplateStrategicPriorities_FormTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetenceLevels",
                columns: table => new
                {
                    CompetenceLevelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetenceId = table.Column<int>(type: "int", nullable: false),
                    LevelId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetenceLevels", x => x.CompetenceLevelId);
                    table.ForeignKey(
                        name: "FK_CompetenceLevels_Competences_CompetenceId",
                        column: x => x.CompetenceId,
                        principalTable: "Competences",
                        principalColumn: "CompetenceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetenceLevels_Levels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "Levels",
                        principalColumn: "LevelId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluations",
                columns: table => new
                {
                    UserEvalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvalId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluations", x => x.UserEvalId);
                    table.ForeignKey(
                        name: "FK_UserEvaluations_Evaluations_EvalId",
                        column: x => x.EvalId,
                        principalTable: "Evaluations",
                        principalColumn: "EvalId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistoryCFos",
                columns: table => new
                {
                    HcfId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    PriorityName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Weighting = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryCFos", x => x.HcfId);
                    table.ForeignKey(
                        name: "FK_HistoryCFos_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoryCMps",
                columns: table => new
                {
                    HcmId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    PriorityName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Weighting = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ResultIndicator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Result = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryCMps", x => x.HcmId);
                    table.ForeignKey(
                        name: "FK_HistoryCMps_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserHelpContents",
                columns: table => new
                {
                    ContentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    HelpId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHelpContents", x => x.ContentId);
                    table.ForeignKey(
                        name: "FK_UserHelpContents_Helps_HelpId",
                        column: x => x.HelpId,
                        principalTable: "Helps",
                        principalColumn: "HelpId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserHelpContents_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserIndicators",
                columns: table => new
                {
                    UserIndicatorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    AttainmentPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IndicatorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserIndicators", x => x.UserIndicatorId);
                    table.ForeignKey(
                        name: "FK_UserIndicators_Indicators_IndicatorId",
                        column: x => x.IndicatorId,
                        principalTable: "Indicators",
                        principalColumn: "IndicatorId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserIndicators_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserObjectives",
                columns: table => new
                {
                    ObjectiveId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Weighting = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ResultIndicator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Result = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UserEvalId = table.Column<int>(type: "int", nullable: false),
                    PriorityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserObjectives", x => x.ObjectiveId);
                    table.ForeignKey(
                        name: "FK_UserObjectives_TemplateStrategicPriorities_PriorityId",
                        column: x => x.PriorityId,
                        principalTable: "TemplateStrategicPriorities",
                        principalColumn: "TemplatePriorityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserObjectives_UserEvaluations_UserEvalId",
                        column: x => x.UserEvalId,
                        principalTable: "UserEvaluations",
                        principalColumn: "UserEvalId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistoryObjectiveColumnValuesFos",
                columns: table => new
                {
                    HistValueId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HcfId = table.Column<int>(type: "int", nullable: false),
                    ColumnName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryObjectiveColumnValuesFos", x => x.HistValueId);
                    table.ForeignKey(
                        name: "FK_HistoryObjectiveColumnValuesFos_HistoryCFos_HcfId",
                        column: x => x.HcfId,
                        principalTable: "HistoryCFos",
                        principalColumn: "HcfId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoryObjectiveColumnValuesMps",
                columns: table => new
                {
                    HistValueId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HcmId = table.Column<int>(type: "int", nullable: false),
                    ColumnName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryObjectiveColumnValuesMps", x => x.HistValueId);
                    table.ForeignKey(
                        name: "FK_HistoryObjectiveColumnValuesMps_HistoryCMps_HcmId",
                        column: x => x.HcmId,
                        principalTable: "HistoryCMps",
                        principalColumn: "HcmId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserIndicatorResults",
                columns: table => new
                {
                    ResultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserIndicatorId = table.Column<int>(type: "int", nullable: false),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    ResultText = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserIndicatorResults", x => x.ResultId);
                    table.ForeignKey(
                        name: "FK_UserIndicatorResults_UserIndicators_UserIndicatorId",
                        column: x => x.UserIndicatorId,
                        principalTable: "UserIndicators",
                        principalColumn: "UserIndicatorId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ObjectiveColumnValues",
                columns: table => new
                {
                    ValueId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ObjectiveId = table.Column<int>(type: "int", nullable: false),
                    ColumnId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectiveColumnValues", x => x.ValueId);
                    table.ForeignKey(
                        name: "FK_ObjectiveColumnValues_ObjectiveColumns_ColumnId",
                        column: x => x.ColumnId,
                        principalTable: "ObjectiveColumns",
                        principalColumn: "ColumnId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ObjectiveColumnValues_UserObjectives_ObjectiveId",
                        column: x => x.ObjectiveId,
                        principalTable: "UserObjectives",
                        principalColumn: "ObjectiveId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompetenceLevels_CompetenceId",
                table: "CompetenceLevels",
                column: "CompetenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetenceLevels_LevelId",
                table: "CompetenceLevels",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_Competences_TemplateId",
                table: "Competences",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_EtatId",
                table: "Evaluations",
                column: "EtatId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_TemplateId",
                table: "Evaluations",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryCFos_UserEvalId",
                table: "HistoryCFos",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryCMps_UserEvalId",
                table: "HistoryCMps",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryObjectiveColumnValuesFos_HcfId",
                table: "HistoryObjectiveColumnValuesFos",
                column: "HcfId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryObjectiveColumnValuesMps_HcmId",
                table: "HistoryObjectiveColumnValuesMps",
                column: "HcmId");

            migrationBuilder.CreateIndex(
                name: "IX_Indicators_TemplateId",
                table: "Indicators",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectiveColumnValues_ColumnId",
                table: "ObjectiveColumnValues",
                column: "ColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectiveColumnValues_ObjectiveId",
                table: "ObjectiveColumnValues",
                column: "ObjectiveId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateStrategicPriorities_TemplateId",
                table: "TemplateStrategicPriorities",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluations_EvalId",
                table: "UserEvaluations",
                column: "EvalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHelpContents_HelpId",
                table: "UserHelpContents",
                column: "HelpId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHelpContents_UserEvalId",
                table: "UserHelpContents",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserIndicatorResults_UserIndicatorId",
                table: "UserIndicatorResults",
                column: "UserIndicatorId");

            migrationBuilder.CreateIndex(
                name: "IX_UserIndicators_IndicatorId",
                table: "UserIndicators",
                column: "IndicatorId");

            migrationBuilder.CreateIndex(
                name: "IX_UserIndicators_UserEvalId",
                table: "UserIndicators",
                column: "UserEvalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserObjectives_PriorityId",
                table: "UserObjectives",
                column: "PriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_UserObjectives_UserEvalId",
                table: "UserObjectives",
                column: "UserEvalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompetenceLevels");

            migrationBuilder.DropTable(
                name: "HistoryObjectiveColumnValuesFos");

            migrationBuilder.DropTable(
                name: "HistoryObjectiveColumnValuesMps");

            migrationBuilder.DropTable(
                name: "ObjectiveColumnValues");

            migrationBuilder.DropTable(
                name: "UserHelpContents");

            migrationBuilder.DropTable(
                name: "UserIndicatorResults");

            migrationBuilder.DropTable(
                name: "Competences");

            migrationBuilder.DropTable(
                name: "Levels");

            migrationBuilder.DropTable(
                name: "HistoryCFos");

            migrationBuilder.DropTable(
                name: "HistoryCMps");

            migrationBuilder.DropTable(
                name: "ObjectiveColumns");

            migrationBuilder.DropTable(
                name: "UserObjectives");

            migrationBuilder.DropTable(
                name: "Helps");

            migrationBuilder.DropTable(
                name: "UserIndicators");

            migrationBuilder.DropTable(
                name: "TemplateStrategicPriorities");

            migrationBuilder.DropTable(
                name: "Indicators");

            migrationBuilder.DropTable(
                name: "UserEvaluations");

            migrationBuilder.DropTable(
                name: "Evaluations");

            migrationBuilder.DropTable(
                name: "Etats");

            migrationBuilder.DropTable(
                name: "FormTemplates");
        }
    }
}
