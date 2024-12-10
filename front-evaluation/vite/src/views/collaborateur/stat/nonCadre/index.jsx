import React from "react";
import MainCard from "ui-component/cards/MainCard";
import { Grid, Typography } from "@mui/material";
import Score from "./Score"; 
import { useParams } from 'react-router-dom';


function Index() {
    const phase = "Finale";
    const { userId } = useParams();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <MainCard title="PERFORMANCE du contrat d'objectifs par année">
                    <Score userId={userId} phase={phase} />
                </MainCard>
            </Grid>
        </Grid>
    );
}

export default Index;