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
  TextField,
  Checkbox,
  Alert,
} from '@mui/material';


import { authInstance } from '../../../axiosConfig';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';

const AjoutHabilitation = () => {
  const [specs, setSpecs] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); 
  const [errorMessage, setErrorMessage] = useState(""); // État pour le message d'erreur
  const navigate = useNavigate();

  const fetchSpecs = async () => {
    try {
      const response = await authInstance.get('/Habilitation/admins');
      setSpecs(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des specs');
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Réinitialiser le message d'erreur
    try {
      const habilitationAdmins = specs
        .filter(spec => selectedIds.includes(spec.id))
        .map(spec => ({ id: spec.id, name: spec.name, sectionName: spec.sectionName }));

      const newSpec = {
        label: newLabel,
        habilitationAdmins: habilitationAdmins 
      };
      
      console.log('Objet envoyé à l\'API:', newSpec); 

      const response = await authInstance.post('/Habilitation', newSpec);
      setSpecs((prevSpecs) => [...prevSpecs, response.data]);
      setNewLabel(""); // Réinitialiser le champ après la soumission
      setSelectedIds([]); // Réinitialiser les IDs sélectionnés

      navigate('/habilitation/ListeHabilitation');

    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Une erreur est survenue lors de l'ajout."
      );      
    }
  };

  return (
      <Paper>
        <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Typography variant="subtitle2">Habilitation</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h3">Ajouter une nouvelle habilitation</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {errorMessage && (
          <Alert severity="error" style={{ margin: '20px' }}>
            {errorMessage} {/* Afficher le message d'erreur */}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Label"
                name="label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Selectionner</TableCell>
                  <TableCell>Label</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {specs.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(spec.id)} 
                        onChange={() => handleCheckboxChange(spec.id)} 
                      />
                    </TableCell>
                    <TableCell>{spec.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container justifyContent="flex-end" item xs={12} mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Ajouter
            </Button>
          </Grid>
        </form>
        </MainCard>
      </Paper>
  );
};

export default AjoutHabilitation;