import React, { useEffect, useState } from 'react';
import { formulaireInstance, authInstance } from '../../../../axiosConfig';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { IconTargetArrow } from '@tabler/icons-react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CollabNMp from './CollabNMp';
import CollabNFi from './CollabNFi';

function CollabNFo() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = user.typeUser;
  const userId = user.id;
  const [templateId, setTemplateId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [indicators, setIndicators] = useState([]);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState(null); 
  const [signatureFile, setSignatureFile] = useState(null);
  const [openSignatureModal, setOpenSignatureModal] = useState(false); 
  const [openNoSignatureModal, setOpenNoSignatureModal] = useState(false);
  const [hasUserData, setHasUserData] = useState(false); // Pour savoir si on a déjà des données validées
  const [isValidate, setIsValidate] = useState(false); 
  const [hasOngoingEvaluation, setHasOngoingEvaluation] = useState(false);
  const [openSignatureRecommendationModal, setOpenSignatureRecommendationModal] = useState(false);

  const navigate = useNavigate();

  const handleOpenSignatureModal = () => {
    setOpenSignatureModal(true);
  };

  const handleCloseSignatureModal = () => {
    setOpenSignatureModal(false);
  };

  const handleSignatureFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const checkUserSignature = async (userId) => {
    try {
      const response = await authInstance.get(`/Signature/get-user-signature/${userId}`);
      return !!response.data.signature; // Renvoie `true` si une signature est trouvée
    } catch (error) {
      return false; // Renvoie `false` si la signature est absente ou en cas d'erreur
    }
  };

  const checkOngoingEvaluation = async () => {
    try {
      const response = await formulaireInstance.get('/Periode/enCours', {
        params: { type: 'NonCadre' }
      });
      setHasOngoingEvaluation(response.data.length > 0);
      if (response.data.length > 0) {
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des évaluations:', error);
    }
  };

  const fetchDetailedTemplate = async (templateId) => {
    try {
      const response = await formulaireInstance.get(`/Template/NonCadreTemplate/${templateId}`);
      const { indicators: fetchedIndicators } = response.data;
      setIndicators(fetchedIndicators);

      // Initialisation des résultats vides
      const initialResults = fetchedIndicators.map((indicator) => ({
        indicatorId: indicator.indicatorId,
        userIndicatorId: 0,
        indicatorName: '',
        results: Array.from({ length: indicator.maxResults }, () => ({
          resultId: 0,
          resultText: '',
          result: 0
        }))
      }));
      setResults(initialResults);
    } catch (error) {
      setErrorMessage('Erreur lors de la récupération des indicateurs.');
    }
  };

  const fetchCurrentPeriod = async () => {
    try {
      const periodResponse = await formulaireInstance.get('/Periode/periodeActel', {
        params: { type: 'NonCadre' }
      });
      if (periodResponse.data.length > 0) {
        setCurrentPeriod(periodResponse.data[0].currentPeriod);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la récupération de la période actuelle.');
    }
  };

  const fetchUserIndicators = async () => {
    if (indicators.length === 0) return; 

    try {
      const userIndicatorsResponse = await formulaireInstance.get('/Evaluation/IndicatorValidateByUser', {
        params: {
          userId: userId,
          type: userType
        }
      });

      const userIndicators = userIndicatorsResponse.data;
      if (userIndicators && userIndicators.length > 0) {
        setHasUserData(true); // On a des données utilisateur, donc on passera en mode "Mettre à jour"

        const filledResults = indicators.map((indicator) => {
          const userIndicator = userIndicators.find((ui) => ui.indicatorId === indicator.indicatorId);
          if (userIndicator) {
            return {
              indicatorId: indicator.indicatorId,
              userIndicatorId: userIndicator.userIndicatorId,
              indicatorName: userIndicator.name,
              results: userIndicator.results.map((r, i) => ({
                resultId: r.resultId,
                resultText: r.resultText,
                result: r.result
              }))
            };
          } else {
            // Si un indicateur n'est pas trouvé côté utilisateur, on garde les valeurs par défaut
            return {
              indicatorId: indicator.indicatorId,
              userIndicatorId: 0,
              indicatorName: '',
              results: Array.from({ length: indicator.maxResults }, () => ({
                resultId: 0,
                resultText: '',
                result: 0
              }))
            };
          }
        });

        setResults(filledResults);
      } 
    } catch (err) {
      // Aucune donnée => on reste en mode "Valider"
      if (err.response && err.response.status === 404) {
        // Pas de données pré-existantes
      } else {
        console.error('Erreur lors de la récupération des indicateurs utilisateur:', err);
      }
    }
  };

  const checkIfValidated = async () => {
    try {
      const response = await formulaireInstance.get('/Evaluation/GetHistoryUserIndicatorFo', {
        params: {
          userId: userId,
          type: userType
        }
      });

      if (response.data && response.data.length > 0) {
        setIsValidate(true); 
      } else {
        setIsValidate(false); 
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsValidate(false); 
      } else {
        console.error('Erreur lors de la vérification de la validation utilisateur:', err);
      }
    }
  };

  const checkIfUserValidated = async () => {
    await checkIfValidated();
  };

  useEffect(() => {
    const initializeTemplate = async () => {
      try {
        await checkOngoingEvaluation();
        await checkIfUserValidated();

        const response = await formulaireInstance.get('/Template/NonCadreTemplate');
        const tempId = response.data.templateId;
        setTemplateId(tempId);

        // Charger les détails du template
        await fetchDetailedTemplate(tempId);

        // Charger la période actuelle
        await fetchCurrentPeriod();
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    initializeTemplate();
  }, []);

  useEffect(() => {
    if (indicators.length > 0) {
      fetchUserIndicators();
    }
  }, [indicators]);

  const handleIndicatorNameChange = (indicatorId, value) => {
    setResults((prevResults) =>
      prevResults.map((result) => (result.indicatorId === indicatorId ? { ...result, indicatorName: value } : result))
    );
  };

  const handleResultChange = (indicatorId, index, value) => {
    setResults((prevResults) =>
      prevResults.map((result) =>
        result.indicatorId === indicatorId
          ? {
              ...result,
              results: result.results.map((res, i) => (i === index ? { ...res, resultText: value } : res))
            }
          : result
      )
    );
  };

  useEffect(() => {
    const recommendAddingSignature = async () => {
      try {
        const hasSignature = await checkUserSignature(userId);
        if (!hasSignature) {
          setOpenSignatureRecommendationModal(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la signature :', error);
      }
    };

    recommendAddingSignature();
  }, [userId]);

  const handleContinueWithoutSignature = () => {
    setOpenSignatureRecommendationModal(false);
  };

  const validateStep = () => {
    const currentIndicator = results.find((res) => res.indicatorId === indicators[activeStep].indicatorId);

    if (!currentIndicator) {
      alert('Les données de cet indicateur sont introuvables.');
      return false;
    }

    if (!currentIndicator.indicatorName.trim()) {
      alert('L\'objectif doit être renseigné.');
      return false;
    }

    const hasAtLeastOneResult = currentIndicator.results.some((result) => result.resultText.trim() !== '');
    if (!hasAtLeastOneResult) {
      alert('Au moins un indicateur de résultat doit être renseigné.');
      return false;
    }

    return true; 
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps = indicators.map((indicator) => indicator.label);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateFixationObjectif = async () => {
    try {
      const formattedData = results.map((result) => ({
        indicatorId: result.indicatorId,
        indicatorName: result.indicatorName,
        results: result.results.map((res) => ({
          resultText: res.resultText,
          result: parseFloat(res.result || 0)
        }))
      }));

      const hasSignature = await checkUserSignature(userId);
      if (!hasSignature) {
        setOpenNoSignatureModal(true);
        return;
      }

      if (!signatureFile) {
        alert('Veuillez fournir un fichier de signature avant de valider vos objectifs.');
        handleOpenSignatureModal();
        return;
      }

      const base64Signature = await convertFileToBase64(signatureFile);

      // Vérification signature
      const compareResponse = await authInstance.post(`/Signature/compare-user-signature/${userId}`, {
        ImageBase64: base64Signature
      });

      if (!compareResponse.data.isMatch) {
        alert('Votre signature ne correspond pas à celle enregistrée. Veuillez réessayer.');
        handleOpenSignatureModal();
        return;
      }

      // Appel à l'API (POST)
      const response = await formulaireInstance.post('/Evaluation/ValidateIndicator', formattedData, {
        params: {
          userId: userId,
          type: userType
        }
      });

      alert(response.data.message || 'Objectifs validés avec succès !');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des objectifs :', error);
      alert(error.response?.data?.Message || 'Une erreur est survenue lors de la mise à jour.');
    }
  };

  const updateFixationObjectif = async () => {
    try {
      const formattedData = results.map((result) => ({
        userIndicatorId: result.userIndicatorId,
        name: result.indicatorName,
        userIndicatorResults: result.results.map((res) => ({
          resultId: res.resultId,
          resultText: res.resultText,
          result: parseFloat(res.result || 0)
        }))
      }));

      const hasSignature = await checkUserSignature(userId);
      if (!hasSignature) {
        setOpenNoSignatureModal(true);
        return;
      }

      if (!signatureFile) {
        alert('Veuillez fournir un fichier de signature avant de mettre à jour vos objectifs.');
        handleOpenSignatureModal();
        return;
      }

      const base64Signature = await convertFileToBase64(signatureFile);

      // Vérification signature
      const compareResponse = await authInstance.post(`/Signature/compare-user-signature/${userId}`, {
        ImageBase64: base64Signature
      });

      if (!compareResponse.data.isMatch) {
        alert('Votre signature ne correspond pas à celle enregistrée. Veuillez réessayer.');
        handleOpenSignatureModal();
        return;
      }

      // Appel à l'API (PUT)
      const response = await formulaireInstance.put('/Evaluation/UpdateIndicator', formattedData, {
        params: {
          userId: userId,
          type: userType
        }
      });

      alert(response.data.message || 'Objectifs mis à jour avec succès !');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des objectifs :', error);
      alert(error.response?.data?.Message || 'Une erreur est survenue lors de la mise à jour.');
    }
  };

    if (!hasOngoingEvaluation) {
      return (
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh'
          }}
        >
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <Card
              sx={{
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <CardContent
                sx={{
                  padding: 4,
                  textAlign: 'center',
                  backgroundColor: 'background.paper',
                  color: 'text.primary'
                }}
              >
                <Box
                  sx={{
                    marginBottom: 3,
                    padding: 2,
                    borderRadius: '12px',
                    backgroundColor: 'primary.lighter',
                    border: '1px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    Aucune évaluation en cours
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>
                    Vous serez informé dès le commencement d'une nouvelle évaluation.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/dashboard/default')}
                  sx={{
                    padding: '10px 32px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  Retour à l'accueil
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      );
    }

  return (
    <Paper>
      <MainCard>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle2">Évaluation</Typography>
            <Typography variant="h3">
              Période actuel: <span style={{ color: '#3949AB' }}>{currentPeriod}</span>
            </Typography>
          </Grid>
        </Grid>
      </MainCard>

      {currentPeriod === 'Fixation Objectif' && indicators.length > 0 && (
        <Box p={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {indicators.map((indicator) => (
              <Step key={indicator.indicatorId}>
                <StepLabel>{indicator.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ marginTop: 3 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                style={{ marginTop: '2rem' }}
              >
                {indicators[activeStep] && (
                  <Card>
                    <CardContent>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          marginBottom: '20px',
                          backgroundColor: '#fafafa',
                          padding: 3,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        {indicators[activeStep].label}
                        <IconTargetArrow style={{ color: '#3F51B5' }} />
                      </Typography>

                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, backgroundColor: '#e8eaf6' }}>
                          <TextField
                            fullWidth
                            label={
                              <span>
                                Objectif <span style={{ color: 'red' }}>*</span>
                              </span>
                            }
                            value={
                              results.find((res) => res.indicatorId === indicators[activeStep].indicatorId)
                                ?.indicatorName || ''
                            }
                            onChange={(e) =>
                              handleIndicatorNameChange(indicators[activeStep].indicatorId, e.target.value)
                            }
                            sx={{ marginBottom: 2 }}
                          />

                          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                            <span>
                              Indicateur de résultat <span style={{ color: 'red' }}>*</span>
                            </span>
                          </Typography>

                          {results
                            .find((res) => res.indicatorId === indicators[activeStep].indicatorId)
                            ?.results.map((result, index) => (
                              <Grid container spacing={2} key={index} sx={{ marginBottom: 2 }}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label={`Indicateur`}
                                    value={result.resultText}
                                    multiline
                                    minRows={2}
                                    onChange={(e) =>
                                      handleResultChange(indicators[activeStep].indicatorId, index, e.target.value)
                                    }
                                  />
                                </Grid>
                              </Grid>
                            ))}
                        </Paper>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="contained"
                color="primary"
                startIcon={<KeyboardArrowLeft />}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                hasUserData ? (
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isValidate}
                    onClick={() => {
                      if (validateStep()) {
                        if (!signatureFile) {
                          handleOpenSignatureModal();
                        } else {
                          updateFixationObjectif();
                        }
                      }
                    }}
                  >
                    {isValidate ? 'Déjà validé' : 'Mettre à jour'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      if (validateStep()) {
                        if (!signatureFile) {
                          handleOpenSignatureModal();
                        } else {
                          validateFixationObjectif();
                        }
                      }
                    }}
                  >
                    Valider
                  </Button>
                )
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (validateStep()) {
                      handleNext();
                    }
                  }}
                  endIcon={<KeyboardArrowRight />}
                >
                  Suivant
                </Button>
              )}
            </Box>

            {/* Modal pour la signature */}
            <Dialog open={openSignatureModal} onClose={handleCloseSignatureModal}>
              <DialogTitle>Veuillez signer pour continuer</DialogTitle>
              <DialogContent>
                <input type="file" accept="image/*" onChange={handleSignatureFileChange} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Choisissez une image contenant votre signature.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseSignatureModal}>Annuler</Button>
                <Button
                  onClick={() => {
                    handleCloseSignatureModal();
                    if (hasUserData) {
                      updateFixationObjectif();
                    } else {
                      validateFixationObjectif();
                    }
                  }}
                  variant="contained"
                  color="primary"
                >
                  Confirmer
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={openNoSignatureModal} onClose={() => setOpenNoSignatureModal(false)}>
              <DialogTitle>Signature manquante</DialogTitle>
              <DialogContent>
                <Typography variant="body1">
                  Vous n’avez pas encore de signature enregistrée. Veuillez{' '}
                  <Typography
                    component="span"
                    onClick={() => navigate('/collab/profile')}
                    sx={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    cliquer ici
                  </Typography>{' '}
                  pour continuer.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenNoSignatureModal(false)} variant="contained" color="primary">
                  Fermer
                </Button>
              </DialogActions>
            </Dialog>
            {/* Modal de recommandation */}
            <Dialog
              open={openSignatureRecommendationModal}
              onClose={handleContinueWithoutSignature}
              aria-labelledby="signature-recommendation-title"
            >
              <DialogTitle id="signature-recommendation-title">Signature Manquante</DialogTitle>
              <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Nous vous recommandons d’ajouter une signature avant de commencer. Cela évitera de devoir tout retaper après
                  validation.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={handleContinueWithoutSignature}>
                  Continuer sans signature
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/collab/profile')} sx={{ ml: 2 }}>
                  Ajouter une signature
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      )}

      {/* Période Mi-Parcours */}
      {currentPeriod === 'Mi-Parcours' && (
          <CollabNMp />
      )}

      {/* Période Évaluation Finale */}
      {currentPeriod === 'Évaluation Finale' && (
          <CollabNFi />
      )}

    </Paper>
  );
}

export default CollabNFo;