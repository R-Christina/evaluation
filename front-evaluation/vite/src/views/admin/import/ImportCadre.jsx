import React, { useState, useCallback } from 'react';
import { formulaireInstance } from '../../../axiosConfig';

// Material-UI components
import {
    Grid,
    Typography,
    Button,
    Box,
    Alert,
} from '@mui/material';

// React Dropzone
import { useDropzone } from 'react-dropzone';

function ImportCadre() {
    const [evaluationFile, setEvaluationFile] = useState(null);
    const [fixationFile, setFixationFile] = useState(null);
    const [miParcoursFile, setMiParcoursFile] = useState(null);
    const [finaleFile, setFinaleFile] = useState(null);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success'); // 'success' ou 'error'
    const [isSubmitted, setIsSubmitted] = useState(false); // Nouvel état pour suivre la soumission

    // Composant Dropzone avec indication de validation conditionnelle
    const FileDropzone = ({ label, file, setFile, isRequired }) => {
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
                    transition: 'background-color 0.3s, border 0.3s',
                    height: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <input {...getInputProps()} />
                <Typography variant="subtitle1">
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitted(true); // Marquer que l'utilisateur a tenté de soumettre

        // Vérification des fichiers
        if (!evaluationFile || !fixationFile || !miParcoursFile || !finaleFile) {
            setMessage('Tous les fichiers sont requis. Veuillez les fournir avant de valider.');
            setSeverity('error');
            return;
        }

        const formData = new FormData();
        formData.append('EvaluationFile', evaluationFile);
        formData.append('FixationFile', fixationFile);
        formData.append('MiParcoursFile', miParcoursFile);
        formData.append('FinaleFile', finaleFile);

        try {
            const response = await formulaireInstance.post('/Import/import-evaluation', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setMessage('Données importées avec succès.');
                setSeverity('success');
                // Réinitialiser les fichiers si nécessaire
                setEvaluationFile(null);
                setFixationFile(null);
                setMiParcoursFile(null);
                setFinaleFile(null);
                setIsSubmitted(false); // Réinitialiser l'état de soumission
            } else {
                setMessage(`Erreur : ${response.statusText}`);
                setSeverity('error');
            }
        } catch (error) {
            setMessage(`Erreur : ${error.response?.data || error.message}`);
            setSeverity('error');
        }
    };

    return (
        <Box sx={{ mx: 'auto',padding: '20px' }}>
            
            <Typography variant="h5" gutterBottom>
                Cadre
            </Typography>

            {/* Message de Retour */}
            {message && (
                <Grid item xs={12} sx={{mt:2, mb: 2}}>
                    <Alert severity={severity}>{message}</Alert>
                </Grid>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* Fichier d'Évaluation */}
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier d'Évaluation"
                            file={evaluationFile}
                            setFile={setEvaluationFile}
                            isRequired={true}
                        />
                    </Grid>
                    {/* Fichier de Fixation */}
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier de Fixation des objectifs"
                            file={fixationFile}
                            setFile={setFixationFile}
                            isRequired={true}
                        />
                    </Grid>
                    {/* Fichier Mi-Parcours */}
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier Mi-Parcours"
                            file={miParcoursFile}
                            setFile={setMiParcoursFile}
                            isRequired={true}
                        />
                    </Grid>
                    {/* Fichier Final */}
                    <Grid item xs={12} sm={6}>
                        <FileDropzone
                            label="Fichier d'évaluation Final"
                            file={finaleFile}
                            setFile={setFinaleFile}
                            isRequired={true}
                        />
                    </Grid>
                    {/* Bouton de Soumission */}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                        >
                            Importer les Fichiers
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}

export default ImportCadre;
