"use strict";

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

const locationStatusElement =
    document.getElementById("locationStatus");


/* =========================================
   API URLS
========================================= */

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";


/* =========================================
   BUTTON EVENTS
========================================= */

searchButton.addEventListener(
    "click",
    searchWeather
);


cityInput.addEventListener(
    "keydown",
    function (event) {

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

        hideError();

        hideLocationStatus();


        const url =
            `${GEOCODING_API}?` +
            `name=${encodeURIComponent(city)}` +
            `&count=1` +
            `&language=en` +
            `&format=json`;


        const response =
            await fetch(
                url,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Geocoding API returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            showError(
                "City not found. Please check the spelling and try again."
            );

            return;

        }


        const location =
            data.results[0];


        if (
            !Number.isFinite(
                Number(location.latitude)
            ) ||
            !Number.isFinite(
                Number(location.longitude)
            )
        ) {

            throw new Error(
                "The location coordinates are invalid."
            );

        }


        await getWeather(

            Number(location.latitude),

            Number(location.longitude),

            location.name,

            location.country || ""

        );


    } catch (error) {

        console.error(
            "City search error:",
            error
        );


        showError(
            "Unable to find this city. Please check your internet connection and try again."
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

        hideError();


        /* Validate coordinates */

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "Invalid latitude or longitude."
            );

        }


        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {

            throw new Error(
                "Coordinates are outside the valid range."
            );

        }


        /*
         * Open-Meteo forecast request.
         */

        const params =
            new URLSearchParams({

                latitude:
                    latitude.toString(),

                longitude:
                    longitude.toString(),

                current:
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "apparent_temperature",
                        "pressure_msl",
                        "wind_speed_10m",
                        "weather_code"
                    ].join(","),

                hourly:
                    [
                        "temperature_2m",
                        "precipitation_probability",
                        "weather_code",
                        "wind_speed_10m"
                    ].join(","),

                daily:
                    [
                        "weather_code",
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_probability_max",
                        "sunrise",
                        "sunset"
                    ].join(","),

                timezone:
                    "auto",

                forecast_days:
                    "7"

            });


        const url =
            `${WEATHER_API}?${params.toString()}`;


        console.log(
            "Weather request:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Weather API returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Weather data:",
            data
        );


        /*
         * Check that the API returned
         * the important data sections.
         */

        if (
            !data.current ||
            !data.hourly ||
            !data.daily
        ) {

            throw new Error(
                "The weather API returned incomplete data."
            );

        }


        /* Display all weather information */

        displayCurrentWeather(
            data,
            name,
            country
        );


        displayHourlyForecast(
            data
        );


        displayDailyForecast(
            data
        );


        displaySummary(
            data
        );


        displaySunTimes(
            data
        );


        displayNoAlerts();


        /*
         * Tell the user that location
         * weather was successfully loaded.
         */

        if (
            name === "Your Location"
        ) {

            showLocationStatus(
                "📍 Weather loaded successfully for your current location."
            );

        }


    } catch (error) {

        console.error(
            "Weather loading error:",
            error
        );


        /*
         * IMPORTANT:
         * Show a useful error instead of
         * hiding the real problem.
         */

        if (
            name === "Your Location"
        ) {

            showError(
                "Unable to load weather for your location. Please check your internet connection and try again."
            );

        } else {

            showError(
                "Unable to load weather information. Please try again."
            );

        }

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


    /*
     * Open-Meteo returns local time when
     * timezone=auto is used.
     *
     * We display the API timestamp directly
     * rather than relying on the user's timezone.
     */

    dateElement.textContent =
        formatApiDateTime(
            current.time
        );


    temperatureElement.textContent =
        `${Math.round(
            Number(current.temperature_2m)
        )}°C`;


    feelsLikeElement.textContent =
        `${Math.round(
            Number(current.apparent_temperature)
        )}°C`;


    humidityElement.textContent =
        `${Math.round(
            Number(current.relative_humidity_2m)
        )}%`;


    windElement.textContent =
        `${Math.round(
            Number(current.wind_speed_10m)
        )} km/h`;


    pressureElement.textContent =
        `${Math.round(
            Number(current.pressure_msl)
        )} hPa`;


    const currentHour =
        findCurrentHourIndex(
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        Array.isArray(
            data.hourly.precipitation_probability
        )
    ) {

        rainChance =
            Number(
                data.hourly
                    .precipitation_probability[
                        currentHour
                    ]
            ) || 0;

    }


    rainChanceElement.textContent =
        `${Math.round(rainChance)}%`;


    const code =
        Number(current.weather_code);


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

function findCurrentHourIndex(
    hourly,
    currentTime
) {

    if (
        !hourly ||
        !Array.isArray(hourly.time)
    ) {

        return 0;

    }


    /*
     * Open-Meteo's timezone=auto returns
     * local timestamps.
     *
     * Compare the YYYY-MM-DDTHH:MM parts
     * instead of converting them through
     * the browser's timezone.
     */

    const target =
        String(currentTime)
            .slice(0, 16);


    for (
        let i = 0;
        i < hourly.time.length;
        i++
    ) {

        if (
            String(hourly.time[i])
                .slice(0, 16) >= target
        ) {

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

    if (
        [51, 53, 55, 56, 57]
            .includes(code)
    ) {
        return "🌦️";
    }

    if (
        [61, 63, 65, 66, 67]
            .includes(code)
    ) {
        return "🌧️";
    }

    if (
        [71, 73, 75, 77, 85, 86]
            .includes(code)
    ) {
        return "❄️";
    }

    if (
        [80, 81, 82]
            .includes(code)
    ) {
        return "🌦️";
    }

    if (
        [95, 96, 99]
            .includes(code)
    ) {
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
        Number(current.weather_code);


    const temperature =
        Math.round(
            Number(
                current.temperature_2m
            )
        );


    const humidity =
        Number(
            current.relative_humidity_2m
        );


    const wind =
        Math.round(
            Number(
                current.wind_speed_10m
            )
        );


    const currentHour =
        findCurrentHourIndex(
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        data.hourly
            .precipitation_probability
    ) {

        rainChance =
            Number(
                data.hourly
                    .precipitation_probability[
                        currentHour
                    ]
            ) || 0;

    }


    let summary =
        `Current conditions are ${getWeatherDescription(code).toLowerCase()} with a temperature of around ${temperature}°C. `;


    if (rainChance >= 70) {

        summary +=
            "There is a high chance of rain, so carrying an umbrella may be useful. ";

    }

    else if (rainChance >= 40) {

        summary +=
            "There is a moderate chance of rain today. ";

    }

    else {

        summary +=
            "There is currently a low chance of rain. ";

    }


    if (wind >= 40) {

        summary +=
            "Strong winds are possible. ";

    }

    else if (wind >= 25) {

        summary +=
            "Winds may be noticeable. ";

    }


    if (humidity >= 80) {

        summary +=
            "Humidity is high.";

    }

    else if (humidity >= 60) {

        summary +=
            "Humidity is moderate.";

    }

    else {

        summary +=
            "Humidity is relatively low.";

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


    hourlyElement.innerHTML =
        "";


    const startIndex =
        findCurrentHourIndex(
            hourly,
            data.current.time
        );


    const hoursToShow =
        24;


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


        const temperature =
            Math.round(
                Number(
                    hourly.temperature_2m[i]
                )
            );


        const rain =
            Number(
                hourly
                    .precipitation_probability[i]
            ) || 0;


        const code =
            Number(
                hourly.weather_code[i]
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "hour";


        card.innerHTML = `

            <strong>
                ${formatApiHour(
                    hourly.time[i]
                )}
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
                🌧️ ${Math.round(rain)}% rain
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


    dailyElement.innerHTML =
        "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const code =
            Number(
                daily.weather_code[i]
            );


        const max =
            Math.round(
                Number(
                    daily.temperature_2m_max[i]
                )
            );


        const min =
            Math.round(
                Number(
                    daily.temperature_2m_min[i]
                )
            );


        const rain =
            Number(
                daily
                    .precipitation_probability_max[i]
            ) || 0;


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "day";


        card.innerHTML = `

            <strong>
                ${formatApiDay(
                    daily.time[i],
                    i
                )}
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
                🌧️ ${Math.round(rain)}%
            </div>

        `;


        dailyElement.appendChild(
            card
        );

    }

}


/* =========================================
   FORMAT API DATE/TIME
========================================= */

function formatApiDateTime(
    dateTime
) {

    if (!dateTime) {
        return "--";
    }


    const parts =
        String(dateTime)
            .split("T");


    if (parts.length !== 2) {
        return dateTime;
    }


    const date =
        parts[0];


    const time =
        parts[1];


    const dateParts =
        date.split("-");


    if (dateParts.length !== 3) {
        return dateTime;
    }


    const year =
        Number(dateParts[0]);


    const month =
        Number(dateParts[1]);


    const day =
        Number(dateParts[2]);


    const timeParts =
        time.split(":");


    let hour =
        Number(timeParts[0]);


    const minute =
        timeParts[1] || "00";


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    const weekday =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        ).toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                timeZone: "UTC"
            }
        );


    return `${weekday}, ${monthNames[month - 1]} ${day}, ${year} • ${hour}:${minute} ${ampm}`;

}


/* =========================================
   FORMAT HOURLY TIME
========================================= */

function formatApiHour(
    dateTime
) {

    if (!dateTime) {
        return "--";
    }


    const parts =
        String(dateTime)
            .split("T");


    if (parts.length !== 2) {
        return dateTime;
    }


    const time =
        parts[1];


    const hour =
        Number(
            time.split(":")[0]
        );


    const minute =
        time.split(":")[1] || "00";


    const displayHour =
        hour % 12 || 12;


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    return `${displayHour}:${minute} ${ampm}`;

}


/* =========================================
   FORMAT DAILY DAY
========================================= */

function formatApiDay(
    dateString,
    index
) {

    if (index === 0) {

        return "Today";

    }


    const parts =
        String(dateString)
            .split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    const date =
        new Date(
            Date.UTC(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            )
        );


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            timeZone: "UTC"
        }
    );

}


/* =========================================
   SUNRISE / SUNSET
========================================= */

function displaySunTimes(data) {

    if (
        !data.daily.sunrise ||
        !data.daily.sunset
    ) {

        sunriseElement.textContent =
            "--";

        sunsetElement.textContent =
            "--";

        return;

    }


    sunriseElement.textContent =
        formatApiHour(
            data.daily.sunrise[0]
        );


    sunsetElement.textContent =
        formatApiHour(
            data.daily.sunset[0]
        );

}


/* =========================================
   MY LOCATION
========================================= */

function getMyLocation() {

    hideError();


    /*
     * Check whether browser supports
     * the Geolocation API.
     */

    if (
        !("geolocation" in navigator)
    ) {

        showError(
            "Your browser does not support location detection."
        );

        return;

    }


    /*
     * Geolocation requires HTTPS
     * except for special local
     * development environments.
     */

    if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
    ) {

        showError(
            "Location services require HTTPS. Please open the HTTPS version of this website."
        );

        return;

    }


    showLoading();


    showLocationStatus(
        "📍 Requesting your location. Please press Allow if your browser asks for permission."
    );


    /*
     * Disable button while requesting
     * the location.
     */

    locationButton.disabled =
        true;


    const options = {

        enableHighAccuracy:
            false,

        timeout:
            15000,

        maximumAge:
            300000

    };


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            try {

                const latitude =
                    Number(
                        position.coords.latitude
                    );


                const longitude =
                    Number(
                        position.coords.longitude
                    );


                const accuracy =
                    Number(
                        position.coords.accuracy
                    );


                console.log(
                    "Location received:",
                    {
                        latitude,
                        longitude,
                        accuracy
                    }
                );


                /*
                 * Validate the returned
                 * coordinates.
                 */

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    throw new Error(
                        "Browser returned invalid coordinates."
                    );

                }


                if (
                    latitude < -90 ||
                    latitude > 90 ||
                    longitude < -180 ||
                    longitude > 180
                ) {

                    throw new Error(
                        "Browser returned coordinates outside the valid range."
                    );

                }


                showLocationStatus(
                    `📍 Location found. Loading weather...`
                );


                /*
                 * Load weather directly using
                 * latitude and longitude.
                 */

                await getWeather(

                    latitude,

                    longitude,

                    "Your Location",

                    ""

                );


            } catch (error) {

                console.error(
                    "Location weather error:",
                    error
                );


                showError(
                    "Your location was detected, but the weather data could not be loaded. Please check your internet connection and try again."
                );

            } finally {

                locationButton.disabled =
                    false;

                hideLoading();

            }

        },


        function (error) {

            console.error(
                "Geolocation error:",
                error
            );


            locationButton.disabled =
                false;


            hideLoading();


            handleLocationError(
                error
            );

        },


        options

    );

}


/* =========================================
   LOCATION ERROR HANDLING
========================================= */

function handleLocationError(
    error
) {

    /*
     * 1 = PERMISSION_DENIED
     * 2 = POSITION_UNAVAILABLE
     * 3 = TIMEOUT
     */

    if (
        error &&
        error.code === 1
    ) {

        showLocationStatus(
            "📍 Location permission was denied."
        );


        showError(
            "Location access was denied. Click the location/lock icon beside the website address in your browser and allow Location, then reload the page."
        );


        return;

    }


    if (
        error &&
        error.code === 2
    ) {

        showLocationStatus(
            "📍 Your device could not determine your location."
        );


        showError(
            "Your location could not be determined. Make sure Location Services are enabled on your device and try again."
        );


        return;

    }


    if (
        error &&
        error.code === 3
    ) {

        showLocationStatus(
            "📍 Location request timed out."
        );


        showError(
            "The location request took too long. Make sure Location Services are enabled and try again."
        );


        return;

    }


    showLocationStatus(
        "📍 Unable to determine your location."
    );


    showError(
        "Unable to access your location. Please check your browser's location permission and try again."
    );

}


/* =========================================
   CHECK LOCATION PERMISSION
========================================= */

async function checkLocationPermission() {

    /*
     * Permissions API is not available
     * in every browser, so this is optional.
     */

    if (
        !navigator.permissions ||
        !navigator.permissions.query
    ) {

        return;

    }


    try {

        const permission =
            await navigator.permissions.query(
                {
                    name: "geolocation"
                }
            );


        console.log(
            "Geolocation permission:",
            permission.state
        );


        permission.addEventListener(
            "change",
            function () {

                console.log(
                    "Geolocation permission changed:",
                    permission.state
                );

            }
        );


    } catch (error) {

        console.log(
            "Could not check geolocation permission:",
            error
        );

    }

}


/* =========================================
   LOCATION STATUS
========================================= */

function showLocationStatus(
    message
) {

    locationStatusElement.textContent =
        message;


    locationStatusElement.classList.remove(
        "hidden"
    );

}


function hideLocationStatus() {

    locationStatusElement.classList.add(
        "hidden"
    );

}


/* =========================================
   ALERT PLACEHOLDER
========================================= */

function displayNoAlerts() {

    alertsElement.innerHTML = `

        <div class="no-alert">

            🔵 No connected authoritative
            emergency alert feed yet.

            <br><br>

            Weather forecast information is
            provided separately from official
            emergency warnings.

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

function showError(
    message
) {

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


/* =========================================
   STARTUP
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkLocationPermission();

        console.log(
            "Weather Summary loaded successfully."
        );

    }
);
