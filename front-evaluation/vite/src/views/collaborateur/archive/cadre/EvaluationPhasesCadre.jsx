import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MainCard from 'ui-component/cards/MainCard';
import { formulaireInstance } from '../../../../axiosConfig';
import { useParams } from 'react-router-dom';

function EvaluationPhasesCadre() {
  const { userId, evalId } = useParams();
  const [historyByPhase, setHistoryByPhase] = useState([]);
  const [activePhase, setActivePhase] = useState('Fixation');
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const [totalWeightingSum, setTotalWeightingSum] = useState(0);
  const [totalResultSum, setTotalResultSum] = useState(0);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userNon = user.name;
  const poste = user.poste;
  const departement = user.department;
  const superiorName = user.superiorName;

  useEffect(() => {
    // Charger la phase "Fixation" par défaut
    handlePhaseClick('Fixation');
    fetchEvaluationDetails();
  }, []);

  const fetchEvaluationDetails = async () => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/${evalId}`);
      if (response && response.data) {
        setEvaluationDetails(response.data);
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching evaluation details:', error);
    }
  };

  const fetchTotalWeighting = async () => {
    try {
      const response = await formulaireInstance.get(`/archive/priority/totalWeighting/${evalId}/${userId}`);
      if (response && response.data) {
        setTotalWeightingSum(response.data.totalWeightingSum);
        setTotalResultSum(0);
        setHistoryByPhase((prevHistory) => {
          const updatedHistory = [...prevHistory];
          response.data.totalWeightings.forEach((item) => {
            updatedHistory.forEach((objective) => {
              if (objective.priorityName === item.priorityName) {
                objective.totalWeighting = item.totalWeighting;
              }
            });
          });
          return updatedHistory;
        });
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching total weighting:', error);
    }
  };

  const fetchTotalWeightingAndResult = async () => {
    try {
      const response = await formulaireInstance.get(`/archive/priority/totalWeightingAndResult/${evalId}/${userId}`);
      if (response && response.data) {
        setTotalWeightingSum(response.data.totalWeightingSum);
        setTotalResultSum(response.data.totalResultSum);
        setHistoryByPhase((prevHistory) => {
          const updatedHistory = [...prevHistory];
          response.data.totalWeightingAndResults.forEach((item) => {
            updatedHistory.forEach((objective) => {
              if (objective.priorityName === item.priorityName) {
                objective.totalWeighting = item.totalWeighting;
                objective.totalResult = item.totalResult;
              }
            });
          });
          return updatedHistory;
        });
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching total weighting and result:', error);
    }
  };

  const handlePhaseClick = async (phase) => {
    setActivePhase(phase);
    try {
      const response = await formulaireInstance.get(`/archive/historyCadre/${userId}/${evalId}/${phase}`);
      if (response && response.data) {
        setHistoryByPhase(response.data);
        if (phase === 'Fixation') {
          fetchTotalWeighting();
        } else if (phase === 'Mi-Parcours') {
          fetchTotalWeightingAndResult();
        }
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching phase history:', error);
    }
  };

  const groupedData = historyByPhase.reduce((acc, curr) => {
    const { priorityName } = curr;
    if (!acc[priorityName]) {
      acc[priorityName] = [];
    }
    acc[priorityName].push(curr);
    return acc;
  }, {});

  return (
    <Paper>
      <MainCard>
        <Grid container spacing={3}>
          {['Fixation', 'Mi-Parcours'].map((phase) => (
            <Grid item xs={12} sm={6} md={4} key={phase}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  backgroundColor: activePhase === phase ? '#C5CAE9' : '#E8EAF6',
                  '&:hover': activePhase !== phase ? { backgroundColor: '#e3eaf5' } : {}
                }}
                onClick={() => handlePhaseClick(phase)}
              >
                <FolderIcon sx={{ fontSize: 24, color: 'rgb(57, 73, 171)', marginRight: '16px' }} />
                <CardContent sx={{ flexGrow: 1, padding: 0 }}>
                  <Typography variant="body1" sx={{ color: '#1a202c' }}>
                    {phase}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {evaluationDetails && (
          <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', padding: 1, fontWeight: 'bold', mt: 5 }}>
            {evaluationDetails.titre}
          </Typography>
        )}

        <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={6}>
            <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                COLLABORATEUR
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Nom : <span style={{ color: '#3949AB' }}>{userNon}</span>
              </Typography>
              <Typography variant="body1">Matricule :</Typography>
              <Typography variant="body1">
                Poste : <span style={{ color: '#3949AB' }}>{poste}</span>
              </Typography>
              <Typography variant="body1">
                Département : <span style={{ color: '#3949AB' }}>{departement}</span>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                MANAGER
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Nom : <span style={{ color: '#3949AB' }}>{superiorName}</span>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <TableContainer sx={{ border: '1px solid #ddd', borderRadius: '4px', mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
                  PRIORITÉS STRATÉGIQUES
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>OBJECTIFS</TableCell>
                <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>PONDÉRATION</TableCell>
                <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
                  INDICATEURS DE RÉSULTAT
                </TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: 'white' }}>RÉSULTATS en % d’atteinte sur 100%</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedData).map(([priorityName, objectives]) => (
                <React.Fragment key={priorityName}>
                  <TableRow>
                    <TableCell
                      rowSpan={objectives.length + 2}
                      sx={{ borderRight: '1px solid #ddd', fontWeight: 'bold', verticalAlign: 'top' }}
                    >
                      {priorityName}
                      <Typography variant="caption" display="block">
                        {/* ({objectives[0].weighting}% / {objectives[0].totalWeighting || 0}%) */}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {objectives.map((objective, index) => (
                    <TableRow key={objective.historyId}>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                        {objective.description && objective.description !== 'N/A' ? objective.description : ' '}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                        {objective.weighting && objective.weighting !== 0 ? `${objective.weighting}%` : ' '}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                        {objective.resultIndicator && objective.resultIndicator !== 'N/A' ? objective.resultIndicator : ' '}
                      </TableCell>
                      <TableCell>{objective.result && objective.result !== 0 ? `${objective.result}%` : ' '}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                    <TableCell colSpan={1} sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
                      Sous-total de pondération
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#000', borderRight: '1px solid #ddd' }}>
                      {objectives[0].totalWeighting || 0} %
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
                      Sous-total résultats
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#000' }}>{objectives[0].totalResult || 0} %</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              <TableRow>
                <TableCell
                  colSpan={1}
                  sx={{ backgroundColor: 'transparent', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}
                >
                </TableCell>
                <TableCell
                  sx={{ backgroundColor: '#fff9d1', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}
                >
                  TOTAL PONDÉRATION (100%)
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fff9d1', color: '#000', borderRight: '1px solid #ddd' }}>
                  {totalWeightingSum} %
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fff9d1', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
                  PERFORMANCE du contrat d'objectifs
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fff9d1', color: '#000' }}>{totalResultSum} %</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Dates Importantes
            </Typography>
            <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Date de fixation des objectifs :{' '}
                {new Date(evaluationDetails?.fixationObjectif).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Date évaluation mi-parcours :{' '}
                {new Date(evaluationDetails?.miParcours).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              <Typography variant="body1">
                Date de l'entretien final :{' '}
                {new Date(evaluationDetails?.final).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container sx={{ mt: 2 }} spacing={4}>
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Typography variant="body1">Signature Collaborateur</Typography>
            <Box sx={{ height: '50px', border: '1px solid black' }} />
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Typography variant="body1">Signature Manager</Typography>
            <Box sx={{ height: '50px', border: '1px solid black' }} />
          </Grid>
        </Grid>
      </MainCard>
    </Paper>
  );
}

export default EvaluationPhasesCadre;
