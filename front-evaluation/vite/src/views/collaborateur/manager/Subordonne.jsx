import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress ,IconButton ,Alert } from '@mui/material';
import { authInstance, formulaireInstance } from '../../../axiosConfig'; 
import MainCard from 'ui-component/cards/MainCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import FlagIcon from '@mui/icons-material/Flag';
import { useNavigate } from 'react-router-dom';

const Subordonne = () => {
  const [subordinates, setSubordinates] = useState([]);
  const [currentPeriodNonCadre, setCurrentPeriodNonCadre] = useState('');
  const [currentPeriodCadre, setCurrentPeriodCadre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;

  const navigate = useNavigate();

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

  const handleFlagClick = (subordinateId, typeUser) => {
    if (typeUser === 'Cadre') {
      navigate(`/manager/fixation/${subordinateId}/${typeUser}`);
    } else if (typeUser === 'NonCadre') {
      navigate(`/manager/fixationNonCadre/${subordinateId}/${typeUser}`);
    }
  };  

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Évaluation des collaborateurs directs</Typography>
            <Typography variant="h3">
              Période Cadre: {currentPeriodCadre || 'Aucune'} <span style={{ color: '#3949AB' }}></span>
              Période Non Cadre: {currentPeriodNonCadre || 'Aucune'} <span style={{ color: '#3949AB' }}></span>
            </Typography>
          </Grid>
        </Grid>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {subordinates.length === 0 ? (
                <MainCard>
                    <Alert severity="warning">Aucun collaborateurs trouver</Alert>
                </MainCard>
            ) : (
              subordinates.map((subordinate) => (
                <Grid item xs={12} sm={6} md={3} key={subordinate.id}>
                  <Paper
                    sx={{
                      p: 2,
                      height: '200px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '16px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                      border: '2px solid #f4f4f4',
                      '&:hover': {
                        border: '1px solid #3949AB'
                      }
                    }}
                  >
                    {/* Initiales */}
                    <Box
                      sx={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#E3F2FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}
                    >
                      <Typography variant="h4" sx={{ color: '#ff4b07' }}>
                        {subordinate.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Nom */}
                    <Typography variant="h6" gutterBottom>
                      {subordinate.name}
                    </Typography>

                    {/* Boutons */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 'auto', // Pousse le conteneur de boutons vers le bas
                        justifyContent: 'center'
                      }}
                    >
                      <IconButton color="success">
                        <BarChartIcon />
                        </IconButton>
                        <IconButton sx={{color:'#ffdd00'}} onClick={() => handleFlagClick(subordinate.id, subordinate.typeUser)}>
                        <FlagIcon />
                    </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        )}

      </MainCard>
    </Paper>
  );
};

export default Subordonne;
