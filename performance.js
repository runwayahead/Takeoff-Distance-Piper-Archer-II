/*
========================================================

TakeoffPro V3.0

performance.js

Piper PA-28-181 Archer II

AFM based

Flaps UP
Flaps 25°

907 kg
953 kg
998 kg
1043 kg
1089 kg

Linear extrapolation

1089 → 1157 kg

========================================================
*/


/*
========================================================
Performance Limits
========================================================
*/

const PERFORMANCE_LIMITS={

    afmMinWeight:907,

    afmInterpolationMaxWeight:1089,

    afmMaxWeight:1157,

    minPressureAltitude:0,

    maxPressureAltitude:10000,

    minTemperature:-20,

    maxTemperature:50

};



/*
========================================================
Helpers
========================================================
*/

function roundMeter(value){

    return Math.round(value);

}



function applyPercent(value,percent){

    return value*(1+(percent/100));

}



function reservePercent(runway,required){

    if(runway<=0){

        return 0;

    }

    return ((runway-required)/runway)*100;

}



/*
========================================================
Weight Helper
========================================================
*/

function getAFMWeight(weight){

    return Number(weight);

}
/*
========================================================
Validation
========================================================
*/

function validateAFM(

    weight,

    pressureAltitude,

    temperature

){

    let message=[];

    if(

        weight>

        PERFORMANCE_LIMITS.afmMaxWeight

    ){

        message.push(

            "Maximum Takeoff Weight exceeded"

        );

    }

    if(

        pressureAltitude<

        PERFORMANCE_LIMITS.minPressureAltitude

    ){

        message.push(

            "Pressure Altitude below AFM range"

        );

    }

    if(

        pressureAltitude>

        PERFORMANCE_LIMITS.maxPressureAltitude

    ){

        message.push(

            "Pressure Altitude above AFM range"

        );

    }

    if(

        temperature<

        PERFORMANCE_LIMITS.minTemperature

    ){

        message.push(

            "Temperature below AFM range"

        );

    }

    if(

        temperature>

        PERFORMANCE_LIMITS.maxTemperature

    ){

        message.push(

            "Temperature above AFM range"

        );

    }

    return{

        valid:

            message.length===0,

        message:

            message.join("<br>")

    };

}



/*
========================================================
Weight Information
========================================================
*/

function updateWeightInfo(

    inputWeight

){

    const field=

        document.getElementById(

            "weightInterpolation"

        );



    if(

        inputWeight<=907

    ){

        field.innerHTML=

            "AFM direct 907 kg";

        return;

    }



    if(

        inputWeight>=1089

    ){

        field.innerHTML=

            "AFM 1089 kg<br>Linear extrapolation";

        return;

    }



    const weights=

        AFM_DATA.weights;



    let lower=

        weights[0];



    let upper=

        weights[1];



    for(

        let i=0;

        i<weights.length-1;

        i++

    ){

        if(

            inputWeight>=weights[i]

            &&

            inputWeight<=weights[i+1]

        ){

            lower=

                weights[i];



            upper=

                weights[i+1];



            break;

        }

    }



    const upperPercent=

        (

            (inputWeight-lower)

            /

            (upper-lower)

        )*100;



    const lowerPercent=

        100-upperPercent;



    field.innerHTML=

        lower

        +

        " kg "

        +

        lowerPercent.toFixed(0)

        +

        "%<br>"

        +

        upper

        +

        " kg "

        +

        upperPercent.toFixed(0)

        +

        "%";

}
/*
========================================================
AFM Performance

Ground Roll

Takeoff Distance 15 m

========================================================
*/

function calculateAFMPerformance(

    inputWeight,

    pressureAltitude,

    temperature

){

    const validation=

        validateAFM(

            inputWeight,

            pressureAltitude,

            temperature

        );



    if(!validation.valid){

        return{

            valid:false,

            message:validation.message,

            groundRoll:0,

            obstacle15m:0

        };

    }



    /*
    ====================================================
    Procedure

    normal -> Flaps UP

    short -> Flaps 25°

    ====================================================
    */

    const procedure=

        document.getElementById(

            "procedure"

        ).value;



    let afmDatabase;



    if(procedure==="short"){

        afmDatabase=

            AFM_DATA.flaps25;

    }

    else{

        afmDatabase=

            AFM_DATA.flapsUp;

    }



    /*
    ====================================================
    AFM Calculation

    ====================================================
    */

    const groundRoll=

        interpolateWeight(

            afmDatabase.groundRoll,

            inputWeight,

            pressureAltitude,

            temperature

        );



    const obstacle15m=

        interpolateWeight(

            afmDatabase.obstacle15m,

            inputWeight,

            pressureAltitude,

            temperature

        );



    return{

        valid:true,

        groundRoll:groundRoll,

        obstacle15m:obstacle15m,

        afmWeight:inputWeight,

        procedure:procedure

    };

}
/*
========================================================
Update AFM Output
========================================================
*/

