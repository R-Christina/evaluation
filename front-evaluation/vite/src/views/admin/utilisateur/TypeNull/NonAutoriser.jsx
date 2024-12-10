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
  Menu
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KeyboardArrowDown, KeyboardArrowUp, FilterList as FilterListIcon } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import MainCard from 'ui-component/cards/MainCard';
import { Link } from 'react-router-dom';
import { authInstance, formulaireInstance } from '../../../../axiosConfig';

const NOnAutoriser = () => {
  const [openRow, setOpenRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const CLASSIFIER = 8;
  const [canClassify, setCanClassify] = useState(false);

  const checkPermissions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id;

      // Vérifier l'habilitation pour pourvoir classifier (8)
      const classifyResponse = await formulaireInstance.get(`/Periode/test-authorization?userId=${userId}&requiredHabilitationAdminId=${CLASSIFIER}`);
      setCanClassify(classifyResponse.data.hasAccess);

    } catch (error) {
      const errorData = error.response?.data;
      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData, null, 2)
          : 'Erreur lors de la vérification des autorisations.'
      );
    }
  };
  useEffect(() => {
    checkPermissions(); // Load initial users with null type on component mount
  }, []);

  useEffect(() => {
    fetchInitialUsers(); // Load initial users with null type on component mount
  }, []);

  // Fetch initial data for users with TypeUser null
  const fetchInitialUsers = async () => {
    try {
      const response = await authInstance.get('/User/users-with-null-type');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching users with null type:', error);
    }
  };

  // Fetch filtered data for users with TypeUser null
  const fetchFilteredUsers = async (nameOrMail, department) => {
    try {
      const response = await authInstance.get('/User/all-null-type', {
        params: {
          NameOrMail: nameOrMail || undefined,
          Department: department || undefined
        }
      });
      setEmployees(response.data);
      setCurrentPage(1); // Reset to first page after filtering
    } catch (error) {
      console.error('Error fetching filtered users with null type:', error);
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
    fetchFilteredUsers(value, departmentFilter);
  };

  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setDepartmentFilter(value);
    fetchFilteredUsers(searchTerm, value);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };


  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Utilisateur</Typography>
            <Typography variant="h3" gutterBottom sx={{ marginTop: '0.5rem' }}>
              Liste des collaborateurs non classifier
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
            {canClassify && (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              sx={{ marginLeft: 2 }}
              onClick={() => navigate('/utilisateur/autorisation')}
            >
              Autoriser
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
            width: 400, // Width for side-by-side fields
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
          <Grid item xs={6}>
            <TextField label="Nom ou Email" value={searchTerm} onChange={handleSearchChange} variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Département" value={departmentFilter} onChange={handleDepartmentChange} variant="outlined" fullWidth />
          </Grid>
        </Grid>
      </Menu>

      <TableContainer component="div" sx={{ padding: 2 }}>
        <Table aria-label="collapsible table" sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}> 
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Matricule</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Nom et prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '12px', borderRight: '1px solid #e0e0e0' }}>Département</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentEmployees.map((employee) => (
              <React.Fragment key={employee.id}>
                <TableRow hover>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                    <Link to={`/employee/${employee.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {employee.matricule}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                      {employee.name}
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{employee.email}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{employee.department}</TableCell>
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
    </Paper>
  );
};

export default NOnAutoriser;
