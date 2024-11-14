CREATE DATABASE evaluation;

select * from users;
select * from HabilitationAdmins;
update HabilitationAdmins set Name='Créer une nouvelle période d''évaluation';
insert into FormTemplates(Name,CreationDate,type) values ('Evaluation 2022 cadre', GETDATE(),0);


SET IDENTITY_INSERT HabilitationAdmins OFF;

drop database evaluation;

CREATE TABLE FormTemplates (
	template_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	name NVARCHAR(255) NOT NULL,
	creation_date DATE NOT NULL,
	type 
);

CREATE TABLE TemplateStrategicPriorities (
	template_priority_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	template_id INT NOT NULL,  
	name NVARCHAR(255) NOT NULL,
	max_objectives INT DEFAULT 4,
	FOREIGN KEY (template_id) REFERENCES FormTemplates(template_id)
);

-- INSERT INTO TemplateStrategicPriorities (TemplateId, Name, MaxObjectives)
-- VALUES (1, 'Robustesse op�rationnelle', 4),
-- 	(1, 'Performance financi�re', 4),
-- 	(1, 'Responsabilit� soci�tale d''entreprise', 4);

CREATE TABLE Etats(
	EtatId INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	EtatDesignation NVARCHAR(255) NOT NULL,  
);
insert into Etats(EtatDesignation) values ('Créer');

CREATE TABLE Evaluations (
	eval_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	template_id INT NOT NULL,  
	eval_annee INT NOT NULL,
	fixation_objectif DATE NOT NULL,
	mi_parcours DATE NOT NULL,
	final DATE NOT NULL,
	etat_id INT NOT NULL,
	titre NVARCHAR(255) NOT NULL,
	FOREIGN KEY (template_id) REFERENCES FormTemplates(template_id),
	FOREIGN KEY (etat_id) REFERENCES Etat_eval(etat_id)
);

CREATE TABLE UserEvaluations (
	user_eval_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	eval_id INT NOT NULL, 
	user_id INT NOT NULL, 
	FOREIGN KEY (eval_id) REFERENCES Evaluations(eval_id),
	FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE UserObjectives (
	objective_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	user_eval_id INT NOT NULL, 
	priority_id INT NOT NULL,
	description NVARCHAR(255) NOT NULL,
	weighting DECIMAL(5,2) NOT NULL, 
	result_indicator NVARCHAR(255), 
	result DECIMAL(5,2) DEFAULT 0, 
	FOREIGN KEY (user_eval_id) REFEREN
	CES UserEvaluations(user_eval_id),
	FOREIGN KEY (priority_id) REFERENCES TemplateStrategicPriorities(template_priority_id)
);

CREATE TABLE ObjectiveColumns (
	column_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	name NVARCHAR(255) NOT NULL,  
	is_active BIT DEFAULT 1  
);

CREATE TABLE ObjectiveColumnValues (
	value_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	objective_id INT NOT NULL,
	column_id INT NOT NULL,
	value NVARCHAR(255), 
	FOREIGN KEY (objective_id) REFERENCES UserObjectives(objective_id),
	FOREIGN KEY (column_id) REFERENCES ObjectiveColumns(column_id)
);

CREATE TABLE HistoryCFo (
	hcf_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	user_eval_id INT NOT NULL,
	priority_name NVARCHAR(255) NOT NULL,
	description NVARCHAR(255) NOT NULL,  
	weighting DECIMAL(5,2) NOT NULL, 
	created_at DATE NOT NULL DEFAULT GETDATE(), 
	FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE HistoryCMp (
	hcm_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	user_eval_id INT NOT NULL,
	priority_name NVARCHAR(255) NOT NULL,
	description NVARCHAR(255) NOT NULL,
	weighting DECIMAL(5,2) NOT NULL,
	result_indicator NVARCHAR(255),
	result DECIMAL(5,2) DEFAULT 0,
	updated_at DATE NOT NULL DEFAULT GETDATE(),
	FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE HistoryObjectiveColumnValuesFo (
    hist_value_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    hcf_id INT NOT NULL,
    column_name NVARCHAR(255) NOT NULL,
    value NVARCHAR(255),
    created_at DATE NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (hcf_id) REFERENCES HistoryCFo(hcf_id)
);

CREATE TABLE HistoryObjectiveColumnValuesMp (
    hist_value_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    hcm_id INT NOT NULL,
    column_name NVARCHAR(255) NOT NULL,
    value NVARCHAR(255),
    created_at DATE NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (hcm_id) REFERENCES HistoryCMp(hcm_id)
);



-- https://www.typeform.com/templates/t/branding-questionnaire/

CREATE TABLE Competences (
    competence_id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (template_id) REFERENCES FormTemplates(template_id)
);

CREATE TABLE Level (
    level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL 
);

CREATE TABLE CompetenceLevels (
    competence_level_id INT PRIMARY KEY AUTO_INCREMENT,
    competence_id INT NOT NULL,
    level_id INT NOT NULL, 
    description TEXT,
    FOREIGN KEY (competence_id) REFERENCES Competences(competence_id),
    FOREIGN KEY (level_id) REFERENCES Level(level_id)
);
 
CREATE TABLE UserCompetences (
    user_competence_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    competence_id INT NOT NULL,
    performance DECIMAL(5,2),
    FOREIGN KEY (competence_id) REFERENCES Competences(competence_id),
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE HistoryUserCompetencesFO (
    history_user_competence_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    competence_name INT NOT NULL,
    performance DECIMAL(5,2),
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE HistoryUserCompetencesMP (
    history_user_competence_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    competence_name INT NOT NULL,
    performance DECIMAL(5,2),
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE Indicators (
    indicator_id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    template_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,  
    max_indicator INT DEFAULT 3,
    FOREIGN KEY (template_id) REFERENCES FormTemplates(template_id)
);

CREATE TABLE UserIndicators (
    user_indicator_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    indicator_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id),
    FOREIGN KEY (indicator_id) REFERENCES Indicators(indicator_id)
);

CREATE TABLE UserIndicatorResults (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    user_indicator_id INT NOT NULL,
    result_text TEXT,
    result DECIMAL(5,2),
    FOREIGN KEY (user_indicator_id) REFERENCES UserIndicators(user_indicator_id)
);

CREATE TABLE HistoryUserIndicatorsFO (
    history_user_indicatorFO_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
	result_text TEXT,
	result DECIMAL(5,2),
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE HistoryUserIndicatorsMP (
    history_user_indicatorMP_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
	result_text TEXT,
	result DECIMAL(5,2),
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id)
);

CREATE TABLE Helps (
    help_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE UserHelpContent (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    user_eval_id INT NOT NULL, 
    help_id INT NOT NULL,  
    role_id INT NOT NULL,   
    content TEXT,
    FOREIGN KEY (user_eval_id) REFERENCES UserEvaluations(user_eval_id),
    FOREIGN KEY (help_id) REFERENCES Helps(help_id),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);


insert into sections(Name) values ('Fiche d''évaluation');