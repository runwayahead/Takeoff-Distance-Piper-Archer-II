const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        pages.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");

        const page = document.getElementById(tab.dataset.page);

        page.classList.add("active");

    });

});

const weightSelect = document.getElementById("weight");

const altitudeSlider = document.getElementById("altitude");
const temperatureSlider = document.getElementById("temperature");
const factorSlider = document.getElementById("factor");

const altitudeValue = document.getElementById("altitudeValue");
const temperatureValue = document.getElementById("temperatureValue");
const factorValue = document.getElementById("factorValue");

const groundOutput = document.getElementById("groundRoll");
const obstacleOutput = document.getElementById("obstacleRoll");
const factorOutput = document.getElementById("factorResult");

function updateLabels() {

    altitudeValue.textContent =
        altitudeSlider.value + " ft";

    temperatureValue.textContent =
        temperatureSlider.value + " °C";

    factorValue.textContent =
        factorSlider.value + " %";

}

altitudeSlider.addEventListener(
    "input",
    updateLabels
);

temperatureSlider.addEventListener(
    "input",
    updateLabels
);

factorSlider.addEventListener(
    "input",
    updateLabels
);

updateLabels();

function performCalculation() {

    const result = calculateTakeoff(

        Number(weightSelect.value),

        Number(altitudeSlider.value),

        Number(temperatureSlider.value),

        Number(factorSlider.value)

    );

    groundOutput.textContent =
        result.ground + " m";

    obstacleOutput.textContent =
        result.obstacle + " m";

    factorOutput.textContent =
        factorSlider.value + " %";

}

document
.getElementById("calculate")
.addEventListener(

    "click",

    () => {

        performCalculation();

        tabs.forEach(t =>
            t.classList.remove("active")
        );

        pages.forEach(p =>
            p.classList.remove("active")
        );

        document
            .querySelector(
                '[data-page="results"]'
            )
            .classList.add("active");

        document
            .getElementById("results")
            .classList.add("active");

    }

);

weightSelect.addEventListener(
    "change",
    performCalculation
);

altitudeSlider.addEventListener(
    "change",
    performCalculation
);

temperatureSlider.addEventListener(
    "change",
    performCalculation
);

factorSlider.addEventListener(
    "change",
    performCalculation
);

performCalculation();