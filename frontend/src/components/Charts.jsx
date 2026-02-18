import React from 'react'
import { PieChart }  from '@mui/x-charts/PieChart'
import { Typography } from '@mui/joy'

const Charts = ({ chartData = null }) => {

    if(chartData === null){
        return (
            <Typography level="h3">
                No Data to be displayed
            </Typography>
        )
    }

    return (
        <PieChart>
        </PieChart>
    )
}

export default Charts