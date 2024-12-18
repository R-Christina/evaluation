INSERT INTO [Sections] ([Name]) 
VALUES
    ('Gestion des habilitations'),
    ('Gestion des utilisateurs'),
    ('Gestion des formulaires d''évaluation'),
    ('Gestion des périodes d''évaluation'),
    ('Gestion des évaluations'),
    ('Gestion des archives');


-- Gestion des habilitations
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter les habilitations', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des habilitations'), 
        1),
    ('Ajouter une habilitation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des habilitations'), 
        1),
    ('Modifier une habilitation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des habilitations'), 
        1),
    ('Supprimer une habilitation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des habilitations'), 
        1),
    ('Assigner des habilitations', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des habilitations'), 
        1);

-- Gestion des utilisateurs
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter la liste des utilisateurs', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des utilisateurs'), 
        1),
    ('Mettre à jour les informations des utilisateurs', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des utilisateurs'), 
        1),
    ('Classifier les utilisateurs', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des utilisateurs'), 
        1);

-- Gestion des formulaires d'évaluation
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter les formulaires vierges d''évaluation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des formulaires d''évaluation'), 
        1),
    ('Modifier les formulaires d''évaluation existants', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des formulaires d''évaluation'), 
        1);

-- Gestion des périodes d'évaluation
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter les périodes d''évaluation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des périodes d''évaluation'), 
        1),
    ('Créer une nouvelle période d''évaluation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des périodes d''évaluation'), 
        1),
    ('Modifier une période d''évaluation', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des périodes d''évaluation'), 
        1);

-- Gestion des évaluations
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter les subordonnés', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Remplir ses formulaires d''évaluation pour un cadre', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Remplir les formulaires d''évaluation pour ses subordonnés cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Consulter les formulaires en cours des collaborateurs cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Consulter les formulaires en cours des subordonnés cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Remplir ses formulaires d''évaluation pour un non-cadre', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Remplir les formulaires d''évaluation pour ses subordonnés non-cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Consulter les formulaires en cours des collaborateurs non-cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1),
    ('Consulter les formulaires en cours des subordonnés non-cadres', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des évaluations'), 
        1);

-- Gestion des archives
INSERT INTO [HabilitationAdmins] ([Name], [SectionId], [IsGranted])
VALUES
    ('Consulter ses archives personnelles', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des archives'), 
        1),
    ('Consulter les archives de tous les collaborateurs', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des archives'), 
        1),
    ('Modifier les fiches archivées de tous les collaborateurs', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des archives'), 
        1),
    ('Consulter les archives des subordonnés', 
        (SELECT [Id] FROM [Sections] WHERE [Name] = 'Gestion des archives'), 
        1);


INSERT INTO [Etats] ([EtatDesignation])
VALUES  ('Créé'), ('En cours'), ('Clôturé');

insert into [FormTemplates]([Name],[CreationDate],[Type]) values ('Formulaire Cadre',GETDATE(),0);
insert into [FormTemplates]([Name],[CreationDate],[Type]) values ('Formulaire Non Cadre',GETDATE(),1);

insert into [UserEvaluationWeights]([TemplateId],[CompetenceWeightTotal],[IndicatorWeightTotal]) values (2,75,25);


INSERT INTO [Levels] ([LevelName]) VALUES ('0');
INSERT INTO [Levels] ([LevelName]) VALUES ('33');
INSERT INTO [Levels] ([LevelName]) VALUES ('66');
INSERT INTO [Levels] ([LevelName]) VALUES ('80');
INSERT INTO [Levels] ([LevelName]) VALUES ('100');

INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Compétence technique');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Efficience');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Qualité du travail');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Assiduité');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Comportement');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Initiative');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Organisation');
INSERT INTO [Competences] ([TemplateId], [Name]) VALUES (2, 'Contrôle');

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