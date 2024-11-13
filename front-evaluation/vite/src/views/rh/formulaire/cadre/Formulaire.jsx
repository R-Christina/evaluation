import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formulaireInstance } from '../../../../axiosConfig'; 
import MainCard from 'ui-component/cards/MainCard';
import {
    Grid,
    Typography,
    Button,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    styled,
    Box,
    Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';

// Styled components for table cells and rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: '1px solid #ddd',
    padding: '8px',
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'medium',
}));

const DynamicTableCell = styled(StyledTableCell)(({ theme }) => ({
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f8f9fa', // Couleur différente pour les colonnes dynamiques
}));

const TotalStyledTableCell = styled(StyledTableCell)(({ theme }) => ({
    backgroundColor: '#d4edda',
    fontWeight: 'medium',
}));

const Formulaire = () => {
    const templateId = 2; // Définir templateId à 1
    const navigate = useNavigate();
    const [formTemplate, setFormTemplate] = useState(null);
    const [dynamicColumns, setDynamicColumns] = useState([]);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await formulaireInstance.get(`/Template/${templateId}`);
                console.log("API Response:", response.data); // Vérifiez ce que renvoie l'API
                setFormTemplate(response.data.template);
                setDynamicColumns(response.data.dynamicColumns); // Récupérer les dynamicColumns
            } catch (error) {
                console.error("Error fetching form template:", error);
            }
        };
        fetchTemplate();
    }, [templateId]);

    // Button handlers
    const handleAddClick = () => navigate('/formulaireCadre/edit');
    const handleUseClick = () => navigate('/formulaireCadre/use');

    return (
        <Paper >
            <MainCard>
                <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Grid item>
                        <Typography variant="subtitle2">Formulaire Cadre</Typography>
                        <Typography variant="h3">Formulaire d’évaluation</Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            onClick={handleAddClick}
                            startIcon={<EditIcon />}
                            style={{ marginRight: 10 }}
                        >
                            Modifier
                        </Button>
                        {/* <Button
                            variant="outlined"
                            onClick={handleUseClick}
                            startIcon={<PanToolAltIcon />}
                            style={{ marginRight: 10 }}
                        >
                            Utiliser
                        </Button> */}
                        <IconButton size="small">
                            <FileDownloadIcon color="primary" />
                        </IconButton>
                    </Grid>
                </Grid>

                {/* Titre du contrat d'objectifs */}
                <Typography variant="h4" align="center" sx={{ backgroundColor: '#d4edda', padding: 1, fontWeight: 'bold' }}>
                    {formTemplate?.name}
                </Typography>

                {/* Informations de l'utilisateur */}
                <Grid container spacing={4} sx={{ mb: 3, mt: 2 }}>
                    <Grid item xs={6}>
                        <Paper  sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>COLLABORATEUR</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1">Nom :</Typography>
                            <Typography variant="body1">Prénom :</Typography>
                            <Typography variant="body1">Matricule :</Typography>
                            <Typography variant="body1">Poste :</Typography>
                            <Typography variant="body1">Département :</Typography>
                            <Typography variant="body1">Direction :</Typography>    
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper  sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>MANAGER</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1">Nom :</Typography>
                            <Typography variant="body1">Prénom :</Typography>
                        </Paper>
                    </Grid>
                </Grid>


                {/* Tableau des priorités stratégiques et des objectifs */}
                <TableContainer sx={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <HeaderTableCell>PRIORITÉS STRATÉGIQUES</HeaderTableCell>
                                <HeaderTableCell>OBJECTIFS</HeaderTableCell>
                                <HeaderTableCell>PONDÉRATION</HeaderTableCell>
                                <HeaderTableCell>INDICATEURS DE RÉSULTAT</HeaderTableCell>
                                <HeaderTableCell>RÉSULTATS en % d’atteinte sur 100%</HeaderTableCell>
                                {dynamicColumns?.map((col) => (
                                    <HeaderTableCell sx={{ backgroundColor: '#dfedff', color: 'black' }} key={col.columnId}>{col.name}</HeaderTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formTemplate?.templateStrategicPriorities?.map((priority) => (
                                <React.Fragment key={priority.templatePriorityId}>
                                    <TableRow>
                                        <StyledTableCell rowSpan={priority.maxObjectives + 2}>
                                            {priority.name}
                                            <Typography variant="caption" display="block">({priority.weighting}%)</Typography>
                                        </StyledTableCell>
                                    </TableRow>
                                    {priority.objectives?.map((objective, objIndex) => (
                                        <TableRow key={`${priority.templatePriorityId}-${objIndex}`}>
                                            <StyledTableCell></StyledTableCell>
                                            <StyledTableCell></StyledTableCell>
                                            <StyledTableCell></StyledTableCell>
                                            <StyledTableCell></StyledTableCell>
                                            {dynamicColumns?.map((dynamicCol) => {
                                                const dynamicValue = objective.dynamicColumns?.find(col => col.columnName === dynamicCol.name)?.value || '';
                                                return (
                                                    <DynamicTableCell key={dynamicCol.columnId}>
                                                        {dynamicValue}
                                                    </DynamicTableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TotalStyledTableCell colSpan={1} sx={{ fontSize: '0.8rem' }}>Sous-total de pondération</TotalStyledTableCell>
                                        <TotalStyledTableCell sx={{ fontSize: '0.8rem' }}>0 %</TotalStyledTableCell>
                                        <TotalStyledTableCell sx={{ fontSize: '0.8rem' }}>Sous-total résultats</TotalStyledTableCell>
                                        <TotalStyledTableCell sx={{ fontSize: '0.8rem' }}>0 %</TotalStyledTableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                            <TableRow>
                                <TotalStyledTableCell colSpan={1} sx={{ backgroundColor: 'transparent' }}></TotalStyledTableCell>
                                <TotalStyledTableCell sx={{ backgroundColor: '#fff9d1' }}>TOTAL PONDÉRATION (100%)</TotalStyledTableCell>
                                <TotalStyledTableCell sx={{ backgroundColor: '#fff9d1' }}>0 %</TotalStyledTableCell>
                                <TotalStyledTableCell sx={{ backgroundColor: '#fff9d1' }}>PERFORMANCE du contrat d'objectifs</TotalStyledTableCell>
                                <TotalStyledTableCell sx={{ backgroundColor: '#fff9d1' }}>0 %</TotalStyledTableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Grid container sx={{ mt: 4, justifyContent: 'space-between' }}>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Dates Importantes</Typography>
                        <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', padding: 2, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>Date de fixation des objectifs :</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>Date évaluation mi-parcours :</Typography>
                            <Typography variant="body1">Date de l'entretien final :</Typography>
                        </Box>
                    </Grid>
                </Grid>


                {/* signature */}
                <Grid container sx={{ mt: 2 }} spacing={4}>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                        <Typography variant="body1">Signature Collaborateur</Typography>
                        <Box sx={{ height: '50px', border: '1px solid black' }} /> {/* Ligne pour signature */}
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                        <Typography variant="body1">Signature Manager</Typography>
                        <Box sx={{ height: '50px', border: '1px solid black' }} /> {/* Ligne pour signature */}
                    </Grid>
                </Grid>

            </MainCard>
        </Paper>
    );
};

export default Formulaire;
