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

CREATE TABLE [Habilitations] (
    [Id] int NOT NULL IDENTITY,
    [Label] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Habilitations] PRIMARY KEY ([Id])
);
GO

INSERT INTO [Sections] ([Name]) 
VALUES
    ('Gestion des habilitations'),
    ('Gestion des utilisateurs'),
    ('Gestion des formulaires d''évaluation'),
    ('Gestion des périodes d''évaluation'),
    ('Gestion des évaluations'),
    ('Gestion des archives');

CREATE TABLE [Users] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Poste] nvarchar(max) NULL,
    [Department] nvarchar(max) NULL,
    [SuperiorId] nvarchar(max) NULL,
    [SuperiorName] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    [TypeUser] int NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [HabilitationAdmins] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [SectionId] int NOT NULL,
    [IsGranted] bit NOT NULL,
    CONSTRAINT [PK_HabilitationAdmins] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_HabilitationAdmins_Sections_SectionId] FOREIGN KEY ([SectionId]) REFERENCES [Sections] ([Id]) ON DELETE CASCADE
);
GO

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


CREATE TABLE [UserHabilitations] (
    [HabilitationsId] int NOT NULL,
    [UsersId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_UserHabilitations] PRIMARY KEY ([HabilitationsId], [UsersId]),
    CONSTRAINT [FK_UserHabilitations_Habilitations_HabilitationsId] FOREIGN KEY ([HabilitationsId]) REFERENCES [Habilitations] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserHabilitations_Users_UsersId] FOREIGN KEY ([UsersId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [HabilitationHabilitationAdmin] (
    [HabilitationAdminsId] int NOT NULL,
    [HabilitationsId] int NOT NULL,
    CONSTRAINT [PK_HabilitationHabilitationAdmin] PRIMARY KEY ([HabilitationAdminsId], [HabilitationsId]),
    CONSTRAINT [FK_HabilitationHabilitationAdmin_HabilitationAdmins_HabilitationAdminsId] FOREIGN KEY ([HabilitationAdminsId]) REFERENCES [HabilitationAdmins] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_HabilitationHabilitationAdmin_Habilitations_HabilitationsId] FOREIGN KEY ([HabilitationsId]) REFERENCES [Habilitations] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_HabilitationAdmins_SectionId] ON [HabilitationAdmins] ([SectionId]);
GO

CREATE INDEX [IX_HabilitationHabilitationAdmin_HabilitationsId] ON [HabilitationHabilitationAdmin] ([HabilitationsId]);
GO

CREATE INDEX [IX_UserHabilitations_UsersId] ON [UserHabilitations] ([UsersId]);
GO

CREATE UNIQUE INDEX [IX_Users_Id] ON [Users] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20241108044825_InitialCreate', N'8.0.10');
GO

COMMIT;
GO

