import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, TextField, IconButton, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { formulaireInstance } from '../../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';
import { motion, AnimatePresence } from 'framer-motion';

const Fixation = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const managerId = user.id;

  const { subordinateId, typeUser } = useParams();
  const [evaluationId, setEvaluationId] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [userObjectives, setUserObjectives] = useState([]);
  const [groupedObjectives, setGroupedObjectives] = useState({});
  const [objectiveIndices, setObjectiveIndices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccessMessage] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isMidtermValidated, setIsMidtermValidated] = useState(false);

  const checkUserValidationHistory = async () => {
    try {
      setError(null); // Réinitialise les erreurs précédentes
      setSuccessMessage(null);

      const response = await formulaireInstance.get('/Evaluation/getUserObjectivesHistory', {
        params: { userId: subordinateId, type: typeUser }
      });

      // Extraire le tableau `historyCFos` depuis `response.data`
      const history = response.data.historyCFos;

      // Vérifier si le tableau contient des validations
      if (Array.isArray(history) && history.length > 0) {
        setIsValidated(true);
      } else {
        setIsValidated(false);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification des validations:', err.response?.data || err.message);
      const message = err.response?.data?.message || err.message || 'Erreur lors de la vérification des validations.';
      setError(message);
    }
  };

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

  const fetchHistoryCMps = async (userId, type) => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/getHistoryMidtermeByUser`, {
        params: { userId: subordinateId, type: typeUser }
      });

      if (response.data && response.data.length > 0) {
        setIsMidtermValidated(true);
        return response.data;
      } else {
        setIsMidtermValidated(false);
        return [];
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Pas d'erreur dans la console pour 404, c'est un cas attendu
        setIsMidtermValidated(false);
        return [];
      } else {
        // Afficher d'autres erreurs dans la console uniquement si elles ne sont pas des 404
        console.error("Erreur inattendue lors de la récupération de l'historique :", err);
        throw err.response?.data?.message || 'Erreur inconnue';
      }
    }
  };

  const fetchCurrentPeriod = async (evalId) => {
    try {
      const response = await formulaireInstance.get(`/Periode/periodeActuel/${evalId}`);
      setCurrentPeriod(response.data.currentPeriod);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de la période actuelle.');
    }
  };

  const handleValidationHistory = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Generate payload based on the currentPeriod
      const payload = Object.values(groupedObjectives)
        .flat()
        .map((objective) => {
          const basePayload = {
            objectiveId: objective.objectiveId,
            indicatorName: objective.templateStrategicPriority?.name || 'Non défini',
            description: objective.description,
            weighting: objective.weighting,
            resultIndicator: objective.resultIndicator || 'N/A', // Fixed capitalization for consistency
            result: objective.result || 0, // Fixed typo (was "objectif.Result")
            objectiveColumnValues: (objective.objectiveColumnValues || []).map((column) => ({
              columnName: column.objectiveColumn?.name || 'Non défini',
              value: column.value || ''
            }))
          };

          // Add specific fields based on the period
          if (currentPeriod === 'Fixation Objectif') {
            return {
              ...basePayload,
              objectiveId: objective.objectiveId
            };
          } else if (currentPeriod === 'Mi-Parcours') {
            return {
              ...basePayload,
              priorityId: objective.templateStrategicPriority?.priorityId // Adjust this field as needed
            };
          }

          return basePayload; // Fallback
        });

      // Determine the API endpoint based on the period
      const endpoint =
        currentPeriod === 'Fixation Objectif' ? '/Evaluation/validateUserObjectivesHistory' : '/Evaluation/validateMitermObjectif';

      // Send the request
      const response = await formulaireInstance.post(endpoint, payload, {
        params: {
          validatorUserId: managerId,
          userId: subordinateId,
          type: typeUser
        }
      });

      setSuccessMessage(response.data.Message || 'Validation effectuée avec succès.');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    }
  };

  useEffect(() => {
    const fetchEvaluationId = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await formulaireInstance.get(`/Evaluation/enCours/${typeUser}`);
        const evalId = response.data;
        setEvaluationId(evalId);

        if (evalId) {
          await fetchCurrentPeriod(evalId);
          await fetchUserObjectives(evalId, subordinateId); // Récupérer les objectifs utilisateur
          await checkUserValidationHistory();
          await fetchHistoryCMps();
        }
      } catch (err) {
        console.error('Erreur complète:', err);
        const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationId();
  }, [typeUser, subordinateId]);

  const handleObjectiveChange = (groupName, index, field, value, colIndex = null) => {
    const updatedGroupedObjectives = { ...groupedObjectives };

    if (colIndex !== null && field === 'objectiveColumnValues') {
      // Mettre à jour uniquement la colonne spécifique
      updatedGroupedObjectives[groupName][index] = {
        ...updatedGroupedObjectives[groupName][index],
        objectiveColumnValues: updatedGroupedObjectives[groupName][index].objectiveColumnValues.map((column, i) =>
          i === colIndex ? { ...column, value } : column
        )
      };
    } else {
      // Mettre à jour un champ général (description, weighting, etc.)
      updatedGroupedObjectives[groupName][index] = {
        ...updatedGroupedObjectives[groupName][index],
        [field]: value
      };
    }

    // Mettre à jour l'état
    setGroupedObjectives(updatedGroupedObjectives);
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
        ) : success ? ( // Affiche le message de succès s'il est défini
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        ) : (
          <>
            {currentPeriod === 'Fixation Objectif' && (
              <>
                {isValidated ? (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Les objectifs ont déjà été validés pour la période de "Fixation Objectif".
                  </Alert>
                ) : (
                  <>
                    {Object.keys(groupedObjectives).length > 0 ? (
                      Object.keys(groupedObjectives).map((groupName) => {
                        const objectives = groupedObjectives[groupName];
                        const currentIndex = objectiveIndices[groupName];

                        return (
                          <>
                            <MainCard key={groupName} sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                              <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
                                {groupName}
                              </Typography>

                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={currentIndex}
                                  initial={{ opacity: 0, x: 50 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -50 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Box>
                                    <TextField
                                      label="Objectif"
                                      fullWidth
                                      variant="outlined"
                                      multiline
                                      minRows={4}
                                      value={objectives[currentIndex]?.description || ''}
                                      onChange={(e) => handleObjectiveChange(groupName, currentIndex, 'description', e.target.value)}
                                      sx={{ mb: 2, mt: 1 }}
                                    />
                                    <TextField
                                      label="Ponération"
                                      fullWidth
                                      variant="outlined"
                                      value={objectives[currentIndex]?.weighting || ''}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                        value = value.replace(',', '.');
                                        handleObjectiveChange(groupName, currentIndex, 'weighting', value);
                                      }}
                                      sx={{ mb: 2, mt: 1 }}
                                    />
                                  </Box>
                                  <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                                    <IconButton
                                      onClick={() =>
                                        setObjectiveIndices((prev) => ({
                                          ...prev,
                                          [groupName]: Math.max(currentIndex - 1, 0)
                                        }))
                                      }
                                      disabled={currentIndex === 0}
                                      sx={{ color: 'success.main' }}
                                    >
                                      <KeyboardArrowLeft />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ mx: 2 }}>
                                      {currentIndex + 1} / {objectives.length}
                                    </Typography>
                                    <IconButton
                                      onClick={() =>
                                        setObjectiveIndices((prev) => ({
                                          ...prev,
                                          [groupName]: Math.min(currentIndex + 1, objectives.length - 1)
                                        }))
                                      }
                                      disabled={currentIndex === objectives.length - 1}
                                      sx={{ color: 'success.main' }}
                                    >
                                      <KeyboardArrowRight />
                                    </IconButton>
                                  </Box>
                                </motion.div>
                              </AnimatePresence>
                            </MainCard>
                          </>
                        );
                      })
                    ) : (
                      <Alert severity="info">Aucun objectif défini pour la période de Fixation Objectif.</Alert>
                    )}

                    <Box display="flex" justifyContent="center" mt={4}>
                      <Button variant="contained" color="primary" onClick={handleValidationHistory}>
                        Valider les Objectifs
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}

            {currentPeriod === 'Mi-Parcours' && (
              <>
                {isMidtermValidated ? (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Le collaboarteur a déjà valider.
                  </Alert>
                ) : (
                  <>
                    {Object.keys(groupedObjectives).length > 0 ? (
                      Object.keys(groupedObjectives).map((groupName) => {
                        const objectives = groupedObjectives[groupName];
                        const currentIndex = objectiveIndices[groupName];

                        return (
                          <>
                            <MainCard key={groupName} sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6' }}>
                              <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
                                {groupName}
                              </Typography>

                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={currentIndex}
                                  initial={{ opacity: 0, x: 50 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -50 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <TextField
                                    label="Objectif"
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    minRows={4}
                                    value={objectives[currentIndex]?.description || ''}
                                    onChange={(e) => handleObjectiveChange(groupName, currentIndex, 'description', e.target.value)}
                                    sx={{ mb: 2, mt: 1 }}
                                  />

                                  <TextField
                                    label="Ponération"
                                    fullWidth
                                    variant="outlined"
                                    value={objectives[currentIndex]?.weighting || ''}
                                    onChange={(e) => {
                                      let value = e.target.value;
                                      if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                      value = value.replace(',', '.');
                                      handleObjectiveChange(groupName, currentIndex, 'weighting', value);
                                    }}
                                    sx={{ mb: 2, mt: 1 }}
                                  />

                                  <TextField
                                    label="Indicateur de Résultat"
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    minRows={4}
                                    value={objectives[currentIndex]?.resultIndicator || ''}
                                    onChange={(e) => handleObjectiveChange(groupName, currentIndex, 'resultIndicator', e.target.value)}
                                    sx={{ mb: 2, mt: 1 }}
                                    disabled={currentPeriod === 'Fixation Objectif'}
                                  />

                                  <TextField
                                    label="Résultat"
                                    fullWidth
                                    variant="outlined"
                                    type="text"
                                    value={objectives[currentIndex]?.result || ''}
                                    onChange={(e) => {
                                      let value = e.target.value;
                                      if (!/^\d{0,3}([.,]\d{0,2})?$/.test(value)) return;
                                      value = value.replace(',', '.');
                                      handleObjectiveChange(groupName, currentIndex, 'result', value);
                                    }}
                                    sx={{ mb: 2, mt: 1 }}
                                    inputProps={{ maxLength: 6 }}
                                    disabled={currentPeriod === 'Fixation Objectif'}
                                  />

                                  {Array.isArray(objectives[currentIndex]?.objectiveColumnValues) &&
                                    objectives[currentIndex]?.objectiveColumnValues.map((column, colIndex) => (
                                      <Box key={column.valueId || colIndex} sx={{ mb: 2, mt: 1 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                          {column.objectiveColumn?.name || `Colonne ${colIndex + 1}`}
                                        </Typography>

                                        <TextField
                                          fullWidth
                                          variant="outlined"
                                          value={column.value || ''}
                                          multiline
                                          minRows={4}
                                          onChange={(e) =>
                                            handleObjectiveChange(
                                              groupName,
                                              currentIndex,
                                              'objectiveColumnValues',
                                              e.target.value,
                                              colIndex
                                            )
                                          }
                                        />
                                      </Box>
                                    ))}

                                  <Box display="flex" justifyContent="right" alignItems="center" mt={2}>
                                    <IconButton
                                      onClick={() =>
                                        setObjectiveIndices((prev) => ({
                                          ...prev,
                                          [groupName]: Math.max(currentIndex - 1, 0)
                                        }))
                                      }
                                      disabled={currentIndex === 0}
                                      sx={{ color: 'success.main' }}
                                    >
                                      <KeyboardArrowLeft />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ mx: 2 }}>
                                      {currentIndex + 1} / {objectives.length}
                                    </Typography>
                                    <IconButton
                                      onClick={() =>
                                        setObjectiveIndices((prev) => ({
                                          ...prev,
                                          [groupName]: Math.min(currentIndex + 1, objectives.length - 1)
                                        }))
                                      }
                                      disabled={currentIndex === objectives.length - 1}
                                      sx={{ color: 'success.main' }}
                                    >
                                      <KeyboardArrowRight />
                                    </IconButton>
                                  </Box>
                                </motion.div>
                              </AnimatePresence>
                            </MainCard>
                          </>
                        );
                      })
                    ) : (
                      <Alert severity="info">Aucun objectif défini pour la période de Mi-Parcours.</Alert>
                    )}

                    <Box display="flex" justifyContent="center" mt={4}>
                      <Button variant="contained" color="primary" onClick={handleValidationHistory}>
                        Valider les Objectifs
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

export default Fixation;
