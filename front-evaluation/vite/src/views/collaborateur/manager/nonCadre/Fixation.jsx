import { Alert, Box, Button, CircularProgress, Grid, Paper, TextField, Typography, IconButton } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { formulaireInstance } from '../../../../axiosConfig';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const FixationNonCadre = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const managerId = user.id;

  const { subordinateId, typeUser } = useParams();
  const [indicators, setIndicators] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);
  const [helps, setHelps] = useState([]);

  const [formValidated, setFormValidated] = useState(null);
  //fixation Valider
  const [isFixationvalidate, setIsFixationvalidate] = useState(null);

  const fetchHelps = async () => {
    const response = await formulaireInstance.get('/Archive/HelpsByAllowedUserLevel/2');
    setHelps(response.data);
  };

  // Récupération des indicateurs utilisateur
  // const fetchIndicators = async () => {
  //   try {
  //     const response = await formulaireInstance.get(`/Evaluation/IndicatorValidateByUser`, {
  //       params: { userId: subordinateId, type: typeUser },
  //     });
  
  //     // Mappez les indicateurs pour inclure les résultats existants
  //     const indicatorsWithResults = response.data.map((indicator) => ({
  //       ...indicator,
  //       results: indicator.results && indicator.results.length > 0
  //         ? indicator.results // Utiliser les résultats existants si disponibles
  //         : Array.from({ length: indicator.maxResults || 1 }).map(() => ({
  //             resultText: '',
  //             result: 0,
  //           })), // Sinon, initialiser avec des valeurs par défaut
  //     }));
  
  //     // Vérifiez si au moins un indicateur a un `resultText` non vide
  //     const hasNonEmptyResultText = indicatorsWithResults.some((indicator) =>
  //       indicator.results.some((result) => result.resultText && result.resultText.trim().length > 0)
  //     );
  
  //     if (hasNonEmptyResultText) {
  //       setIsFixationvalidate(true); //deja valider
  //     } else {
  //       setIsFixationvalidate(false); //pas encore valider
  //     }
  
  //     setIndicators(indicatorsWithResults);
  //   } catch (err) {
  //     console.error('Erreur lors du chargement des indicateurs:', err);
  //     setError(err.response?.data?.message || err.message || 'Erreur inconnue.');
  //   }
  // };
  const fetchIndicatorsAndCompetences = async () => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/IndicatorValidateByUser`, {
        params: { userId: subordinateId, type: typeUser },
      });
  
      const competencesData = Array.isArray(response.data?.competences) ? response.data.competences : [];
      const indicatorsData = Array.isArray(response.data?.indicators) ? response.data.indicators : [];

      // Extraction des compétences
      const competencesWithPerformance = competencesData.map((competence) => ({
        competenceId: competence.historyUserCompetenceId,
        name: competence.competenceName,
        performance: competence.performance,
      }));
  
      // Extraction des indicateurs avec résultats existants ou valeurs par défaut
      const indicatorsWithResults = indicatorsData.map((indicator) => ({
        indicatorId: indicator.historyUserIndicatorMPId,
        name: indicator.name,
        results: [
          {
            resultText: indicator.resultText || '',
            result: indicator.result || 0,
          },
        ],
      }));
  
      // Vérification si au moins un indicateur ou une compétence a des valeurs remplies
      const hasNonEmptyResultText = indicatorsWithResults.some((indicator) =>
        indicator.results.some((result) => result.resultText && result.resultText.trim().length > 0),
      );
  
      const hasNonEmptyCompetencePerformance = competencesWithPerformance.some(
        (competence) => competence.performance > 0,
      );
  
      if (hasNonEmptyResultText || hasNonEmptyCompetencePerformance) {
        setIsFixationvalidate(true); // Déjà validé
      } else {
        setIsFixationvalidate(false); // Pas encore validé
      }
  
      setIndicators(indicatorsWithResults);
      setCompetences(competencesWithPerformance);
    } catch (err) {
      console.error('Erreur lors du chargement des indicateurs et compétences:', err);
      setError(err.response?.data?.message || err.message || 'Erreur inconnue.');
    }
  };  


  // Récupération du TemplateId et du FormTemplate
  const fetchTemplateData = async () => {
    const response = await formulaireInstance.get('/Template/NonCadreTemplate');
    const { templateId } = response.data;
    setTemplateId(templateId);

    // Récupérer les détails du template si l'évaluation existe
    const evaluationResponse = await formulaireInstance.get(`/Evaluation/enCours/${typeUser}`);
    const evalId = evaluationResponse.data;

    if (evalId) {
      const detailedResponse = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
      setFormTemplate(detailedResponse.data);

      setEvaluationId(evalId);

      // Récupération de la période actuelle
      const periodResponse = await formulaireInstance.get('/Periode/periodeActel', {
        params: { type: 'NonCadre' }
      });
      if (periodResponse.data.length > 0) {
        setCurrentPeriod(periodResponse.data[0].currentPeriod);
      }
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchTemplateData();
        await fetchIndicatorsAndCompetences();
        await fetchHelps();
        setError(null);
      } catch (err) {
        console.error('Erreur complète:', err);
        const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [subordinateId, typeUser]);

  // useEffect(() => {
  //   if (evaluationId && currentPeriod === 'Fixation Objectif') {
  //     const checkFormValidation = async () => {
  //       try {
  //         const response = await formulaireInstance.get(`/Archive/historyNonCadre/${subordinateId}/${evaluationId}/${currentPeriod}`);

  //         if (response.status === 200 && response.data) {
  //           setFormValidated(true);
  //         } else {
  //           setFormValidated(false);
  //         }
  //       } catch (err) {
  //         if (err.response?.status === 404) {
  //           setFormValidated(false);
  //         } else {
  //           setError(err.response?.data?.message || err.message || 'Erreur inconnue.');
  //         }
  //       }
  //     };
  //     checkFormValidation();
  //   }
  // }, [evaluationId, currentPeriod, subordinateId]);

  useEffect(() => {
    if (evaluationId && currentPeriod === 'Mi-Parcours') {
      const checkFormValidation = async () => {
        try {
          const response = await formulaireInstance.get('/Evaluation/IsResultValidateByManager', {
            params: { userId: subordinateId, type: typeUser }
          });

          // Vérifie si Competences et IndicatorResults sont null
          if (response.data?.Competences === null && response.data?.IndicatorResults === null) {
            setFormValidated(false); // Déjà validé
          } else {
            setFormValidated(true); // Pas encore validé
          }
        } catch (err) {
          console.error('Erreur lors de la vérification des validations :', err);
          const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
          setError(message);
        }
      };

      checkFormValidation();
    }
  }, [evaluationId, currentPeriod, subordinateId, typeUser]);

  // Fonction pour valider les objectifs
  const handleValidateObjectives = async () => {
    try {
      let payload = {};
      let url = '';
      let params = {};

      if (currentPeriod === 'Fixation Objectif') {
        // URL pour Fixation Objectif
        url = '/Evaluation/ValidateIndicatorHistory';

        // Payload pour Fixation Objectif
        payload = indicators.map((indicator) => ({
          IndicatorId: indicator.indicatorId,
          IndicatorName: indicator.name || '',
          results: indicator.results.map((result) => ({
            resultText: result.resultText || '',
            result: result.result || 0
          }))
        }));

        // Params pour Fixation Objectif
        params = {
          userId: subordinateId,
          validateUserId: managerId,
          type: typeUser
        };
      } else if (currentPeriod === 'Mi-Parcours') {
        // URL pour Mi-Parcours
        url = '/Evaluation/ValidateResultManager';

        // Payload pour Mi-Parcours
        payload = {
          Competences:
            formTemplate?.competences?.map((competence) => ({
              CompetenceId: competence.competenceId,
              Performance: competence.performance || 0
            })) || [],
          Indicators: indicators.map((indicator) => ({
            IndicatorId: indicator.indicatorId,
            IndicatorName: indicator.name || '',
            Results: indicator.results.map((r) => ({
              ResultText: r.resultText || 'N/A',
              Result: r.result || 0
            }))
          }))
        };
        console.log('Payload Mi-Parcours:', payload);

        // Params pour Mi-Parcours
        params = {
          userId: subordinateId,
          type: typeUser
        };
      } else {
        alert('Type de validation invalide.');
        return;
      }

      // Appel API avec les données appropriées
      const response = await formulaireInstance.post(url, payload, { params });

      alert(`Validation réussie`);
    } catch (err) {
      console.error('Erreur complète:', err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    }
  };

  const handleNext = () => {
    if (currentIndex < (formTemplate?.competences?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const currentCompetence = formTemplate?.competences?.[currentIndex];

  const handleCompetencePerformanceChange = (competenceId, newValue) => {
    const updatedCompetences = [...formTemplate.competences];
    const competenceIndex = updatedCompetences.findIndex((c) => c.competenceId === competenceId);
    if (competenceIndex >= 0) {
      updatedCompetences[competenceIndex].performance = parseFloat(newValue) || 0;
      setFormTemplate({ ...formTemplate, competences: updatedCompetences });
    }
  };

  const handleIndicatorResultUpdate = (indicatorIndex, resultIndex, field, value) => {
    const updatedIndicators = [...indicators];

    if (!updatedIndicators[indicatorIndex].results) {
      updatedIndicators[indicatorIndex].results = [];
    }

    updatedIndicators[indicatorIndex].results[resultIndex] = {
      ...(updatedIndicators[indicatorIndex].results[resultIndex] || {}),
      [field]: field === 'result' ? parseFloat(value) || 0 : value // Conversion pour `result`
    };

    setIndicators(updatedIndicators);
  };

  const handleSaveHelps = async () => {
    try {
      const payload = helps.map((help) => ({
        UserId: subordinateId,
        WriterUserId: managerId,
        Type: typeUser,
        HelpId: help.helpId,
        Content: help.content || '' // Assurez-vous que `content` est bien défini
      }));
      console.log(payload);

      await formulaireInstance.post('/Evaluation/InsertHelpContentsAndArchive', payload);
      alert('Les aides ont été sauvegardées avec succès !');
    } catch (err) {
      console.error('Erreur complète:', err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    }
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Évaluation des collaborateurs directs</Typography>
            <Typography variant="h3">{currentPeriod || 'Non définie'}</Typography>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : indicators.length > 0 ? (
          <>
            {currentPeriod === 'Fixation Objectif' &&
              (isFixationvalidate ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Vous avez déjà validé le formulaire pour cet période.
                </Alert>
              ) : (
                <>
                  <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                    <Box>
                      <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
                        Indicateurs Métiers
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 4 }}>
                        {indicators.map((indicator, index) => (
                          <Box key={indicator.userIndicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}>
                            {/* Nom de l'indicateur */}
                            <TextField
                              label={indicator.indicatorLabel || "Nom de l'indicateur"}
                              variant="outlined"
                              fullWidth
                              multiline
                              rows={3}
                              value={indicator.name || ''}
                              onChange={(e) => {
                                const updatedIndicators = [...indicators];
                                updatedIndicators[index].name = e.target.value;
                                setIndicators(updatedIndicators);
                              }}
                              sx={{ mb: 2 }}
                            />

                            {/* Résultats et pourcentages */}
                            {indicator.results.map((result, resultIndex) => (
                              <Grid container spacing={2} key={resultIndex} sx={{ mb: 2 }}>
                                <Grid item xs={8}>
                                  <TextField
                                    label={`Résultat Attendu ${resultIndex + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={result.resultText || ''}
                                    onChange={(e) => handleIndicatorResultUpdate(index, resultIndex, 'resultText', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={4}>
                                  {currentPeriod === 'Fixation Objectif' && (
                                    <Typography variant="caption" sx={{ color: 'gray', mt: -1 }}>
                                      <span style={{ color: 'red' }}>* </span>
                                      Non modifiable pendant cette période
                                    </Typography>
                                  )}
                                  <TextField
                                    label="Pourcentage"
                                    variant="outlined"
                                    type="number"
                                    fullWidth
                                    value={result.result || ''}
                                    onChange={(e) => {
                                      let value = e.target.value;
                                      if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                      value = value.replace(',', '.');
                                      handleIndicatorResultUpdate(index, resultIndex, 'result', value);
                                    }}
                                    InputProps={{
                                      endAdornment: <Typography>%</Typography>
                                    }}
                                    disabled={currentPeriod === 'Fixation Objectif'}
                                  />
                                </Grid>
                              </Grid>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="center" mt={4}>
                      <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                        Valider les Objectifs
                      </Button>
                    </Box>
                  </MainCard>
                </>
              ))}

            {currentPeriod === 'Mi-Parcours' && (
              <>
              {formValidated ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Vous avez déjà validé le formulaire pour cet période.
                </Alert>
              ) : (
                <>
                <MainCard
                  maxWidth="md"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: 4,
                    pb: 4,
                    mt: 3,
                    backgroundColor: '#E8EAF6',
                    p: 2
                  }}
                >
                  <AnimatePresence mode="wait">
                    {currentCompetence && (
                      <motion.div
                        key={currentCompetence.competenceId}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3949AB', mb: 3 }}>
                          {currentCompetence.name}
                        </Typography>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 3,
                            mb: 4
                          }}
                        >
                          {formTemplate.levels.map((level) => {
                            const competenceLevel = currentCompetence.levels?.find((cl) => cl.levelId === level.levelId);
                            return (
                              <Box
                                key={level.levelId}
                                sx={{
                                  p: 3,
                                  borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E5E7EB',
                                  textAlign: 'left',
                                  transition: 'background-color 0.3s ease',
                                  '&:hover': { backgroundColor: '#F0F4F8' }
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#3949AB' }}>
                                  Niveau : {level.levelName}%
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                  {competenceLevel ? competenceLevel.description : 'Description non disponible'}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>

                        <TextField
                          label="Performance en %"
                          variant="outlined"
                          type="number"
                          value={currentCompetence?.performance || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleCompetencePerformanceChange(currentCompetence.competenceId, value);
                          }}
                          fullWidth
                          sx={{ mb: 3 }}
                          InputProps={{
                            endAdornment: <Typography>%</Typography>
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, width: '100%', mt: 4 }}>
                    <IconButton onClick={handleBack} disabled={currentIndex === 0} sx={{ color: 'success.main' }}>
                      <KeyboardArrowLeft />
                    </IconButton>
                    <Typography variant="body2">
                      {currentIndex + 1} / {formTemplate?.competences?.length || 0}
                    </Typography>
                    <IconButton
                      onClick={handleNext}
                      disabled={currentIndex === (formTemplate?.competences?.length || 0) - 1}
                      sx={{ color: 'success.main' }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </MainCard>

                <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
                      Indicateurs Métiers
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 4 }}>
                      {indicators.map((indicator, index) => (
                        <Box key={indicator.userIndicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}>
                          {/* Nom de l'indicateur */}
                          <TextField
                            label={indicator.indicatorLabel || "Nom de l'indicateur"}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={indicator.name || ''}
                            onChange={(e) => {
                              const updatedIndicators = [...indicators];
                              updatedIndicators[index].name = e.target.value;
                              setIndicators(updatedIndicators);
                            }}
                            sx={{ mb: 2 }}
                          />

                          {/* Résultats et pourcentages */}
                          {indicator.results.map((result, resultIndex) => (
                            <Grid container spacing={2} key={resultIndex} sx={{ mb: 2 }}>
                              <Grid item xs={8}>
                                <TextField
                                  label={`Résultat Attendu ${resultIndex + 1}`}
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={result.resultText || ''}
                                  onChange={(e) => handleIndicatorResultUpdate(index, resultIndex, 'resultText', e.target.value)}
                                  disabled={currentPeriod === 'Fixation Objectif'}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Pourcentage"
                                  variant="outlined"
                                  type="number"
                                  fullWidth
                                  value={result.result || ''}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                    value = value.replace(',', '.');
                                    handleIndicatorResultUpdate(index, resultIndex, 'result', value);
                                  }}
                                  InputProps={{
                                    endAdornment: <Typography>%</Typography>
                                  }}
                                  disabled={currentPeriod === 'Fixation Objectif'}
                                />
                              </Grid>
                            </Grid>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="center" mt={4}>
                    <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                      Valider les Objectifs
                    </Button>
                  </Box>
                </MainCard>
                </>
              )}
              </>
            )}

            {currentPeriod === 'Évaluation Finale' && helps.length > 0 && (
              <>
              {formValidated ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Vous avez déjà validé le formulaire pour cet période.
                </Alert>
              ) : (
                <>
                <MainCard
                  maxWidth="md"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: 4,
                    pb: 4,
                    mt: 3,
                    backgroundColor: '#E8EAF6',
                    p: 2
                  }}
                >
                  <AnimatePresence mode="wait">
                    {currentCompetence && (
                      <motion.div
                        key={currentCompetence.competenceId}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3949AB', mb: 3 }}>
                          {currentCompetence.name}
                        </Typography>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 3,
                            mb: 4
                          }}
                        >
                          {formTemplate.levels.map((level) => {
                            const competenceLevel = currentCompetence.levels?.find((cl) => cl.levelId === level.levelId);
                            return (
                              <Box
                                key={level.levelId}
                                sx={{
                                  p: 3,
                                  borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E5E7EB',
                                  textAlign: 'left',
                                  transition: 'background-color 0.3s ease',
                                  '&:hover': { backgroundColor: '#F0F4F8' }
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#3949AB' }}>
                                  Niveau : {level.levelName}%
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                  {competenceLevel ? competenceLevel.description : 'Description non disponible'}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>

                        <TextField
                          label="Performance en %"
                          variant="outlined"
                          type="number"
                          value={currentCompetence?.performance || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleCompetencePerformanceChange(currentCompetence.competenceId, value);
                          }}
                          fullWidth
                          sx={{ mb: 3 }}
                          InputProps={{
                            endAdornment: <Typography>%</Typography>
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, width: '100%', mt: 4 }}>
                    <IconButton onClick={handleBack} disabled={currentIndex === 0} sx={{ color: 'success.main' }}>
                      <KeyboardArrowLeft />
                    </IconButton>
                    <Typography variant="body2">
                      {currentIndex + 1} / {formTemplate?.competences?.length || 0}
                    </Typography>
                    <IconButton
                      onClick={handleNext}
                      disabled={currentIndex === (formTemplate?.competences?.length || 0) - 1}
                      sx={{ color: 'success.main' }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </MainCard>

                <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
                      Indicateurs Métiers
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 4 }}>
                      {indicators.map((indicator, index) => (
                        <Box key={indicator.userIndicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}>
                          {/* Nom de l'indicateur */}
                          <TextField
                            label={indicator.indicatorLabel || "Nom de l'indicateur"}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={indicator.name || ''}
                            onChange={(e) => {
                              const updatedIndicators = [...indicators];
                              updatedIndicators[index].name = e.target.value;
                              setIndicators(updatedIndicators);
                            }}
                            sx={{ mb: 2 }}
                          />

                          {/* Résultats et pourcentages */}
                          {indicator.results.map((result, resultIndex) => (
                            <Grid container spacing={2} key={resultIndex} sx={{ mb: 2 }}>
                              <Grid item xs={8}>
                                <TextField
                                  label={`Résultat Attendu ${resultIndex + 1}`}
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={result.resultText || ''}
                                  onChange={(e) => handleIndicatorResultUpdate(index, resultIndex, 'resultText', e.target.value)}
                                  disabled={currentPeriod === 'Fixation Objectif'}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Pourcentage"
                                  variant="outlined"
                                  type="number"
                                  fullWidth
                                  value={result.result || ''}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                    value = value.replace(',', '.');
                                    handleIndicatorResultUpdate(index, resultIndex, 'result', value);
                                  }}
                                  InputProps={{
                                    endAdornment: <Typography>%</Typography>
                                  }}
                                  disabled={currentPeriod === 'Fixation Objectif'}
                                />
                              </Grid>
                            </Grid>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="center" mt={4}>
                    <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                      Valider les Objectifs
                    </Button>
                  </Box>
                </MainCard>
                </>
              )}

              <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8F5E9' }}>
                <Typography variant="h5" sx={{ color: '#2E7D32', mb: 2 }}>
                  Aides Disponibles
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {helps.map((help, index) => (
                    <Box key={help.HelpId} sx={{ border: '1px solid #C8E6C9', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                        {help.name}
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
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
                    onClick={handleSaveHelps}
                    disabled={helps.some((help) => !help.content || help.content.trim() === '')} // Désactiver si un champ est vide
                  >
                    Valider
                  </Button>
                </Box>
              </MainCard>
              </>
            )}
          </>
        ) : (
          <Alert severity="info">Aucun indicateur utilisateur trouvé.</Alert>
        )}
      </MainCard>
    </Paper>
  );
};

export default FixationNonCadre;
