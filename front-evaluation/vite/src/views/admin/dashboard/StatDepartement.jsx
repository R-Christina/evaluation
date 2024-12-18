import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Grid, Card, CardContent, Typography, Box, Avatar, CircularProgress } from '@mui/material';
import { formulaireInstance } from '../../../axiosConfig';

const StatDepartement = ({ phase = 'Évaluation Finale' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les données depuis l'API avec les paramètres
  const fetchData = async () => {
    try {
      const response = await formulaireInstance.get(`/Stat/averageScoresByYearAndDepartment/${phase}`);
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de récupérer les données.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [phase]); // Le fetchData sera appelé lorsque 'phase' change

  // Préparer les données pour Recharts
  const prepareRechartsData = () => {
    if (!data || !data.averageScoresByYearAndDepartment) return [];

    const years = Array.from(new Set(data.averageScoresByYearAndDepartment.map((item) => item.year))).sort((a, b) => a - b); // Trier les années par ordre croissant

    // Créer un tableau de données pour chaque année et chaque département
    return years.map((year) => {
      const yearData = data.averageScoresByYearAndDepartment.find((item) => item.year === year);
      let yearObj = { year: year.toString() };

      if (yearData && yearData.departments) {
        yearData.departments.forEach((department) => {
          yearObj[department.department] = department.averageScore || 0;
        });
      }

      return yearObj;
    });
  };

  const rechartsData = prepareRechartsData();

  // Fonction pour générer une couleur unique par département
  const generateColorForDepartment = (departmentName) => {
    let hash = 0;
    for (let i = 0; i < departmentName.length; i++) {
      hash = departmentName.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      color += ('00' + ((hash >> (i * 8)) & 0xff).toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {/* Titre et Description */}
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6" color="textPrimary">
                  Moyennes Annuelles des Contrats d'Objectifs par Département
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Comparaison des scores moyens entre départements
                </Typography>
              </Grid>
            </Grid>

            {/* Zone de Contenu */}
            <Box sx={{ width: '100%', height: '50vh', mt: 2 }}>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" color="error">
                    {error}
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rechartsData} margin={{ top: 20, bottom: 5 }}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    {/* Dynamically create lines for each department */}
                    {data?.averageScoresByYearAndDepartment?.[0]?.departments?.map((department) => (
                      <Line
                        key={department.department}
                        type="monotone"
                        dataKey={department.department}
                        stroke={generateColorForDepartment(department.department)} // Applique la couleur générée
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>

            {/* Affichage des Moyennes par Département */}
            {!loading && !error && data && data.averageScoresByYearAndDepartment?.[0]?.departments && (
              <Grid container spacing={2} sx={{ mt: 3 }} justifyContent="center">
                {data.averageScoresByYearAndDepartment[0].departments.map((department) => (
                  <Grid item xs={12} md={6} key={department.department}>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Box
                        sx={{
                          backgroundColor: generateColorForDepartment(department.department),
                          width: 20,
                          height: 20,
                          borderRadius: '50%', // Pour garder une forme circulaire, comme l'Avatar
                          marginRight: 2
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {department.department}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatDepartement;
