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
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';

// Styled components for table cells and rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: '12px',
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textAlign: 'center',
}));

const TotalStyledTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: '#d4edda',
  textAlign: 'center',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Formulaire = () => {
  const templateId = 4;
  const navigate = useNavigate();
  const [formTemplate, setFormTemplate] = useState(null);

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
  const handleUseClick = () => navigate('/formulaireNonCadre/use');

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
            {/* <Button variant="outlined" onClick={handleUseClick} startIcon={<PanToolAltIcon />} sx={{ mr: 2 }}>
              Utiliser
            </Button> */}
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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>COLLABORATEUR</Typography>
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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>MANAGER</Typography>
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
                <HeaderTableCell sx={{ backgroundColor: '#dfedff', color: 'black'}}>Performance en %</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formTemplate?.competences?.map((competence) => (
                <StyledTableRow key={competence.competenceId}>
                  <StyledTableCell sx={{ fontSize: '0.8rem' }}>{competence.name}</StyledTableCell>
                  {formTemplate.levels.map((level) => {
                    const competenceLevel = competence.levels?.find((cl) => cl.levelId === level.levelId);
                    return <StyledTableCell sx={{ fontSize: '0.8rem' }} key={level.levelId}>{competenceLevel ? competenceLevel.description : '-'}</StyledTableCell>;
                  })}
                  <StyledTableCell sx={{ backgroundColor: '#F9F9F9'}}></StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table>
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
                    <StyledTableCell rowSpan={indicator.maxResults + 1}>
                      {indicator.label}
                    </StyledTableCell>
                  </TableRow>
                  {Array.from({ length: indicator.maxResults }).map((_, index) => (
                    <TableRow key={`${indicator.indicatorId}-${index}`}>
                      <StyledTableCell>-</StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>


        <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
          <Grid item xs={12}>
            {formTemplate?.helps?.map((help) => (
              <Box key={help.helpId} sx={{ mb: 3 }}>
                {/* Affichage du nom du help */}
                <Typography variant="body1" sx={{ mb: 1}}>
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
                  }}
                >
                </Box>
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
