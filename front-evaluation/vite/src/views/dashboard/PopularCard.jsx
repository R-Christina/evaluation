import PropTypes from 'prop-types';
import React from 'react';
import { formulaireInstance } from '../../axiosConfig';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

const PopularCard = ({ isLoading }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const managerId = user.id;

  const phase = 'Évaluation Finale';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await formulaireInstance.get(`/Stat/subordinates/averageScoresByYear/${managerId}/${encodeURIComponent(phase)}`);
        // La réponse est présumée OK si aucun catch n’est survenu
        const result = response.data;
        setData(result);
      } catch (error) {
        console.error('Erreur lors de la récupération des scores moyens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [managerId, phase]);

  // Pendant le chargement, on affiche le Skeleton
  if (isLoading || loading) {
    return <SkeletonPopularCard />;
  }

  if (!data || !data.averageScoresByYear || data.averageScoresByYear.length === 0) {
    return (
      <MainCard content={false}>
        <CardContent>
          <Typography variant="h6">Aucune donnée disponible</Typography>
        </CardContent>
      </MainCard>
    );
  }

  const sortedData = [...data.averageScoresByYear].sort((a, b) => a.year - b.year);

  const rows = sortedData.map((item, index) => {
    const previousScore = index > 0 ? sortedData[index - 1].averageScore : null;
    let trendingUp = null;
    if (previousScore !== null) {
      trendingUp = item.averageScore >= previousScore;
    }

    return (
      <React.Fragment key={item.year}>
        <Grid container direction="column">
          <Grid item>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="subtitle1" color="inherit">
                  {item.year}
                </Typography>
              </Grid>
              <Grid item>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1" color="inherit">
                      {item.averageScore.toFixed(2)} %
                    </Typography>
                  </Grid>
                  {/* On retire la condition previousScore !== null pour tester */}
                  <Grid item>
                    {item.averageScore < 50 ? (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '5px',
                          bgcolor: '#ff0000', // Rouge vif
                          color: '#ffffff', // Texte blanc
                          ml: 2
                        }}
                      >
                        <KeyboardArrowDownOutlinedIcon fontSize="small" />
                      </Avatar>
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '5px',
                          bgcolor: '#00ff00', // Vert vif
                          color: '#000000', // Texte noir
                          ml: 2
                        }}
                      >
                        <KeyboardArrowUpOutlinedIcon fontSize="small" />
                      </Avatar>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ my: 1.5 }} />
      </React.Fragment>
    );
  });

  return (
    <MainCard content={false}>
      <CardContent>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <Typography variant="h6">Moyenne des contrats d'objectifs annuel</Typography>
          </Grid>
          <Grid item xs={12} sx={{ pt: '16px !important' }}>
            {/* Pass the chart data to BajajAreaChartCard */}
            <BajajAreaChartCard averageData={data.averageScoresByYear} />
          </Grid>
          <Grid item xs={12}>
            {rows}
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
        <Button size="small" disableElevation>
          View All
          <ChevronRightOutlinedIcon />
        </Button>
      </CardActions>
    </MainCard>
  );
};

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  managerId: PropTypes.string.isRequired,
  phase: PropTypes.string.isRequired
};

export default PopularCard;
