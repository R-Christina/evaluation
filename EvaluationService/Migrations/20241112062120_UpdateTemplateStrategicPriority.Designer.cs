﻿// <auto-generated />
using System;
using EvaluationService.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace EvaluationService.Migrations
{
    [DbContext(typeof(AppdbContext))]
    [Migration("20241112062120_UpdateTemplateStrategicPriority")]
    partial class UpdateTemplateStrategicPriority
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.10")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("EvaluationService.Models.Competence", b =>
                {
                    b.Property<int>("CompetenceId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CompetenceId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("TemplateId")
                        .HasColumnType("int");

                    b.HasKey("CompetenceId");

                    b.HasIndex("TemplateId");

                    b.ToTable("Competences");
                });

            modelBuilder.Entity("EvaluationService.Models.CompetenceLevel", b =>
                {
                    b.Property<int>("CompetenceLevelId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CompetenceLevelId"));

                    b.Property<int>("CompetenceId")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("LevelId")
                        .HasColumnType("int");

                    b.HasKey("CompetenceLevelId");

                    b.HasIndex("CompetenceId");

                    b.HasIndex("LevelId");

                    b.ToTable("CompetenceLevels");
                });

            modelBuilder.Entity("EvaluationService.Models.Etat", b =>
                {
                    b.Property<int>("EtatId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("EtatId"));

                    b.Property<string>("EtatDesignation")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("EtatId");

                    b.ToTable("Etats");
                });

            modelBuilder.Entity("EvaluationService.Models.Evaluation", b =>
                {
                    b.Property<int>("EvalId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("EvalId"));

                    b.Property<int>("EtatId")
                        .HasColumnType("int");

                    b.Property<int>("EvalAnnee")
                        .HasColumnType("int");

                    b.Property<DateTime>("Final")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("FixationObjectif")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("MiParcours")
                        .HasColumnType("datetime2");

                    b.Property<int>("TemplateId")
                        .HasColumnType("int");

                    b.Property<string>("Titre")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("EvalId");

                    b.HasIndex("EtatId");

                    b.HasIndex("TemplateId");

                    b.ToTable("Evaluations");
                });

            modelBuilder.Entity("EvaluationService.Models.FormTemplate", b =>
                {
                    b.Property<int>("TemplateId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TemplateId"));

                    b.Property<DateTime>("CreationDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.HasKey("TemplateId");

                    b.ToTable("FormTemplates");
                });

            modelBuilder.Entity("EvaluationService.Models.Help", b =>
                {
                    b.Property<int>("HelpId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HelpId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.HasKey("HelpId");

                    b.ToTable("Helps");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryCFo", b =>
                {
                    b.Property<int>("HcfId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HcfId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("PriorityName")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("UserEvalId")
                        .HasColumnType("int");

                    b.Property<decimal>("Weighting")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("HcfId");

                    b.HasIndex("UserEvalId");

                    b.ToTable("HistoryCFos");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryCMp", b =>
                {
                    b.Property<int>("HcmId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HcmId"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("PriorityName")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<decimal>("Result")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ResultIndicator")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("UserEvalId")
                        .HasColumnType("int");

                    b.Property<decimal>("Weighting")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("HcmId");

                    b.HasIndex("UserEvalId");

                    b.ToTable("HistoryCMps");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryObjectiveColumnValuesFo", b =>
                {
                    b.Property<int>("HistValueId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HistValueId"));

                    b.Property<string>("ColumnName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("HcfId")
                        .HasColumnType("int");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("HistValueId");

                    b.HasIndex("HcfId");

                    b.ToTable("HistoryObjectiveColumnValuesFos");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryObjectiveColumnValuesMp", b =>
                {
                    b.Property<int>("HistValueId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HistValueId"));

                    b.Property<string>("ColumnName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("HcmId")
                        .HasColumnType("int");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("HistValueId");

                    b.HasIndex("HcmId");

                    b.ToTable("HistoryObjectiveColumnValuesMps");
                });

            modelBuilder.Entity("EvaluationService.Models.Indicator", b =>
                {
                    b.Property<int>("IndicatorId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IndicatorId"));

                    b.Property<int>("MaxResults")
                        .HasColumnType("int");

                    b.Property<int>("TemplateId")
                        .HasColumnType("int");

                    b.Property<string>("label")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IndicatorId");

                    b.HasIndex("TemplateId");

                    b.ToTable("Indicators");
                });

            modelBuilder.Entity("EvaluationService.Models.Level", b =>
                {
                    b.Property<int>("LevelId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("LevelId"));

                    b.Property<string>("LevelName")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("LevelId");

                    b.ToTable("Levels");
                });

            modelBuilder.Entity("EvaluationService.Models.ObjectiveColumn", b =>
                {
                    b.Property<int>("ColumnId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ColumnId"));

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.HasKey("ColumnId");

                    b.ToTable("ObjectiveColumns");
                });

            modelBuilder.Entity("EvaluationService.Models.ObjectiveColumnValue", b =>
                {
                    b.Property<int>("ValueId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ValueId"));

                    b.Property<int>("ColumnId")
                        .HasColumnType("int");

                    b.Property<int>("ObjectiveId")
                        .HasColumnType("int");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ValueId");

                    b.HasIndex("ColumnId");

                    b.HasIndex("ObjectiveId");

                    b.ToTable("ObjectiveColumnValues");
                });

            modelBuilder.Entity("EvaluationService.Models.TemplateStrategicPriority", b =>
                {
                    b.Property<int>("TemplatePriorityId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TemplatePriorityId"));

                    b.Property<int>("MaxObjectives")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("TemplateId")
                        .HasColumnType("int");

                    b.HasKey("TemplatePriorityId");

                    b.HasIndex("TemplateId");

                    b.ToTable("TemplateStrategicPriorities");
                });

            modelBuilder.Entity("EvaluationService.Models.UserEvaluation", b =>
                {
                    b.Property<int>("UserEvalId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserEvalId"));

                    b.Property<int>("EvalId")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserEvalId");

                    b.HasIndex("EvalId");

                    b.ToTable("UserEvaluations");
                });

            modelBuilder.Entity("EvaluationService.Models.UserHelpContent", b =>
                {
                    b.Property<int>("ContentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ContentId"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("HelpId")
                        .HasColumnType("int");

                    b.Property<int>("UserEvalId")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("ContentId");

                    b.HasIndex("HelpId");

                    b.HasIndex("UserEvalId");

                    b.ToTable("UserHelpContents");
                });

            modelBuilder.Entity("EvaluationService.Models.UserIndicator", b =>
                {
                    b.Property<int>("UserIndicatorId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserIndicatorId"));

                    b.Property<decimal?>("AttainmentPercentage")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("IndicatorId")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("UserEvalId")
                        .HasColumnType("int");

                    b.HasKey("UserIndicatorId");

                    b.HasIndex("IndicatorId");

                    b.HasIndex("UserEvalId");

                    b.ToTable("UserIndicators");
                });

            modelBuilder.Entity("EvaluationService.Models.UserIndicatorResult", b =>
                {
                    b.Property<int>("ResultId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ResultId"));

                    b.Property<int>("LineNumber")
                        .HasColumnType("int");

                    b.Property<string>("ResultText")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserIndicatorId")
                        .HasColumnType("int");

                    b.HasKey("ResultId");

                    b.HasIndex("UserIndicatorId");

                    b.ToTable("UserIndicatorResults");
                });

            modelBuilder.Entity("EvaluationService.Models.UserObjective", b =>
                {
                    b.Property<int>("ObjectiveId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ObjectiveId"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("PriorityId")
                        .HasColumnType("int");

                    b.Property<decimal?>("Result")
                        .IsRequired()
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ResultIndicator")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserEvalId")
                        .HasColumnType("int");

                    b.Property<decimal>("Weighting")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ObjectiveId");

                    b.HasIndex("PriorityId");

                    b.HasIndex("UserEvalId");

                    b.ToTable("UserObjectives");
                });

            modelBuilder.Entity("EvaluationService.Models.Competence", b =>
                {
                    b.HasOne("EvaluationService.Models.FormTemplate", "Template")
                        .WithMany("Competences")
                        .HasForeignKey("TemplateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Template");
                });

            modelBuilder.Entity("EvaluationService.Models.CompetenceLevel", b =>
                {
                    b.HasOne("EvaluationService.Models.Competence", "Competence")
                        .WithMany("CompetenceLevels")
                        .HasForeignKey("CompetenceId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.Level", "Level")
                        .WithMany("CompetenceLevels")
                        .HasForeignKey("LevelId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Competence");

                    b.Navigation("Level");
                });

            modelBuilder.Entity("EvaluationService.Models.Evaluation", b =>
                {
                    b.HasOne("EvaluationService.Models.Etat", "Etat")
                        .WithMany()
                        .HasForeignKey("EtatId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.FormTemplate", "FormTemplate")
                        .WithMany("Evaluations")
                        .HasForeignKey("TemplateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Etat");

                    b.Navigation("FormTemplate");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryCFo", b =>
                {
                    b.HasOne("EvaluationService.Models.UserEvaluation", "UserEvaluation")
                        .WithMany()
                        .HasForeignKey("UserEvalId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserEvaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryCMp", b =>
                {
                    b.HasOne("EvaluationService.Models.UserEvaluation", "UserEvaluation")
                        .WithMany()
                        .HasForeignKey("UserEvalId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserEvaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryObjectiveColumnValuesFo", b =>
                {
                    b.HasOne("EvaluationService.Models.HistoryCFo", "HistoryCFo")
                        .WithMany()
                        .HasForeignKey("HcfId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("HistoryCFo");
                });

            modelBuilder.Entity("EvaluationService.Models.HistoryObjectiveColumnValuesMp", b =>
                {
                    b.HasOne("EvaluationService.Models.HistoryCMp", "HistoryCMp")
                        .WithMany()
                        .HasForeignKey("HcmId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("HistoryCMp");
                });

            modelBuilder.Entity("EvaluationService.Models.Indicator", b =>
                {
                    b.HasOne("EvaluationService.Models.FormTemplate", "FormTemplate")
                        .WithMany("Indicators")
                        .HasForeignKey("TemplateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("FormTemplate");
                });

            modelBuilder.Entity("EvaluationService.Models.ObjectiveColumnValue", b =>
                {
                    b.HasOne("EvaluationService.Models.ObjectiveColumn", "ObjectiveColumn")
                        .WithMany("ObjectiveColumnValues")
                        .HasForeignKey("ColumnId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.UserObjective", "UserObjective")
                        .WithMany("ObjectiveColumnValues")
                        .HasForeignKey("ObjectiveId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("ObjectiveColumn");

                    b.Navigation("UserObjective");
                });

            modelBuilder.Entity("EvaluationService.Models.TemplateStrategicPriority", b =>
                {
                    b.HasOne("EvaluationService.Models.FormTemplate", "FormTemplate")
                        .WithMany("TemplateStrategicPriorities")
                        .HasForeignKey("TemplateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("FormTemplate");
                });

            modelBuilder.Entity("EvaluationService.Models.UserEvaluation", b =>
                {
                    b.HasOne("EvaluationService.Models.Evaluation", "Evaluation")
                        .WithMany("UserEvaluations")
                        .HasForeignKey("EvalId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Evaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.UserHelpContent", b =>
                {
                    b.HasOne("EvaluationService.Models.Help", "Help")
                        .WithMany("UserHelpContents")
                        .HasForeignKey("HelpId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.UserEvaluation", "UserEvaluation")
                        .WithMany("UserHelpContents")
                        .HasForeignKey("UserEvalId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Help");

                    b.Navigation("UserEvaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.UserIndicator", b =>
                {
                    b.HasOne("EvaluationService.Models.Indicator", "Indicator")
                        .WithMany()
                        .HasForeignKey("IndicatorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.UserEvaluation", "UserEvaluation")
                        .WithMany("UserIndicators")
                        .HasForeignKey("UserEvalId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Indicator");

                    b.Navigation("UserEvaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.UserIndicatorResult", b =>
                {
                    b.HasOne("EvaluationService.Models.UserIndicator", "UserIndicator")
                        .WithMany("UserIndicatorResults")
                        .HasForeignKey("UserIndicatorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("UserIndicator");
                });

            modelBuilder.Entity("EvaluationService.Models.UserObjective", b =>
                {
                    b.HasOne("EvaluationService.Models.TemplateStrategicPriority", "TemplateStrategicPriority")
                        .WithMany("UserObjectives")
                        .HasForeignKey("PriorityId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EvaluationService.Models.UserEvaluation", "UserEvaluation")
                        .WithMany("UserObjectives")
                        .HasForeignKey("UserEvalId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("TemplateStrategicPriority");

                    b.Navigation("UserEvaluation");
                });

            modelBuilder.Entity("EvaluationService.Models.Competence", b =>
                {
                    b.Navigation("CompetenceLevels");
                });

            modelBuilder.Entity("EvaluationService.Models.Evaluation", b =>
                {
                    b.Navigation("UserEvaluations");
                });

            modelBuilder.Entity("EvaluationService.Models.FormTemplate", b =>
                {
                    b.Navigation("Competences");

                    b.Navigation("Evaluations");

                    b.Navigation("Indicators");

                    b.Navigation("TemplateStrategicPriorities");
                });

            modelBuilder.Entity("EvaluationService.Models.Help", b =>
                {
                    b.Navigation("UserHelpContents");
                });

            modelBuilder.Entity("EvaluationService.Models.Level", b =>
                {
                    b.Navigation("CompetenceLevels");
                });

            modelBuilder.Entity("EvaluationService.Models.ObjectiveColumn", b =>
                {
                    b.Navigation("ObjectiveColumnValues");
                });

            modelBuilder.Entity("EvaluationService.Models.TemplateStrategicPriority", b =>
                {
                    b.Navigation("UserObjectives");
                });

            modelBuilder.Entity("EvaluationService.Models.UserEvaluation", b =>
                {
                    b.Navigation("UserHelpContents");

                    b.Navigation("UserIndicators");

                    b.Navigation("UserObjectives");
                });

            modelBuilder.Entity("EvaluationService.Models.UserIndicator", b =>
                {
                    b.Navigation("UserIndicatorResults");
                });

            modelBuilder.Entity("EvaluationService.Models.UserObjective", b =>
                {
                    b.Navigation("ObjectiveColumnValues");
                });
#pragma warning restore 612, 618
        }
    }
}
