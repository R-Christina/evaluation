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

CREATE TABLE [FormTemplates] (
    [TemplateId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [CreationDate] datetime2 NOT NULL,
    [Type] int NOT NULL,
    CONSTRAINT [PK_FormTemplates] PRIMARY KEY ([TemplateId])
);
GO

CREATE TABLE [Etats] (
    [EtatId] int NOT NULL IDENTITY,
    [EtatDesignation] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Etats] PRIMARY KEY ([EtatId])
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
    CONSTRAINT [PK_Evaluations] PRIMARY KEY ([EvalId]),
    CONSTRAINT [FK_Evaluations_Etats_EtatId] FOREIGN KEY ([EtatId]) REFERENCES [Etats] ([EtatId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Evaluations_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
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

--cadre
CREATE TABLE [TemplateStrategicPriorities] (
    [TemplatePriorityId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [MaxObjectives] int NOT NULL,
    [TemplateId] int NOT NULL,
    CONSTRAINT [PK_TemplateStrategicPriorities] PRIMARY KEY ([TemplatePriorityId]),
    CONSTRAINT [FK_TemplateStrategicPriorities_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserObjectives] (
    [ObjectiveId] int NOT NULL IDENTITY,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
    [ResultIndicator] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    [UserEvalId] int NOT NULL,
    [PriorityId] int NOT NULL,
    CONSTRAINT [PK_UserObjectives] PRIMARY KEY ([ObjectiveId]),
    CONSTRAINT [FK_UserObjectives_TemplateStrategicPriorities_PriorityId] FOREIGN KEY ([PriorityId]) REFERENCES [TemplateStrategicPriorities] ([TemplatePriorityId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserObjectives_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [HistoryCFos] (
    [HcfId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [PriorityName] nvarchar(255) NOT NULL,
    [Description] nvarchar(255) NOT NULL,
    [Weighting] decimal(18,2) NOT NULL,
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
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryCMps] PRIMARY KEY ([HcmId]),
    CONSTRAINT [FK_HistoryCMps_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [ObjectiveColumns] (
    [ColumnId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_ObjectiveColumns] PRIMARY KEY ([ColumnId])
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

CREATE TABLE [HistoryObjectiveColumnValuesFos] (
    [HistValueId] int NOT NULL IDENTITY,
    [HcfId] int NOT NULL,
    [ColumnName] nvarchar(max) NOT NULL,
    [Value] nvarchar(max) NOT NULL,
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
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HistoryObjectiveColumnValuesMps] PRIMARY KEY ([HistValueId]),
    CONSTRAINT [FK_HistoryObjectiveColumnValuesMps_HistoryCMps_HcmId] FOREIGN KEY ([HcmId]) REFERENCES [HistoryCMps] ([HcmId]) ON DELETE CASCADE
);
GO



--NonCadre
CREATE TABLE [Levels] (
    [LevelId] int NOT NULL IDENTITY,
    [LevelName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Levels] PRIMARY KEY ([LevelId])
);
GO

CREATE TABLE [Competences] (
    [CompetenceId] int NOT NULL IDENTITY,
    [TemplateId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [Weight] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_Competences] PRIMARY KEY ([CompetenceId]),
    CONSTRAINT [FK_Competences_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
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

CREATE TABLE [UserEvaluationWeights] (
    [WeightId] int NOT NULL IDENTITY,
    [TemplateId] int NOT NULL,
    [CompetenceWeightTotal] decimal(18,2) NOT NULL,
    [IndicatorWeightTotal] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_UserEvaluationWeights] PRIMARY KEY ([WeightId]),
);
insert into [UserEvaluationWeights]([TemplateId],[CompetenceWeightTotal],[IndicatorWeightTotal]) values (2,75,25);

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

CREATE TABLE [HistoryUserCompetenceFOs] (
    [HistoryUserCompetenceId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [CompetenceName] int NOT NULL,
    [Performance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_HistoryUserCompetenceFOs] PRIMARY KEY ([HistoryUserCompetenceId]),
    CONSTRAINT [FK_HistoryUserCompetenceFOs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [HistoryUserCompetenceMPs] (
    [HistoryUserCompetenceId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [CompetenceName] int NOT NULL,
    [Performance] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_HistoryUserCompetenceMPs] PRIMARY KEY ([HistoryUserCompetenceId]),
    CONSTRAINT [FK_HistoryUserCompetenceMPs_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Indicators] (
    [IndicatorId] int NOT NULL IDENTITY,
    [label] nvarchar(max) NOT NULL,
    [MaxResults] int NOT NULL,
    [TemplateId] int NOT NULL,
    CONSTRAINT [PK_Indicators] PRIMARY KEY ([IndicatorId]),
    CONSTRAINT [FK_Indicators_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

CREATE TABLE [UserIndicators] (
    [UserIndicatorId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL
    [IndicatorId] int NOT NULL,
    CONSTRAINT [PK_UserIndicators] PRIMARY KEY ([UserIndicatorId]),
    CONSTRAINT [FK_UserIndicators_Indicators_IndicatorId] FOREIGN KEY ([IndicatorId]) REFERENCES [Indicators] ([IndicatorId]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserIndicators_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [UserIndicatorResults] (
    [ResultId] int NOT NULL IDENTITY,
    [UserIndicatorId] int NOT NULL,
    [LineNumber] int NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_UserIndicatorResults] PRIMARY KEY ([ResultId]),
    CONSTRAINT [FK_UserIndicatorResults_UserIndicators_UserIndicatorId] FOREIGN KEY ([UserIndicatorId]) REFERENCES [UserIndicators] ([UserIndicatorId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [HistoryUserIndicatorFOs] (
    [HistoryUserIndicatorFOId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [ResultText] nvarchar(max) NULL,
    [Result] decimal(18,2) NULL,
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

CREATE TABLE [Helps] (
    [HelpId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Helps] PRIMARY KEY ([HelpId])
);
GO
insert into [Helps]([Name]) values ('Projet professionnel du salarié et souhait d''évolution de carrière');

CREATE TABLE [UserHelpContents] (
    [ContentId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [HelpId] int NOT NULL,
    [UserId] int NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_UserHelpContents] PRIMARY KEY ([ContentId]),
    CONSTRAINT [FK_UserHelpContents_Helps_HelpId] FOREIGN KEY ([HelpId]) REFERENCES [Helps] ([HelpId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserHelpContents_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
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

CREATE INDEX [IX_HistoryCFos_UserEvalId] ON [HistoryCFos] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryCMps_UserEvalId] ON [HistoryCMps] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryObjectiveColumnValuesFos_HcfId] ON [HistoryObjectiveColumnValuesFos] ([HcfId]);
GO

CREATE INDEX [IX_HistoryObjectiveColumnValuesMps_HcmId] ON [HistoryObjectiveColumnValuesMps] ([HcmId]);
GO

CREATE INDEX [IX_Indicators_TemplateId] ON [Indicators] ([TemplateId]);
GO

CREATE INDEX [IX_ObjectiveColumnValues_ColumnId] ON [ObjectiveColumnValues] ([ColumnId]);
GO

CREATE INDEX [IX_ObjectiveColumnValues_ObjectiveId] ON [ObjectiveColumnValues] ([ObjectiveId]);
GO

CREATE INDEX [IX_TemplateStrategicPriorities_TemplateId] ON [TemplateStrategicPriorities] ([TemplateId]);
GO

CREATE INDEX [IX_UserEvaluations_EvalId] ON [UserEvaluations] ([EvalId]);
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
VALUES (N'20241108074420_InitialCreate', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Evaluations] ADD [Type] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241108083843_MigrationEvaluation', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Competences]') AND [c].[name] = N'Weight');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Competences] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Competences] DROP COLUMN [Weight];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241110140734_UpdateCompetence', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CompetenceLevels]') AND [c].[name] = N'Score');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [CompetenceLevels] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [CompetenceLevels] DROP COLUMN [Score];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241110141733_UpdateCompetenceLevel', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserObjectives]') AND [c].[name] = N'ResultIndicator');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [UserObjectives] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [UserObjectives] ALTER COLUMN [ResultIndicator] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241111070408_MakeResultIndicatorNullable', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241112061911_UpdateUserObjective', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241112062120_UpdateTemplateStrategicPriority', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE INDEX [IX_HistoryUserCompetenceFOs_UserEvalId] ON [HistoryUserCompetenceFOs] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserIndicatorFOs_UserEvalId] ON [HistoryUserIndicatorFOs] ([UserEvalId]);
GO

CREATE INDEX [IX_UserCompetences_CompetenceId] ON [UserCompetences] ([CompetenceId]);
GO

CREATE INDEX [IX_UserCompetences_UserEvalId] ON [UserCompetences] ([UserEvalId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114064509_HistoryNonCadre', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[HistoryUserCompetenceFOs]') AND [c].[name] = N'CompetenceName');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [HistoryUserCompetenceFOs] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [HistoryUserCompetenceFOs] ALTER COLUMN [CompetenceName] nvarchar(max) NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114071217_UpdateHistoryCompetenceFo', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserIndicators]') AND [c].[name] = N'AttainmentPercentage');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [UserIndicators] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [UserIndicators] DROP COLUMN [AttainmentPercentage];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114072931_UpdateUserIndicator', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[UserIndicatorResults].[LineNumber]', N'Result', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114073148_UpdateUserIndicatorResult', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserIndicatorResults]') AND [c].[name] = N'Result');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [UserIndicatorResults] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [UserIndicatorResults] ALTER COLUMN [Result] decimal(18,2) NOT NULL;
GO

CREATE INDEX [IX_HistoryUserCompetenceMPs_UserEvalId] ON [HistoryUserCompetenceMPs] ([UserEvalId]);
GO

CREATE INDEX [IX_HistoryUserIndicatorMPs_UserEvalId] ON [HistoryUserIndicatorMPs] ([UserEvalId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114074307_UpdateUserIndicatorResults', N'8.0.10');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[HistoryUserCompetenceMPs]') AND [c].[name] = N'CompetenceName');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [HistoryUserCompetenceMPs] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [HistoryUserCompetenceMPs] ALTER COLUMN [CompetenceName] nvarchar(max) NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241114075117_UpdateIntToSring', N'8.0.10');
GO

COMMIT;
GO

