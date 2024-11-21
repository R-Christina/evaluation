import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formulaireInstance } from '../../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';
import {
  Grid,
  Typography,
  Button,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  Divider,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Styled components for table cells and rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: '12px'
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textAlign: 'center'
}));

const TotalStyledTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: '#d4edda',
  textAlign: 'center'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  }
}));

const Formulaire = () => {
  const [templateId, setTemplateId] = useState(null);
  const navigate = useNavigate();
  const [formTemplate, setFormTemplate] = useState(null);

  useEffect(() => {
    {
      const fetchCadreTemplateId = async () => {
        try {
          const response = await formulaireInstance.get('/Template/NonCadreTemplate');
          if (response.data?.templateId) {
            setTemplateId(response.data.templateId);
            console.log('templateId '+ response.data.templateId);
          } else {
            console.error('Template ID for Cadre not found in the response');
          }
        } catch (error) {
          console.error('Error fetching Cadre template ID:', error);
        }
      };
      fetchCadreTemplateId();
    }
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
        console.log('API Response:', response.data);
        setFormTemplate(response.data);
      } catch (error) {
        console.error('Error fetching form template:', error);
      }
    };
    fetchTemplate();
  }, [templateId]);

  const handleAddClick = () => navigate('/formulaireNonCadre/edit');

  return (
    <Paper sx={{ borderRadius: 0 }}>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Formulaire Non Cadre</Typography>
            <Typography variant="h3">Formulaire d’évaluation</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleAddClick} startIcon={<EditIcon />} sx={{ mr: 2 }}>
              Modifier
            </Button>
            <IconButton size="small">
              <FileDownloadIcon color="primary" />
            </IconButton>
          </Grid>
        </Grid>

        <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', p: 1, fontWeight: 'bold' }}>
          {formTemplate?.name || "Formulaire d'évaluation"}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={6}>
            <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                COLLABORATEUR
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">Nom :</Typography>
              <Typography variant="body1">Prénom :</Typography>
              <Typography variant="body1">Matricule :</Typography>
              <Typography variant="body1">Poste :</Typography>
              <Typography variant="body1">Département :</Typography>
              <Typography variant="body1">Direction :</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                MANAGER
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">Nom :</Typography>
              <Typography variant="body1">Prénom :</Typography>
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
              {formTemplate?.competences?.map((competence) => (
                <StyledTableRow key={competence.competenceId}>
                  <StyledTableCell sx={{ fontSize: '0.8rem' }}>{competence.name}</StyledTableCell>
                  {formTemplate.levels.map((level) => {
                    const competenceLevel = competence.levels?.find((cl) => cl.levelId === level.levelId);
                    return (
                      <StyledTableCell sx={{ fontSize: '0.8rem' }} key={level.levelId}>
                        {competenceLevel ? competenceLevel.description : '-'}
                      </StyledTableCell>
                    );
                  })}
                  <StyledTableCell sx={{ backgroundColor: '#F9F9F9' }}></StyledTableCell>
                </StyledTableRow>
              ))}
              {/* Ligne pour la pondération totale des indicateurs */}
              <StyledTableRow>
                <StyledTableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  {' '}
                  Pondération totale des indicateurs :{' '}
                  {formTemplate?.competenceWeightTotal ? `${formTemplate.competenceWeightTotal} %` : '-'}
                </StyledTableCell>
                <StyledTableCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  {' '}
                  TOTAL de la performance des indicateur
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>-</StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <HeaderTableCell>INDICATEURS METIERS</HeaderTableCell>
                <HeaderTableCell>RESULTATS ATTENDUS</HeaderTableCell>
                <HeaderTableCell>RESULTATS en % d'atteinte sur 100%</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formTemplate?.indicators?.map((indicator) => (
                <React.Fragment key={indicator.indicatorId}>
                  <TableRow>
                    <StyledTableCell rowSpan={indicator.maxResults + 1}>{indicator.label}</StyledTableCell>
                  </TableRow>
                  {Array.from({ length: indicator.maxResults }).map((_, index) => (
                    <TableRow key={`${indicator.indicatorId}-${index}`}>
                      <StyledTableCell>-</StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {/* Ligne pour la performance totale */}
              <StyledTableRow>
                <StyledTableCell colSpan={1} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                  TOTAL de la performance des indicateurs :{' '}
                  {formTemplate?.indicatorWeightTotal ? `${formTemplate.indicatorWeightTotal} %` : '-'}
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>
                  TOTAL de la performance des indicateur
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>-</StyledTableCell>
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
                <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>-</StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
          <Grid item xs={12}>
            {formTemplate?.helps?.map((help) => (
              <Box key={help.helpId} sx={{ mb: 3 }}>
                {/* Affichage du nom du help */}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {help.name}
                </Typography>

                {/* Champ stylisé pour ressembler à un input */}
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: 1.5,
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontSize: '0.9rem',
                    height: '100px'
                  }}
                ></Box>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Grid container sx={{ mt: 2 }} spacing={4}>
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Typography variant="body1">Signature Collaborateur</Typography>
            <Box sx={{ height: '50px', border: '1px solid black' }} /> {/* Ligne pour signature */}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Typography variant="body1">Signature Manager</Typography>
            <Box sx={{ height: '50px', border: '1px solid black' }} /> {/* Ligne pour signature */}
          </Grid>
        </Grid>
      </MainCard>
    </Paper>
  );
};

export default Formulaire;
