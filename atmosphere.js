/*
=========================================
TakeoffPro V2
atmosphere.js
C172 TAE125-02-114
=========================================
*/

const ISA_TEMP = 15;
const ISA_LAPSE = 2; // °C / 1000 ft

function round(value) {
    return Math.round(value);
}

/*
-----------------------------------------
Pressure Altitude
PA = Elevation + (1013 - QNH) * 30
-----------------------------------------
*/

function calculatePressureAltitude(elevation, qnh) {

    return Math.max(

        0,

        round(

            Number(elevation) +

            ((1013 - Number(qnh)) * 30)

        )

    );

}

/*
-----------------------------------------
ISA Temperature
-----------------------------------------
*/

function calculateISATemperature(pressureAltitude) {

    return ISA_TEMP -

        ((pressureAltitude / 1000) * ISA_LAPSE);

}

/*
-----------------------------------------
Density Altitude
DA = PA + 120 * (OAT - ISA Temp)
-----------------------------------------
*/

function calculateDensityAltitude(

    pressureAltitude,

    oat

) {

    const isaTemp =

        calculateISATemperature(

            pressureAltitude

        );

    return Math.max(

        0,

        round(

            pressureAltitude +

            (120 * (Number(oat) - isaTemp))

        )

    );

}

/*
-----------------------------------------
Update Atmosphere Card
-----------------------------------------
*/

function updateAtmosphere() {

    const elevation =

        Number(

            document.getElementById(

                "elevation"

            ).value

        );

    const qnh =

        Number(

            document.getElementById(

                "qnh"

            ).value

        );

    const oat =

        Number(

            document.getElementById(

                "temperature"

            ).value

        );

    const pressureAltitude =

        Math.max(

            0,

            calculatePressureAltitude(

                elevation,

                qnh

            )

        );

    const densityAltitude =

        Math.max(

            0,

            calculateDensityAltitude(

                pressureAltitude,

                oat

            )

        );

    document.getElementById(

        "pressureAltitude"

    ).innerText =

        pressureAltitude + " ft";

    document.getElementById(

        "densityAltitude"

    ).innerText =

        densityAltitude + " ft";

    return {

        pressureAltitude:

            pressureAltitude,

        densityAltitude:

            densityAltitude

    };

}

/*
-----------------------------------------
Live Update
-----------------------------------------
*/

window.addEventListener(

    "load",

    () => {

        [

            "elevation",

            "qnh",

            "temperature"

        ].forEach(id => {

            document

                .getElementById(id)

                .addEventListener(

                    "input",

                    () => {

                        updateAtmosphere();

                        if (

                            typeof updatePerformance === "function"

                        ) {

                            updatePerformance();

                        }

                    }

                );

        });

        updateAtmosphere();

    }

);