function updateAFMOutput(result){

    if(!result.valid){

        document.getElementById(

            "groundRoll"

        ).innerHTML="---";



        document.getElementById(

            "takeoffDistance"

        ).innerHTML="---";



        document.getElementById(

            "finalDistance"

        ).innerHTML="AFM LIMIT";



        document.getElementById(

            "calculationTree"

        ).innerHTML=

            result.message;



        return;

    }



    document.getElementById(

        "groundRoll"

    ).innerHTML=

        roundMeter(

            result.groundRoll

        )+" m";



    document.getElementById(

        "takeoffDistance"

    ).innerHTML=

        roundMeter(

            result.obstacle15m

        )+" m";

}



/*
========================================================
Calculation Tree
========================================================
*/

function createCalculationTree(

    ground,

    obstacle,

    procedure

){

    let tree=[];



    tree.push(

        "AFM"

    );



    tree.push("");



    tree.push(

        procedure==="short"

        ?

        "Procedure : Short Field (Flaps 25°)"

        :

        "Procedure : Normal (Flaps UP)"

    );



    tree.push("");



    tree.push(

        "Ground Roll : "

        +

        roundMeter(

            ground

        )

        +

        " m"

    );



    tree.push(

        "15 m         : "

        +

        roundMeter(

            obstacle

        )

        +

        " m"

    );



    return tree;

}
/*
========================================================
Takeoff Corrections

Wind
Surface
Procedure
Slope

========================================================
*/

function calculateCorrectedPerformance(result){

    if(!result.valid){

        return{

            valid:false,

            message:result.message

        };

    }

    let ground=result.groundRoll;

    let obstacle=result.obstacle15m;

    let tree=createCalculationTree(

        ground,

        obstacle,

        result.procedure

    );



    /*
    ====================================================
    Wind
    ====================================================
    */

    const wind=

        updateWind();

    const windPercent=

        wind.correction;

    ground=

        applyPercent(

            ground,

            windPercent

        );

    obstacle=

        applyPercent(

            obstacle,

            windPercent

        );

    tree.push("");

    tree.push(

        "Wind "

        +

        windPercent.toFixed(1)

        +

        " %"

    );

    tree.push(

        "Ground Roll : "

        +

        roundMeter(

            ground

        )

        +

        " m"

    );

    tree.push(

        "15 m         : "

        +

        roundMeter(

            obstacle

        )

        +

        " m"

    );



    /*
    ====================================================
    Surface
    ====================================================
    */

    const surface=

        document.getElementById(

            "surface"

        ).value;

    let surfacePercent=0;

    switch(surface){

        case "grass":

            surfacePercent=20;

            break;

        case "grasswet":

            surfacePercent=30;

            break;

        case "contaminated":

            surfacePercent=30;

            break;

        default:

            surfacePercent=0;

    }

    ground=

        applyPercent(

            ground,

            surfacePercent

        );

    obstacle=

        applyPercent(

            obstacle,

            surfacePercent

        );

    tree.push("");

    tree.push(

        "Surface +"

        +

        surfacePercent

        +

        " %"

    );

    tree.push(

        "Ground Roll : "

        +

        roundMeter(

            ground

        )

        +

        " m"

    );

    tree.push(

        "15 m         : "

        +

        roundMeter(

            obstacle

        )

        +

        " m"

    );



    /*
    ====================================================
    Procedure

    AFM already selected

    Safety Margin remains

    ====================================================
    */

    let procedurePercent=0;

    switch(result.procedure){

        case "normal":

            procedurePercent=30;

            break;

        case "short":

            procedurePercent=20;

            break;

        default:

            procedurePercent=0;

    }

    ground=

        applyPercent(

            ground,

            procedurePercent

        );

    obstacle=

        applyPercent(

            obstacle,

            procedurePercent

        );

    tree.push("");

    tree.push(

        "Procedure +"

        +

        procedurePercent

        +

        " %"

    );

    tree.push(

        "Ground Roll : "

        +

        roundMeter(

            ground

        )

        +

        " m"

    );

    tree.push(

        "15 m         : "

        +

        roundMeter(

            obstacle

        )

        +

        " m"

    );
        /*
    ====================================================
    Slope

    +10 % uphill

    -10 % downhill

    per 1 %

    ====================================================
    */

    const slope=

        Number(

            document.getElementById(

                "slope"

            ).value

        );



    const slopePercent=

        slope*10;



    ground=

        applyPercent(

            ground,

            slopePercent

        );



    obstacle=

        applyPercent(

            obstacle,

            slopePercent

        );



    tree.push("");



    tree.push(

        "Slope "

        +

        slope.toFixed(1)

        +

        " %"

    );



    tree.push(

        "Ground Roll : "

        +

        roundMeter(

            ground

        )

        +

        " m"

    );



    tree.push(

        "15 m         : "

        +

        roundMeter(

            obstacle

        )

        +

        " m"

    );



    /*
    ====================================================
    Result

    ====================================================
    */

    return{

        valid:true,

        groundRoll:ground,

        obstacle15m:obstacle,

        calculationTree:

            tree.join("\n")

    };

}
/*
========================================================
Final Performance

Runway Remaining
Reserve
Status

========================================================
*/

