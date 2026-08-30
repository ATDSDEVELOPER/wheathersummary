/* =========================================
   GET HTML ELEMENTS
========================================= */

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const locationButton =
    document.getElementById("locationButton");

const cityElement =
    document.getElementById("city");

const dateElement =
    document.getElementById("date");

const weatherIconElement =
    document.getElementById("weatherIcon");

const temperatureElement =
    document.getElementById("temperature");

const conditionElement =
    document.getElementById("condition");

const feelsLikeElement =
    document.getElementById("feelsLike");

const humidityElement =
    document.getElementById("humidity");

const windElement =
    document.getElementById("wind");

const rainChanceElement =
    document.getElementById("rainChance");

const pressureElement =
    document.getElementById("pressure");

const summaryElement =
    document.getElementById("summary");

const hourlyElement =
    document.getElementById("hourlyForecast");

const dailyElement =
    document.getElementById("dailyForecast");

const sunriseElement =
    document.getElementById("sunrise");

const sunsetElement =
    document.getElementById("sunset");

const alertsElement =
    document.getElementById("alerts");

const loadingElement =
    document.getElementById("loading");

const errorElement =
    document.getElementById("error");


/* =========================================
   BUTTON EVENTS
========================================= */

searchButton.addEventListener(
    "click",
    searchWeather
);


cityInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            searchWeather();

        }

    }
);


locationButton.addEventListener(
    "click",
    getMyLocation
);


/* =========================================
   SEARCH CITY
========================================= */

async function searchWeather() {

    const city =
        cityInput.value.trim();


    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;

    }


    try {

        showLoading();


        const url =
            `https://geocoding-api.open-meteo.com/v1/search?` +
            `name=${encodeURIComponent(city)}` +
            `&count=1` +
            `&language=en` +
            `&format=json`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Geocoding request failed"
            );

        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            showError(
                "City not found. Please try another city."
            );

            return;

        }


        const location =
            data.results[0];


        await getWeather(

            location.latitude,

            location.longitude,

            location.name,

            location.country

        );


    } catch (error) {

        console.error(error);

        showError(
            "Unable to find this city."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================
   GET WEATHER
========================================= */

async function getWeather(
    latitude,
    longitude,
    name,
    country
) {

    try {

        showLoading();


        const url =
            `https://api.open-meteo.com/v1/forecast?` +

            `latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=` +

            `temperature_2m,` +
            `relative_humidity_2m,` +
            `apparent_temperature,` +
            `pressure_msl,` +
            `wind_speed_10m,` +
            `weather_code` +

            `&hourly=` +

            `temperature_2m,` +
            `precipitation_probability,` +
            `weather_code,` +
            `wind_speed_10m` +

            `&daily=` +

            `weather_code,` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `precipitation_probability_max,` +
            `sunrise,` +
            `sunset` +

            `&timezone=auto` +

            `&forecast_days=7`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API request failed"
            );

        }


        const data =
            await response.json();


        /* CURRENT WEATHER */

        displayCurrentWeather(
            data,
            name,
            country
        );


        /* HOURLY FORECAST */

        displayHourlyForecast(
            data
        );


        /* 7 DAY FORECAST */

        displayDailyForecast(
            data
        );


        /* SUMMARY */

        displaySummary(
            data
        );


        /* SUNRISE / SUNSET */

        displaySunTimes(
            data
        );


        /* ALERT PLACEHOLDER */

        displayNoAlerts();


    } catch (error) {

        console.error(error);

        showError(
            "Unable to load weather information."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================
   DISPLAY CURRENT WEATHER
========================================= */

function displayCurrentWeather(
    data,
    name,
    country
) {

    const current =
        data.current;


    cityElement.textContent =
        country
            ? `${name}, ${country}`
            : name;


    const localDate =
        new Date(current.time);


    dateElement.textContent =
        localDate.toLocaleString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );


    temperatureElement.textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;


    feelsLikeElement.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    humidityElement.textContent =
        `${current.relative_humidity_2m}%`;


    windElement.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    pressureElement.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    const currentHour =
        findCurrentHourIndex(
            data.hourly
        );


    let rainChance = 0;


    if (currentHour >= 0) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];

    }


    rainChanceElement.textContent =
        `${rainChance}%`;


    const code =
        current.weather_code;


    conditionElement.textContent =
        getWeatherDescription(
            code
        );


    weatherIconElement.textContent =
        getWeatherIcon(
            code
        );

}


