import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Button, CircularProgress, IconButton, Alert } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import FlagIcon from '@mui/icons-material/Flag';
import { authInstance, formulaireInstance } from '../../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const Subordonne = () => {
  const [subordinates, setSubordinates] = useState([]);
  const [currentPeriodNonCadre, setCurrentPeriodNonCadre] = useState('');
  const [currentPeriodCadre, setCurrentPeriodCadre] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;

  const navigate = useNavigate();

  const SUBORDINATE_TYPE_TO_HABILITATION_ID = {
    Cadre: 16,
    NonCadre: 20,
  };
  
  const [canViewArchive, setCanViewArchive] = useState(false);  
  const VIEW_ARCHIVE = 26;
  
  // Fonction pour vérifier une permission pour un type de subordonné
  const checkPermissionForSubordinateType = async (userId, subordinateType) => {
    const requiredHabilitationId = SUBORDINATE_TYPE_TO_HABILITATION_ID[subordinateType];
  
    if (!requiredHabilitationId) {
      console.error(`Aucun identifiant d'habilitation trouvé pour le type de subordonné : ${subordinateType}`);
      return false;
    }
  
    try {
      const response = await formulaireInstance.get('/Periode/test-authorization', {
        params: {
          userId,
          requiredHabilitationAdminId: requiredHabilitationId,
        },
      });
      return response.data.hasAccess;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'autorisation :', error);
      return false;
    }
  };
  
  // Fonction pour vérifier une permission spécifique (comme VIEW_ARCHIVE)
  const checkPermission = async (userId, habilitationId) => {
    if (!habilitationId) {
      console.error(`Aucun identifiant d'habilitation fourni : ${habilitationId}`);
      return false;
    }
  
    try {
      const response = await formulaireInstance.get('/Periode/test-authorization', {
        params: {
          userId,
          requiredHabilitationAdminId: habilitationId,
        },
      });
      return response.data.hasAccess;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'autorisation :', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchSubordinates = async () => {
      try {
        const response = await authInstance.get('/User/user/subordonates', {
          params: { superiorId: userId }
        });
        setSubordinates(response.data);

        const periodNonCadre = await formulaireInstance.get('/Periode/periodeActel', {
          params: { type: 'NonCadre' }
        });
        if (periodNonCadre.data.length > 0) {
          setCurrentPeriodNonCadre(periodNonCadre.data[0].currentPeriod);
        }

        const periodCadre = await formulaireInstance.get('/Periode/periodeActel', {
          params: { type: 'Cadre' }
        });
        if (periodCadre.data.length > 0) {
          setCurrentPeriodCadre(periodCadre.data[0].currentPeriod);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubordinates();
  }, []);

  // Chargement des permissions
  useEffect(() => {
  const fetchPermissions = async () => {
    setLoadingPermissions(true);

    const permissionsMap = {};
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.id;

    try {
      for (const subordinate of subordinates) {
        const hasPermission = await checkPermissionForSubordinateType(userId, subordinate.typeUser);
        permissionsMap[subordinate.id] = hasPermission;
      }

      // Vérification de l'habilitation pour voir les archives
      const canView = await checkPermission(userId, VIEW_ARCHIVE);
      setCanViewArchive(canView);

      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions :', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  if (subordinates.length > 0) {
    fetchPermissions();
  } else {
    setLoadingPermissions(false);
  }
}, [subordinates]);

  const handleFlagClick = (subordinateId, typeUser) => {
    if (typeUser === 'Cadre') {
      navigate(`/manager/evaluationCadre/${subordinateId}/${typeUser}`);
    } else if (typeUser === 'NonCadre') {
      navigate(`/manager/evaluationNonCadre/${subordinateId}/${typeUser}`);
    }
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Collaborateurs directs</Typography>
            <Typography variant="h3" sx={{ marginTop: '0.5rem' }}>
              Évaluation des collaborateurs directs
            </Typography>
          </Grid>
        </Grid>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {/* Carte Période Cadre */}
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    backgroundColor: '#3949AB', // Couleur bleu pastel
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#E8EAF6' }}>
                      Cadre
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                      {currentPeriodCadre || 'Aucune évaluation en cours'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      fontSize: '3rem',
                      opacity: 0.3
                    }}
                  >
                    &#8373;
                  </Box>
                </Paper>
              </Grid>

              {/* Carte Période Non Cadre */}
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    backgroundColor: '#E8EAF6', // Couleur bleu pastel
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">Non Cadre</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3949AB' }}>
                      {currentPeriodNonCadre || 'Aucune évaluation en cours'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      fontSize: '3rem',
                      opacity: 0.3
                    }}
                  >
                    &#128100;
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2} mt={5}>
              {subordinates.length === 0 ? (
                <MainCard>
                  <Alert severity="warning">Aucun collaborateurs trouvés</Alert>
                </MainCard>
              ) : (
                subordinates.map((subordinate) => (
                  <Grid item xs={12} sm={6} md={4} key={subordinate.id}>
                    <Paper
                      sx={{
                        p: 3,
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        },
                        border: '1px solid rgb(227, 232, 239)'
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          backgroundColor: '#3949AB', // Fond bleu
                          color: '#fff', // Texte blanc
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          margin: '0 auto'
                        }}
                      >
                        {subordinate.name.charAt(0).toUpperCase()}
                      </Box>

                      {/* Subordinate Name */}
                      <Typography variant="h6" sx={{ fontWeight: '600', mt: 2 }}>
                        {subordinate.name}
                      </Typography>

                      {/* Role */}
                      <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                        {subordinate.typeUser}
                      </Typography>

                      {/* Actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 1,
                          mt: 2
                        }}
                      >
                        {/* Bouton Statistique */}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ textTransform: 'none', flexGrow: 1 }}
                          onClick={() => {
                            if (subordinate.typeUser === 'Cadre') {
                              navigate(`/stat/cadre/index/${subordinate.id}/${subordinate.typeUser}`);
                            } else if (subordinate.typeUser === 'NonCadre') {
                              navigate(`/stat/nonCadre/index/${subordinate.id}/${subordinate.typeUser}`);
                            } else {
                              console.error('Invalid user type:', subordinate.typeUser);
                            }
                          }}
                        >
                          Statistique
                        </Button>

                        {/* Bouton Evaluation */}
                        {permissions[subordinate.id] && (
                          <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            sx={{ textTransform: 'none', flexGrow: 1 }}
                            onClick={() => handleFlagClick(subordinate.id, subordinate.typeUser)}
                          >
                            Évaluation
                          </Button>
                        )}

                        {/* Bouton Archive */}
                        {canViewArchive && (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            textTransform: 'none',
                            flexGrow: 1,
                            backgroundColor: '#FFCCBC',
                            color: '#FF5722',
                            '&:hover': {
                              backgroundColor: '#FFCCBC'
                            }
                          }}
                          onClick={() => {
                            if (subordinate.typeUser === 'Cadre') {
                              navigate(`/allEvaluation/cadreYear/${subordinate.id}/${subordinate.typeUser}`);
                            } else if (subordinate.typeUser === 'NonCadre') {
                              navigate(`/allEvaluation/nonCadreYear/${subordinate.id}/${subordinate.typeUser}`);
                            } else {
                              console.error('Invalid user type:', subordinate.typeUser);
                            }
                          }}
                        >
                          Archive
                        </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        )}
      </MainCard>
    </Paper>
  );
};

export default Subordonne;