function updateFinalPerformance(result){

    if(!result.valid){

        document.getElementById(

            "finalDistance"

        ).innerHTML="AFM LIMIT";



        document.getElementById(

            "remainingDistance"

        ).innerHTML="---";



        document.getElementById(

            "statusBadge"

        ).innerHTML="AFM LIMIT";



        document.getElementById(

            "calculationTree"

        ).innerHTML=

            result.message;



        return;

    }



    /*
    ====================================================
    Runway
    ====================================================
    */

    const runwayLength=

        Number(

            document.getElementById(

                "runwayLength"

            ).value

        );



    const required=

        roundMeter(

            result.obstacle15m

        );



    const remaining=

        calculateRemainingDistance(

            runwayLength,

            required

        );



    const reserve=

        calculateReserve(

            runwayLength,

            required

        );



    /*
    ====================================================
    Output
    ====================================================
    */

    document.getElementById(

        "finalDistance"

    ).innerHTML=

        required+" m";



    document.getElementById(

        "remainingDistance"

    ).innerHTML=

        roundMeter(

            remaining

        )+" m";



    document.getElementById(

        "calculationTree"

    ).innerHTML=

        result.calculationTree;



    /*
    ====================================================
    Status
    ====================================================
    */

    const badge=

        document.getElementById(

            "statusBadge"

        );



    badge.classList.remove(

        "safe"

    );



    badge.classList.remove(

        "caution"

    );



    badge.classList.remove(

        "danger"

    );



    if(reserve>=40){

        badge.classList.add(

            "safe"

        );



        badge.innerHTML=

            "SAFE<br>"

            +

            reserve.toFixed(0)

            +

            "%";



        return;

    }



    if(

        reserve>=20 &&

        reserve<40

    ){

        badge.classList.add(

            "caution"

        );



        badge.innerHTML=

            "CAUTION<br>"

            +

            reserve.toFixed(0)

            +

            "%";



        return;

    }



    badge.classList.add(

        "danger"

    );



    badge.innerHTML=

        "NOT RECOMMENDED<br>"

        +

        reserve.toFixed(0)

        +

        "%";

}



/*
========================================================
Helper

Runway Remaining

========================================================
*/

function calculateRemainingDistance(

    runway,

    required

){

    return runway-required;

}



/*
========================================================
Helper

Reserve

========================================================
*/

function calculateReserve(

    runway,

    required

){

    return reservePercent(

        runway,

        required

    );

}
/*
========================================================
Main Performance Update
========================================================
*/

