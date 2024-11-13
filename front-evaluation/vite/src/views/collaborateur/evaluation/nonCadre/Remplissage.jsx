import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, TextField, IconButton, Paper, Grid, Alert, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { formulaireInstance } from '../../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';

const Remplissage = () => {
  const [templateId, setTemplateId] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [performanceValues, setPerformanceValues] = useState({});
  const [indicatorValues, setIndicatorValues] = useState([]);
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');

  useEffect(() => {
    const fetchInitialTemplate = async () => {
      try {
        const response = await formulaireInstance.get('/Template/NonCadreTemplate');
        const { templateId } = response.data;
        setTemplateId(templateId);

        const evaluationResponse = await formulaireInstance.get('/Periode/enCours', {
          params: { type: 'NonCadre' }
        });
        setHasOngoingEvaluation(evaluationResponse.data.length > 0);

        if (evaluationResponse.data.length > 0) {
          const detailedResponse = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
          setFormTemplate(detailedResponse.data);

          const periodResponse = await formulaireInstance.get('/Periode/periodeActel', {
            params: { type: 'NonCadre' }
          });
          if (periodResponse.data.length > 0) {
            setCurrentPeriod(periodResponse.data[0].currentPeriod);
          }
        }
      } catch (error) {
        console.error('Error fetching template or evaluation data:', error);
      }
    };
    fetchInitialTemplate();
  }, []);

  const handlePerformanceChange = (competenceId, value) => {
    setPerformanceValues((prev) => ({
      ...prev,
      [competenceId]: value
    }));
  };

  const handleIndicatorChange = (index, field, value) => {
    const updatedIndicators = [...indicatorValues];
    if (!updatedIndicators[index]) updatedIndicators[index] = { label: '', results: ['', '', ''] };
    if (field === 'label') {
      updatedIndicators[index].label = value;
    } else {
      const resultIndex = parseInt(field.split('_')[1], 10);
      updatedIndicators[index].results[resultIndex] = value;
    }
    setIndicatorValues(updatedIndicators);
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

  if (!hasOngoingEvaluation) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" p={20}>
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
    return <Typography>Chargement...</Typography>;
  }

  const currentCompetence = formTemplate?.competences?.[currentIndex];
  const isObjectiveSettingPeriod = currentPeriod === 'Fixation Objectif';

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Évaluation des compétences</Typography>
            <Typography variant="h3">
              Période : <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>

        <MainCard
          maxWidth="md"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 4, mt: 3, backgroundColor: '#E8EAF6', p: 2 }}
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
                  value={performanceValues[currentCompetence.competenceId] || ''}
                  onChange={(e) => handlePerformanceChange(currentCompetence.competenceId, e.target.value)}
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

        {/* Section pour remplir les indicateurs métiers */}
        <MainCard sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#3949AB', mb: 4, textAlign: 'center' }}>
              Indicateurs Métiers
            </Typography>
            <Box sx={{ display: 'grid', gap: 4 }}>
              {formTemplate.indicators.map((indicator) => (
                <Box key={indicator.indicatorId} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <TextField
                    label={indicator.label}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={indicatorValues[indicator.indicatorId]?.label || ''}
                    onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'label', 0, e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {Array.from({ length: indicator.maxResults }).map((_, resultIndex) => (
                    <Grid container spacing={2} key={resultIndex} sx={{ mb: 2 }}>
                      <Grid item xs={8}>
                        <TextField
                          label={`Résultat Attendu ${resultIndex + 1}`}
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={2}
                          value={indicatorValues[indicator.indicatorId]?.results[resultIndex]?.result || ''}
                          onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'result', resultIndex, e.target.value)}
                          disabled={isObjectiveSettingPeriod}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Pourcentage"
                          variant="outlined"
                          type="number"
                          fullWidth
                          value={indicatorValues[indicator.indicatorId]?.results[resultIndex]?.percentage || ''}
                          onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'percentage', resultIndex, e.target.value)}
                          disabled={isObjectiveSettingPeriod}
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
          </Box>
        </MainCard>
      </MainCard>
    </Paper>
  );
};

export default Remplissage;
