import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid, Typography, Paper, Box, TextField, IconButton, Alert, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { formulaireInstance } from '../../../../axiosConfig';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const Remplissage = () => {
  const [userType] = useState(JSON.parse(localStorage.getItem('user'))?.typeUser || null);
  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [objectiveIndices, setObjectiveIndices] = useState([]);
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [evalId, setEvalId] = useState(null);
  const [fixationObjectives, setFixationObjectives] = useState([]);
  const [missingResultsWarning, setMissingResultsWarning] = useState(false);

  useEffect(() => {
    if (userType === 'Cadre') {
      const fetchCadreTemplateId = async () => {
        try {
          const response = await formulaireInstance.get('/Template/CadreTemplate');
          if (response.data?.templateId) {
            setTemplateId(response.data.templateId);
          } else {
            console.error('Template ID for Cadre not found in the response');
          }
        } catch (error) {
          console.error('Error fetching Cadre template ID:', error);
        }
      };
      fetchCadreTemplateId();
    }
  }, [userType]);

  useEffect(() => {
    if (userType === 'Cadre') {
      const checkOngoingEvaluation = async () => {
        try {
          const response = await formulaireInstance.get('/Periode/enCours', { params: { type: 'Cadre' } });
          if (response.data.length > 0) {
            setHasOngoingEvaluation(true);
            setEvalId(response.data[0].evalId);
          } else {
            setHasOngoingEvaluation(false);
            setEvalId(null);
          }
        } catch (error) {
          console.error('Error checking ongoing evaluations:', error);
        }
      };
      checkOngoingEvaluation();
    }
  }, [userType]);

  useEffect(() => {
    if (hasOngoingEvaluation && templateId && userType === 'Cadre') {
      const fetchData = async () => {
        try {
          const templateResponse = await formulaireInstance.get(`/Template/${templateId}`);
          const fetchedTemplate = templateResponse.data.template;
          setObjectiveIndices(Array(fetchedTemplate.templateStrategicPriorities.length).fill(0));
          setTemplate(fetchedTemplate);

          const periodResponse = await formulaireInstance.get('/Periode/periodeActel', { params: { type: 'Cadre' } });
          if (periodResponse.data?.length > 0) {
            setCurrentPeriod(periodResponse.data[0].currentPeriod);
          }
        } catch (error) {
          console.error('Error fetching template or period data:', error);
        }
      };
      fetchData();
    }
  }, [templateId, hasOngoingEvaluation, userType]);

  useEffect(() => {
    const fetchFixationObjectives = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        const response = await formulaireInstance.get(`/Evaluation/userObjectif`, {
          params: { evalId, userId }
        });

        if (response.data) {
          setFixationObjectives(response.data);
        } else {
          console.error('No objectives found for fixation phase');
        }
      } catch (error) {
        console.error('Error fetching fixation objectives:', error);
      }
    };

    if (hasOngoingEvaluation && currentPeriod === 'Mi-Parcours') {
      fetchFixationObjectives();
    }
  }, [evalId, hasOngoingEvaluation, currentPeriod]);

  const handleObjectiveChange = (priorityIndex, objectiveIndex, field, value) => {
    setTemplate((prevTemplate) => {
      const updatedTemplate = { ...prevTemplate };
      updatedTemplate.templateStrategicPriorities[priorityIndex].objectives[objectiveIndex] = {
        ...updatedTemplate.templateStrategicPriorities[priorityIndex].objectives[objectiveIndex],
        [field]: value
      };
      return updatedTemplate;
    });
  };

  const handleValidateObjectives = async () => {
    setIsValidated(true);
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    const type = userType;

    const objectivesData = template.templateStrategicPriorities.flatMap((priority) =>
      priority.objectives.map((objective) => ({
        priorityId: priority.templatePriorityId,
        priorityName: priority.name,
        description: objective.description || 'N/A',
        weighting: parseFloat(objective.weighting) || 0,
        resultIndicator: objective.resultIndicator || 'N/A',
        result: objective.result || 0,
        dynamicColumns: objective.dynamicColumns
          ? objective.dynamicColumns.map((col) => ({
              columnName: col.columnName || '',
              value: col.value || ''
            }))
          : []
      }))
    );

    // Check for missing results
    const missingResults = objectivesData.some((obj) => obj.description !== 'N/A' && obj.result === 0);
    if (missingResults) {
      setMissingResultsWarning(true);
      return;
    }

    console.log("Data being sent to the backend:", objectivesData); // Log data for debugging

    const endpoint = currentPeriod === 'Mi-Parcours'
      ? `/Evaluation/updateMidtermObjectivesCadre`
      : `/Evaluation/validateObjectivesCadre`;

    try {
      await formulaireInstance.post(endpoint, objectivesData, {
        headers: { 'Content-Type': 'application/json' },
        params: { userId, type }
      });
      alert('Objectifs validés et enregistrés avec succès.');
    } catch (error) {
      console.error('Erreur lors de la validation des objectifs:', error);
      alert('Erreur de validation. Veuillez vérifier les données envoyées.');
    }
  };

  if (userType !== 'Cadre') {
    return (
      <Box display="flex" justifyContent="center" p={20}>
        <Alert severity="error">
          <Typography variant="h5">Access Denied</Typography>
          <Typography variant="body1">Only Cadre users can access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  if (!hasOngoingEvaluation) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" p={20}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h4">Aucune évaluation en cours</Typography>
          <Typography variant="body1">Vous allez recevoir une notification lors du commencement</Typography>
        </Alert>
        <Button variant="contained" color="primary" onClick={() => (window.location.href = '/')}>
          Go Back to Home
        </Button>
      </Box>
    );
  }

  if (!template) {
    return <Typography>Loading...</Typography>;
  }

  const isObjectiveSettingPeriod = currentPeriod === 'Fixation Objectif';

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Evaluation</Typography>
            <Typography variant="h3">
              Période : <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>

        {missingResultsWarning && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Certains objectifs ont été définis sans résultats correspondants. Veuillez vérifier et compléter les résultats avant de valider.
          </Alert>
        )}

        {template.templateStrategicPriorities.map((priority, priorityIndex) => {
          const currentObjectiveIndex = objectiveIndices[priorityIndex];
          const currentObjective = priority.objectives[currentObjectiveIndex];

          const matchingObjectives = fixationObjectives.filter((obj) => obj.templateStrategicPriority.name === priority.name);
          const matchingObjective = matchingObjectives[currentObjectiveIndex];

          return (
            <MainCard key={priority.templatePriorityId} sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
              <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
                {priority.name}
              </Typography>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentObjectiveIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <Box>
                    {matchingObjective ? (
                      <>
                        <Box mb={0} p={1.5} sx={{ backgroundColor: '#fffaf1', borderRadius: 1, borderLeft: '4px solid #FB8C00' }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                            Objectif fixé :
                          </Typography>
                          <Typography variant="body2" color="textPrimary">
                            {matchingObjective.description}
                          </Typography>
                        </Box>
                        <TextField
                          label="Objectif"
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={4}
                          value={currentObjective.description || ''}
                          onChange={(e) => handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'description', e.target.value)}
                          sx={{ mb: 2, mt: 1 }}
                        />

                        <Box mb={0} p={1.5} sx={{ backgroundColor: '#fffaf1', borderRadius: 1, borderLeft: '4px solid #FB8C00' }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                            Pondération fixé :
                          </Typography>
                          <Typography variant="body2" color="textPrimary">
                            {matchingObjective.weighting}
                          </Typography>
                        </Box>
                        <TextField
                          label="Pondération"
                          fullWidth
                          variant="outlined"
                          type="text"
                          value={currentObjective.weighting || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'weighting', value);
                          }}
                          sx={{ mb: 2, mt: 1 }}
                          inputProps={{ maxLength: 6 }}
                        />

                        <TextField
                          label="Indicateur de Résultat"
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={4}
                          value={currentObjective.resultIndicator || ''}
                          onChange={(e) => handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'resultIndicator', e.target.value)}
                          sx={{ mb: 2, mt: 1 }}
                        />

                        <TextField
                          label="Résultat"
                          fullWidth
                          variant="outlined"
                          type="text"
                          value={currentObjective.result || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'result', value);
                          }}
                          sx={{ mb: 2, mt: 1 }}
                          inputProps={{ maxLength: 6 }}
                        />

                        <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                          <IconButton
                            onClick={() => {
                              setObjectiveIndices((prevIndices) => {
                                const newIndices = [...prevIndices];
                                newIndices[priorityIndex] = Math.max(currentObjectiveIndex - 1, 0);
                                return newIndices;
                              });
                            }}
                            disabled={currentObjectiveIndex === 0}
                            sx={{ color: 'success.main' }}
                          >
                            <KeyboardArrowLeft />
                          </IconButton>
                          <Typography variant="body1" sx={{ mx: 2 }}>
                            {currentObjectiveIndex + 1} / {priority.objectives.length}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              setObjectiveIndices((prevIndices) => {
                                const newIndices = [...prevIndices];
                                newIndices[priorityIndex] = Math.min(currentObjectiveIndex + 1, priority.objectives.length - 1);
                                return newIndices;
                              });
                            }}
                            disabled={currentObjectiveIndex === priority.objectives.length - 1}
                            sx={{ color: 'success.main' }}
                          >
                            <KeyboardArrowRight />
                          </IconButton>
                        </Box>
                      </>
                    ) : (
                      <>
                        <TextField
                          label="Objectif"
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={4}
                          value={currentObjective.description || ''}
                          onChange={(e) => handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'description', e.target.value)}
                          sx={{ mb: 2, mt: 1 }}
                        />
                        <TextField
                          label="Pondération"
                          fullWidth
                          variant="outlined"
                          type="text"
                          value={currentObjective.weighting || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'weighting', value);
                          }}
                          sx={{ mb: 2, mt: 1 }}
                          inputProps={{ maxLength: 6 }}
                        />

                        <TextField
                          label="Indicateur de Résultat"
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={4}
                          value={currentObjective.resultIndicator || ''}
                          onChange={(e) => handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'resultIndicator', e.target.value)}
                          sx={{ mb: 2, mt: 1 }}
                          disabled={isObjectiveSettingPeriod}
                        />

                        <TextField
                          label="Résultat"
                          fullWidth
                          variant="outlined"
                          type="text"
                          value={currentObjective.result || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                            value = value.replace(',', '.');
                            handleObjectiveChange(priorityIndex, currentObjectiveIndex, 'result', value);
                          }}
                          sx={{ mb: 2, mt: 1 }}
                          inputProps={{ maxLength: 6 }}
                          disabled={isObjectiveSettingPeriod}
                        />

                        <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                          <IconButton
                            onClick={() => {
                              setObjectiveIndices((prevIndices) => {
                                const newIndices = [...prevIndices];
                                newIndices[priorityIndex] = Math.max(currentObjectiveIndex - 1, 0);
                                return newIndices;
                              });
                            }}
                            disabled={currentObjectiveIndex === 0}
                            sx={{ color: 'success.main' }}
                          >
                            <KeyboardArrowLeft />
                          </IconButton>
                          <Typography variant="body1" sx={{ mx: 2 }}>
                            {currentObjectiveIndex + 1} / {priority.objectives.length}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              setObjectiveIndices((prevIndices) => {
                                const newIndices = [...prevIndices];
                                newIndices[priorityIndex] = Math.min(currentObjectiveIndex + 1, priority.objectives.length - 1);
                                return newIndices;
                              });
                            }}
                            disabled={currentObjectiveIndex === priority.objectives.length - 1}
                            sx={{ color: 'success.main' }}
                          >
                            <KeyboardArrowRight />
                          </IconButton>
                        </Box>
                      </>
                    )}
                  </Box>
                </motion.div>
              </AnimatePresence>
            </MainCard>
          );
        })}

        {!isValidated && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
              Validate Objectives
            </Button>
          </Box>
        )}
      </MainCard>
    </Paper>
  );
};

export default Remplissage;
