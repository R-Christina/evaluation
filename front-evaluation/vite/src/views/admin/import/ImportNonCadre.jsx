import React, { useState, useCallback } from 'react';
import { formulaireInstance } from '../../../axiosConfig';
import { Grid, Typography, Button, Box, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const FileDropzone = ({ label, file, setFile, isRequired, isSubmitted }) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            setFile(acceptedFiles[0]);
        },
        [setFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
        },
    });

    const showError = isRequired && isSubmitted && !file;

    return (
        <Box
            {...getRootProps()}
            sx={{
                border: showError ? '2px dashed red' : '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
                transition: 'background-color 0.3s',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
            }}
        >
            <input {...getInputProps()} />
            <Typography variant="subtitle1" gutterBottom>
                {label}
            </Typography>
            <Typography variant="body2" color="textSecondary">
                {file ? file.name : 'Glissez-déposez un fichier ici ou cliquez'}
            </Typography>
            {showError && (
                <Typography variant="caption" color="error">
                    Ce fichier est requis.
                </Typography>
            )}
        </Box>
    );
};

const ImportNonCadre = () => {
    const [evaluationFile, setEvaluationFile] = useState(null);
    const [fixationFile, setFixationFile] = useState(null);
    const [miParcoursIndicatorsFile, setMiParcoursIndicatorsFile] = useState(null);
    const [miParcoursCompetenceFile, setMiParcoursCompetenceFile] = useState(null);
    const [finaleFile, setFinaleFile] = useState(null);
    const [helpFile, setHelpFile] = useState(null);
    const [userHelpContentFile, setUserHelpContentFile] = useState(null);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitted(true);

        if (
            !evaluationFile ||
            !fixationFile ||
            !miParcoursIndicatorsFile ||
            !miParcoursCompetenceFile ||
            !finaleFile ||
            !helpFile ||
            !userHelpContentFile
        ) {
            setMessage('Tous les fichiers sont requis.');
            setSeverity('error');
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        setSeverity('success');

        const formData = new FormData();
        formData.append('EvaluationFile', evaluationFile);
        formData.append('FixationFile', fixationFile);
        formData.append('MiParcoursIndicatorsFile', miParcoursIndicatorsFile);
        formData.append('MiParcoursCompetenceFile', miParcoursCompetenceFile);
        formData.append('FinaleFile', finaleFile);
        formData.append('HelpFile', helpFile);
        formData.append('UserHelpContentFile', userHelpContentFile);

        try {
            const response = await formulaireInstance.post('/NonCadreImport/import-non-cadre-evaluation', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setMessage('Données importées avec succès.');
                setSeverity('success');
                resetFiles();
            } else {
                setMessage(`Erreur : ${response.statusText}`);
                setSeverity('error');
            }
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data
                    ? `Erreur : ${error.response.data}`
                    : 'Une erreur est survenue lors de l\'importation.'
            );
            setSeverity('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetFiles = () => {
        setEvaluationFile(null);
        setFixationFile(null);
        setMiParcoursIndicatorsFile(null);
        setMiParcoursCompetenceFile(null);
        setFinaleFile(null);
        setHelpFile(null);
        setUserHelpContentFile(null);
        setIsSubmitted(false);
    };

    return (
        <Box sx={{ mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Importation des Fichiers Non-Cadres
            </Typography>
            {message && (
                <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                    <Alert severity={severity}>{message}</Alert>
                </Grid>
            )}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier d'Évaluation"
                            file={evaluationFile}
                            setFile={setEvaluationFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier de Fixation des objectifs"
                            file={fixationFile}
                            setFile={setFixationFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier des Indicateurs Mi-Parcours"
                            file={miParcoursIndicatorsFile}
                            setFile={setMiParcoursIndicatorsFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier des Compétences Mi-Parcours"
                            file={miParcoursCompetenceFile}
                            setFile={setMiParcoursCompetenceFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier d'évaluation Finale"
                            file={finaleFile}
                            setFile={setFinaleFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier des Aides"
                            file={helpFile}
                            setFile={setHelpFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier des historiques d'aides"
                            file={userHelpContentFile}
                            setFile={setUserHelpContentFile}
                            isRequired={true}
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Importation en cours...' : 'Importer les Fichiers'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default ImportNonCadre;