/* =========================================
   FIND CURRENT HOUR
========================================= */

function findCurrentHourIndex(hourly) {

    const now =
        new Date();


    for (
        let i = 0;
        i < hourly.time.length;
        i++
    ) {

        const time =
            new Date(
                hourly.time[i]
            );


        if (time >= now) {

            return i;

        }

    }


    return 0;

}


/* =========================================
   WEATHER DESCRIPTION
========================================= */

function getWeatherDescription(code) {

    if (code === 0) {

        return "Clear sky";

    }


    if (code === 1) {

        return "Mainly clear";

    }


    if (code === 2) {

        return "Partly cloudy";

    }


    if (code === 3) {

        return "Overcast";

    }


    if ([45, 48].includes(code)) {

        return "Foggy";

    }


    if ([51, 53, 55].includes(code)) {

        return "Drizzle";

    }


    if ([56, 57].includes(code)) {

        return "Freezing drizzle";

    }


    if ([61, 63, 65].includes(code)) {

        return "Rain";

    }


    if ([66, 67].includes(code)) {

        return "Freezing rain";

    }


    if ([71, 73, 75, 77].includes(code)) {

        return "Snow";

    }


    if ([80, 81, 82].includes(code)) {

        return "Rain showers";

    }


    if ([85, 86].includes(code)) {

        return "Snow showers";

    }


    if ([95, 96, 99].includes(code)) {

        return "Thunderstorm";

    }


    return "Unknown weather";

}


/* =========================================
   WEATHER ICON
========================================= */

function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    }


    if ([1, 2].includes(code)) {

        return "⛅";

    }


    if (code === 3) {

        return "☁️";

    }


    if ([45, 48].includes(code)) {

        return "🌫️";

    }


    if ([51, 53, 55, 56, 57].includes(code)) {

        return "🌦️";

    }


    if ([61, 63, 65, 66, 67].includes(code)) {

        return "🌧️";

    }


    if ([71, 73, 75, 77, 85, 86].includes(code)) {

        return "❄️";

    }


    if ([80, 81, 82].includes(code)) {

        return "🌦️";

    }


    if ([95, 96, 99].includes(code)) {

        return "⛈️";

    }


    return "🌤️";

}


/* =========================================
   WEATHER SUMMARY
========================================= */

function displaySummary(data) {

    const current =
        data.current;


    const code =
        current.weather_code;


    const temperature =
        Math.round(
            current.temperature_2m
        );


    const humidity =
        current.relative_humidity_2m;


    const wind =
        Math.round(
            current.wind_speed_10m
        );


    const currentHour =
        findCurrentHourIndex(
            data.hourly
        );


    let rainChance = 0;


    if (currentHour >= 0) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];

    }


    let summary =
        `Today is ${getWeatherDescription(code).toLowerCase()} with a temperature of around ${temperature}°C. `;


    if (rainChance >= 70) {

        summary +=
            `There is a high chance of rain, so carrying an umbrella is recommended. `;

    }

    else if (rainChance >= 40) {

        summary +=
            `There is a moderate chance of rain today. `;

    }

    else {

        summary +=
            `There is currently a low chance of rain. `;

    }


    if (wind >= 40) {

        summary +=
            `Strong winds are possible. `;

    }

    else if (wind >= 25) {

        summary +=
            `Winds may be noticeable. `;

    }


    if (humidity >= 80) {

        summary +=
            `Humidity is high.`;

    }

    else if (humidity >= 60) {

        summary +=
            `Humidity is moderate.`;

    }


    summaryElement.textContent =
        summary;

}


/* =========================================
   HOURLY FORECAST
========================================= */

function displayHourlyForecast(data) {

    const hourly =
        data.hourly;


    hourlyElement.innerHTML = "";


    const startIndex =
        findCurrentHourIndex(
            hourly
        );


    const hoursToShow = 24;


    for (
        let i = startIndex;
        i < startIndex + hoursToShow;
        i++
    ) {

        if (
            i >= hourly.time.length
        ) {

            break;

        }


        const time =
            new Date(
                hourly.time[i]
            );


        const temperature =
            Math.round(
                hourly.temperature_2m[i]
            );


        const rain =
            hourly
                .precipitation_probability[i];


        const code =
            hourly.weather_code[i];


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "hour";


        card.innerHTML = `

            <strong>
                ${formatHour(time)}
            </strong>

            <div class="icon">
                ${getWeatherIcon(code)}
            </div>

            <div class="temp">
                ${temperature}°C
            </div>

            <div class="condition">
                ${getWeatherDescription(code)}
            </div>

            <div class="rain">
                🌧️ ${rain}% rain
            </div>

        `;


        hourlyElement.appendChild(
            card
        );

    }

}


