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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);

  // Récupération des indicateurs utilisateur
  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const response = await formulaireInstance.get(`/Evaluation/IndicatorValidateByUser`, {
        params: { userId: subordinateId, type: typeUser }
      });

      // Initialiser `results` si non présents
      const indicatorsWithResults = response.data.map(indicator => ({
        ...indicator,
        results: Array.from({ length: indicator.maxResults || 1 }).map(() => ({
          resultText: '',
          result: 0
        }))
      }));

      setIndicators(indicatorsWithResults);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Récupération du TemplateId et du FormTemplate
  const fetchTemplateData = async () => {
    try {
      const response = await formulaireInstance.get('/Template/NonCadreTemplate');
      const { templateId } = response.data;
      setTemplateId(templateId);

      // Récupérer les détails du template si l'évaluation existe
      const evaluationResponse = await formulaireInstance.get(`/Evaluation/enCours/${typeUser}`);
      const evalId = evaluationResponse.data;

      if (evalId) {
        const detailedResponse = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
        setFormTemplate(detailedResponse.data);

        // Récupération de la période actuelle
        const periodResponse = await formulaireInstance.get('/Periode/periodeActel', {
          params: { type: 'NonCadre' }
        });
        if (periodResponse.data.length > 0) {
          setCurrentPeriod(periodResponse.data[0].currentPeriod);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la récupération du Template.';
      setError(message);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchTemplateData();
      await fetchIndicators();
    };

    initializeData();
  }, [subordinateId, typeUser]);

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
          ResultText: 'N/A',
          Result: 0
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
          Competences: formTemplate?.competences?.map((competence) => ({
            CompetenceId: competence.competenceId,
            Performance: competence.performance || 0
          })) || [],
          Indicators: indicators.map((indicator) => ({
            IndicatorId: indicator.indicatorId,
            IndicatorName: indicator.name || '',
            Results: indicator.results.map(r => ({
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
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue.';
      alert(`Erreur : ${message}`);
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
    const competenceIndex = updatedCompetences.findIndex(
      (c) => c.competenceId === competenceId
    );
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
      [field]: field === 'result' ? parseFloat(value) || 0 : value, // Conversion pour `result`
    };
  
    setIndicators(updatedIndicators);
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
            {currentPeriod === 'Mi-Parcours' && (
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
                            handleCompetencePerformanceChange( currentCompetence.competenceId, value
                            )
                        }}
                        fullWidth
                        sx={{ mb: 3 }}
                        InputProps={{
                            endAdornment: <Typography>%</Typography>,
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
            )}

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
                              onChange={(e) =>
                                handleIndicatorResultUpdate(index, resultIndex, 'resultText', e.target.value)
                              }
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
                              onChange={(e) =>{
                                let value = e.target.value;
                                    if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                    value = value.replace(',', '.');
                                handleIndicatorResultUpdate(index, resultIndex, 'result', value)
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
            </MainCard>
          </>
        ) : (
          <Alert severity="info">Aucun indicateur utilisateur trouvé.</Alert>
        )}

        <Box display="flex" justifyContent="center" mt={4}>
          <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
            Valider les Objectifs
          </Button>
        </Box>
      </MainCard>
    </Paper>
  );
};

export default FixationNonCadre;
