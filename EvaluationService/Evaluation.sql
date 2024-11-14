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
insert into [Etats] ([EtatDesignation]) values ('Créer'),('En Cours'),('Clôturer');

CREATE TABLE [FormTemplates] (
    [TemplateId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [CreationDate] datetime2 NOT NULL,
    [Type] int NOT NULL,
    CONSTRAINT [PK_FormTemplates] PRIMARY KEY ([TemplateId])
);
GO
insert into [FormTemplates]([Name],[CreationDate],[Type]) values ('Formulaire Cadre',GETDATE(),0);
insert into [FormTemplates]([Name],[CreationDate],[Type]) values ('Formulaire Non Cadre',GETDATE(),0);


CREATE TABLE [Helps] (
    [HelpId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    CONSTRAINT [PK_Helps] PRIMARY KEY ([HelpId])
);
GO

CREATE TABLE [Levels] (
    [LevelId] int NOT NULL IDENTITY,
    [LevelName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Levels] PRIMARY KEY ([LevelId])
);
GO

INSERT INTO [Levels] ([LevelName]) VALUES ('0');
INSERT INTO [Levels] ([LevelName]) VALUES ('33');
INSERT INTO [Levels] ([LevelName]) VALUES ('66');
INSERT INTO [Levels] ([LevelName]) VALUES ('80');
INSERT INTO [Levels] ([LevelName]) VALUES ('100');

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
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Compétence technique');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Efficience');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Qualité du travail');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Assiduité');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Comportement');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Initiative');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Organisation');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (4, 'Contrôle');

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
    CONSTRAINT [PK_Evaluations] PRIMARY KEY ([EvalId]),
    CONSTRAINT [FK_Evaluations_Etats_EtatId] FOREIGN KEY ([EtatId]) REFERENCES [Etats] ([EtatId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Evaluations_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
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
insert into [Indicators] ([label],[MaxResults],[TemplateId]) values ('Indicateur 1', 3, 4);
insert into [Indicators] ([label],[MaxResults],[TemplateId]) values ('Indicateur 2', 3, 4);
insert into [Indicators] ([label],[MaxResults],[TemplateId]) values ('Indicateur 3', 3, 4);
insert into [Indicators] ([label],[MaxResults],[TemplateId]) values ('Indicateur 4', 2, 4);

CREATE TABLE [TemplateStrategicPriorities] (
    [TemplatePriorityId] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [MaxObjectives] int NOT NULL,
    [TemplateId] int NOT NULL,
    CONSTRAINT [PK_TemplateStrategicPriorities] PRIMARY KEY ([TemplatePriorityId]),
    CONSTRAINT [FK_TemplateStrategicPriorities_FormTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [FormTemplates] ([TemplateId]) ON DELETE CASCADE
);
GO

INSERT INTO [TemplateStrategicPriorities] ([TemplateId], [Name], [MaxObjectives])
VALUES 
(1, N'Robustesse opérationnelle', 4),
(1, N'Performance financière', 4),
(1, N'Responsabilité sociétale d''entreprise', 4);
 
 
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
-- 1
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (1, 1, 'Ignore encore beaucoup de son domaine. Doit être surveillé, guidé et contrôlé constamment.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (1, 2, 'A des lacunes. Pourrait mieux faire. Progrès peut être possible.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (1, 3, 'Connaît son domaine d''activité. Elément sûr. Bon spécialiste.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (1, 4, 'Sait juger et décider en connaissance de cause.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (1, 5, 'Très compétent. A le souci d''accroître sa valeur personnelle. A du potentiel.');

-- 2
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (2, 1, 'Réalise ses missions lentement. Est vite découragé. Ne fait pas suffisamment d''efforts.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (2, 2, 'Obtient difficilement les niveaux standards. Adaptation et progression lentes.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (2, 3, 'Normale. Adaptation et progression correctes.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (2, 4, 'Habile. Actif. Assimile bien. Courageux. Décidé. Tenace.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (2 , 5, 'Rapide. Précis. Dynamique. Surmonte toutes les difficultés.');

-- 3
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (3, 1, 'Exécute sa tache sans intérêt. Son travail doit être surveillé et contrôlé constamment.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (3, 2, 'Moyenne. Progrès peut être possible.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (3, 3, 'A le souci d''obtenir un travail correct. Cherche à s''améliorer.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (3, 4, 'Toujours satisfaisante. A le sens et le souci de la qualité.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (3, 5, 'Excellente. S''emploie à atteindre tous les objectifs fixés.');

-- 4
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (4, 1, 'Retards et absences fréquents.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (4, 2, 'N''arrive pas toujours à l''heure. A souvent besoin de s''absenter.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (4, 3, 'Satisfaisante.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (4, 4, 'Ponctuel. Prolonge son temps de travail sur demande.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (4, 5, 'Particulièrement disponible quels que soient les horaires imposés.');

-- 5
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (5, 1, 'Ne s''intègre pas. Peu respectueux de la hiérarchie. Esprit contestataire.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (5, 2, 'Fait tout juste ce qui lui est demandé. N''a pas le sens du travail d''équipe.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (5, 3, 'Correct avec tous. Bon équipier.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (5, 4, 'Respectueux des ordres et directives donnés. Responsable. Déterminé.');
INSERT INTO [CompetenceLevels] ([CompetenceId], [LevelId], [Description]) VALUES (5, 5, 'Excellent en toutes circonstances. Aime son mérier et l''exécute avec enthousiasme.');


CREATE TABLE [UserEvaluations] (
    [UserEvalId] int NOT NULL IDENTITY,
    [EvalId] int NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_UserEvaluations] PRIMARY KEY ([UserEvalId]),
    CONSTRAINT [FK_UserEvaluations_Evaluations_EvalId] FOREIGN KEY ([EvalId]) REFERENCES [Evaluations] ([EvalId]) ON DELETE NO ACTION
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

CREATE TABLE [UserIndicators] (
    [UserIndicatorId] int NOT NULL IDENTITY,
    [UserEvalId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [AttainmentPercentage] decimal(18,2) NULL,
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
    [ResultIndicator] nvarchar(max) NOT NULL,
    [Result] decimal(18,2) NOT NULL,
    [UserEvalId] int NOT NULL,
    [PriorityId] int NOT NULL,
    CONSTRAINT [PK_UserObjectives] PRIMARY KEY ([ObjectiveId]),
    CONSTRAINT [FK_UserObjectives_TemplateStrategicPriorities_PriorityId] FOREIGN KEY ([PriorityId]) REFERENCES [TemplateStrategicPriorities] ([TemplatePriorityId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserObjectives_UserEvaluations_UserEvalId] FOREIGN KEY ([UserEvalId]) REFERENCES [UserEvaluations] ([UserEvalId]) ON DELETE NO ACTION
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

CREATE TABLE [UserIndicatorResults] (
    [ResultId] int NOT NULL IDENTITY,
    [UserIndicatorId] int NOT NULL,
    [LineNumber] int NOT NULL,
    [ResultText] nvarchar(max) NOT NULL,
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

--maka ny fixation sy mi-parcours d'une année
DECLARE @UserId NVARCHAR(MAX) = '18219f8e-b781-46ff-9182-37c9da640c03' -- Remplacez par l'ID utilisateur
DECLARE @EvalId INT = 4 -- Remplacez par l'ID d'évaluation souhaité

SELECT 
    'Fixation' AS Phase,
    hcf.HcfId AS HistoryId,
    hcf.PriorityName,
    hcf.Description,
    hcf.Weighting,
    hcf.CreatedAt AS Date,
    e.EvalAnnee AS EvaluationYear,
    NULL AS ResultIndicator,
    NULL AS Result
FROM 
    HistoryCFos hcf
JOIN 
    UserEvaluations ue ON hcf.UserEvalId = ue.UserEvalId
JOIN 
    Evaluations e ON ue.EvalId = e.EvalId
WHERE 
    ue.UserId = @UserId
    AND e.EvalId = @EvalId

UNION ALL

SELECT 
    'Mi-Parcours' AS Phase,
    hcm.HcmId AS HistoryId,
    hcm.PriorityName,
    hcm.Description,
    hcm.Weighting,
    hcm.UpdatedAt AS Date,
    e.EvalAnnee AS EvaluationYear,
    hcm.ResultIndicator,
    hcm.Result
FROM 
    HistoryCMps hcm
JOIN 
    UserEvaluations ue ON hcm.UserEvalId = ue.UserEvalId
JOIN 
    Evaluations e ON ue.EvalId = e.EvalId
WHERE 
    ue.UserId = @UserId
    AND e.EvalId = @EvalId
ORDER BY 
    Phase, Date;


--maka ny année
SELECT E.EvalAnnee, E.EvalId
FROM [Evaluations] E
JOIN [UserEvaluations] U ON E.EvalId = U.EvalId
WHERE E.EtatId = 3
AND U.UserId = '18219f8e-b781-46ff-9182-37c9da640c03';

-- rudy: 4bbe3a90-2f91-40b9-bdb2-6efc48195f3a

