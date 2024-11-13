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

CREATE TABLE [Sections] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Sections] PRIMARY KEY ([Id])
);
GO
insert into [Sections] ([Name]) values ('Fiche d''évaluation'),('Archives');

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

