import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { authInstance } from '../../../axiosConfig';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
// import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // New icon for "Cadre"
// Alternatively, you can use:
import WorkIcon from '@mui/icons-material/Work';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.light,
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0) 77.58%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

// ==============================|| DASHBOARD - CADRES COUNT DARK CARD ||============================== //

const CountCadre = ({ isLoading }) => {
  const theme = useTheme();
  const [cadresCount, setCadresCount] = useState(null);

  useEffect(() => {
      const fetchUserCount = async () => {
        try {
          // Remplacez l'URL par celle de votre API backend
          const response = await authInstance.get(`/StatUser/user/count`);
          
          // Extraire uniquement le total Cadre + NonCadre
          const cadre = response.data.Cadre;
    
          // Mettre à jour l'état avec la valeur récupérée
          setCadresCount(cadre);
        } catch (err) {
          console.error('Erreur lors de la récupération du nombre de collaborateurs:', err);
          setError('Impossible de charger les données.');
        } finally {
          setLoading(false);
        }
      };
    
      fetchUserCount();
    }, []);

  return (
    <>
      {isLoading || cadresCount === null ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            <List sx={{ py: 0 }}>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.largeAvatar,
                      bgcolor: 'primary.800',
                      color: '#fff'
                    }}
                  >
                    <WorkIcon fontSize="inherit" /> {/* New icon for Cadre */}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{ py: 0, my: 0.45 }}
                  primary={
                    <Typography variant="h4" sx={{ color: '#fff' }}>
                      {cadresCount} {/* Display the fetched count here */}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="subtitle2" sx={{ color: 'primary.light', mt: 0.25 }}>
                      Cadre
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

CountCadre.propTypes = {
  superiorId: PropTypes.string.isRequired, // Expected superior ID to fetch the count
  isLoading: PropTypes.bool
};

export default CountCadre;