// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   Paper,
//   Divider,
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton
// } from '@mui/material';
// import FolderIcon from '@mui/icons-material/Folder';
// import MainCard from 'ui-component/cards/MainCard';
// import { formulaireInstance } from '../../../../axiosConfig';
// import { useParams } from 'react-router-dom';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// function EvaluationPhasesCadre() {
//   const { userId, evalId } = useParams();
//   const [historyByPhase, setHistoryByPhase] = useState([]);
//   const [activePhase, setActivePhase] = useState('Fixation');
//   const [evaluationDetails, setEvaluationDetails] = useState(null);
//   const [totalWeightingSum, setTotalWeightingSum] = useState(0);
//   const [totalResultSum, setTotalResultSum] = useState(0);
//   const user = JSON.parse(localStorage.getItem('user')) || {};
//   const userNon = user.name || 'Utilisateur';
//   const poste = user.poste || 'N/A';
//   const departement = user.department || 'N/A';
//   const superiorName = user.superiorName || 'N/A';

//   const [isContentVisible, setIsContentVisible] = useState(true);

//   const printRef = useRef();

//   useEffect(() => {
//     // Charger la phase "Fixation" par défaut
//     handlePhaseClick('Fixation');
//     fetchEvaluationDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchEvaluationDetails = async () => {
//     try {
//       const response = await formulaireInstance.get(`/Evaluation/${evalId}`);
//       if (response && response.data) {
//         setEvaluationDetails(response.data);
//       } else {
//         console.error('Structure de réponse inattendue:', response);
//       }
//     } catch (error) {
//       console.error("Erreur lors de la récupération des détails de l'évaluation:", error);
//     }
//   };

//   const fetchTotalWeighting = async () => {
//     try {
//       const response = await formulaireInstance.get(`/archive/priority/totalWeighting/${evalId}/${userId}`);
//       if (response && response.data) {
//         setTotalWeightingSum(response.data.totalWeightingSum);
//         setTotalResultSum(0);
//         setHistoryByPhase((prevHistory) => {
//           const updatedHistory = [...prevHistory];
//           response.data.totalWeightings.forEach((item) => {
//             updatedHistory.forEach((objective) => {
//               if (objective.priorityName === item.priorityName) {
//                 objective.totalWeighting = item.totalWeighting;
//               }
//             });
//           });
//           return updatedHistory;
//         });
//       } else {
//         console.error('Structure de réponse inattendue:', response);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération de la pondération totale:', error);
//     }
//   };

//   const fetchTotalWeightingAndResult = async (phase) => {
//     try {
//       const response = await formulaireInstance.get(`/archive/priority/totalWeightingAndResult/${evalId}/${userId}/${phase}`);
//       if (response && response.data) {
//         setTotalWeightingSum(response.data.totalWeightingSum);
//         setTotalResultSum(response.data.totalResultSum);
//         setHistoryByPhase((prevHistory) => {
//           const updatedHistory = [...prevHistory];
//           response.data.totalWeightingAndResults.forEach((item) => {
//             updatedHistory.forEach((objective) => {
//               if (objective.priorityName === item.priorityName) {
//                 objective.totalWeighting = item.totalWeighting;
//                 objective.totalResult = item.totalResult;
//               }
//             });
//           });
//           return updatedHistory;
//         });
//       } else {
//         console.error('Structure de réponse inattendue:', response);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération de la pondération et des résultats:', error);
//     }
//   };

//   const handlePhaseClick = async (phase) => {
//     setActivePhase(phase);
//     setIsContentVisible(false); // Déclencher l'animation de sortie

//     setTimeout(async () => {
//       try {
//         const response = await formulaireInstance.get(`/archive/historyCadre/${userId}/${evalId}/${phase}`);
//         if (response && response.data) {
//           setHistoryByPhase(response.data);
//           if (phase === 'Fixation') {
//             await fetchTotalWeighting();
//           } else if (phase === 'Mi-Parcours' || phase === 'Évaluation Finale') {
//             await fetchTotalWeightingAndResult(phase);
//           }
//         }
//       } catch (error) {
//         console.error("Erreur lors de la récupération de l'historique de la phase:", error);
//       } finally {
//         setIsContentVisible(true); // Déclencher l'animation d'entrée
//       }
//     }, 400); // Synchronisé avec la transition CSS
//   };

