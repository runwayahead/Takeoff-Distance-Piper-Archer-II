/*
========================================================

TakeoffPro V3.0

interpolation.js

Piper PA-28-181 Archer II

Linear interpolation
Linear extrapolation (1089 → 1157 kg)

========================================================
*/


/*
========================================================
Linear interpolation
========================================================
*/

function lerp(a, b, t){

    return a + (b - a) * t;

}



/*
========================================================
Find Bounds

Returns:

lowIndex
highIndex
ratio

========================================================
*/

function findBounds(value, values){

    if(value <= values[0]){

        return{

            lowIndex:0,

            highIndex:0,

            ratio:0

        };

    }



    for(let i=0;i<values.length-1;i++){

        if(

            value>=values[i] &&

            value<=values[i+1]

        ){

            return{

                lowIndex:i,

                highIndex:i+1,

                ratio:

                    (value-values[i])

                    /

                    (values[i+1]-values[i])

            };

        }

    }



    /*
    ----------------------------------------
    Above maximum

    Linear extrapolation

    ----------------------------------------
    */

    const last=

        values.length-1;



    return{

        lowIndex:last-1,

        highIndex:last,

        ratio:

            (value-values[last-1])

            /

            (values[last]-values[last-1])

    };

}



/*
========================================================
Temperature interpolation
========================================================
*/

function interpolateTemperature(

    row,

    temperature

){

    const t=

        findBounds(

            temperature,

            AFM_DATA.temperatures

        );



    return lerp(

        row[t.lowIndex],

        row[t.highIndex],

        t.ratio

    );

}



/*
========================================================
Pressure altitude interpolation
========================================================
*/

function interpolatePressureAltitude(

    table,

    pressureAltitude,

    temperature

){

    const a=

        findBounds(

            pressureAltitude,

            AFM_DATA.pressureAltitudes

        );



    const low=

        interpolateTemperature(

            table[a.lowIndex],

            temperature

        );



    const high=

        interpolateTemperature(

            table[a.highIndex],

            temperature

        );



    return lerp(

        low,

        high,

        a.ratio

    );

}
/*
========================================================
Weight interpolation

907–1089 kg interpolation

1089–1157 kg extrapolation

========================================================
*/

function interpolateWeight(

    dataset,

    weight,

    pressureAltitude,

    temperature

){

    const w=

        findBounds(

            weight,

            AFM_DATA.weights

        );



    const lowValue=

        interpolatePressureAltitude(

            dataset[

                AFM_DATA.weights[

                    w.lowIndex

                ]

            ],

            pressureAltitude,

            temperature

        );



    const highValue=

        interpolatePressureAltitude(

            dataset[

                AFM_DATA.weights[

                    w.highIndex

                ]

            ],

            pressureAltitude,

            temperature

        );



    return lerp(

        lowValue,

        highValue,

        w.ratio

    );

}



/*
========================================================
Takeoff calculation

========================================================
*/

function calculateTakeoff(

    dataset,

    weight,

    pressureAltitude,

    temperature,

    safetyFactor=100

){

    const ground=

        interpolateWeight(

            dataset.groundRoll,

            weight,

            pressureAltitude,

            temperature

        );



    const obstacle=

        interpolateWeight(

            dataset.obstacle15m,

            weight,

            pressureAltitude,

            temperature

        );



    return{

        ground:

            Math.round(

                ground*

                safetyFactor/

                100

            ),

        obstacle:

            Math.round(

                obstacle*

                safetyFactor/

                100

            )

    };

}
