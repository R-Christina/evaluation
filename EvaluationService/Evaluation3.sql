IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Etats] (
    [EtatId] int NOT NULL IDENTITY,
    [EtatDesignation] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Etats] PRIMARY KEY ([EtatId])
);
GO

CREATE TABLE [FormTemplates] (
    [TemplateId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [CreationDate] datetime2 NOT NULL,
    [Type] int NOT NULL,
    CONSTRAINT [PK_FormTemplates] PRIMARY KEY ([TemplateId])
);
GO

CREATE TABLE [HistoryUserHelpContents] (
    [HistoryContentId] int NOT NULL IDENTITY,
    [HelpId] int NOT NULL,
    [HelpName] nvarchar(255) NOT NULL,
    [ContentId] int NOT NULL,
    [UserEvalId] int NOT NULL,
    [WriterUserId] nvarchar(max) NOT NULL,
    [Content] nvarchar(255) NOT NULL,
    [ArchivedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryUserHelpContents] PRIMARY KEY ([HistoryContentId])
);
GO

CREATE TABLE [Levels] (
    [LevelId] int NOT NULL IDENTITY,
    [LevelName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Levels] PRIMARY KEY ([LevelId])
);
GO

CREATE TABLE [ObjectiveColumns] (
    [ColumnId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_ObjectiveColumns] PRIMARY KEY ([ColumnId])
);
GO

CREATE TABLE [Competences] (
    [CompetenceId] int NOT NULL IDENTITY,
    [TemplateId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Competences] PRIMARY KEY ([CompetenceId]),
    CONSTRAINT [FK_Competences_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Evaluations] (
    [EvalId] int NOT NULL IDENTITY,
    [EvalAnnee] int NOT NULL,
    [FixationObjectif] datetime2 NOT NULL,
    [MiParcours] datetime2 NOT NULL,
    [Final] datetime2 NOT NULL,
    [EtatId] int NOT NULL,
    [TemplateId] int NOT NULL,
    [Titre] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [CompetenceWeightTotal] decimal(18,2) NULL,
    [IndicatorWeightTotal] decimal(18,2) NULL,
    CONSTRAINT [PK_Evaluations] PRIMARY KEY ([EvalId]),
    CONSTRAINT [FK_Evaluations_Etats_EtatId] FOREIGN KEY ([EtatId]) REFERENCES [Etats] ([EtatId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Evaluations_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Helps] (
    [HelpId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [TemplateId] int NOT NULL,
    [IsActive] bit NOT NULL,
    [AllowedUserLevel] int NOT NULL,
    CONSTRAINT [PK_Helps] PRIMARY KEY ([HelpId]),
    CONSTRAINT [FK_Helps_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Indicators] (
    [IndicatorId] int NOT NULL IDENTITY,
    [label] nvarchar(max) NOT NULL,
    [MaxResults] int NOT NULL,
    [TemplateId] int NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Indicators] PRIMARY KEY ([IndicatorId]),
    CONSTRAINT [FK_Indicators_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [TemplateStrategicPriorities] (
    [TemplatePriorityId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [MaxObjectives] int NOT NULL,
    [TemplateId] int NOT NULL,
    [IsActif] bit NOT NULL,
    CONSTRAINT [PK_TemplateStrategicPriorities] PRIMARY KEY ([TemplatePriorityId]),
    CONSTRAINT [FK_TemplateStrategicPriorities_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserEvaluationWeights] (
    [WeightId] int NOT NULL IDENTITY,
    [TemplateId] int NOT NULL,
    [CompetenceWeightTotal] decimal(18,2) NOT NULL,
    [IndicatorWeightTotal] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_UserEvaluationWeights] PRIMARY KEY ([WeightId]),
    CONSTRAINT [FK_UserEvaluationWeights_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [CompetenceLevels] (
    [CompetenceLevelId] int NOT NULL IDENTITY,
    [CompetenceId] int NOT NULL,
    [LevelId] int NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_CompetenceLevels] PRIMARY KEY ([CompetenceLevelId]),
    CONSTRAINT [FK_CompetenceLevels_Competences_CompetenceId] FOREIGN KEY ([CompetenceId]) REFERENCES [Competences] ([CompetenceId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_CompetenceLevels_Levels_LevelId] FOREIGN KEY ([LevelId]) REFERENCES [Levels] ([LevelId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [UserEvaluations] (
    [UserEvalId] int NOT NULL IDENTITY,
    [EvalId] int NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_UserEvaluations] PRIMARY KEY ([UserEvalId]),
    CONSTRAINT [FK_UserEvaluations_Evaluations_EvalId] FOREIGN KEY ([EvalId]) REFERENCES [Evaluations] ([EvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [HistoryCFis] (
    [HcfiId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [PriorityName] nvarchar(255) NOT NULL,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
    [ResultIndicator] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryCFis] PRIMARY KEY ([HcfiId]),
    CONSTRAINT [FK_HistoryCFis_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryCFos] (
    [HcfId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [PriorityName] nvarchar(255) NOT NULL,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryCFos] PRIMARY KEY ([HcfId]),
    CONSTRAINT [FK_HistoryCFos_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryCMps] (
    [HcmId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [PriorityName] nvarchar(255) NOT NULL,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
    [ResultIndicator] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryCMps] PRIMARY KEY ([HcmId]),
    CONSTRAINT [FK_HistoryCMps_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserCompetenceFOs] (
    [HistoryUserCompetenceId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [CompetenceName] nvarchar(max) NOT NULL,
    [Performance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_HistoryUserCompetenceFOs] PRIMARY KEY ([HistoryUserCompetenceId]),
    CONSTRAINT [FK_HistoryUserCompetenceFOs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserCompetenceMPs] (
    [HistoryUserCompetenceId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [CompetenceName] nvarchar(max) NOT NULL,
    [Performance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_HistoryUserCompetenceMPs] PRIMARY KEY ([HistoryUserCompetenceId]),
    CONSTRAINT [FK_HistoryUserCompetenceMPs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserindicatorFis] (
    [HistoryUserindicatorFiId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryUserindicatorFis] PRIMARY KEY ([HistoryUserindicatorFiId]),
    CONSTRAINT [FK_HistoryUserindicatorFis_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserIndicatorFOs] (
    [HistoryUserIndicatorFOId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryUserIndicatorFOs] PRIMARY KEY ([HistoryUserIndicatorFOId]),
    CONSTRAINT [FK_HistoryUserIndicatorFOs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserIndicatorMPs] (
    [HistoryUserIndicatorMPId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_HistoryUserIndicatorMPs] PRIMARY KEY ([HistoryUserIndicatorMPId]),
    CONSTRAINT [FK_HistoryUserIndicatorMPs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserCompetences] (
    [UserCompetenceId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [CompetenceId] int NOT NULL,
    [Performance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_UserCompetences] PRIMARY KEY ([UserCompetenceId]),
    CONSTRAINT [FK_UserCompetences_Competences_CompetenceId] FOREIGN KEY ([CompetenceId]) REFERENCES [Competences] ([CompetenceId]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserCompetences_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserHelpContents] (
    [ContentId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [HelpId] int NOT NULL,
    [WriterUserId] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_UserHelpContents] PRIMARY KEY ([ContentId]),
    CONSTRAINT [FK_UserHelpContents_Helps_HelpId] FOREIGN KEY ([HelpId]) REFERENCES [Helps] ([HelpId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserHelpContents_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [UserIndicators] (
    [UserIndicatorId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [IndicatorId] int NOT NULL,
    CONSTRAINT [PK_UserIndicators] PRIMARY KEY ([UserIndicatorId]),
    CONSTRAINT [FK_UserIndicators_Indicators_IndicatorId] FOREIGN KEY ([IndicatorId]) REFERENCES [Indicators] ([IndicatorId]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserIndicators_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [UserObjectives] (
    [ObjectiveId] int NOT NULL IDENTITY,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
    [ResultIndicator] nvarchar(max) NULL,
    [Result] decimal(18,2) NOT NULL,
    [UserEvalId] int NOT NULL,
    [PriorityId] int NOT NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_UserObjectives] PRIMARY KEY ([ObjectiveId]),
    CONSTRAINT [FK_UserObjectives_TemplateStrategicPriorities_PriorityId] FOREIGN KEY ([PriorityId]) REFERENCES [TemplateStrategicPriorities] ([TemplatePriorityId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserObjectives_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [HistoryObjectiveColumnValuesFis] (
    [HistValueId] int NOT NULL IDENTITY,
    [HcfiId] int NOT NULL,
    [ColumnName] nvarchar(max) NOT NULL,
    [Value] nvarchar(max) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryObjectiveColumnValuesFis] PRIMARY KEY ([HistValueId]),
    CONSTRAINT [FK_HistoryObjectiveColumnValuesFis_HistoryCFis_HcfiId] FOREIGN KEY ([HcfiId]) REFERENCES [HistoryCFis] ([HcfiId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryObjectiveColumnValuesFos] (
    [HistValueId] int NOT NULL IDENTITY,
    [HcfId] int NOT NULL,
    [ColumnName] nvarchar(max) NOT NULL,
    [Value] nvarchar(max) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryObjectiveColumnValuesFos] PRIMARY KEY ([HistValueId]),
    CONSTRAINT [FK_HistoryObjectiveColumnValuesFos_HistoryCFos_HcfId] FOREIGN KEY ([HcfId]) REFERENCES [HistoryCFos] ([HcfId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryObjectiveColumnValuesMps] (
    [HistValueId] int NOT NULL IDENTITY,
    [HcmId] int NOT NULL,
    [ColumnName] nvarchar(max) NOT NULL,
    [Value] nvarchar(max) NOT NULL,
    [ValidatedBy] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryObjectiveColumnValuesMps] PRIMARY KEY ([HistValueId]),
    CONSTRAINT [FK_HistoryObjectiveColumnValuesMps_HistoryCMps_HcmId] FOREIGN KEY ([HcmId]) REFERENCES [HistoryCMps] ([HcmId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserIndicatorResults] (
    [ResultId] int NOT NULL IDENTITY,
    [UserIndicatorId] int NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_UserIndicatorResults] PRIMARY KEY ([ResultId]),
    CONSTRAINT [FK_UserIndicatorResults_UserIndicators_UserIndicatorId] FOREIGN KEY ([UserIndicatorId]) REFERENCES [UserIndicators] ([UserIndicatorId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [ObjectiveColumnValues] (
    [ValueId] int NOT NULL IDENTITY,
    [ObjectiveId] int NOT NULL,
    [ColumnId] int NOT NULL,
    [Value] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ObjectiveColumnValues] PRIMARY KEY ([ValueId]),
    CONSTRAINT [FK_ObjectiveColumnValues_ObjectiveColumns_ColumnId] FOREIGN KEY ([ColumnId]) REFERENCES [ObjectiveColumns] ([ColumnId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ObjectiveColumnValues_UserObjectives_ObjectiveId] FOREIGN KEY ([ObjectiveId]) REFERENCES [UserObjectives] ([ObjectiveId]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_CompetenceLevels_CompetenceId] ON [CompetenceLevels] ([CompetenceId]);
GO

CREATE INDEX [IX_CompetenceLevels_LevelId] ON [CompetenceLevels] ([LevelId]);
GO

CREATE INDEX [IX_Competences_TemplateId] ON [Competences] ([TemplateId]);
GO

CREATE INDEX [IX_Evaluations_EtatId] ON [Evaluations] ([EtatId]);
GO

CREATE INDEX [IX_Evaluations_TemplateId] ON [Evaluations] ([TemplateId]);
GO

CREATE INDEX [IX_Helps_TemplateId] ON [Helps] ([TemplateId]);
GO

CREATE INDEX [IX_HistoryCFis_UserEvalId] ON [HistoryCFis] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryCFos_UserEvalId] ON [HistoryCFos] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryCMps_UserEvalId] ON [HistoryCMps] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryObjectiveColumnValuesFis_HcfiId] ON [HistoryObjectiveColumnValuesFis] ([HcfiId]);
GO

CREATE INDEX [IX_HistoryObjectiveColumnValuesFos_HcfId] ON [HistoryObjectiveColumnValuesFos] ([HcfId]);
GO

CREATE INDEX [IX_HistoryObjectiveColumnValuesMps_HcmId] ON [HistoryObjectiveColumnValuesMps] ([HcmId]);
GO

CREATE INDEX [IX_HistoryUserCompetenceFOs_UserEvalId] ON [HistoryUserCompetenceFOs] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserCompetenceMPs_UserEvalId] ON [HistoryUserCompetenceMPs] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserindicatorFis_UserEvalId] ON [HistoryUserindicatorFis] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserIndicatorFOs_UserEvalId] ON [HistoryUserIndicatorFOs] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserIndicatorMPs_UserEvalId] ON [HistoryUserIndicatorMPs] ([UserEvalId]);
GO

CREATE INDEX [IX_Indicators_TemplateId] ON [Indicators] ([TemplateId]);
GO

CREATE INDEX [IX_ObjectiveColumnValues_ColumnId] ON [ObjectiveColumnValues] ([ColumnId]);
GO

CREATE INDEX [IX_ObjectiveColumnValues_ObjectiveId] ON [ObjectiveColumnValues] ([ObjectiveId]);
GO

CREATE INDEX [IX_TemplateStrategicPriorities_TemplateId] ON [TemplateStrategicPriorities] ([TemplateId]);
GO

CREATE INDEX [IX_UserCompetences_CompetenceId] ON [UserCompetences] ([CompetenceId]);
GO

CREATE INDEX [IX_UserCompetences_UserEvalId] ON [UserCompetences] ([UserEvalId]);
GO

CREATE INDEX [IX_UserEvaluations_EvalId] ON [UserEvaluations] ([EvalId]);
GO

CREATE INDEX [IX_UserEvaluationWeights_TemplateId] ON [UserEvaluationWeights] ([TemplateId]);
GO

CREATE INDEX [IX_UserHelpContents_HelpId] ON [UserHelpContents] ([HelpId]);
GO

CREATE INDEX [IX_UserHelpContents_UserEvalId] ON [UserHelpContents] ([UserEvalId]);
GO

CREATE INDEX [IX_UserIndicatorResults_UserIndicatorId] ON [UserIndicatorResults] ([UserIndicatorId]);
GO

CREATE INDEX [IX_UserIndicators_IndicatorId] ON [UserIndicators] ([IndicatorId]);
GO

CREATE INDEX [IX_UserIndicators_UserEvalId] ON [UserIndicators] ([UserEvalId]);
GO

CREATE INDEX [IX_UserObjectives_PriorityId] ON [UserObjectives] ([PriorityId]);
GO

CREATE INDEX [IX_UserObjectives_UserEvalId] ON [UserObjectives] ([UserEvalId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241129115329_InitialCreate', N'8.0.10');
GO

COMMIT;
GO