//   const groupedData = historyByPhase.reduce((acc, curr) => {
//     const { priorityName } = curr;
//     if (!acc[priorityName]) {
//       acc[priorityName] = [];
//     }
//     acc[priorityName].push(curr);
//     return acc;
//   }, {});

//   const columnNames = Array.from(
//     new Set(historyByPhase.flatMap((objective) => objective.columnValues || []).map((column) => column.columnName))
//   );

//   const exportPDF = () => {
//     const input = printRef.current;
//     html2canvas(input, { scale: 2 })
//       .then((canvas) => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF({
//           orientation: 'portrait',
//           unit: 'pt',
//           format: 'a4'
//         });

//         const imgProps = pdf.getImageProperties(imgData);
//         const pdfWidth = pdf.internal.pageSize.getWidth();
//         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//         const sanitizedUserName = userNon.replace(/[^a-z0-9]/gi, '_').toLowerCase();
//         pdf.save(`${sanitizedUserName}_formulaire_Cadre.pdf`);
//       })
//       .catch((err) => {
//         console.error('Erreur lors de la génération du PDF:', err);
//       });
//   };

//   return (
//     <Paper>
//       <MainCard>
//         <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
//           <Grid item>
//             <Typography variant="subtitle2">Archive</Typography>
//             <Typography variant="h3" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
//               Formulaire d’évaluation
//             </Typography>
//           </Grid>
//           <Grid item>
//             <IconButton size="small" onClick={exportPDF}>
//               <FileDownloadIcon color="primary" />
//             </IconButton>
//           </Grid>
//         </Grid>

//         <Grid container spacing={3}>
//           {['Fixation', 'Mi-Parcours', 'Évaluation Finale'].map((phase) => (
//             <Grid item xs={12} sm={6} md={4} key={phase}>
//               <Card
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   padding: '10px 20px',
//                   cursor: 'pointer',
//                   backgroundColor: activePhase === phase ? '#C5CAE9' : '#E8EAF6',
//                   '&:hover': activePhase !== phase ? { backgroundColor: '#e3eaf5' } : {}
//                 }}
//                 onClick={() => handlePhaseClick(phase)}
//               >
//                 <FolderIcon sx={{ fontSize: 24, color: 'rgb(57, 73, 171)', marginRight: '16px' }} />
//                 <CardContent sx={{ flexGrow: 1, padding: 0 }}>
//                   <Typography variant="body1" sx={{ color: '#1a202c' }}>
//                     {phase}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>

//         <Box
//           sx={{
//             padding: 2,
//             opacity: isContentVisible ? 1 : 0,
//             transform: isContentVisible ? 'translateY(0)' : 'translateY(10px)',
//             transition: 'opacity 0.5s ease, transform 0.5s ease', // Synchronisé avec setTimeout
//             willChange: 'opacity, transform'
//           }}
//           ref={printRef}
//         >
//           {evaluationDetails && (
//             <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', padding: 1, fontWeight: 'bold', mt: 2 }}>
//               {evaluationDetails.titre}
//             </Typography>
//           )}

//           <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
//             <Grid item xs={6}>
//               <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
//                 <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
//                   COLLABORATEUR
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 <Typography variant="body1">
//                   Nom : <span style={{ color: '#3949AB' }}>{userNon}</span>
//                 </Typography>
//                 <Typography variant="body1">Matricule : {user.matricule || 'N/A'}</Typography>
//                 <Typography variant="body1">
//                   Poste : <span style={{ color: '#3949AB' }}>{poste}</span>
//                 </Typography>
//                 <Typography variant="body1">
//                   Département : <span style={{ color: '#3949AB' }}>{departement}</span>
//                 </Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={6}>
//               <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
//                 <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
//                   MANAGER
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 <Typography variant="body1">
//                   Nom : <span style={{ color: '#3949AB' }}>{superiorName}</span>
//                 </Typography>
//               </Paper>
//             </Grid>
//           </Grid>

