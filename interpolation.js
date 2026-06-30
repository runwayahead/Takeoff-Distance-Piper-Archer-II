function lerp(a, b, t) {
    return a + (b - a) * t;
}

function bounds(value, array) {

    /*
    ---------------------------------------
    Extrapolation below minimum
    ---------------------------------------
    */

    if (value < array[0]) {

        return {

            low: array[0],

            high: array[1],

            ratio:

                (value - array[0]) /

                (array[1] - array[0])

        };

    }

    /*
    ---------------------------------------
    Exact minimum
    ---------------------------------------
    */

    if (value === array[0]) {

        return {

            low: array[0],

            high: array[0],

            ratio: 0

        };

    }

    /*
    ---------------------------------------
    Above maximum
    ---------------------------------------
    */

    if (value >= array[array.length - 1]) {

        return {

            low: array[array.length - 1],

            high: array[array.length - 1],

            ratio: 0

        };

    }

    /*
    ---------------------------------------
    Normal interpolation
    ---------------------------------------
    */

    for (let i = 0; i < array.length - 1; i++) {

        if (value >= array[i] && value <= array[i + 1]) {

            return {

                low: array[i],

                high: array[i + 1],

                ratio:

                    (value - array[i]) /

                    (array[i + 1] - array[i])

            };

        }

    }

}

function interpolateTemperature(values, temp) {

    const t = bounds(

        temp,

        AFM.temperatures

    );

    const lowIndex =

        AFM.temperatures.indexOf(t.low);

    const highIndex =

        AFM.temperatures.indexOf(t.high);

    const lowValue = values[lowIndex];

    const highValue = values[highIndex];

    return lerp(

        lowValue,

        highValue,

        t.ratio

    );

}

function interpolateAltitude(table, altitude, temperature) {

    const a = bounds(

        altitude,

        AFM.altitudes

    );

    const lowTempValue =

        interpolateTemperature(

            table[a.low],

            temperature

        );

    const highTempValue =

        interpolateTemperature(

            table[a.high],

            temperature

        );

    return lerp(

        lowTempValue,

        highTempValue,

        a.ratio

    );

}

function interpolateWeight(dataset, weight, altitude, temperature) {

    const w = bounds(

        weight,

        AFM.weights

    );

    const lowWeightValue =

        interpolateAltitude(

            dataset[w.low],

            altitude,

            temperature

        );

    const highWeightValue =

        interpolateAltitude(

            dataset[w.high],

            altitude,

            temperature

        );

    return lerp(

        lowWeightValue,

        highWeightValue,

        w.ratio

    );

}

function calculateTakeoff(

    weight,

    altitude,

    temperature,

    safetyFactor

) {

    const ground = interpolateWeight(

        AFM.groundRoll,

        weight,

        altitude,

        temperature

    );

    const obstacle = interpolateWeight(

        AFM.obstacle15m,

        weight,

        altitude,

        temperature

    );

    return {

        ground:

            Math.round(

                ground *

                safetyFactor /

                100

            ),

        obstacle:

            Math.round(

                obstacle *

                safetyFactor /

                100

            )

    };

}
