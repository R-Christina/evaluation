import React, { useState, useEffect } from 'react';
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
  TextField,
  Box,
  Button,
  Pagination,
  Menu,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ClearIcon from '@mui/icons-material/Clear';
import MainCard from 'ui-component/cards/MainCard';
import { Link } from 'react-router-dom';
import { authInstance, formulaireInstance } from '../../../axiosConfig';
import RefreshIcon from '@mui/icons-material/Refresh';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';

const ListeUtilisateur = () => {
  const [openRow, setOpenRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [typeUserFilter, setTypeUserFilter] = useState('');
  const [matriculeFilter, setMatriculeFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [habilitationToDelete, setHabilitationToDelete] = useState({ userId: null, habilitationId: null, label: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSyncing, setIsSyncing] = useState(false); // État pour la synchronisation
  const [openEditDialog, setOpenEditDialog] = useState(false); // État pour le dialog d'édition
  const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné
  const [newTypeUser, setNewTypeUser] = useState(''); // Nouveau type d'utilisateur

  const [canAssign, setCanAssign] = useState(false);
  const ASSIGN_HABILITATION = 5; //assigner une habilitation a un utilisateur

  const [canEditUser, setCanEditUser] = useState(false);
  const UPADATE_USER = 7; //editer et actualiser les utilisateurs

  const checkPermissions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id;

      const assignResponse = await formulaireInstance.get(
        `/Periode/test-authorization?userId=${userId}&requiredHabilitationAdminId=${ASSIGN_HABILITATION}`
      );
      setCanAssign(assignResponse.data.hasAccess);

      const editUserResponse = await formulaireInstance.get(
        `/Periode/test-authorization?userId=${userId}&requiredHabilitationAdminId=${UPADATE_USER}`
      );
      setCanEditUser(editUserResponse.data.hasAccess);
    } catch (error) {
      const errorData = error.response?.data;
      setError(typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : 'Erreur lors de la vérification des autorisations.');
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const mapTypeUser = (type) => {
    const typeMapping = {
      Cadre: 'Cadre',
      NonCadre: 'NonCadre'
    };
    return typeMapping[type] || 'Aucun'; // Retourne "Aucun" si le type est null ou non mappé
  };

  const itemsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialUsers(); // Load initial unfiltered users on component mount
  }, []);

  // Fetch initial data using User/user
  const fetchInitialUsers = async () => {
    try {
      const response = await authInstance.get('/User/user');
      const mappedEmployees = response.data.map((employee) => ({
        ...employee,
        typeUser: mapTypeUser(employee.typeUser) // Appliquer le mapping au moment de la récupération
      }));
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching initial users:', error);
    }
  };

  // Fetch filtered data using User/all with query parameters
  const fetchFilteredUsers = async (nameOrMail, department, typeUser, matricule) => {
    try {
      const response = await authInstance.get('/User/all', {
        params: {
          NameOrMail: nameOrMail || undefined,
          Department: department || undefined,
          TypeUser: typeUser || undefined,
          m: matricule || undefined        
        }
      }
    );
    console.log('Fetching users with params:', response);
      setEmployees(response.data);
      setCurrentPage(1); // Reset to first page after filtering
    } catch (error) {
      console.error('Error fetching filtered users:', error);
      setSnackbar({ open: true, message: 'Erreur lors du filtrage des utilisateurs.', severity: 'error' });
    }
  };

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  // Open and close the filter menu
  const handleFilterIconClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  // Dynamic filtering as user types
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    fetchFilteredUsers(value, departmentFilter, typeUserFilter, matriculeFilter);
  };
  
  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setDepartmentFilter(value);
    fetchFilteredUsers(searchTerm, value, typeUserFilter, matriculeFilter);
  };
  
  const handleTypeUserChange = (event) => {
    const value = event.target.value;
    setTypeUserFilter(value);
    fetchFilteredUsers(searchTerm, departmentFilter, value, matriculeFilter);
  };
  
  const handleMatriculeChange = (event) => {
    const value = event.target.value;
    setMatriculeFilter(value);
    fetchFilteredUsers(searchTerm, departmentFilter, typeUserFilter, value);
  };  
  

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddClick = (userId) => {
    navigate(`/utilisateur/assignation/${userId}`); // Navigate with userId in the URL
  };

  const handleRemoveHabilitation = (userId, habilitationId, label) => {
    setHabilitationToDelete({ userId, habilitationId, label });
    setOpenDialog(true);
  };

  const confirmRemoveHabilitation = async () => {
    const { userId, habilitationId } = habilitationToDelete;
    try {
      const dto = {
        UserIds: [userId],
        HabilitationIds: [habilitationId]
      };

      await authInstance.post('/User/remove-habilitations', dto);

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) => {
          if (employee.id === userId) {
            return {
              ...employee,
              habilitations: employee.habilitations.filter((h) => h.id !== habilitationId)
            };
          }
          return employee;
        })
      );

      setSnackbar({ open: true, message: 'Habilitation supprimée avec succès.', severity: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression des habilitations:', error);
      const errorMessage = error.response?.data || 'Erreur lors de la suppression des habilitations.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setOpenDialog(false);
      setHabilitationToDelete({ userId: null, habilitationId: null, label: '' });
    }
  };

  const cancelRemoveHabilitation = () => {
    setOpenDialog(false);
    setHabilitationToDelete({ userId: null, habilitationId: null, label: '' });
  };

  const handleSyncUsers = async () => {
    setIsSyncing(true); // Démarrer la synchronisation
    try {
      const response = await authInstance.post(`/User/Actualize`);
      // Afficher les résultats de la synchronisation
      setSnackbar({
        open: true,
        message: `Synchronisation réussie! Ajoutés: ${response.data.Added}, Mis à jour: ${response.data.Updated}, Supprimés: ${response.data.Deleted}`,
        severity: 'success'
      });
      // Rafraîchir la liste des utilisateurs
      fetchInitialUsers();
    } catch (error) {
      console.error('Erreur lors de la synchronisation des utilisateurs:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la synchronisation des utilisateurs.',
        severity: 'error'
      });
    } finally {
      setIsSyncing(false); // Terminer la synchronisation
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);

    // Mapper les types utilisateur de chaîne vers des valeurs numériques
    const typeMapping = {
      Cadre: 0,
      NonCadre: 1
    };

    // Définir une valeur par défaut si le type utilisateur est inconnu ou null
    const mappedType = typeMapping[user.typeUser] ?? null;
    if (mappedType === null) {
      console.warn(`Type utilisateur inconnu ou null pour l'utilisateur : ${user.name}`);
    }
    setNewTypeUser(mappedType);
    setOpenEditDialog(true);
  };

  const handleUpdateUserType = async () => {
    if (!selectedUser) return;

    try {
      const dto = {
        UserIds: [selectedUser.id],
        NewType: newTypeUser
      };

      const response = await authInstance.put('/User/update-users-type', dto);

      setSnackbar({
        open: true,
        message: response.data, // "Les types d'utilisateur ont été mis à jour avec succès."
        severity: 'success'
      });

      // Mettre à jour localement les données avec le nouveau type mappé
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === selectedUser.id ? { ...employee, typeUser: mapTypeUser(newTypeUser === 0 ? 'Cadre' : 'NonCadre') } : employee
        )
      );

      setOpenEditDialog(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type d'utilisateur:", error);
      const errorMessage = error.response?.data || "Erreur lors de la mise à jour du type d'utilisateur.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Utilisateur</Typography>
            <Typography variant="h3" gutterBottom sx={{ marginTop: '0.5rem' }}>
              Liste des collaborateurs
            </Typography>
          </Grid>

          <Grid item>
            <IconButton
              onClick={handleFilterIconClick}
              sx={{
                borderRadius: '8px',
                border: '1px solid #ddd',
                padding: '8px',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: '#f0f0f0'
                }
              }}
            >
              <FilterListIcon stroke={1.5} size="24px" />
            </IconButton>
            {/* <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                sx={{ marginLeft: 2 }} 
                onClick={() => navigate('/utilisateur/assignationAll')}
              >
                Assigner
              </Button> */}
            {canEditUser && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                sx={{ marginLeft: 2 }}
                onClick={handleSyncUsers} // Changer l'action pour la synchronisation
                disabled={isSyncing} // Désactiver le bouton pendant la synchronisation
              >
                {isSyncing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            )}
          </Grid>
        </Grid>
      </MainCard>

      {/* Filter Menu Panel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        sx={{
          '& .MuiPaper-root': {
            padding: 2,
            width: 600, // Largeur pour les champs côte à côte
            borderRadius: 2,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            marginLeft: '-250px',
            marginTop: '-20px'
          }
        }}
      >
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>

        <Grid container spacing={2}>
          {/* Champ Matricule ajouté en premier */}
          <Grid item xs={12} md={3}>
            <TextField label="Matricule" value={matriculeFilter} onChange={handleMatriculeChange} variant="outlined" fullWidth />
          </Grid>

          {/* Champ Nom ou Email */}
          <Grid item xs={12} md={3}>
            <TextField label="Nom ou Email" value={searchTerm} onChange={handleSearchChange} variant="outlined" fullWidth />
          </Grid>

          {/* Champ Département */}
          <Grid item xs={12} md={3}>
            <TextField label="Département" value={departmentFilter} onChange={handleDepartmentChange} variant="outlined" fullWidth />
          </Grid>

          {/* Champ Type Utilisateur */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-user-label">Type</InputLabel>
              <Select labelId="type-user-label" label="Type" value={typeUserFilter} onChange={handleTypeUserChange}>
                <MenuItem value="Cadre">Cadre</MenuItem>
                <MenuItem value="NonCadre">Non-Cadre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Menu>

      <TableContainer component="div" sx={{ padding: 2 }}>
        <Table aria-label="collapsible table" sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>
                Matricule
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>
                Nom et prénom
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>
                Département
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Type</TableCell>
              {canEditUser && (
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>
                  Action
                </TableCell>
              )}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {currentEmployees.map((employee) => (
              <React.Fragment key={employee.id}>
                <TableRow>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                    <Link to={`/employee/${employee.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {employee.matricule}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{employee.name}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{employee.email}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{employee.department}</TableCell>
                  <TableCell sx={{ fontSize: '0.9rem', padding: '12px', textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color:
                          employee.typeUser === 'Cadre'
                            ? '#B07B00' // Texte jaune
                            : employee.typeUser === 'NonCadre'
                              ? '#2E7D32' // Texte vert
                              : '#ffffff', // Texte blanc
                        backgroundColor:
                          employee.typeUser === 'Cadre'
                            ? '#FFF5CC' // Fond jaune
                            : employee.typeUser === 'NonCadre'
                              ? '#DFF8E0' // Fond vert
                              : '#ffab91' // Fond rouge
                      }}
                    >
                      {mapTypeUser(employee.typeUser)}
                    </Box>
                  </TableCell>

                  {canEditUser && (
                    <TableCell sx={{ padding: '12px', borderRight: '1px solid #e0e0e0' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(employee)}
                        sx={{ textTransform: 'none', fontSize: 'small', padding: '8px 16px' }}
                      >
                        Éditer
                      </Button>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(employee.id)}
                      sx={{ color: openRow === employee.id ? '#1976d2' : '#757575' }}
                    >
                      {openRow === employee.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ padding: 0 }} colSpan={7}>
                    <Collapse in={openRow === employee.id} timeout="auto" unmountOnExit>
                      <Box sx={{ padding: '16px', backgroundColor: '#fafafa' }}>
                        <Grid container alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
                          <Typography variant="h6" component="div" color="textSecondary">
                            Habilitations
                          </Typography>
                          {canAssign && (
                            <Button
                              variant="outlined"
                              startIcon={<AddCircleIcon />}
                              onClick={() => handleAddClick(employee.id)}
                              sx={{ marginLeft: 2 }}
                            >
                              Ajouter
                            </Button>
                          )}
                        </Grid>
                        <Table size="small" aria-label="habilitation details">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#555' }}>Label</TableCell>
                              {canAssign && (
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#555' }}>
                                  Action
                                </TableCell>
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {employee.habilitations.map((habilitation) => (
                              <TableRow key={habilitation.id}>
                                <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{habilitation.label}</TableCell>
                                {canAssign && (
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveHabilitation(employee.id, habilitation.id, habilitation.label)}
                                      sx={{
                                        color: '#f44336',
                                        '&:hover': { backgroundColor: '#fdecea' }
                                      }}
                                    >
                                      <ClearIcon />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
        <Pagination
          count={Math.ceil(employees.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '1rem',
              margin: '0 4px',
              color: '#4a4a4a',
              backgroundColor: '#f7f9fc',
              border: '1px solid #ddd',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#e0e7ff',
                color: '#3f51b5'
              },
              marginBottom: 2,
              marginTop: 2
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#3f51b5',
              color: '#ffffff',
              fontWeight: 'bold',
              borderColor: '#3f51b5',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 10px rgba(63, 81, 181, 0.2)'
            }
          }}
        />
      </Grid>

      {/* Dialog de Confirmation de Suppression */}
      <Dialog
        open={openDialog}
        onClose={cancelRemoveHabilitation}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'habilitation <strong>{habilitationToDelete.label}</strong> ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveHabilitation} color="primary">
            Annuler
          </Button>
          <Button onClick={confirmRemoveHabilitation} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} aria-labelledby="edit-user-type-dialog-title">
        <DialogTitle id="edit-user-type-dialog-title">Modifier le Type d'Utilisateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sélectionnez le nouveau type pour l'utilisateur <strong>{selectedUser?.name}</strong>.
          </DialogContentText>
          <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
            <InputLabel id="new-type-user-label">Type</InputLabel>
            <Select labelId="new-type-user-label" label="Type" value={newTypeUser} onChange={(e) => setNewTypeUser(e.target.value)}>
              <MenuItem value={0}>Cadre</MenuItem>
              <MenuItem value={1}>Non-Cadre</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleUpdateUserType} color="secondary" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ListeUtilisateur;
