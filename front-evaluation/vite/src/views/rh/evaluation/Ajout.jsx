import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid, Typography, TextField, Button, Alert, Select, MenuItem } from '@mui/material';
import { formulaireInstance } from '../../../axiosConfig';
import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate

const Ajout = () => {
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    evalAnnee: '',
    fixationObjectif: '',
    miParcours: '',
    final: '',
    etatId: 1,
    templateId: '',
    titre: '',
    type: '', // Ajout du champ type initialisé vide
  });

  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Initialisez le hook useNavigate

  // Vérifie l'existence de l'utilisateur dans le localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await formulaireInstance.get('/Template/GetAllTemplates');
        setTemplates(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await formulaireInstance.post(`/Periode?userId=${userId}`, formData);

      if (response.data.Success === false) {
        setMessage(response.data.Errors.join(', ')); // Affiche les messages d'erreur du backend
        setSuccessMessage('');
      } else {
        setMessage('');
        setSuccessMessage(response.data.Message); // Affiche le message de succès
        setIsDataUpdated(true);

        // Réinitialiser les champs du formulaire
        setFormData({
          evalAnnee: '',
          fixationObjectif: '',
          miParcours: '',
          final: '',
          etatId: 1,
          templateId: '',
          titre: '',
          type: '',
        });


        navigate('/evaluation/listeEvaluation');
      }
    } catch (error) {
      const errors = error.response?.data?.Errors;
      if (errors && Array.isArray(errors)) {
        setMessage(errors.join(', '));
      } else {
        setMessage(error.response?.data?.Message || 'Une erreur est survenue.');
      }
      setSuccessMessage('');
    }
  };

  useEffect(() => {
    if (isDataUpdated) {
      setIsDataUpdated(false);
    }
  }, [isDataUpdated]);

  return (
    <MainCard>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography variant="subtitle2">Évaluation</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h3">Ajouter une nouvelle période d'évaluation</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {message && (
        <Alert severity="error" style={{ margin: '20px' }}>
          {message}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" style={{ margin: '20px' }}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} mt={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Année"
              name="evalAnnee"
              value={formData.evalAnnee}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              fullWidth
              name="type"
              value={formData.type}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Sélectionner le type d'évaluation
              </MenuItem>
              <MenuItem value="Cadre">Cadre</MenuItem>
              <MenuItem value="NonCadre">Non Cadre</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Select
              fullWidth
              name="templateId"
              value={formData.templateId}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Sélectionner un formulaire
              </MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.templateId} value={template.templateId}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fixation des objectifs"
              type="date"
              name="fixationObjectif"
              value={formData.fixationObjectif}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mi-parcours"
              type="date"
              name="miParcours"
              value={formData.miParcours}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Final"
              type="date"
              name="final"
              value={formData.final}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container justifyContent="flex-end" mt={2}>
              <Button type="submit" variant="contained" color="primary">
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default Ajout;
