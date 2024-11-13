import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Grid,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MainCard from 'ui-component/cards/MainCard';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { authInstance } from '../../../axiosConfig';

const ListeHabilitation = () => {
  const [habilitations, setHabilitations] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const navigate = useNavigate();

  const fetchHabilitations = async () => {
    try {
      const response = await authInstance.get('/Habilitation');
      setHabilitations(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des habilitations');
    }
  };

  useEffect(() => {
    fetchHabilitations();
  }, []);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  const handleAddClick = () => {
    navigate('/habilitation/AjoutHabilitation');
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Habilitation</Typography>
            <Typography variant="h3" gutterBottom sx={{ marginTop: '0.5rem' }}>
              Liste des habilitations
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleAddClick}
              startIcon={<AddCircleIcon />}
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
      </MainCard>

      <TableContainer>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {habilitations.map((habilitation) => (
              <React.Fragment key={habilitation.id}>
                <TableRow hover>
                  <TableCell>{habilitation.label}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditClick(habilitation.id)} // Notez la correction ici
                      startIcon={<EditIcon />}
                      color="primary"
                      sx={{ marginRight: 1 }}
                    >
                      Éditer
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleDeleteClick(habilitation.id)} // Notez la correction ici
                      startIcon={<DeleteIcon />}
                      color="error"
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                  <TableCell padding="checkbox">
                    <IconButton size="small" color="success" onClick={() => toggleRow(habilitation.id)}>
                      {openRow === habilitation.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                    <Collapse in={openRow === habilitation.id} timeout="auto" unmountOnExit>
                      <Box
                        sx={{
                          margin: 1,
                          padding: '1rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: '#f9f9f9',
                        }}
                      >
                        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                          Détails
                        </Typography>
                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                          {habilitation.habilitationAdmins.map((admin) => (
                            <li key={admin.id} style={{ marginBottom: '0.5rem' }}>
                              <Typography variant="body2" sx={{ color: '#555' }}>
                                {admin.name}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ListeHabilitation;
