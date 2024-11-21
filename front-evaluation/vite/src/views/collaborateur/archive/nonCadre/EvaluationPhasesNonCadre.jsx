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
  TableRow,
  styled
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MainCard from 'ui-component/cards/MainCard';
import { formulaireInstance } from '../../../../axiosConfig';
import { useParams } from 'react-router-dom';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: '12px'
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textAlign: 'center'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  }
}));

function EvaluationPhasesNonCadre() {
  const [formTemplate, setFormTemplate] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const { userId, evalId } = useParams();
  const [historyByPhase, setHistoryByPhase] = useState([]);
  const [activePhase, setActivePhase] = useState('Fixation');
  const [indicatorsSum, setIndicatorsSum] = useState([]);
  const [competenceAvg, setCompetenceAvg] = useState([]);
  const [indicatorAvg, setIndicatorAvg] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userNon = user.name;
  const poste = user.poste;
  const departement = user.department;
  const superiorName = user.superiorName;

  const groupedIndicators =
    historyByPhase?.indicators?.reduce((acc, indicator) => {
      if (!acc[indicator.name]) {
        acc[indicator.name] = [];
      }
      acc[indicator.name].push(indicator);
      return acc;
    }, {}) || {};

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const Templateresponse = await formulaireInstance.get('/Template/NonCadreTemplate');
        const { templateId } = Templateresponse.data;
        setTemplateId(templateId);

        const response = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
        console.log('API Response:', response.data);
        setFormTemplate(response.data);
      } catch (error) {
        console.error('Error fetching form template:', error);
      }
    };
    fetchTemplate();
  }, [templateId]);

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

  const handlePhaseClick = async (phase) => {
    // Met à jour la phase active
    setActivePhase(phase);
  
    try {
      // Premier appel API : Récupérer l'historique de la phase
      const historyResponse = await formulaireInstance.get(`/archive/historyNonCadre/${userId}/${evalId}/${phase}`);
      if (historyResponse && historyResponse.data) {
        setHistoryByPhase(historyResponse.data);
        setIndicatorsSum(historyResponse.data.indicatorsSum || []);
        setCompetenceAvg(historyResponse.data.competenceAvg || []);
        setIndicatorAvg(historyResponse.data.indicatorAvg || []);
        console.log('Historique des données:', historyResponse.data);
      } else {
        console.error('Structure de réponse inattendue pour l\'historique:', historyResponse);
      }
  
      // Deuxième appel API : Calculer le score
      const scoreResponse = await formulaireInstance.get(`/archive/calculateScore/${userId}/${evalId}/${phase}`);
      if (scoreResponse && scoreResponse.data) {
        setScoreData(scoreResponse.data);
        console.log('Données de score:', scoreResponse.data);
      } else {
        console.error('Structure de réponse inattendue pour le score:', scoreResponse);
      }
  
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };  

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

        <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderTableCell>INDICATEURS de capacités et de compétences</HeaderTableCell>
                {formTemplate?.levels?.map((level) => (
                  <HeaderTableCell key={level.levelId}>{level.levelName} %</HeaderTableCell>
                ))}
                <HeaderTableCell sx={{ backgroundColor: '#dfedff', color: 'black' }}>Performance en %</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyByPhase?.competences?.map((competence) => {
                // Trouver la compétence correspondante dans le template pour obtenir les niveaux
                const templateCompetence = formTemplate?.competences?.find(
                  (templateComp) => templateComp.name === competence.competenceName
                );

                return (
                  <StyledTableRow key={competence.historyId}>
                    <StyledTableCell sx={{ fontSize: '0.8rem' }}>{competence.competenceName}</StyledTableCell>
                    {formTemplate?.levels?.map((level) => {
                      // Chercher le niveau correspondant pour chaque compétence dans le template
                      const competenceLevel = templateCompetence?.levels?.find((cl) => cl.levelId === level.levelId);
                      return (
                        <StyledTableCell sx={{ fontSize: '0.8rem' }} key={level.levelId}>
                          {competenceLevel ? competenceLevel.description : '-'}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell sx={{ backgroundColor: '#F9F9F9', textAlign: 'center' }}>
                      {competence.performance !== null ? `${competence.performance}%` : '-'}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
              {/* Ligne pour la pondération totale des indicateurs */}
              <StyledTableRow>
                <StyledTableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  Pondération totale des indicateurs :{' '}
                  {evaluationDetails?.competenceWeightTotal ? `${evaluationDetails.competenceWeightTotal} %` : '-'}
                </StyledTableCell>
                <StyledTableCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  TOTAL de la performance des indicateur
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>
                  {scoreData?.competenceAvg ?? '-'} %
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 0 }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <HeaderTableCell>INDICATEURS METIERS</HeaderTableCell>
                <HeaderTableCell>RESULTATS ATTENDUS</HeaderTableCell>
                <HeaderTableCell>RESULTATS en % d'atteinte sur 100%</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedIndicators).map(([indicatorName, indicators]) => (
                <React.Fragment key={indicatorName}>
                  {indicators.map((indicator, index) => (
                    <TableRow key={`${indicatorName}-${index}`}>
                      {index === 0 && (
                        <StyledTableCell rowSpan={indicators.length + 1}>
                          {indicatorName}
                        </StyledTableCell>
                      )}
                      <StyledTableCell>{indicator.resultText ? indicator.resultText : ' -'}</StyledTableCell>
                      <StyledTableCell>{indicator.result !== null ? `${indicator.result}%` : ' - '}</StyledTableCell>
                    </TableRow>
                  ))}
                  {/* Ligne de somme pour chaque indicatorName */}
                  <TableRow>
                    <StyledTableCell colSpan={1} sx={{ fontWeight: 'bold', backgroundColor: '#E8EAF6' }}>
                      Total
                    </StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 'bold', backgroundColor: '#E8EAF6'}}>
                      {indicatorsSum.find(sum => sum.name === indicatorName)?.totalResult !== undefined
                        ? `${indicatorsSum.find(sum => sum.name === indicatorName).totalResult}%`
                        : '- '}
                    </StyledTableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              {/* Ligne pour la performance totale */}
              <StyledTableRow>
                <StyledTableCell colSpan={1} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  TOTAL de la performance des indicateurs :{' '}
                  {evaluationDetails?.indicatorWeightTotal ? `${evaluationDetails.indicatorWeightTotal} %` : '-'}
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>
                  TOTAL de la performance des indicateur
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>
                  {scoreData?.indicatorAvg ?? '-'} %
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper} sx={{ borderRadius: 0, mt: 5 }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableBody>
              <StyledTableRow>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#FFF9D1' }}>
                  TOTAL pondération (100%): {formTemplate?.competenceWeightTotal != null && formTemplate?.indicatorWeightTotal != null
                  ? `${formTemplate.competenceWeightTotal + formTemplate.indicatorWeightTotal} %`
                  : '-'}
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#FFF9D1' }}>
                  PERFORMANCE du contrat d'objectifs
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>
                  {scoreData?.score ?? '-'} %
                </StyledTableCell>
              </StyledTableRow>
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
                {evaluationDetails?.fixationObjectif
                  ? new Date(evaluationDetails.fixationObjectif).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Date évaluation mi-parcours :{' '}
                {evaluationDetails?.miParcours
                  ? new Date(evaluationDetails.miParcours).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '-'}
              </Typography>
              <Typography variant="body1">
                Date de l'entretien final :{' '}
                {evaluationDetails?.final
                  ? new Date(evaluationDetails.final).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '-'}
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
export default EvaluationPhasesNonCadre;