import React, { useState, useEffect } from 'react';
import { authInstance } from '../../../../../axiosConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MainCard from 'ui-component/cards/MainCard';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';

function AllNonCadre() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUsersCadre = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authInstance.get('/User/users-non-cadre'); // Appel API
      setUsers(response.data); // Stockez les utilisateurs dans l'état
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs Cadre :', err);
      setError(err.response?.data?.message || 'Erreur inconnue');
    } finally {
      setLoading(false);  
    }
  };

  const handleUserClick = (userId, typeUser) => {
    navigate(`/allEvaluation/nonCadreYear/${userId}/${typeUser}`);
  };

  useEffect(() => {
    fetchUsersCadre();
  }, []);

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">Erreur : {error}</Typography>;
  }

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Archive</Typography>
            <Typography variant="h3" sx={{ marginTop: '0.5rem' }}>
              Archive Evaluation Collaborateur Cadre
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  backgroundColor: '#E8EAF6',
                  '&:hover': {
                    backgroundColor: '#e3eaf5'
                  }
                }}
                onClick={() => handleUserClick(user.id, user.typeUser)}
              >
                <FolderIcon sx={{ fontSize: 24, color: 'rgb(57, 73, 171)', marginRight: '16px' }} />
                <CardContent sx={{ flexGrow: 1, padding: 0 }}>
                  <Typography variant="body1" sx={{ color: '#1a202c' }}>
                    {user.name}
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

export default AllNonCadre;