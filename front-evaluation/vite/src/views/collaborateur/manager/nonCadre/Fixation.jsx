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

  const [midTermCompetences, setMidTermCompetences] = useState([]);
  const [midTermIndicators, setMidTermIndicators] = useState([]);

  const fetchHelps = async () => {
    const response = await formulaireInstance.get('/Archive/HelpsByAllowedUserLevel/2');
    setHelps(response.data);
  };

  // Récupération des indicateurs utilisateur
  const fetchIndicators = async () => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/IndicatorValidateByUser`, {
        params: { userId: subordinateId, type: typeUser }
      });

      // Mappez les indicateurs pour inclure les résultats existants
      const indicatorsWithResults = response.data.map((indicator) => ({
        ...indicator,
        results:
          indicator.results && indicator.results.length > 0
            ? indicator.results // Utiliser les résultats existants si disponibles
            : Array.from({ length: indicator.maxResults || 1 }).map(() => ({
                resultText: '',
                result: 0
              })) // Sinon, initialiser avec des valeurs par défaut
      }));

      // Vérifiez si au moins un indicateur a un `resultText` non vide
      const hasNonEmptyResultText = indicatorsWithResults.some((indicator) =>
        indicator.results.some((result) => result.resultText && result.resultText.trim().length > 0)
      );

      if (hasNonEmptyResultText) {
        setIsFixationvalidate(true); //deja valider
      } else {
        setIsFixationvalidate(false); //pas encore valider
      }

      setIndicators(indicatorsWithResults);
    } catch (err) {
      console.error('Erreur lors du chargement des indicateurs:', err);
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
        await fetchTemplateData(); // Charge les métadonnées et définit `currentPeriod`
        await fetchHelps(); // Charge les aides disponibles
        setError(null);
      } catch (err) {
        console.error('Erreur complète:', err);
        setError(err.response?.data?.message || err.message || 'Erreur inconnue.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [subordinateId, typeUser]);

  // Charger les indicateurs après avoir défini `currentPeriod`
  useEffect(() => {
    if (currentPeriod === 'Fixation Objectif' || currentPeriod === 'Mi-Parcours') {
      fetchIndicators();
    }
  }, [currentPeriod]);

  useEffect(() => {
    if (evaluationId && currentPeriod === 'Mi-Parcours') {
      const checkFormValidation = async () => {
        try {
          const response = await formulaireInstance.get('/Evaluation/IsResultValidateByManager', {
            params: { userId: subordinateId, type: typeUser }
          });

          // Vérifie si Competences et IndicatorResults sont null
          if (response.data?.competences === null && response.data?.indicatorResults === null) {
            setFormValidated(false); // Pas encore validé
          } else {
            setFormValidated(true); // deja validé
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

      if (currentPeriod === 'Fixation Objectif') {
        setIsFixationvalidate(false); // Déjà validé
      } else if (currentPeriod === 'Mi-Parcours') {
        setFormValidated(true); // Déjà validé
      }

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

  const fetchFinalEvaluationData = async () => {
    try {
      const response = await formulaireInstance.get('/Evaluation/IndicatorValidateByUser', {
        params: { userId: subordinateId, type: typeUser }
      });
      
      console.log('Réponse de IndicatorValidateByUser:', response.data); // Ajoutez ceci
  
      // Vérifiez si la réponse contient des indicateurs
      if (response.data && Array.isArray(response.data)) {
        const indicatorsWithResults = response.data.map((indicator) => ({
          ...indicator,
          // Assurez-vous que chaque résultat a des valeurs par défaut si nécessaire
          results: indicator.results && indicator.results.length > 0
            ? indicator.results
            : Array.from({ length: indicator.maxResults || 1 }).map(() => ({
                resultText: '',
                result: 0,
                resultId: null // Assurez-vous d'avoir un ID unique pour chaque résultat
              }))
        }));
  
        console.log('Indicateurs avec résultats:', indicatorsWithResults); // Ajoutez ceci
  
        // Déterminez si le formulaire est validé
        const hasNonEmptyResultText = indicatorsWithResults.some((indicator) =>
          indicator.results.some((result) => result.resultText && result.resultText.trim().length > 0)
        );
  
        setFormValidated(hasNonEmptyResultText);
        setMidTermIndicators(indicatorsWithResults);
      } else {
        console.log('Aucun indicateur trouvé dans la réponse.'); // Ajoutez ceci
        setMidTermIndicators([]);
        setFormValidated(false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des indicateurs:', err);
      setError(err.response?.data?.message || err.message || 'Erreur inconnue.');
    }
  };

  useEffect(() => {
    if (evaluationId && currentPeriod === 'Évaluation Finale') {
      fetchFinalEvaluationData();
    }
  }, [evaluationId, currentPeriod, subordinateId, typeUser]);  
  

  const handleUpdateAndSave = async () => {
    try {
      // Préparer les deux payloads
      const evaluationPayloads = midTermIndicators.map((indicator) => ({
        userIndicatorId: indicator.userIndicatorId,
        updatedResults: indicator.results.map((result) => ({
          ResultId: result.resultId,
          ResultText: result.resultText,
          Result: result.result
        }))
      }));
      console.log(evaluationPayloads);

      const helpsPayload = helps.map((help) => ({
        UserId: subordinateId,
        WriterUserId: managerId,
        Type: typeUser,
        HelpId: help.helpId,
        Content: help.content || ''
      }));

      // Créer les requêtes
      const updateEvaluationPromises = evaluationPayloads.map((payload) =>
        formulaireInstance.post('/Evaluation/UpdateUserIndicatorResults', payload.updatedResults, {
          params: { userIndicatorId: payload.userIndicatorId }
        })
      );

      const saveHelpsPromise = formulaireInstance.post('/Evaluation/InsertHelpContentsAndArchive', helpsPayload);

      // Exécuter toutes les requêtes en parallèle
      await Promise.all([...updateEvaluationPromises, saveHelpsPromise]);

      alert('Évaluation finale et aides sauvegardées avec succès.');
      // Rafraîchir les données ou mettre à jour l'état si nécessaire
      fetchFinalEvaluationData();
      // Optionnel : Réinitialiser les états si nécessaire
    } catch (err) {
      console.error('Erreur lors de la mise à jour et de la sauvegarde:', err);
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
        ) : (
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

                    <Box display="flex" justifyContent="left" mt={4}>
                      <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                        Valider
                      </Button>
                    </Box>
                  </MainCard>
                </>
              ))}

            {currentPeriod === 'Mi-Parcours' && (
              <>
                {!formValidated ? (
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

                      <Box display="flex" justifyContent="left" mt={4}>
                        <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                          Valider
                        </Button>
                      </Box>
                    </MainCard>
                  </>
                )}
              </>
            )}

            {currentPeriod === 'Évaluation Finale' && (
              <>
                {!formValidated ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Vous avez déjà validé le formulaire pour cette période.
                  </Alert>
                ) : (
                  <>
                    {/* Indicateurs Métiers */}
                    <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                      <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
                        Indicateurs Métiers
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 4 }}>
                        {midTermIndicators.map((indicator) => (
                          <Box key={indicator.userIndicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', p: 2 }}>
                            {/* Nom de l'indicateur */}
                            <TextField
                              label="Nom de l'indicateur"
                              variant="outlined"
                              fullWidth
                              value={indicator.name || 'Nom manquant'}
                              InputProps={{
                                readOnly: true
                              }}
                              sx={{ mb: 2 }}
                            />

                            {/* Résultats et pourcentages */}
                            {indicator.results.map((result, resultIndex) => (
                              <Grid container spacing={2} key={result.resultId || resultIndex} sx={{ mb: 2 }}>
                                <Grid item xs={8}>
                                  <TextField
                                    label={`Résultat Attendu ${resultIndex + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={result.resultText || ''}
                                    InputProps={{
                                      readOnly: true
                                    }}
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
                                      const value = parseFloat(e.target.value) || 0;
                                      const updatedIndicators = [...midTermIndicators];
                                      const indicatorIndex = updatedIndicators.findIndex(
                                        (ind) => ind.userIndicatorId === indicator.userIndicatorId
                                      );
                                      if (indicatorIndex !== -1) {
                                        const resultIndex = updatedIndicators[indicatorIndex].results.findIndex(
                                          (res) => res.resultId === result.resultId
                                        );
                                        if (resultIndex !== -1) {
                                          updatedIndicators[indicatorIndex].results[resultIndex].result = value;
                                          setMidTermIndicators(updatedIndicators);
                                        }
                                      }
                                    }}
                                    InputProps={{
                                      endAdornment: <Typography>%</Typography>
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </MainCard>

                    {/* Aides Disponibles */}
                    <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8F5E9' }}>
                      <Typography variant="h5" sx={{ color: '#2E7D32', mb: 2 }}>
                        Aides Disponibles
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        {helps.map((help) => (
                          <Box key={help.HelpId} sx={{ border: '1px solid #C8E6C9', borderRadius: 2, p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                              {help.name}
                            </Typography>
                            <TextField
                              fullWidth
                              variant="outlined"
                              multiline
                              rows={3}
                              value={help.content || ''}
                              onChange={(e) => {
                                const updatedHelps = [...helps];
                                const helpToUpdate = updatedHelps.find((h) => h.HelpId === help.HelpId);
                                if (helpToUpdate) {
                                  helpToUpdate.content = e.target.value;
                                  setHelps(updatedHelps);
                                }
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </MainCard>

                    {/* Bouton Unique pour Mettre à Jour l'Évaluation et Sauvegarder les Aides */}
                    <Box display="flex" justifyContent="left" mt={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateAndSave}
                        disabled={
                          // Désactiver si un champ de pourcentage est vide ou invalide
                          midTermIndicators.some((indicator) =>
                            indicator.results.some((result) => result.result === undefined || result.result === null)
                          ) ||
                          // Désactiver si un champ d'aide est vide
                          helps.some((help) => !help.content || help.content.trim() === '')
                        }
                      >
                        Valider
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </>
        )}
      </MainCard>
    </Paper>
  );
};

export default FixationNonCadre;
