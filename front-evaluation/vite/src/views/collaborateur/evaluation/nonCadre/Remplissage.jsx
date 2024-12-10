import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Alert,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider
} from '@mui/material';
import { formulaireInstance } from '../../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';
import { motion } from 'framer-motion';

const Remplissage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;
  const userType = user.typeUser;

  const [formTemplate, setFormTemplate] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [indicatorValues, setIndicatorValues] = useState({});
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [evalId, setEvalId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Nouvel état pour suivre si le formulaire a été validé
  const [isValidated, setIsValidated] = useState(false);
  //etat si les desultat sont disponible
  const [isResultDispo, setIsResultDispo] = useState(false);

  // États pour Mi-Parcours
  const [competences, setCompetences] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour Final
  const [helps, setHelps] = useState([]);
  const [loadingEvaluationFinale, setLoadingEvaluationFinale] = useState(false);

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

          await fetchHelps();
        }
      } catch (error) {
        setErrorMessage('Erreur lors du chargement des données initiales.');
      }
    };

    fetchInitialData();
  }, []);

  // Vérifier si l'utilisateur a déjà validé lors de la période 'Fixation Objectif'
  useEffect(() => {
    const checkValidation = async () => {
      if (currentPeriod === 'Fixation Objectif'&& evalId && userId) {
        try {
          const response = await formulaireInstance.get('/Evaluation/IndicatorValidateByUser', {
            params: {
              userId: userId,
              type: userType // 'NonCadre' ou 'Cadre'
            }
          });

          if (response.data != null) {
            // L'utilisateur a déjà validé
            setIsValidated(true);
            setSuccessMessage(response.data.Message);
          } else {
            // L'utilisateur n'a pas encore validé
            setIsValidated(false);
          }
        } catch (error) {
          // Si l'endpoint retourne un 404, cela signifie que l'utilisateur n'a pas encore validé
          if (error.response && error.response.status === 404) {
            setIsValidated(false);
          } else {
            setErrorMessage(error.response?.data?.Message || 'Erreur lors de la vérification de la validation.');
          }
        }
      }
    };

    checkValidation();
  }, [currentPeriod, evalId, userId, userType]);

  // Récupérer les données Mi-Parcours
  useEffect(() => {
    const fetchMiParcoursData = async () => {
      if (currentPeriod === 'Mi-Parcours') {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
          const [competencesResponse, indicatorsResponse] = await Promise.all([
            formulaireInstance.get(`/Evaluation/${evalId}/competences/${userId}`),
            formulaireInstance.get(`/Evaluation/${evalId}/indicators/${userId}`)
          ]);

          // Si les requêtes aboutissent, mettez à jour les états
          const competences = Array.isArray(competencesResponse.data) ? competencesResponse.data : [];
          const indicators = Array.isArray(indicatorsResponse.data) ? indicatorsResponse.data : [];

          setCompetences(competences);
          setIndicators(indicators);

          // Vérifiez si les deux contiennent des données
          if (competences.length > 0 && indicators.length > 0) {
            setIsResultDispo(true);
          } else {
            setIsResultDispo(false);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            setIsResultDispo(false);
          } else {
            // Pour toutes les autres erreurs, affiche le message générique ou celui du backend
            const backendErrorMessage = error.response?.data?.Message || 'Erreur lors de la récupération des données Mi-Parcours.';
            setErrorMessage(backendErrorMessage);
          }
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

  const handleSubmitFixationObjectif = async () => {
    if (!formTemplate) {
      setErrorMessage("Le formulaire n'est pas chargé.");
      return;
    }

    const indicatorsToSubmit = formTemplate.indicators.map((indicator) => {
      const indValue = indicatorValues[indicator.indicatorId] || {};
      return {
        indicatorId: indicator.indicatorId,
        indicatorName: indValue.label || indicator.name || 'N/A',
        results: [
          {
            resultText: 'N/A', // Vous pouvez remplacer 'N/A' par la valeur appropriée si nécessaire
            result: 0 // Vous pouvez remplacer 0 par la valeur appropriée si nécessaire
          }
        ]
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
      setIsValidated(true); // Marquer comme validé après la soumission
    } catch (error) {
      const backendErrorMessage = error.response?.data?.Message || 'Une erreur inconnue est survenue.';
      setErrorMessage(backendErrorMessage);
    }
  };

  useEffect(() => {
    const fetchValidationStatus = async () => {
      setLoading(true);
      try {
        const response = await formulaireInstance.get('/Evaluation/IsResultValidateByUser', {
          params: { userId, type: userType }
        });

        const { competences, indicators } = response.data;
        setCompetences(competences || []);
        setIndicators(indicators || []);

        if (competences.length > 0 || indicators.length > 0) {
          setIsValidated(true);
        } else {
          setIsValidated(false);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.Message || 'Erreur lors de la vérification des résultats.';
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchValidationStatus();
  }, [userId, userType]);

  // Fonction pour archiver les données Mi-Parcours
  const handleArchiveMiParcours = async () => {
    if (!evalId || !userId) {
      setErrorMessage("Identifiant d'évaluation ou utilisateur manquant.");
      return;
    }

    setLoading(true);
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
      setIsValidated(true);
      // Optionnel : Actualiser les données ou rediriger
      // window.location.reload();
    } catch (error) {
      const backendErrorMessage = error.response?.data?.Message || "Une erreur est survenue lors de l'archivage.";
      setErrorMessage(backendErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationFinaleData = async () => {
    setLoadingEvaluationFinale(true); // Indicateur de chargement pour l'Évaluation Finale
    setErrorMessage(null);
    setSuccessMessage(null);
  
    try {
      const indicatorsResponse = await formulaireInstance.get(`/Evaluation/${evalId}/indicators/${userId}`);
  
      const indicators = Array.isArray(indicatorsResponse.data) ? indicatorsResponse.data : [];
  
      setIndicators(indicators);
  
      if (indicators.length > 0) {
        setIsResultDispo(true);
      } else {
        setIsResultDispo(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setIsResultDispo(false);
      } else {
        setErrorMessage(error.response?.data?.Message || 'Erreur lors de la récupération des indicateurs pour l\'évaluation finale.');
      }
    } finally {
      setLoadingEvaluationFinale(false); // Fin du chargement
    }
  };
  
  useEffect(() => {
    if (currentPeriod === 'Évaluation Finale') {
      fetchEvaluationFinaleData();
    }
  }, [currentPeriod, evalId, userId]);  

  const fetchHelps = async () => {
    try {
      const response = await formulaireInstance.get('/Archive/HelpsByAllowedUserLevel/1');
      setHelps(response.data);
      console.log(response.data);
      setErrorMessage(null);
    } catch (error) {
      const backendErrorMessage = error.response?.data?.Message || 'Erreur lors de la récupération des aides.';
      setErrorMessage(backendErrorMessage);
    }
  };

  const handleSaveAndSubmit = async () => {
    // Première opération : Sauvegarder les aides
    try {
      const payloadHelps = helps.map((help) => ({
        UserId: userId,
        WriterUserId: userId,
        Type: userType,
        HelpId: help.helpId,
        Content: help.content || ''
      }));
      console.log('Payload des aides:', payloadHelps);
  
      await formulaireInstance.post('/Evaluation/InsertHelpContentsAndArchive', payloadHelps);
      alert('Les aides ont été sauvegardées avec succès !');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des aides:', err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue lors de la sauvegarde des aides.';
      setError(message);
    }
  
    // Deuxième opération : Soumettre l'évaluation finale
    try {
      if (!indicators || indicators.length === 0) {
        setErrorMessage("Aucun indicateur à soumettre.");
        return;
      }
  
      // Préparer les données à envoyer
      const indicatorsToSubmit = indicators.map((indicator) => ({
        indicatorId: indicator.indicatorId,
        indicatorName: indicator.indicatorName,
        results: indicator.results.map((result) => ({
          resultText: result.resultText || 'N/A', // Utilisation directe de resultText
          result: result.result || 0 
        }))
      }));
      console.log(indicatorsToSubmit);
  
      const response = await formulaireInstance.post('/Evaluation/ValidateIndicatorFiHistory', indicatorsToSubmit, {
        params: {
          userId: userId,
          validateUserId: userId, // Si le validateur est différent, ajustez cette valeur
          type: 'NonCadre' // Assurez-vous que 'Noncadre' correspond à la valeur attendue par votre backend
        }
      });
  
      setSuccessMessage(response.data.Message || "Indicateurs soumis avec succès pour l'Évaluation Finale.");
      setErrorMessage(null);
      setIsValidated(true);
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'évaluation finale:', error);
      const backendErrorMessage = error.response?.data?.message || 'Une erreur inconnue est survenue lors de la soumission.';
      setErrorMessage(backendErrorMessage);
    }
  };

  if (userType !== 'NonCadre') {
    return (
      <Box display="flex" justifyContent="center" p={20}>
        <Alert severity="error">
          <Typography variant="h5">Accès Refusé</Typography>
          <Typography variant="body1">Seuls les utilisateurs Cadre peuvent accéder à cette page.</Typography>
        </Alert>
      </Box>
    );
  }

  if (!hasOngoingEvaluation) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh'
        }}
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <Card
            sx={{
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <CardContent
              sx={{
                padding: 4,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                color: 'text.primary'
              }}
            >
              <Box
                sx={{
                  marginBottom: 3,
                  padding: 2,
                  borderRadius: '12px',
                  backgroundColor: 'primary.lighter',
                  border: '1px solid',
                  borderColor: 'primary.main'
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  Aucune évaluation en cours
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>
                  Vous serez informé dès le commencement d'une nouvelle évaluation.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                  padding: '10px 32px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    );
  }

  if (!formTemplate) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Évaluation des indicateurs</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
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

              {/* Afficher le message si déjà validé */}
              {isValidated ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Vous avez déjà validé ce formulaire.
                </Alert>
              ) : (
                <Box sx={{ display: 'grid', gap: 4 }}>
                  {formTemplate.indicators.map((indicator) => {
                    const indValue = indicatorValues[indicator.indicatorId] || {};
                    return (
                      <Box key={indicator.indicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}>
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
              )}
            </Box>

            {/* Afficher le bouton Valider seulement si non validé */}
            {!isValidated && (
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSubmitFixationObjectif}>
                Valider
              </Button>
            )}
          </MainCard>
        )}

        {currentPeriod === 'Mi-Parcours' && Array.isArray(competences) && Array.isArray(indicators) && (
          <>
            {/* Chargement ou Erreur */}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {/* Message d'information */}
                {!isResultDispo ? (
                  <Alert severity="info" sx={{ mt: 5, mb: 3 }}>
                    Votre manager n'a pas encore validé vos résultats.
                  </Alert>
                ) : isValidated ? (
                  <Alert severity="info" sx={{ mt: 5, mb: 3 }}>
                    Vous avez déjà validé ce formulaire.
                  </Alert>
                ) : (
                  <>
                    {/* Section Compétences */}
                    <Box sx={{ mt: 5 }}>
                      {competences.length > 0 ? (
                        <Box sx={{ flexGrow: 1 }}>
                          <Grid container spacing={2}>
                            {competences.map((competence) => (
                              <Grid item xs={12} sm={6} md={3} key={competence.UserCompetenceId}>
                                <Paper
                                  sx={{
                                    p: 3,
                                    borderRadius: '8px',
                                    backgroundColor: '#E8EAF6',
                                    border: '1px solid rgba(159, 168, 218, 0.75)'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ color: '#555555', mt: 1 }}>
                                    {competence.competenceName}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1C1C1C' }}>
                                    {competence.performance} %
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontStyle: 'italic',
                            color: '#757575'
                          }}
                        >
                          Aucune compétence trouvée.
                        </Typography>
                      )}
                    </Box>

                    {/* Section Indicateurs */}
                    <Card
                      sx={{
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        mt: '20px',
                        p: 2
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          fontFamily: 'Roboto, sans-serif',
                          color: '#333333'
                        }}
                      >
                        Indicateurs
                      </Typography>
                      <Divider sx={{ mb: 2, backgroundColor: '#E0E0E0' }} />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'left'
                                }}
                              >
                                Nom de l'indicateur
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'left'
                                }}
                              >
                                Résultat (Texte)
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'right'
                                }}
                              >
                                Résultat (Valeur)
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {indicators.map((indicator, index) =>
                              indicator.results && indicator.results.length > 0 ? (
                                indicator.results
                                  .filter((result) => result.resultText !== 'N/A')
                                  .map((result, resultIndex, filteredResults) => (
                                    <TableRow key={`${indicator.indicatorId}-${resultIndex}`}>
                                      {resultIndex === 0 && (
                                        <TableCell
                                          rowSpan={filteredResults.length}
                                          sx={{
                                            color: '#555555',
                                            fontWeight: 600,
                                            verticalAlign: 'top',
                                            textAlign: 'left'
                                          }}
                                        >
                                          {indicator.indicatorName}
                                        </TableCell>
                                      )}
                                      <TableCell
                                        sx={{
                                          color: '#555555',
                                          textAlign: 'left'
                                        }}
                                      >
                                        {result.resultText}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: '#555555',
                                          textAlign: 'right'
                                        }}
                                      >
                                        {result.result} %
                                      </TableCell>
                                    </TableRow>
                                  ))
                              ) : (
                                <TableRow key={indicator.indicatorId}>
                                  <TableCell sx={{ color: '#555555', textAlign: 'left' }}>{index + 1}</TableCell>
                                  <TableCell
                                    sx={{
                                      color: '#555555',
                                      fontWeight: 600,
                                      textAlign: 'left'
                                    }}
                                  >
                                    {indicator.indicatorName}
                                  </TableCell>
                                  <TableCell
                                    colSpan={2}
                                    sx={{
                                      color: '#757575',
                                      fontStyle: 'italic',
                                      textAlign: 'center'
                                    }}
                                  >
                                    Aucun résultat disponible.
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>

                    {/* Bouton de validation */}
                    <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleArchiveMiParcours}>
                      Valider
                    </Button>
                  </>
                )}
              </Box>
            )}
          </>
        )}

        {currentPeriod === 'Évaluation Finale' && (
          <>
            <Card
              sx={{
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: 'none',
                mt: '20px',
                p: 2
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontFamily: 'Roboto, sans-serif',
                  color: '#333333'
                }}
              >
                Indicateurs
              </Typography>
              <Divider sx={{ mb: 2, backgroundColor: '#E0E0E0' }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#333333',
                          textAlign: 'left'
                        }}
                      >
                        Nom de l'indicateur
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#333333',
                          textAlign: 'left'
                        }}
                      >
                        Résultat (Texte)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#333333',
                          textAlign: 'right'
                        }}
                      >
                        Résultat (Valeur)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {indicators.map((indicator, index) =>
                      indicator.results && indicator.results.length > 0 ? (
                        indicator.results
                          .filter((result) => result.resultText !== 'N/A')
                          .map((result, resultIndex, filteredResults) => (
                            <TableRow key={`${indicator.indicatorId}-${resultIndex}`}>
                              {resultIndex === 0 && (
                                <TableCell
                                  rowSpan={filteredResults.length}
                                  sx={{
                                    color: '#555555',
                                    fontWeight: 600,
                                    verticalAlign: 'top',
                                    textAlign: 'left'
                                  }}
                                >
                                  {indicator.indicatorName}
                                </TableCell>
                              )}
                              <TableCell
                                sx={{
                                  color: '#555555',
                                  textAlign: 'left'
                                }}
                              >
                                {result.resultText}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: '#555555',
                                  textAlign: 'right'
                                }}
                              >
                                {result.result} %
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow key={indicator.indicatorId}>
                          <TableCell sx={{ color: '#555555', textAlign: 'left' }}>{index + 1}</TableCell>
                          <TableCell
                            sx={{
                              color: '#555555',
                              fontWeight: 600,
                              textAlign: 'left'
                            }}
                          >
                            {indicator.indicatorName}
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            sx={{
                              color: '#757575',
                              fontStyle: 'italic',
                              textAlign: 'center'
                            }}
                          >
                            Aucun résultat disponible.
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8F5E9' }}>
              <Typography variant="h5" sx={{ color: '#2E7D32', mb: 2 }}>
                Aides Disponibles
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {helps.map((help, index) => (
                  <Box key={help.helpId} sx={{ border: '1px solid #C8E6C9', borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                      {help.name}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      multiline
                      minRows={4}
                      value={help.content || ''} // Initialisation si `content` est null/undefined
                      onChange={(e) => {
                        const updatedHelps = [...helps];
                        updatedHelps[index].content = e.target.value;
                        setHelps(updatedHelps); // Met à jour l'état des helps
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveAndSubmit}
                  disabled={helps.some((help) => !help.content || help.content.trim() === '')} // Désactiver si un champ est vide
                >
                  Valider
                </Button>
              </Box>
            </MainCard>
          </>
        )}
      </MainCard>
    </Paper>
  );
};

export default Remplissage;
