import React, { useState, useEffect, useRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid, Typography, Paper, Box, TextField, IconButton, Alert, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { formulaireInstance } from '../../../../axiosConfig';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const Remplissage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = user.typeUser;
  const userId = user.id;

  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [userObjectives, setUserObjectives] = useState([]);
  const [groupedObjectives, setGroupedObjectives] = useState({});
  const [objectiveIndices, setObjectiveIndices] = useState({});
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [evalId, setEvalId] = useState(null);
  const [error, setError] = useState(null);

  // Référence pour éviter la mise à jour multiple du template
  const isTemplateUpdated = useRef(false);

  // Fonction fetchUserObjectives intégrée
  const fetchUserObjectives = async (evalId, userId) => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/userObjectif`, {
        params: { evalId, userId }
      });
      setUserObjectives(response.data);

      // Regrouper les objectifs par `templateStrategicPriority.name`
      const grouped = response.data.reduce((acc, obj) => {
        const groupName = obj.templateStrategicPriority?.name || 'Non définie';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(obj);
        return acc;
      }, {});
      setGroupedObjectives(grouped);

      // Initialiser les indices de navigation
      const indices = Object.keys(grouped).reduce((acc, groupName) => {
        acc[groupName] = 0;
        return acc;
      }, {});
      setObjectiveIndices(indices);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des objectifs utilisateur.');
    }
  };

  // Effet pour récupérer l'ID du template si l'utilisateur est un Cadre
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

  // Effet pour vérifier s'il y a une évaluation en cours
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

  // Effet pour récupérer le template et la période actuelle
  useEffect(() => {
    if (hasOngoingEvaluation && templateId && userType === 'Cadre') {
      const fetchData = async () => {
        try {
          const templateResponse = await formulaireInstance.get(`/Template/${templateId}`);
          const fetchedTemplate = templateResponse.data.template;
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

  // Effet pour appeler fetchUserObjectives lorsque evalId et userId sont disponibles
  useEffect(() => {
    if (hasOngoingEvaluation && evalId && userId) {
      // fetchUserObjectives est uniquement nécessaire pour 'Mi-Parcours'
      const fetchPeriodAndObjectives = async () => {
        try {
          const periodResponse = await formulaireInstance.get('/Periode/periodeActel', { params: { type: 'Cadre' } });
          if (periodResponse.data?.length > 0) {
            const period = periodResponse.data[0].currentPeriod;
            setCurrentPeriod(period);
            if (period === 'Mi-Parcours') {
              await fetchUserObjectives(evalId, userId);
            }
          }
        } catch (error) {
          console.error('Error fetching period data:', error);
        }
      };
      fetchPeriodAndObjectives();
    }
  }, [hasOngoingEvaluation, evalId, userId]);

  const handleObjectiveChange = (groupName, objectiveIndex, field, value) => {
    if (currentPeriod === 'Fixation Objectif') {
      setTemplate((prevTemplate) => {
        const updatedTemplate = { ...prevTemplate };
        const priorityIndex = updatedTemplate.templateStrategicPriorities.findIndex(
          (priority) => priority.name === groupName
        );
        if (priorityIndex !== -1) {
          updatedTemplate.templateStrategicPriorities[priorityIndex].objectives[objectiveIndex][field] = value;
        }
        return updatedTemplate;
      });
    } else if (currentPeriod === 'Mi-Parcours') {
      setGroupedObjectives((prevGrouped) => {
        const updatedGroup = [...prevGrouped[groupName]];
        updatedGroup[objectiveIndex] = {
          ...updatedGroup[objectiveIndex],
          [field]: value
        };
        return {
          ...prevGrouped,
          [groupName]: updatedGroup
        };
      });
    }
  };

 // Fonction pour valider les objectifs
  const handleValidateObjectives = async () => {
    setIsValidated(true);

    let objectivesData = [];

    if (currentPeriod === 'Fixation Objectif') {
      if (!template) {
        console.error('No template data to validate.');
        return;
      }

      objectivesData = template.templateStrategicPriorities.flatMap((priority) =>
        priority.objectives.map((objective) => ({
          priorityId: priority.templatePriorityId, // Provenant du template
          priorityName: priority.name,
          description: objective.description || '',
          weighting: parseFloat(objective.weighting) || 0,
          resultIndicator: objective.resultIndicator || '',
          result: parseFloat(objective.result) || 0,
          dynamicColumns: objective.dynamicColumns
            ? objective.dynamicColumns.map((col) => ({
                columnName: col.columnName || '',
                value: col.value === 'N/A' ? '' : col.value,
              }))
            : [],
        }))
      );
    } else if (currentPeriod === 'Mi-Parcours') {
      if (!groupedObjectives) {
        console.error('No objectives data to validate.');
        return;
      }

      objectivesData = Object.entries(groupedObjectives).flatMap(([groupName, objectives]) =>
        objectives.map((objective) => ({
          priorityId: objective.templateStrategicPriority.templatePriorityId, // Provenant des userObjectives
          priorityName: groupName,
          description: objective.description || '',
          weighting: parseFloat(objective.weighting) || 0,
          resultIndicator: objective.resultIndicator || '',
          result: parseFloat(objective.result) || 0,
          dynamicColumns: objective.objectiveColumnValues
            ? objective.objectiveColumnValues.map((colVal) => ({
                columnName: colVal.objectiveColumn?.name || '',
                value: colVal.value || 'N/A'
              }))
            : [],
        }))
      );
    } else {
      console.error('Période non reconnue:', currentPeriod);
      alert('Période non valide. Veuillez vérifier les données.');
      return;
    }

    console.log('Data being sent to the backend:', objectivesData);

    let url = '';

    if (currentPeriod === 'Fixation Objectif') {
      url = '/Evaluation/validateUserObjectives';
    } else if (currentPeriod === 'Mi-Parcours') {
      url = '/Evaluation/validateMitermObjectifHistory';
    }

    try {
      await formulaireInstance.post(
        url,
        objectivesData,
        {
          headers: { 'Content-Type': 'application/json' },
          params: { userId, type: userType },
        }
      );

      alert('Objectifs validés et enregistrés avec succès.');
    } catch (err) {
      console.error('Erreur backend complète:', err);

      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    }
  };

  // Vérifier le type d'utilisateur
  if (userType !== 'Cadre') {
    return (
      <Box display="flex" justifyContent="center" p={20}>
        <Alert severity="error">
          <Typography variant="h5">Accès Refusé</Typography>
          <Typography variant="body1">Seuls les utilisateurs Cadre peuvent accéder à cette page.</Typography>
        </Alert>
      </Box>
    );
  }

  // Vérifier s'il y a une évaluation en cours
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

  // Vérifier si le template est chargé en 'Fixation Objectif' ou si les userObjectives sont chargés en 'Mi-Parcours'
  if ((currentPeriod === 'Fixation Objectif' && !template) || (currentPeriod === 'Mi-Parcours' && !userObjectives.length)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    );
  }

  // Fonction de rendu des objectifs en fonction de la période
  const renderObjectives = () => {
    if (currentPeriod === 'Fixation Objectif') {
      return template.templateStrategicPriorities.map((priority, priorityIndex) => {
        const currentObjectiveIndex = objectiveIndices[priority.name] || 0;
        const currentObjective = priority.objectives[currentObjectiveIndex];

        return (
          <MainCard key={priority.templatePriorityId} sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
            <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
              {priority.name}
            </Typography>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${priorityIndex}-${currentObjectiveIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '1rem' }}
              >
                <Box>
                  <TextField
                    label="Objectif"
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={4}
                    value={currentObjective.description || ''}
                    onChange={(e) =>
                      handleObjectiveChange(priority.name, currentObjectiveIndex, 'description', e.target.value)
                    }
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
                      handleObjectiveChange(priority.name, currentObjectiveIndex, 'weighting', value);
                    }}
                    sx={{ mb: 2, mt: 1 }}
                    inputProps={{ maxLength: 6 }}
                  />

                  <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                    <IconButton
                      onClick={() => {
                        setObjectiveIndices((prevIndices) => ({
                          ...prevIndices,
                          [priority.name]: Math.max(currentObjectiveIndex - 1, 0)
                        }));
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
                        setObjectiveIndices((prevIndices) => ({
                          ...prevIndices,
                          [priority.name]: Math.min(currentObjectiveIndex + 1, priority.objectives.length - 1)
                        }));
                      }}
                      disabled={currentObjectiveIndex === priority.objectives.length - 1}
                      sx={{ color: 'success.main' }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </MainCard>
        );
      });
    } else if (currentPeriod === 'Mi-Parcours') {
      return Object.keys(groupedObjectives).map((groupName, groupIndex) => {
        const currentObjectiveIndex = objectiveIndices[groupName] || 0;
        const currentObjective = groupedObjectives[groupName][currentObjectiveIndex];

        return (
          <MainCard key={groupIndex} sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
            <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
              {groupName}
            </Typography>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${groupName}-${currentObjectiveIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '1rem' }}
              >
                <Box>
                  <TextField
                    label="Objectif"
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={4}
                    value={currentObjective.description || ''}
                    InputProps={{ readOnly: true }}
                    onChange={(e) =>
                      handleObjectiveChange(groupName, currentObjectiveIndex, 'description', e.target.value)
                    }
                    sx={{ mb: 2, mt: 1 }}
                  />

                  <TextField
                    label="Pondération"
                    fullWidth
                    variant="outlined"
                    type="text"
                    value={currentObjective.weighting || ''}
                    InputProps={{ readOnly: true }}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                      value = value.replace(',', '.');
                      handleObjectiveChange(groupName, currentObjectiveIndex, 'weighting', value);
                    }}
                    sx={{ mb: 2, mt: 1 }}
                    inputProps={{ maxLength: 6 }}
                  />

                  <TextField
                    label="Indicateur de résultat"
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={4}
                    value={currentObjective.resultIndicator || ''}
                    InputProps={{ readOnly: true }}
                    onChange={(e) =>
                      handleObjectiveChange(groupName, currentObjectiveIndex, 'resultIndicator', e.target.value)
                    }
                    sx={{ mb: 2, mt: 1 }}
                  />

                  <TextField
                    label="Résultat"
                    fullWidth
                    variant="outlined"
                    type="text"
                    value={currentObjective.result || ''}
                    InputProps={{ readOnly: true }}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                      value = value.replace(',', '.');
                      handleObjectiveChange(groupName, currentObjectiveIndex, 'result', value);
                    }}
                    sx={{ mb: 2, mt: 1 }}
                    inputProps={{ maxLength: 6 }}
                  />

                  {/* Affichage des objectiveColumnValues */}
                  {currentObjective.objectiveColumnValues && currentObjective.objectiveColumnValues.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                        {currentObjective.objectiveColumnValues.map((colVal) => colVal.objectiveColumn?.name).join(', ')}
                      </Typography>
                      {currentObjective.objectiveColumnValues.map((colVal) => (
                        <TextField
                          key={colVal.valueId}
                          fullWidth
                          variant="outlined"
                          multiline
                          minRows={2}
                          value={colVal.value === 'N/A' ? '' : colVal.value}
                          InputProps={{ readOnly: true }} // Champ en lecture seule
                          sx={{ mb: 2, mt: 1 }}
                        />
                      ))}
                    </>
                  )}

                  <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                    <IconButton
                      onClick={() => {
                        setObjectiveIndices((prevIndices) => ({
                          ...prevIndices,
                          [groupName]: Math.max(currentObjectiveIndex - 1, 0)
                        }));
                      }}
                      disabled={currentObjectiveIndex === 0}
                      sx={{ color: 'success.main' }}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2 }}>
                      {currentObjectiveIndex + 1} / {groupedObjectives[groupName].length}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        setObjectiveIndices((prevIndices) => ({
                          ...prevIndices,
                          [groupName]: Math.min(currentObjectiveIndex + 1, groupedObjectives[groupName].length - 1)
                        }));
                      }}
                      disabled={currentObjectiveIndex === groupedObjectives[groupName].length - 1}
                      sx={{ color: 'success.main' }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </MainCard>
        );
      });
    } else {
      return null;
    }
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Évaluation</Typography>
            <Typography variant="h3">
              Période : <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>

        {error && ( // Affichage de l'erreur s'il y en a une
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderObjectives()}

        {!isValidated && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
              Valider les Objectifs
            </Button>
          </Box>
        )}
      </MainCard>
    </Paper>
  );
};

export default Remplissage;