function updatePerformance(){

    /*
    ====================================================
    Input
    ====================================================
    */

    const inputWeight=

        Number(

            document.getElementById(

                "weight"

            ).value

        );



    const temperature=

        Number(

            document.getElementById(

                "temperature"

            ).value

        );



    /*
    ====================================================
    Atmosphere
    ====================================================
    */

    const atmosphere=

        updateAtmosphere();



    const pressureAltitude=

        atmosphere.pressureAltitude;



    /*
    ====================================================
    Weight Information
    ====================================================
    */

    updateWeightInfo(

        inputWeight

    );



    /*
    ====================================================
    AFM
    ====================================================
    */

    const afm=

        calculateAFMPerformance(

            inputWeight,

            pressureAltitude,

            temperature

        );



    updateAFMOutput(

        afm

    );



    if(!afm.valid){

        document.getElementById(

            "finalDistance"

        ).innerHTML=

            "AFM LIMIT";



        document.getElementById(

            "remainingDistance"

        ).innerHTML=

            "---";



        document.getElementById(

            "statusBadge"

        ).innerHTML=

            "AFM LIMIT";



        document.getElementById(

            "calculationTree"

        ).innerHTML=

            afm.message;

        return;

    }



    /*
    ====================================================
    Wind
    ====================================================
    */

    updateWind();



    /*
    ====================================================
    Corrections
    ====================================================
    */

    const corrected=

        calculateCorrectedPerformance(

            afm

        );



    /*
    ====================================================
    Final Output
    ====================================================
    */

    updateFinalPerformance(

        corrected

    );

}



/*
========================================================
Refresh
========================================================
*/

function refreshPerformance(){

    updatePerformance();

}



/*
========================================================
Reset
========================================================
*/

function resetPerformance(){

    document.getElementById(

        "groundRoll"

    ).innerHTML="---";



    document.getElementById(

        "takeoffDistance"

    ).innerHTML="---";



    document.getElementById(

        "finalDistance"

    ).innerHTML="---";



    document.getElementById(

        "remainingDistance"

    ).innerHTML="---";



    document.getElementById(

        "calculationTree"

    ).innerHTML="";



    document.getElementById(

        "statusBadge"

    ).innerHTML="READY";

}



/*
========================================================
Weight Validation
========================================================
*/

function validateWeightInput(){

    const weight=

        Number(

            document.getElementById(

                "weight"

            ).value

        );



    if(weight>

        PERFORMANCE_LIMITS.afmMaxWeight){

        document.getElementById(

            "weight"

        ).style.border=

            "2px solid red";

    }

    else{

        document.getElementById(

            "weight"

        ).style.border="";

    }

}
/*
========================================================
TakeoffPro V3.0

Live Integration

========================================================
*/

function registerPerformanceEvents(){

    const inputIds=[

        "weight",
        "elevation",
        "qnh",
        "temperature",

        "windDirection",
        "windSpeed",

        "runwayHeading",

        "runwayLength",

        "surface",

        "procedure",

        "slope"

    ];



    inputIds.forEach(function(id){

        const element=document.getElementById(id);

        if(!element){

            return;

        }



        element.addEventListener(

            "input",

            function(){

                validateWeightInput();

                updatePerformance();

            }

        );



        element.addEventListener(

            "change",

            function(){

                validateWeightInput();

                updatePerformance();

            }

        );

    });

}



/*
========================================================
Initialisation

========================================================
*/

function initialisePerformance(){

    validateWeightInput();

    updatePerformance();

}



/*
========================================================
External Refresh

========================================================
*/

function recalculateTakeoff(){

    updatePerformance();

}



/*
========================================================
Status Helper

========================================================
*/

function setStatus(text,cssClass){

    const badge=

        document.getElementById(

            "statusBadge"

        );



    if(!badge){

        return;

    }



    badge.classList.remove(

        "safe"

    );



    badge.classList.remove(

        "caution"

    );



    badge.classList.remove(

        "danger"

    );



    if(cssClass){

        badge.classList.add(

            cssClass

        );

    }



    badge.innerHTML=text;

}



/*
========================================================
Version

========================================================
*/

const TAKEOFFPRO_VERSION={

    app:"3.0",

    aircraft:

    "Piper PA-28-181 Archer II",

    afmWeights:[

        907,

        953,

        998,

        1043,

        1089

    ],

    interpolation:[

        "Weight",

        "Pressure Altitude",

        "Temperature"

    ],

    weightLogic:

        "907-1089 kg interpolation / 1089-1157 kg extrapolation",

    extrapolation:true

};



/*
========================================================
Startup

========================================================
*/

window.addEventListener(

    "load",

    function(){

        registerPerformanceEvents();

        initialisePerformance();

        console.log(

            "TakeoffPro",

            TAKEOFFPRO_VERSION

        );

    }

);
