import MainCard from 'ui-component/cards/MainCard';
import {   
    Grid, 
    Typography,
    Button,
    Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const EditFormCadre = () => {

  return (
    <Paper >
        <MainCard>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                <Typography variant="subtitle2">Formulaire Non Cadre</Typography>
                <Typography variant="h3">Modification du formulaire</Typography>
                </Grid>
            </Grid>
        </MainCard>
    </Paper>
  );
};

export default EditFormCadre;