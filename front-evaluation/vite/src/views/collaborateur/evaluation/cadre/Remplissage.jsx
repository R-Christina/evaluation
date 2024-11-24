import React, { useState, useEffect, useRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import {
  Grid,
  Typography,
  Paper,
  Box,
  TextField,
  IconButton,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { formulaireInstance } from '../../../../axiosConfig';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const Remplissage = () => {
  const tableStyles = {
    table: {
      width: '100%',
      tableLayout: 'fixed', // Largeur uniforme des colonnes
      borderCollapse: 'collapse' // Suppression des espaces entre bordures
    },
    tableCell: {
      verticalAlign: 'middle', // Alignement vertical centré
      textAlign: 'left', // Alignement horizontal
      padding: '8px', // Uniformisation des espaces
      wordBreak: 'break-word' // Gestion des longues chaînes de texte
    },
    tableRow: {
      borderBottom: '1px solid rgba(224, 224, 224, 1)' // Bordure cohérente entre les lignes
    }
  };

  // Récupération des informations utilisateur
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = user.typeUser;
  const userId = user.id;

  // États principaux
  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [userObjectives, setUserObjectives] = useState([]);
  const [groupedObjectives, setGroupedObjectives] = useState({});
  const [objectiveIndices, setObjectiveIndices] = useState({});
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [historyCMps, setHistoryCMps] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [isFixationValidated, setIsFixationValidated] = useState(false);
  const [isMidtermValidated, setIsMidtermValidated] = useState(false);
  const [evalId, setEvalId] = useState(null);
  const [error, setError] = useState(null);

  // Référence pour éviter les mises à jour multiples du template
  const isTemplateUpdated = useRef(false);

  // ------------------- Fonctions de Récupération des Données -------------------

  // Récupérer les objectifs de l'utilisateur
  const fetchUserObjectives = async (evalId, userId) => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/userObjectif`, {
        params: { evalId, userId }
      });

      // Supposons que response.data contient un tableau d'objectifs
      if (Array.isArray(response.data) && response.data.length > 0) {
        setIsFixationValidated(true);
      } else {
        setIsFixationValidated(false);
      }

      setUserObjectives(response.data);

      // Regrouper les objectifs par priorité stratégique
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
        params: { userId, type }
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

  // Récupérer l'ID du template si l'utilisateur est un Cadre
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

  // Vérifier s'il y a une évaluation en cours
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

  // Récupérer le template et la période actuelle
  const fetchTemplateAndPeriod = async () => {
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

  // Récupérer la période et les objectifs si en Mi-Parcours
  const fetchPeriodAndObjectives = async () => {
    try {
      const periodResponse = await formulaireInstance.get('/Periode/periodeActel', { params: { type: 'Cadre' } });
      if (periodResponse.data?.length > 0) {
        const period = periodResponse.data[0].currentPeriod;
        setCurrentPeriod(period);
        if (period === 'Mi-Parcours' || period === 'Fixation Objectif') {
          await fetchUserObjectives(evalId, userId);
        }
      }
    } catch (error) {
      console.error('Error fetching period data:', error);
    }
  };

  // ------------------- Hooks d'Effet -------------------

  // Récupérer l'ID du template si utilisateur est Cadre
  useEffect(() => {
    if (userType === 'Cadre') {
      fetchCadreTemplateId();
    }
  }, [userType]);

  // Vérifier s'il y a une évaluation en cours
  useEffect(() => {
    if (userType === 'Cadre') {
      checkOngoingEvaluation();
    }
  }, [userType]);

  // Récupérer le template et la période actuelle si évaluation en cours
  useEffect(() => {
    if (hasOngoingEvaluation && templateId && userType === 'Cadre') {
      fetchTemplateAndPeriod();
    }
  }, [templateId, hasOngoingEvaluation, userType]);

  // Appeler fetchUserObjectives lorsque evalId et userId sont disponibles
  useEffect(() => {
    if (hasOngoingEvaluation && evalId && userId) {
      fetchPeriodAndObjectives();
    }
  }, [hasOngoingEvaluation, evalId, userId]);

  useEffect(() => {
    if (userId && userType) {
      fetchHistoryCMps(userId, userType)
        .then((data) => setHistoryCMps(data))
        .catch((err) => setHistoryError(err));
    }
  }, [userId, userType]);

  // ------------------- Gestion des Changements des Objectifs -------------------

  const handleObjectiveChange = (groupName, objectiveIndex, field, value) => {
    if (currentPeriod === 'Fixation Objectif') {
      setTemplate((prevTemplate) => {
        const updatedTemplate = { ...prevTemplate };
        const priorityIndex = updatedTemplate.templateStrategicPriorities.findIndex((priority) => priority.name === groupName);
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

  // ------------------- Validation des Objectifs -------------------

  const handleValidateObjectives = async () => {
    let objectivesData = [];

    if (currentPeriod === 'Fixation Objectif') {
      if (!template) {
        console.error('No template data to validate.');
        return;
      }

      // Préparer les données pour "Fixation Objectif"
      objectivesData = template.templateStrategicPriorities.flatMap((priority) =>
        priority.objectives.map((objective) => ({
          priorityId: priority.templatePriorityId,
          priorityName: priority.name,
          description: objective.description || '',
          weighting: parseFloat(objective.weighting) || 0,
          resultIndicator: objective.resultIndicator || '',
          result: parseFloat(objective.result) || 0,
          dynamicColumns: objective.dynamicColumns
            ? objective.dynamicColumns.map((col) => ({
                columnName: col.columnName || '',
                value: col.value === 'N/A' ? '' : col.value
              }))
            : []
        }))
      );
    } else if (currentPeriod === 'Mi-Parcours') {
      if (!groupedObjectives) {
        console.error('No objectives data to validate.');
        return;
      }

      // Préparer les données pour "Mi-Parcours"
      objectivesData = Object.entries(groupedObjectives).flatMap(([groupName, objectives]) =>
        objectives.map((objective) => ({
          priorityId: objective.templateStrategicPriority.templatePriorityId,
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
            : []
        }))
      );
    } else {
      console.error('Période non reconnue:', currentPeriod);
      alert('Période non valide. Veuillez vérifier les données.');
      return;
    }

    console.log('Data being sent to the backend:', objectivesData);

    // Définir l'URL en fonction de la période actuelle
    let url = '';
    if (currentPeriod === 'Fixation Objectif') {
      url = '/Evaluation/validateUserObjectives';
    } else if (currentPeriod === 'Mi-Parcours') {
      url = '/Evaluation/validateMitermObjectifHistory';
    }

    try {
      // Envoyer les données au backend
      await formulaireInstance.post(url, objectivesData, {
        headers: { 'Content-Type': 'application/json' },
        params: { userId, type: userType }
      });

      alert('Objectifs validés et enregistrés avec succès.');

      // Mettre à jour l'état correspondant à la période actuelle
      if (currentPeriod === 'Fixation Objectif') {
        setIsFixationValidated(true);
      } else if (currentPeriod === 'Mi-Parcours') {
        setIsMidtermValidated(true);
      }
    } catch (err) {
      console.error('Erreur backend complète:', err);

      const message = err.response?.data?.message || err.message || 'Erreur inconnue.';
      setError(message);
    }
  };

  // ------------------- Vérifications d'Accès et de Chargement -------------------

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

  // Vérifier si les données sont chargées
  if ((currentPeriod === 'Fixation Objectif' && !template) || (currentPeriod === 'Mi-Parcours' && !userObjectives.length)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    );
  }

  // ------------------- Rendu Principal -------------------

  return (
    <Paper>
      <MainCard>
        {/* En-tête de l'évaluation */}
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Évaluation</Typography>
            <Typography variant="h3">
              Période : <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>

        {/* Affichage des erreurs */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <>
          {currentPeriod === 'Fixation Objectif' && template && (
            <>
              {isFixationValidated ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Les objectifs ont déjà été validés pour la période de "Fixation Objectif".
                </Alert>
              ) : (
                <>
                  {template.templateStrategicPriorities.map((priority, priorityIndex) => {
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
                                onChange={(e) => handleObjectiveChange(priority.name, currentObjectiveIndex, 'description', e.target.value)}
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
                  })}
                  <Box display="flex" mt={4} justifyContent="left">
                    <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                      Valider
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}

          {/* Section Mi-Parcours */}
          {currentPeriod === 'Mi-Parcours' && groupedObjectives && (
            <>
              {isMidtermValidated ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Les objectifs ont déjà été validés.
                </Alert>
              ) : (
                <>
                <Box sx={{ mt: 3 }}>
                  {Object.keys(groupedObjectives).map((groupName, groupIndex) => (
                    // <Box key={groupIndex} sx={{ mb: 4 }}>
                    //   <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
                    //     {groupName}
                    //   </Typography>

                    <Card
                      key={groupIndex}
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
                          mb: 2,
                          color: '#333333'
                        }}
                      >
                        {groupName}
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
                                  textAlign: 'left',
                                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                                  width: '25%' // Largeur uniforme pour Objectif
                                }}
                              >
                                Objectif
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'left',
                                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                                  width: '10%' // Largeur pour Pondération
                                }}
                              >
                                Pondération
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'left',
                                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                                  width: '25%' // Largeur pour Indicateur de résultat
                                }}
                              >
                                Indicateur de résultat
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333333',
                                  textAlign: 'left',
                                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                                  width: '10%' // Largeur pour Résultat
                                }}
                              >
                                Résultat
                              </TableCell>
                              {/* Colonnes dynamiques basées sur objectiveColumn.name */}
                              {groupedObjectives[groupName]?.[0]?.objectiveColumnValues?.map((colVal, index) => (
                                <TableCell
                                  key={`header-${index}`}
                                  sx={{
                                    fontWeight: 'bold',
                                    color: '#333333',
                                    textAlign: 'left',
                                    width: '10%' // Largeur dynamique pour chaque colonne supplémentaire
                                  }}
                                >
                                  {colVal.objectiveColumn?.name || `Colonne ${index + 1}`}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {groupedObjectives[groupName]
                              .filter((objective) => {
                                // Exclure les lignes où tous les champs principaux sont "N/A"
                                return (
                                  objective.description !== 'N/A' &&
                                  objective.weighting !== 'N/A' &&
                                  objective.resultIndicator !== 'N/A' &&
                                  objective.result !== 'N/A'
                                );
                              })
                              .map((objective, objectiveIndex) => (
                                <TableRow key={`${groupName}-${objectiveIndex}`}>
                                  <TableCell
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                                      width: '25%' // Largeur identique à l'en-tête
                                    }}
                                  >
                                    {objective.description || 'N/A'}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                                      width: '10%' // Largeur identique à l'en-tête
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        color: objective.weighting >= 50 ? 'primary.main' : 'error.main',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                      }}
                                    >
                                      <Typography>{objective.weighting || 'N/A'} %</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                                      width: '25%' // Largeur identique à l'en-tête
                                    }}
                                  >
                                    {objective.resultIndicator || 'N/A'}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                                      width: '10%' // Largeur identique à l'en-tête
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        backgroundColor: objective.result >= 50 ? '#E8EAF6' : 'rgba(244, 67, 54, 0.1)',
                                        color: objective.result >= 50 ? 'primary.main' : 'error.main',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                      }}
                                    >
                                      <Typography>{objective.result !== undefined ? `${objective.result} %` : 'N/A'}</Typography>
                                    </Box>
                                  </TableCell>
                                  {/* Colonnes dynamiques pour les données */}
                                  {objective.objectiveColumnValues?.map((colVal, index) => (
                                    <TableCell
                                      key={`data-${objectiveIndex}-${index}`}
                                      sx={{
                                        width: '10%' // Largeur identique à l'en-tête
                                      }}
                                    >
                                      {colVal.value || 'N/A'}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  ))}
                </Box>

                <Box display="flex" mt={4} justifyContent="left">
                <Button variant="contained" color="primary" onClick={handleValidateObjectives}>
                  Valider
                </Button>
              </Box>
              </>
              )}
            </>
          )}
        </>
      </MainCard>
    </Paper>
  );
};

export default Remplissage;
