import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton, Paper } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MainCard from 'ui-component/cards/MainCard';
import { formulaireInstance } from '../../../axiosConfig';
import { useNavigate } from 'react-router-dom';

function MyEvaluation() {
  const [evaluationsByYear, setEvaluationsByYear] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;
  const userType = user.typeUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await formulaireInstance.get(`/archive/years/${userId}`);
        if (response && response.data) {
          setEvaluationsByYear(response.data);
        } else {
          console.error('Unexpected response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      }
    };

    if (userId) {
      fetchEvaluations();
    }
  }, [userId]);

  const handleEvaluationClick = (evalId) => {
    if (userType === 'Cadre') {
      navigate(`/archive/evaluationPhasesCadre/${userId}/${evalId}`);
    } else if (userType === 'NonCadre') {
      navigate(`/archive/evaluationPhasesNonCadre/${userId}/${evalId}`);
    } else {
      console.error('Invalid user type specified.');
    }
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">
              Archive
            </Typography>
            <Typography variant="h3">
              Liste des évaluations
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {evaluationsByYear.map((evaluation) => (
            <Grid item xs={12} sm={6} md={4} key={evaluation.evalId}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  backgroundColor: '#E8EAF6',
                  '&:hover': {
                    backgroundColor: '#e3eaf5',
                  },
                }}
                onClick={() => handleEvaluationClick(evaluation.evalId)}
              >
                <FolderIcon sx={{ fontSize: 24, color: 'rgb(57, 73, 171)', marginRight: '16px' }} />
                <CardContent sx={{ flexGrow: 1, padding: 0 }}>
                  <Typography variant="body1" sx={{ color: '#1a202c' }}>
                    {evaluation.evalAnnee}
                  </Typography>
                </CardContent>
                <IconButton>
                  <MoreVertIcon sx={{ fontSize: 20, color: '#757575' }} />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MainCard>
    </Paper>
  );
}

export default MyEvaluation;