/* =========================================
   7 DAY FORECAST
========================================= */

function displayDailyForecast(data) {

    const daily =
        data.daily;


    dailyElement.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i]
            );


        const code =
            daily.weather_code[i];


        const max =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const min =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const rain =
            daily
                .precipitation_probability_max[i];


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "day";


        card.innerHTML = `

            <strong>
                ${formatDay(date)}
            </strong>

            <div class="icon">
                ${getWeatherIcon(code)}
            </div>

            <div>
                ${getWeatherDescription(code)}
            </div>

            <div class="temps">
                ${max}° / ${min}°
            </div>

            <div class="rain">
                🌧️ ${rain}%
            </div>

        `;


        dailyElement.appendChild(
            card
        );

    }

}


/* =========================================
   FORMAT HOUR
========================================= */

function formatHour(date) {

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric"
        }
    );

}


/* =========================================
   FORMAT DAY
========================================= */

function formatDay(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}


/* =========================================
   SUNRISE / SUNSET
========================================= */

function displaySunTimes(data) {

    const sunrise =
        new Date(
            data.daily.sunrise[0]
        );


    const sunset =
        new Date(
            data.daily.sunset[0]
        );


    sunriseElement.textContent =
        sunrise.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );


    sunsetElement.textContent =
        sunset.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


/* =========================================
   MY LOCATION
========================================= */

function getMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Your browser does not support location detection."
        );

        return;

    }


    showLoading();


    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            let cityName = "Your Location";
            let countryName = "";


            try {

                const reverseUrl =
                    `https://geocoding-api.open-meteo.com/v1/search?` +
                    `latitude=${latitude}` +
                    `&longitude=${longitude}` +
                    `&count=1` +
                    `&language=en` +
                    `&format=json`;


                const response =
                    await fetch(reverseUrl);


                if (response.ok) {

                    const data =
                        await response.json();


                    if (
                        data.results &&
                        data.results.length > 0
                    ) {

                        cityName =
                            data.results[0].name;

                        countryName =
                            data.results[0].country || "";

                    }

                }

            } catch (err) {

                console.warn(
                    "Reverse geocoding failed, using fallback name:",
                    err
                );

            }


            await getWeather(

                latitude,

                longitude,

                cityName,

                countryName

            );

        },


        function(error) {

            console.error(error);

            hideLoading();


            switch (error.code) {

                case error.PERMISSION_DENIED:

                    showError(
                        "Location permission denied or blocked by system overlays. Please enable location or close floating apps, then try again."
                    );

                    break;


                case error.POSITION_UNAVAILABLE:

                    showError(
                        "Location information is unavailable. Please search manually."
                    );

                    break;


                case error.TIMEOUT:

                    showError(
                        "Location request timed out. Please try again."
                    );

                    break;


                default:

                    showError(
                        "An unknown location error occurred."
                    );

                    break;

            }

        },


        options

    );

}


/* =========================================
   ALERT PLACEHOLDER
========================================= */

function displayNoAlerts() {

    alertsElement.innerHTML = `

        <div class="no-alert">

            🔵 Emergency alert service
            is not connected yet.

            <br><br>

            When we add the authoritative
            alert API, this section will show
            relevant warnings such as:

            <br><br>

            🌪️ Tornado<br>
            ⛈️ Severe Storm<br>
            🌊 Tsunami<br>
            🌎 Earthquake<br>
            🌧️ Flood<br>
            🌋 Volcanic Activity

        </div>

    `;

}


/* =========================================
   LOADING
========================================= */

function showLoading() {

    loadingElement.classList.remove(
        "hidden"
    );

    hideError();

}


function hideLoading() {

    loadingElement.classList.add(
        "hidden"
    );

}


/* =========================================
   ERROR
========================================= */

function showError(message) {

    errorElement.textContent =
        message;

    errorElement.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorElement.classList.add(
        "hidden"
    );

}
