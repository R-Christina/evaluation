import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Paper, Grid, Alert, Button } from '@mui/material';
import { formulaireInstance } from '../../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';

const Remplissage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;
  
  const [formTemplate, setFormTemplate] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [indicatorValues, setIndicatorValues] = useState({});
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [evalId, setEvalId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Nouvel état pour les messages de succès

  // États pour Mi-Parcours
  const [competences, setCompetences] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Récupérer le template initial et les informations d'évaluation en cours
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const templateResponse = await formulaireInstance.get('/Template/NonCadreTemplate');
        const { templateId } = templateResponse.data;
        setTemplateId(templateId);

        const evaluationResponse = await formulaireInstance.get('/Periode/enCours', {
          params: { type: 'NonCadre' }
        });
        setHasOngoingEvaluation(evaluationResponse.data.length > 0);

        if (evaluationResponse.data.length > 0) {
          const firstEvaluation = evaluationResponse.data[0];
          const currentEvalId = firstEvaluation.evalId || firstEvaluation.id || null;
          setEvalId(currentEvalId);

          const detailedTemplateResponse = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
          setFormTemplate(detailedTemplateResponse.data);

          const periodResponse = await formulaireInstance.get('/Periode/periodeActel', {
            params: { type: 'NonCadre' }
          });
          if (periodResponse.data.length > 0) {
            setCurrentPeriod(periodResponse.data[0].currentPeriod);
          }
        }
      } catch (error) {
        setErrorMessage('Erreur lors du chargement des données initiales.');
      }
    };

    fetchInitialData();
  }, []);

  // Récupérer les données Mi-Parcours
  useEffect(() => {
    const fetchMiParcoursData = async () => {
      if (currentPeriod === 'Mi-Parcours' && evalId && userId) {
        setLoading(true);
        setDataError(null);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
          const [competencesResponse, indicatorsResponse] = await Promise.all([
            formulaireInstance.get(`/Evaluation/${evalId}/competences/${userId}`),
            formulaireInstance.get(`/Evaluation/${evalId}/indicators/${userId}`)
          ]);

          setCompetences(Array.isArray(competencesResponse.data) ? competencesResponse.data : []);
          setIndicators(Array.isArray(indicatorsResponse.data) ? indicatorsResponse.data : []);
        } catch (error) {
          const backendErrorMessage = error.response?.data?.Message || 'Erreur lors de la récupération des données Mi-Parcours.';
          setDataError(backendErrorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMiParcoursData();
  }, [currentPeriod, evalId, userId]);

  const handleIndicatorLabelChange = (indicatorId, value) => {
    setIndicatorValues((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        label: value
      }
    }));
  };

  const handleIndicatorChange = (indicatorId, field, value) => {
    setIndicatorValues((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value
      }
    }));
  };

  const handleSubmitFixationObjectif = async () => {
    if (!formTemplate) {
      setErrorMessage('Le formulaire n\'est pas chargé.');
      return;
    }

    const indicatorsToSubmit = formTemplate.indicators.map((indicator) => {
      const indValue = indicatorValues[indicator.indicatorId] || {};
      return {
        indicatorId: indicator.indicatorId,
        indicatorName: indValue.label || indicator.name || 'N/A',
        resultText: 'N/A', // Fixé à "N/A"
        result: 0 // Fixé à 0
      };
    });

    try {
      await formulaireInstance.post('/Evaluation/ValidateIndicator', indicatorsToSubmit, {
        params: {
          userId: userId,
          type: 'NonCadre'
        }
      });
      setSuccessMessage('Indicateurs soumis avec succès pour la période Fixation Objectif.');
      setErrorMessage(null);
    } catch (error) {
      const backendErrorMessage = error.response?.data?.Message || 'Une erreur inconnue est survenue.';
      setErrorMessage(backendErrorMessage);
    }
  };

  // Fonction pour archiver les données Mi-Parcours
  const handleArchiveMiParcours = async () => {
    if (!evalId || !userId) {
      setErrorMessage('Identifiant d\'évaluation ou utilisateur manquant.');
      return;
    }

    setLoading(true);
    setDataError(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await formulaireInstance.post('/Evaluation/ArchiveMiParcoursData', null, {
        params: {
          userId: userId,
          type: 'NonCadre' // ou 'Cadre' selon le contexte
        }
      });

      setSuccessMessage('Données Mi-Parcours archivées avec succès.');
      // Optionnel : Actualiser les données ou rediriger
      // window.location.reload();
    } catch (error) {
      const backendErrorMessage = error.response?.data?.Message || 'Une erreur est survenue lors de l\'archivage.';
      setDataError(backendErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!hasOngoingEvaluation) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        p={20}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h4">Aucune évaluation en cours</Typography>
          <Typography variant="body1">Vous recevrez une notification lors du commencement.</Typography>
        </Alert>
        <Button variant="contained" color="primary" onClick={() => (window.location.href = '/')}>
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  if (!formTemplate) {
    return <Typography>Chargement...</Typography>
  }

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Évaluation des indicateurs</Typography>
            <Typography variant="h3">
              Période : <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {currentPeriod === 'Fixation Objectif' && (
          <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
                Indicateurs Métiers (Objectifs)
              </Typography>
              <Box sx={{ display: 'grid', gap: 4 }}>
                {formTemplate.indicators.map((indicator) => {
                  const indValue = indicatorValues[indicator.indicatorId] || {};
                  return (
                    <Box
                      key={indicator.indicatorId}
                      sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}
                    >
                      <TextField
                        label="Indicateur"
                        variant="outlined"
                        fullWidth
                        multiline
                        minRows={4}
                        value={indValue.label || ''}
                        onChange={(e) => handleIndicatorLabelChange(indicator.indicatorId, e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </MainCard>
        )}

        {currentPeriod === 'Mi-Parcours' && (
          <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#F3E5F5' }}>
            <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
              Évaluation Mi-Parcours
            </Typography>

            {loading ? (
              <Typography>Chargement des données...</Typography>
            ) : dataError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {dataError}
              </Alert>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Compétences
                  </Typography>
                  {competences.length > 0 ? (
                    <Grid container spacing={2}>
                      {competences.map((competence) => (
                        <Grid item xs={12} sm={6} md={4} key={competence.UserCompetenceId}>
                          <Paper sx={{ p: 2, border: '1px solid #E0E0E0' }}>
                            <Typography variant="subtitle1">
                              Compétence ID: {competence.competenceId}
                            </Typography>
                            <Typography variant="body1">
                              Performance: {competence.performance}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>Aucune compétence trouvée.</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Indicateurs
                  </Typography>
                  {indicators.length > 0 ? (
                    indicators.map((indicator) => (
                      <Box key={indicator.indicatorId} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">{indicator.indicatorName}</Typography>
                        {indicator.results && indicator.results.length > 0 ? (
                          <Grid container spacing={1}>
                            {indicator.results.map((result, index) => (
                              <Grid item xs={12} sm={6} key={index}>
                                <Paper sx={{ p: 1, border: '1px solid #E0E0E0' }}>
                                  <Typography variant="body2">
                                    {result.resultText}: {result.result}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2">Aucun résultat disponible.</Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography>Aucun indicateur trouvé.</Typography>
                  )}
                </Box>
              </>
            )}

            {/* Bouton pour archiver les données Mi-Parcours */}
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 3 }}
              onClick={handleArchiveMiParcours}
              disabled={loading}
            >
              Archiver les Données Mi-Parcours
            </Button>
          </MainCard>
        )}

        {currentPeriod === 'Fixation Objectif' && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSubmitFixationObjectif}
          >
            Valider
          </Button>
        )}
      </MainCard>
    </Paper>
  );
};

export default Remplissage;