//           <TableContainer sx={{ border: '1px solid #ddd', borderRadius: '4px', mt: 4 }}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
//                     PRIORITÉS STRATÉGIQUES
//                   </TableCell>
//                   <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>OBJECTIFS</TableCell>
//                   <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>PONDÉRATION</TableCell>
//                   <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
//                     INDICATEURS DE RÉSULTAT
//                   </TableCell>
//                   <TableCell sx={{ backgroundColor: '#3f51b5', color: 'white' }}>RÉSULTATS en % d’atteinte sur 100%</TableCell>
//                   {columnNames?.length > 0 &&
//                     columnNames.map((columnName) => (
//                       <TableCell key={columnName} sx={{ backgroundColor: '#DFEDFF', color: 'black' }}>
//                         {columnName}
//                       </TableCell>
//                     ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {Object.entries(groupedData).map(([priorityName, objectives]) => (
//                   <React.Fragment key={priorityName}>
//                     <TableRow>
//                       <TableCell
//                         rowSpan={objectives.length + 2}
//                         sx={{ borderRight: '1px solid #ddd', fontWeight: 'bold', verticalAlign: 'top' }}
//                       >
//                         {priorityName}
//                         <Typography variant="caption" display="block">
//                           {/* Vous pouvez décommenter et ajuster si nécessaire */}
//                           {/* ({objectives[0].weighting}% / {objectives[0].totalWeighting || 0}%) */}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                     {objectives.map((objective) => (
//                       <TableRow key={objective.historyId}>
//                         <TableCell sx={{ borderRight: '1px solid #ddd' }}>
//                           {objective.description && objective.description !== 'N/A' ? objective.description : ' '}
//                         </TableCell>
//                         <TableCell sx={{ borderRight: '1px solid #ddd' }}>
//                           {objective.weighting && objective.weighting !== 0 ? `${objective.weighting}%` : ' '}
//                         </TableCell>
//                         <TableCell sx={{ borderRight: '1px solid #ddd' }}>
//                           {objective.resultIndicator && objective.resultIndicator !== 'N/A' ? objective.resultIndicator : ' '}
//                         </TableCell>
//                         <TableCell sx={{ borderRight: '1px solid #ddd' }}>
//                           {objective.result && objective.result !== 0 ? `${objective.result}%` : ' '}
//                         </TableCell>
//                         {objective.columnValues &&
//                           objective.columnValues.length > 0 &&
//                           objective.columnValues.map((column) => (
//                             <TableCell key={column.columnName} sx={{ borderRight: '1px solid #ddd' }}>
//                               {column.value !== 'N/A' ? column.value : ''}
//                             </TableCell>
//                           ))}
//                       </TableRow>
//                     ))}
//                     <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
//                       <TableCell colSpan={1} sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
//                         Sous-total de pondération
//                       </TableCell>
//                       <TableCell sx={{ fontSize: '0.8rem', color: '#000', borderRight: '1px solid #ddd' }}>
//                         {objectives[0].totalWeighting || 0} %
//                       </TableCell>
//                       <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
//                         Sous-total résultats
//                       </TableCell>
//                       <TableCell sx={{ fontSize: '0.8rem', color: '#000' }}>{objectives[0].totalResult || 0} %</TableCell>
//                     </TableRow>
//                   </React.Fragment>
//                 ))}
//                 <TableRow>
//                   <TableCell colSpan={1} sx={{ backgroundColor: 'transparent' }}></TableCell>
//                   <TableCell sx={{ backgroundColor: '#fff9d1' }}>TOTAL PONDÉRATION (100%)</TableCell>
//                   <TableCell sx={{ backgroundColor: '#fff9d1' }}>{totalWeightingSum}%</TableCell>
//                   <TableCell sx={{ backgroundColor: '#fff9d1' }}>PERFORMANCE du contrat d'objectifs</TableCell>
//                   <TableCell sx={{ backgroundColor: '#fff9d1', }}>{totalResultSum}%</TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
//             <Grid item xs={12}>
//               <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
//                 Dates Importantes
//               </Typography>
//               <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: 2, backgroundColor: '#f9f9f9' }}>
//                 <Typography variant="body1" sx={{ mb: 1 }}>
//                   Date de fixation des objectifs :{' '}
//                   {evaluationDetails?.fixationObjectif
//                     ? new Date(evaluationDetails.fixationObjectif).toLocaleDateString('fr-FR', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })
//                     : 'N/A'}
//                 </Typography>
//                 <Typography variant="body1" sx={{ mb: 1 }}>
//                   Date évaluation mi-parcours :{' '}
//                   {evaluationDetails?.miParcours
//                     ? new Date(evaluationDetails.miParcours).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
//                     : 'N/A'}
//                 </Typography>
//                 <Typography variant="body1">
//                   Date de l'entretien final :{' '}
//                   {evaluationDetails?.final
//                     ? new Date(evaluationDetails.final).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
//                     : 'N/A'}
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>

