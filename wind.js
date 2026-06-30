/*
=========================================
TakeoffPro V2
wind.js
C172 TAE125-02-114
=========================================
*/

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function normalizeAngle(angle) {

    angle = angle % 360;

    if (angle < 0) {
        angle += 360;
    }

    return angle;

}

function calculateWindComponents(

    runwayHeading,

    windDirection,

    windSpeed

) {

    runwayHeading = Number(runwayHeading);
    windDirection = Number(windDirection);
    windSpeed = Number(windSpeed);

    let difference = normalizeAngle(

        windDirection - runwayHeading

    );

    if (difference > 180) {
        difference = 360 - difference;
    }

    const radians = toRadians(difference);

    const headwind =

        Math.cos(radians) * windSpeed;

    const crosswind =

        Math.sin(radians) * windSpeed;

    return {

        headwind: headwind,

        crosswind: Math.abs(crosswind)

    };

}

/*
-----------------------------------------
AFM Wind Correction

Headwind:
-10 % per 9 kt

Tailwind:
+10 % per 2 kt

Maximum Tailwind considered:
10 kt
-----------------------------------------
*/

function calculateWindCorrection(headwind) {

    let correction = 0;

    if (headwind >= 0) {

        correction =

            -(headwind / 9) * 10;

    }

    else {

        let tailwind = Math.abs(headwind);

        if (tailwind > 10) {
            tailwind = 10;
        }

        correction =

            (tailwind / 2) * 10;

    }

    return correction;

}

/*
-----------------------------------------
Warnings
-----------------------------------------
*/

function updateWindWarning(

    headwind,

    crosswind

) {

    const warning =

        document.getElementById(

            "windWarning"

        );

    warning.className = "warning";

    warning.innerHTML = "";

    if (Math.abs(headwind) > 10 && headwind < 0) {

        warning.classList.add(

            "red"

        );

        warning.innerHTML =

            "⚠ Tailwind greater than 10 kt";

        return;

    }

    if (crosswind > 15) {

        warning.classList.add(

            "yellow"

        );

        warning.innerHTML =

            "⚠ Crosswind greater than 15 kt";

    }

}

/*
-----------------------------------------
Update
-----------------------------------------
*/

function updateWind() {

    const runwayHeading =

        Number(

            document.getElementById(

                "runwayHeading"

            ).value

        );

    const windDirection =

        Number(

            document.getElementById(

                "windDirection"

            ).value

        );

    const windSpeed =

        Number(

            document.getElementById(

                "windSpeed"

            ).value

        );

    const result =

        calculateWindComponents(

            runwayHeading,

            windDirection,

            windSpeed

        );

    const headwindDisplay =

        document.getElementById(

            "headwind"

        );

    const crosswindDisplay =

        document.getElementById(

            "crosswind"

        );

    if (result.headwind >= 0) {

        headwindDisplay.innerHTML =

            Math.round(result.headwind)

            + " kt HW";

    }

    else {

        headwindDisplay.innerHTML =

            Math.abs(

                Math.round(result.headwind)

            )

            + " kt TW";

    }

    crosswindDisplay.innerHTML =

        Math.round(

            result.crosswind

        )

        + " kt";

    updateWindWarning(

        result.headwind,

        result.crosswind

    );

    return {

        headwind:

            result.headwind,

        crosswind:

            result.crosswind,

        correction:

            calculateWindCorrection(

                result.headwind

            )

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

            "runwayHeading",

            "windDirection",

            "windSpeed"

        ].forEach(id => {

            document

                .getElementById(id)

                .addEventListener(

                    "input",

                    () => {

                        updateWind();

                        if (

                            typeof updatePerformance

                            === "function"

                        ) {

                            updatePerformance();

                        }

                    }

                );

        });

        updateWind();

    }

);
