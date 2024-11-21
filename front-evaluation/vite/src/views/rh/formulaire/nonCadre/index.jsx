import React, { useEffect, useState, useRef } from 'react';
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Menu,
  MenuItem 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import MoreVertIcon from '@mui/icons-material/MoreVert'; 


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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  }
}));

const Formulaire = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [templateId, setTemplateId] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // États pour l'ajout d'un indicateur
  const [isAddIndicatorModalOpen, setIsAddIndicatorModalOpen] = useState(false);
  const [newIndicatorLabel, setNewIndicatorLabel] = useState('');
  const [newMaxResults, setNewMaxResults] = useState(0);

  // États pour la mise à jour des indicateurs en masse
  const [isEditIndicatorsModalOpen, setIsEditIndicatorsModalOpen] = useState(false);
  const [indicators, setIndicators] = useState([]);

  const printRef = useRef();

  const fetchTemplate = async () => {
    if (!templateId) return;
    try {
      const response = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
      setFormTemplate(response.data);
    } catch (error) {
      console.error('Error fetching form template:', error);
      enqueueSnackbar('Erreur lors de la récupération du formulaire.', { variant: 'error' });
    }
  };

  useEffect(() => {
    const fetchNonCadreTemplateId = async () => {
      try {
        const response = await formulaireInstance.get('/Template/NonCadreTemplate');
        if (response.data?.templateId) {
          setTemplateId(response.data.templateId);
          console.log('templateId ' + response.data.templateId);
        } else {
          console.error('Template ID for Non-Cadre not found in the response');
        }
      } catch (error) {
        console.error('Error fetching Non-Cadre template ID:', error);
      }
    };
    fetchNonCadreTemplateId();
  }, []); // This useEffect does not depend on anything

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);


  const handleSaveTemplateName = async () => {
    if (!newTemplateName.trim()) {
      enqueueSnackbar('Le nom du formulaire ne peut pas être vide.', { variant: 'warning' });
      return;
    }
  
    try {
      const response = await formulaireInstance.put(
        `/Template/UpdateNonCadreTemplateName`,
        newTemplateName, // Send the string directly
        { headers: { 'Content-Type': 'application/json' } } // Ensure headers are correct
      );
  
      setFormTemplate((prevTemplate) => ({ ...prevTemplate, name: newTemplateName }));
      setIsModalOpen(false);
      enqueueSnackbar('Nom du formulaire mis à jour avec succès!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating template name:', error);
  
      if (error.response && error.response.data) {
        enqueueSnackbar(error.response.data.title || 'Erreur lors de la mise à jour.', { variant: 'error' });
      } else {
        enqueueSnackbar('Erreur réseau lors de la mise à jour.', { variant: 'error' });
      }
    }
  };  
  

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleEditIconClick = () => {
    setNewTemplateName(formTemplate?.name || '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddIndicatorClick = () => {
    setIsAddIndicatorModalOpen(true);
  };

  const handleAddIndicatorModalClose = () => {
    setIsAddIndicatorModalOpen(false);
    setNewIndicatorLabel('');
    setNewMaxResults(0);
  };

  const handleAddIndicator = async () => {
    try {
      const response = await formulaireInstance.post('/Template/addIndicator', {
        TemplateId: templateId,
        Label: newIndicatorLabel,
        MaxResults: newMaxResults,
      });

      console.log('Indicator added:', response.data);
      enqueueSnackbar('Indicateur ajouté avec succès!', { variant: 'success' });

      // Mettre à jour immédiatement le template localement
      const newIndicator = {
        indicatorId: response.data.IndicatorId,
        label: newIndicatorLabel,
        maxResults: newMaxResults,
        isActive: true,
      };

      setFormTemplate((prevTemplate) => ({
        ...prevTemplate,
        indicators: [...prevTemplate.indicators, newIndicator],
      }));
      handleAddIndicatorModalClose();
    } catch (error) {
      console.error('Error adding indicator:', error);
      enqueueSnackbar('Erreur lors de l\'ajout de l\'indicateur.', { variant: 'error' });
    }
  };

  // Fonction pour récupérer tous les indicateurs
  const fetchAllIndicators = async () => {
    try {
      const response = await formulaireInstance.get('/Template/AllIndicator');
      setIndicators(response.data.map(indicator => ({
        indicatorId: indicator.indicatorId, // Assurez-vous que les noms des propriétés correspondent
        label: indicator.label,
        maxResults: indicator.maxResults,
        isActive: indicator.isActive,
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération des indicateurs:', error);
      enqueueSnackbar('Erreur lors de la récupération des indicateurs.', { variant: 'error' });
    }
  };

  // Fonction pour ouvrir le modal de mise à jour des indicateurs
  const handleEditIndicatorsClick = () => {
    fetchAllIndicators();
    setIsEditIndicatorsModalOpen(true);
  };

  // Fonction pour fermer le modal de mise à jour des indicateurs
  const handleEditIndicatorsModalClose = () => {
    setIsEditIndicatorsModalOpen(false);
  };

  // Fonction pour gérer les changements dans les champs des indicateurs
  const handleIndicatorChange = (id, field, value) => {
    setIndicators((prevIndicators) =>
      prevIndicators.map((indicator) =>
        indicator.indicatorId === id ? { ...indicator, [field]: value } : indicator
      )
    );
  };

  // Fonction pour sauvegarder tous les indicateurs mis à jour
  const handleSaveAllIndicators = async () => {
    try {
      const updates = indicators.map((indicator) => ({
        IndicatorId: indicator.indicatorId, // Doit être un int
        NewLabel: indicator.label,
        NewMaxResults: indicator.maxResults,
        IsActive: indicator.isActive,
      }));
      console.log('Mise à jour des indicateurs:', updates);
  
      const response = await formulaireInstance.put('/Template/UpdateIndicators', updates);
  
      console.log('Indicateurs mis à jour:', response.data);
      enqueueSnackbar('Indicateurs mis à jour avec succès!', { variant: 'success' });
  
      // Refresh template after updating
      await fetchTemplate(); // Ensure this function is accessible here
  
      // Reset state
      setIndicators([]);
      handleEditIndicatorsModalClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des indicateurs:', error);
      if (error.response && error.response.data) {
        enqueueSnackbar(`Erreur: ${error.response.data.Message || 'Mise à jour des indicateurs échouée.'}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Erreur lors de la mise à jour des indicateurs.', { variant: 'error' });
      }
    }
  };

  const DropdownMenu = ({ handleAddIndicatorClick, handleEditIndicatorsClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
  
    const handleAddIndicator = () => {
      handleAddIndicatorClick();
      handleMenuClose();
    };

    const handleEditIndicator = () => {
      handleEditIndicatorsClick();
      handleMenuClose();
    };
    return (
      <>
        <IconButton onClick={handleMenuOpen} color="primary">
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleAddIndicator}>
            <AddIcon fontSize="small" sx={{ mr: 1 }} /> Ajouter une indicateur métier
          </MenuItem>
          <MenuItem onClick={handleEditIndicator}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Modifier les indicateurs métiers
          </MenuItem>
        </Menu>
      </>
    );
  };

  const exportPDF = () => {
    const input = printRef.current;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('formulaire_Non_Cadre.pdf');
      })
      .catch((err) => {
        console.error('Erreur lors de la génération du PDF', err);
        enqueueSnackbar('Erreur lors de la génération du PDF.', { variant: 'error' });
      });
  };

  return (
    <Paper sx={{ borderRadius: 0 }}>
      <MainCard>
        {/* En-tête du formulaire */}
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Formulaire Non Cadre</Typography>
            <Typography variant="h3">Formulaire d’évaluation</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleEditClick}
              startIcon={isEditing ? <DoneIcon /> : <EditIcon />}
              sx={{ mr: 2 }}
            >
              {isEditing ? 'Terminer' : 'Modifier'}
            </Button>
            <IconButton size="small" onClick={exportPDF}>
              <FileDownloadIcon color="primary" />
            </IconButton>
          </Grid>
        </Grid>

        {/* Contenu du formulaire */}
        <Box sx={{ padding: 2 }} ref={printRef}>
          {/* Titre du formulaire avec icône d'édition */}
          <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', p: 1, fontWeight: 'bold', position: 'relative' }}>
            {formTemplate?.name}
            {isEditing && (
              <IconButton size="small" onClick={handleEditIconClick}>
                <EditIcon color="primary" />
              </IconButton>
            )}
          </Typography>

          {/* Sections COLLABORATEUR et MANAGER */}
          <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
            <Grid item xs={6}>
              <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  COLLABORATEUR
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">Nom :</Typography>
                <Typography variant="body1">Matricule :</Typography>
                <Typography variant="body1">Poste :</Typography>
                <Typography variant="body1">Département :</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  MANAGER
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">Nom :</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Table des compétences */}
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
                    Pondération totale des indicateurs :{' '}
                    {formTemplate?.competenceWeightTotal ? `${formTemplate.competenceWeightTotal} %` : '-'}
                  </StyledTableCell>
                  <StyledTableCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#eaf3e0' }}>
                    TOTAL de la performance des indicateur
                  </StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaf3e0' }}>-</StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
          

          {/* Table des indicateurs métiers */}
          <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing && (
                    <DropdownMenu
                      handleEditIndicatorsClick={handleEditIndicatorsClick}
                      handleAddIndicatorClick={handleAddIndicatorClick}
                /> )}
                </Grid>
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
                      {/* First row with the indicator label */}
                      <TableRow>
                        <StyledTableCell rowSpan={indicator.maxResults + 1}>{indicator.label}</StyledTableCell>
                        <StyledTableCell>-</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </TableRow>

                      {/* Rows for the results */}
                      {Array.from({ length: indicator.maxResults - 1 }).map((_, index) => (
                        <TableRow key={`${indicator.indicatorId}-${index}`}>
                          <StyledTableCell>-</StyledTableCell>
                          <StyledTableCell></StyledTableCell>
                        </TableRow>
                      ))}

                      {/* Total row for the indicator */}
                      <TableRow>
                        <StyledTableCell colSpan={1} sx={{ fontWeight: 'bold', backgroundColor: '#E8EAF6' }}>
                          Total
                        </StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#E8EAF6' }}>
                          {/* Add logic here for the calculated total, if applicable */}
                          -
                        </StyledTableCell>
                      </TableRow>
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

          {/* Table des pondérations */}
          <TableContainer component={Paper} sx={{ borderRadius: 0, mt: 5 }}>
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell sx={{ fontWeight: 'bold', textAlign: 'left', backgroundColor: '#FFF9D1' }}>
                    TOTAL pondération (100%):{' '}
                    {formTemplate?.competenceWeightTotal != null && formTemplate?.indicatorWeightTotal != null
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

          {/* Section des aides */}
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

          {/* Sections des signatures */}
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
        </Box>

        {/* Modal pour éditer le nom du template */}
        <Dialog open={isModalOpen} onClose={handleModalClose}>
          <DialogTitle>Modifier le titre du formulaire</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nouveau titre"
              type="text"
              fullWidth
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="primary">
              Annuler
            </Button>
            <Button onClick={handleSaveTemplateName} color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal pour ajouter un indicateur */}
        <Dialog open={isAddIndicatorModalOpen} onClose={handleAddIndicatorModalClose}>
          <DialogTitle>Ajouter un Indicateur</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de l'indicateur"
              type="text"
              fullWidth
              value={newIndicatorLabel}
              onChange={(e) => setNewIndicatorLabel(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Nombre maximum de résultats"
              type="number"
              fullWidth
              value={newMaxResults}
              onChange={(e) => setNewMaxResults(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddIndicatorModalClose} color="primary">
              Annuler
            </Button>
            <Button onClick={handleAddIndicator} color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal pour mettre à jour les indicateurs en masse */}
        <Dialog open={isEditIndicatorsModalOpen} onClose={handleEditIndicatorsModalClose} maxWidth="md" fullWidth>
          <DialogTitle>Modifier les Indicateurs</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Nombre Max de Résultats</TableCell>
                    <TableCell>Actif</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {indicators.map((indicator) => (
                    <TableRow key={indicator.indicatorId}>
                      <TableCell>
                        <TextField
                          value={indicator.label}
                          onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'label', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={indicator.maxResults}
                          onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'maxResults', parseInt(e.target.value))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={indicator.isActive}
                          onChange={(e) => handleIndicatorChange(indicator.indicatorId, 'isActive', e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditIndicatorsModalClose} color="secondary">
              Fermer
            </Button>
            <Button onClick={handleSaveAllIndicators} color="primary" variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </Paper>
  );
};

export default Formulaire;
