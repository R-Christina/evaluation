import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Typography,
  Button,
  Alert,
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material';

import { formulaireInstance } from '../../../axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

const Liste = ({ isDataUpdated }) => {
  const creer = 1;
  const en_cours = 2;
  const cloturer = 3;
  const [evaluations, setEvaluations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [evaluationsPerPage] = useState(5);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [editableEvaluation, setEditableEvaluation] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();
  const HABILITATION_ADD = 12;
  const HABILITATION_EDIT = 13;

  const checkPermissions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id;

      // Vérifier l'habilitation pour l'ajout (1)
      const addResponse = await formulaireInstance.get(`/Periode/test-authorization?userId=${userId}&requiredHabilitationAdminId=${HABILITATION_ADD}`);
      setCanAdd(addResponse.data.hasAccess);

      // Vérifier l'habilitation pour la modification (2)
      const editResponse = await formulaireInstance.get(`/Periode/test-authorization?userId=${userId}&requiredHabilitationAdminId=${HABILITATION_EDIT}`);
      setCanEdit(editResponse.data.hasAccess);
    } catch (error) {
      const errorData = error.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors de la vérification des autorisations.'
      );
    }
  };

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const response = await formulaireInstance.get('/Periode/AllEvaluation');
      setEvaluations(response.data);
    } catch (err) {
      const errorData = err.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors de la récupération des évaluations.'
      );
    } finally {
      setLoading(false);
    } 
  };

  useEffect(() => {
    checkPermissions();
    fetchEvaluations();
  }, [isDataUpdated]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastEvaluation = (currentPage + 1) * evaluationsPerPage;
  const indexOfFirstEvaluation = indexOfLastEvaluation - evaluationsPerPage;
  const currentEvaluations = Array.isArray(evaluations)
    ? evaluations.slice(indexOfFirstEvaluation, indexOfLastEvaluation)
    : [];


  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
  };

  const handleEditClick = (evaluation) => {
    setEditingEvaluationId(evaluation.evalId);
    setEditableEvaluation({
      evalAnnee: evaluation.evalAnnee,
      fixationObjectif: evaluation.fixationObjectif.split('T')[0],
      miParcours: evaluation.miParcours.split('T')[0],
      final: evaluation.final.split('T')[0],
      templateId: evaluation.templateId,
      titre: evaluation.titre,
      type: evaluation.type
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableEvaluation({ ...editableEvaluation, [name]: value });
  };

  const handleSaveClick = async (evalId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id;
  
      await formulaireInstance.put(`Periode/edit/${evalId}?userId=${userId}`, {
        titre: editableEvaluation.titre,
        evalAnnee: editableEvaluation.evalAnnee,
        fixationObjectif: editableEvaluation.fixationObjectif,
        miParcours: editableEvaluation.miParcours,
        final: editableEvaluation.final,
        templateId: editableEvaluation.templateId,
        type: editableEvaluation.type // Reference editableEvaluation.type instead of evaluation.type
      });
      fetchEvaluations();
      setEditingEvaluationId(null);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      const errorData = error.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors de la sauvegarde de l\'évaluation.'
      );
    }
  };  

  const handleCancelClick = () => {
    setEditingEvaluationId(null);
    setEditableEvaluation({});
  };

  const debuterEvaluation = async (evalId) => {
    try {
      await formulaireInstance.put(`/Evaluation/start/${evalId}`);
      fetchEvaluations();
    } catch (error) {
      const errorData = error.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors du démarrage de l\'évaluation.'
      );
    }
  };

  const cloturerEvaluation = async (evalId) => {
    try {
      await formulaireInstance.put(`/Periode/cloturer/${evalId}`);
      fetchEvaluations();
    } catch (error) {
      const errorData = error.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors de la clôture de l\'évaluation.'
      );
    }
  };

  const handleAddClick = () => {
    navigate('/evaluation/ajoutEvaluation');
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Période</Typography>
            <Typography variant="h3" gutterBottom sx={{ marginTop: '0.5rem' }}>
              Liste des périodes d'évaluation
            </Typography>
          </Grid>
          <Grid item>
          {canAdd && ( 
            <Button variant="outlined" onClick={handleAddClick} startIcon={<AddCircleIcon />}>
              Ajouter
            </Button>
          )}
          </Grid>
        </Grid>
      </MainCard>
      {error && (
        <Alert severity="error" style={{ margin: '20px' }}>
          <pre>{error}</pre>
        </Alert>
      )}

      <TableContainer component="div" sx={{ padding: 2 }}>
        <Table aria-label="collapsible table" sx={{ border: '1px solid #e0e0e0', borderRadius: '4px',  }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Année</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Fixation des objectifs</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Mi-parcours</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Final</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Status</TableCell>
              {canEdit && 
              <>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px',borderRight: '1px solid #e0e0e0' }}>Action
              </TableCell>
              <TableCell></TableCell>
              </>
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {currentEvaluations.map((evaluation) => (
              <TableRow key={evaluation.evalId}>
                {editingEvaluationId === evaluation.evalId ? (
                  <>
                    <TableCell>
                      <input type="text" name="evalAnnee" value={editableEvaluation.evalAnnee} onChange={handleInputChange} />
                    </TableCell>
                    <TableCell>
                      <input type="text" name="titre" value={editableEvaluation.titre} onChange={handleInputChange} />
                    </TableCell>
                    <TableCell>
                      <input type="date" name="fixationObjectif" value={editableEvaluation.fixationObjectif} onChange={handleInputChange} />
                    </TableCell>
                    <TableCell>
                      <input type="date" name="miParcours" value={editableEvaluation.miParcours} onChange={handleInputChange} />
                    </TableCell>
                    <TableCell>
                      <input type="date" name="final" value={editableEvaluation.final} onChange={handleInputChange} />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleSaveClick(evaluation.evalId)}>
                        Sauvegarder
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
                        Annuler
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{evaluation.evalAnnee}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{evaluation.titre}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{formatDate(evaluation.fixationObjectif)}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{formatDate(evaluation.miParcours)}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{formatDate(evaluation.final)}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }} style={{ color: evaluation.etatId === en_cours ? '#fcd53b' : evaluation.etatId === creer ? '#00e676' : 'blue' }}>
                      {evaluation.etatDesignation || 'N/A'}
                    </TableCell>
                    {canEdit && (
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {evaluation.etatId === creer && (
                          <Button variant="outlined" color="primary" onClick={() => debuterEvaluation(evaluation.evalId)}>
                            Débuter
                          </Button>
                        )}
                        {evaluation.etatId === en_cours && (
                          <Button variant="outlined" color="primary" onClick={() => cloturerEvaluation(evaluation.evalId)}>
                            Clôturer
                          </Button>
                        )}
                        {evaluation.etatId === cloturer && (
                          <Button variant="outlined" color="secondary" disabled>
                            Clôturer
                          </Button>
                        )}
                      </TableCell>
                    )}
                    {canEdit && (
                    <TableCell>
                      
                        <Tooltip title="Éditer">
                          <IconButton onClick={() => handleEditClick(evaluation)} disabled={evaluation.etatId === cloturer}>
                            <FontAwesomeIcon
                              icon={faEdit}
                              style={{
                                color: evaluation.etatId === cloturer ? 'gray' : 'blue',
                                fontSize: '1rem'
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                    </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={evaluations.length > evaluationsPerPage ? evaluations.length : 1}
        rowsPerPage={evaluationsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
};

export default Liste;