//           <Grid container sx={{ mt: 2 }} spacing={4}>
//             <Grid item xs={6} sx={{ textAlign: 'center' }}>
//               <Typography variant="body1">Signature Collaborateur</Typography>
//               <Box sx={{ height: '100px', border: '1px solid black' }} />
//             </Grid>
//             <Grid item xs={6} sx={{ textAlign: 'center' }}>
//               <Typography variant="body1">Signature Manager</Typography>
//               <Box sx={{ height: '100px', border: '1px solid black' }} />
//             </Grid>
//           </Grid>
//         </Box>
//       </MainCard>
//     </Paper>
//   );
// }

// export default EvaluationPhasesCadre;

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MainCard from 'ui-component/cards/MainCard';
import { formulaireInstance, authInstance } from '../../../../axiosConfig';
import { useParams } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function EvaluationPhasesCadre() {
  const { userId, evalId } = useParams();
  const [historyByPhase, setHistoryByPhase] = useState([]);
  const [activePhase, setActivePhase] = useState('Fixation');
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const [totalWeightingSum, setTotalWeightingSum] = useState(0);
  const [totalResultSum, setTotalResultSum] = useState(0);
  const [errorMessage, setErrorMessage] = useState(''); // État pour le message d'erreur
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userNon = user.name || 'Utilisateur';
  const poste = user.poste || 'N/A';
  const departement = user.department || 'N/A';
  const superiorName = user.superiorName || 'N/A';
  const superiorId = user.superiorId;

  const [isContentVisible, setIsContentVisible] = useState(true);

  const printRef = useRef();

  const [userSignature, setUserSignature] = useState(null); // Signature du collaborateur
  const [managerSignature, setManagerSignature] = useState(null); // Signature du manager

  useEffect(() => {
    handlePhaseClick('Fixation');
    fetchEvaluationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvaluationDetails = async () => {
    try {
      const response = await formulaireInstance.get(`/Evaluation/${evalId}`);
      if (response && response.data) {
        setEvaluationDetails(response.data);
      } else {
        console.error('Structure de réponse inattendue:', response);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'évaluation:", error);
    }
  };

  const fetchUserAndManagerSignatures = async (userId, managerId) => {
    try {
      // Récupérer la signature de l'utilisateur
      const userResponse = await authInstance.get(`/Signature/get-user-signature/${userId}`);
      if (userResponse && userResponse.data) {
        setUserSignature(userResponse.data.signature);
      }

      // Récupérer la signature du manager
      const managerResponse = await authInstance.get(`/Signature/get-user-signature/${managerId}`);
      if (managerResponse && managerResponse.data) {
        setManagerSignature(managerResponse.data.signature);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des signatures:', error);
    }
  };

  const fetchTotalWeighting = async () => {
    try {
      const response = await formulaireInstance.get(`/archive/priority/totalWeighting/${evalId}/${userId}`);
      if (response && response.data) {
        setTotalWeightingSum(response.data.totalWeightingSum);
        setTotalResultSum(0);
        setHistoryByPhase((prevHistory) => {
          const updatedHistory = [...prevHistory];
          response.data.totalWeightings.forEach((item) => {
            updatedHistory.forEach((objective) => {
              if (objective.priorityName === item.priorityName) {
                objective.totalWeighting = item.totalWeighting;
              }
            });
          });
          return updatedHistory;
        });
      } else {
        console.error('Structure de réponse inattendue:', response);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la pondération totale:', error);
    }
  };

  const fetchTotalWeightingAndResult = async (phase) => {
    try {
      const response = await formulaireInstance.get(`/archive/priority/totalWeightingAndResult/${evalId}/${userId}/${phase}`);
      if (response && response.data) {
        setTotalWeightingSum(response.data.totalWeightingSum);
        setTotalResultSum(response.data.totalResultSum);
        setHistoryByPhase((prevHistory) => {
          const updatedHistory = [...prevHistory];
          response.data.totalWeightingAndResults.forEach((item) => {
            updatedHistory.forEach((objective) => {
              if (objective.priorityName === item.priorityName) {
                objective.totalWeighting = item.totalWeighting;
                objective.totalResult = item.totalResult;
              }
            });
          });
          return updatedHistory;
        });
      } else {
        console.error('Structure de réponse inattendue:', response);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la pondération et des résultats:', error);
    }
  };

  const handlePhaseClick = async (phase) => {
    setActivePhase(phase);
    setIsContentVisible(false);
    setErrorMessage('');

    setTimeout(async () => {
      try {
        const response = await formulaireInstance.get(`/archive/historyCadre/${userId}/${evalId}/${phase}`);
        if (response && response.data) {
          if (response.data.message) {
            setHistoryByPhase([]);
            setErrorMessage(response.data.message);
          } else {
            setHistoryByPhase(response.data);
            setErrorMessage('');

            // Appeler les pondérations et résultats selon la phase
            if (phase === 'Fixation') {
              await fetchTotalWeighting();
            } else if (phase === 'Mi-Parcours' || phase === 'Évaluation Finale') {
              await fetchTotalWeightingAndResult(phase);
            }

            // Appeler les signatures uniquement lorsque les données sont disponibles
            if (response.data.length > 0) {
              if (userId && superiorId) {
                await fetchUserAndManagerSignatures(userId, superiorId);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique de la phase:", error);
        setErrorMessage('Pas encore de donnée disponible');
      } finally {
        setIsContentVisible(true);
      }
    }, 400);
  };

  const groupedData = historyByPhase.reduce((acc, curr) => {
    const { priorityName } = curr;
    if (!acc[priorityName]) {
      acc[priorityName] = [];
    }
    acc[priorityName].push(curr);
    return acc;
  }, {});

  const columnNames = Array.from(
    new Set(historyByPhase.flatMap((objective) => objective.columnValues || []).map((column) => column.columnName))
  );

  const exportPDF = () => {
    const input = printRef.current;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const sanitizedUserName = userNon.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${sanitizedUserName}_formulaire_Cadre.pdf`);
      })
      .catch((err) => {
        console.error('Erreur lors de la génération du PDF:', err);
      });
  };

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="subtitle2">Archive</Typography>
            <Typography variant="h3" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              Formulaire d’évaluation
            </Typography>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={exportPDF}>
              <FileDownloadIcon color="primary" />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {['Fixation', 'Mi-Parcours', 'Évaluation Finale'].map((phase) => (
            <Grid item xs={12} sm={6} md={4} key={phase}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  backgroundColor: activePhase === phase ? '#C5CAE9' : '#E8EAF6',
                  '&:hover': activePhase !== phase ? { backgroundColor: '#e3eaf5' } : {}
                }}
                onClick={() => handlePhaseClick(phase)}
              >
                <FolderIcon sx={{ fontSize: 24, color: 'rgb(57, 73, 171)', marginRight: '16px' }} />
                <CardContent sx={{ flexGrow: 1, padding: 0 }}>
                  <Typography variant="body1" sx={{ color: '#1a202c' }}>
                    {phase}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            padding: 2,
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            willChange: 'opacity, transform'
          }}
          ref={printRef}
        >
          {evaluationDetails && (
            <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', padding: 1, fontWeight: 'bold', mt: 2 }}>
              {evaluationDetails.titre}
            </Typography>
          )}

          {errorMessage ? (
            <Alert
              severity="info"
              sx={{
                textAlign: 'center',
                marginBottom: 3
              }}
            >
              {errorMessage}
            </Alert>
          ) : (
            <>
              <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      COLLABORATEUR
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      Nom : <span style={{ color: '#3949AB' }}>{userNon}</span>
                    </Typography>
                    <Typography variant="body1">Matricule : {user.matricule || 'N/A'}</Typography>
                    <Typography variant="body1">
                      Poste : <span style={{ color: '#3949AB' }}>{poste}</span>
                    </Typography>
                    <Typography variant="body1">
                      Département : <span style={{ color: '#3949AB' }}>{departement}</span>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      MANAGER
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      Nom : <span style={{ color: '#3949AB' }}>{superiorName}</span>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <TableContainer sx={{ border: '1px solid #ddd', borderRadius: '4px', mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
                        PRIORITÉS STRATÉGIQUES
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>OBJECTIFS</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>PONDÉRATION</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd', backgroundColor: '#3f51b5', color: 'white' }}>
                        INDICATEURS DE RÉSULTAT
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#3f51b5', color: 'white' }}>RÉSULTATS en % d’atteinte sur 100%</TableCell>
                      {columnNames?.length > 0 &&
                        columnNames.map((columnName) => (
                          <TableCell key={columnName} sx={{ backgroundColor: '#DFEDFF', color: 'black' }}>
                            {columnName}
                          </TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(groupedData).map(([priorityName, objectives]) => (
                      <React.Fragment key={priorityName}>
                        <TableRow>
                          <TableCell
                            rowSpan={objectives.length + 2}
                            sx={{ borderRight: '1px solid #ddd', fontWeight: 'bold', verticalAlign: 'top' }}
                          >
                            {priorityName}
                            <Typography variant="caption" display="block">
                              {/* Vous pouvez décommenter et ajuster si nécessaire */}
                              {/* ({objectives[0].weighting}% / {objectives[0].totalWeighting || 0}%) */}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {objectives.map((objective) => (
                          <TableRow key={objective.historyId}>
                            <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                              {objective.description && objective.description !== 'N/A' ? objective.description : ' '}
                            </TableCell>
                            <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                              {objective.weighting && objective.weighting !== 0 ? `${objective.weighting}%` : ' '}
                            </TableCell>
                            <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                              {objective.resultIndicator && objective.resultIndicator !== 'N/A' ? objective.resultIndicator : ' '}
                            </TableCell>
                            <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                              {objective.result && objective.result !== 0 ? `${objective.result}%` : ' '}
                            </TableCell>
                            {objective.columnValues &&
                              objective.columnValues.length > 0 &&
                              objective.columnValues.map((column) => (
                                <TableCell key={column.columnName} sx={{ borderRight: '1px solid #ddd' }}>
                                  {column.value !== 'N/A' ? column.value : ''}
                                </TableCell>
                              ))}
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                          <TableCell
                            colSpan={1}
                            sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}
                          >
                            Sous-total de pondération
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#000', borderRight: '1px solid #ddd' }}>
                            {objectives[0].totalWeighting || 0} %
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000', borderRight: '1px solid #ddd' }}>
                            Sous-total résultats
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#000' }}>{objectives[0].totalResult || 0} %</TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    <TableRow>
                      <TableCell colSpan={1} sx={{ backgroundColor: 'transparent' }}></TableCell>
                      <TableCell sx={{ backgroundColor: '#fff9d1' }}>TOTAL PONDÉRATION (100%)</TableCell>
                      <TableCell sx={{ backgroundColor: '#fff9d1' }}>{totalWeightingSum}%</TableCell>
                      <TableCell sx={{ backgroundColor: '#fff9d1' }}>PERFORMANCE du contrat d'objectifs</TableCell>
                      <TableCell sx={{ backgroundColor: '#fff9d1' }}>{totalResultSum}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Dates Importantes
                  </Typography>
                  <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Date de fixation des objectifs :{' '}
                      {evaluationDetails?.fixationObjectif
                        ? new Date(evaluationDetails.fixationObjectif).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Date évaluation mi-parcours :{' '}
                      {evaluationDetails?.miParcours
                        ? new Date(evaluationDetails.miParcours).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      Date de l'entretien final :{' '}
                      {evaluationDetails?.final
                        ? new Date(evaluationDetails.final).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container sx={{ mt: 2 }} spacing={4}>
                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                  <Typography variant="body1">Signature Collaborateur</Typography>
                  <Box sx={{ height: '100px', border: '1px solid black' }} >
                    {userSignature ? (
                      <img
                        src={`data:image/png;base64,${userSignature}`}
                        alt="Signature Collaborateur"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <Typography variant="caption">Signature indisponible</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                  <Typography variant="body1">Signature Manager</Typography>
                  <Box sx={{ height: '100px', border: '1px solid black' }} >
                    {managerSignature ? (
                      <img
                        src={`data:image/png;base64,${managerSignature}`}
                        alt="Signature Collaborateur"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <Typography variant="caption">Signature indisponible</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </MainCard>
    </Paper>
  );
}

export default EvaluationPhasesCadre;
