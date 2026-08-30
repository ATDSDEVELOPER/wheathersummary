/* =========================================================
   WEATHER SUMMARY
   Main JavaScript
   Weather data: Open-Meteo
========================================================= */


/* =========================================================
   GET HTML ELEMENTS
========================================================= */

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

const copyrightYear =
    document.getElementById("copyrightYear");


/* =========================================================
   COPYRIGHT YEAR
========================================================= */

if (copyrightYear) {

    copyrightYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

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


/* =========================================================
   SEARCH CITY
========================================================= */

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
            "https://geocoding-api.open-meteo.com/v1/search?" +
            "name=" +
            encodeURIComponent(city) +
            "&count=1" +
            "&language=en" +
            "&format=json";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Geocoding request failed."
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

        console.error(
            "Search error:",
            error
        );

        showError(
            "Unable to find this city. Please try again."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   GET WEATHER
========================================================= */

async function getWeather(
    latitude,
    longitude,
    name,
    country
) {

    try {

        showLoading();


        const url =
            "https://api.open-meteo.com/v1/forecast?" +

            "latitude=" +
            encodeURIComponent(latitude) +

            "&longitude=" +
            encodeURIComponent(longitude) +

            "&current=" +

            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "pressure_msl," +
            "wind_speed_10m," +
            "weather_code" +

            "&hourly=" +

            "temperature_2m," +
            "precipitation_probability," +
            "weather_code," +
            "wind_speed_10m" +

            "&daily=" +

            "weather_code," +
            "temperature_2m_max," +
            "temperature_2m_min," +
            "precipitation_probability_max," +
            "sunrise," +
            "sunset" +

            "&timezone=auto" +

            "&forecast_days=7";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API request failed."
            );

        }


        const data =
            await response.json();


        if (!data.current) {

            throw new Error(
                "Weather data is unavailable."
            );

        }


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


        /*
            IMPORTANT:

            Open-Meteo forecast data itself is NOT
            an official emergency alert system.

            Therefore we clearly label this section
            as information rather than claiming
            official emergency warnings.
        */

        displayNoAlerts();


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        showError(
            "Unable to load weather information. Please try again."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   DISPLAY CURRENT WEATHER
========================================================= */

function displayCurrentWeather(
    data,
    name,
    country
) {

    const current =
        data.current;


    /* LOCATION */

    cityElement.textContent =
        country
            ? `${name}, ${country}`
            : name;


    /* DATE */

    const localDate =
        parseLocalDateTime(
            current.time
        );


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


    /* TEMPERATURE */

    temperatureElement.textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;


    /* FEELS LIKE */

    feelsLikeElement.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    /* HUMIDITY */

    humidityElement.textContent =
        `${current.relative_humidity_2m}%`;


    /* WIND */

    windElement.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    /* PRESSURE */

    pressureElement.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    /* RAIN CHANCE */

    const currentHour =
        findCurrentHourIndex(
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        data.hourly.precipitation_probability &&
        data.hourly.precipitation_probability[currentHour] !== undefined
    ) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];

    }


    rainChanceElement.textContent =
        `${rainChance}%`;


    /* WEATHER CONDITION */

    const code =
        current.weather_code;


    conditionElement.textContent =
        getWeatherDescription(
            code
        );


    /* WEATHER ICON */

    weatherIconElement.textContent =
        getWeatherIcon(
            code
        );

}


/* =========================================================
   PARSE LOCAL DATE/TIME
========================================================= */

function parseLocalDateTime(
    dateTimeString
) {

    /*
        Open-Meteo with timezone=auto returns
        local time without a timezone offset.

        We create the date carefully so the
        displayed date/time remains usable.
    */

    const parts =
        dateTimeString.split(
            /[-T: ]/
        ).map(Number);


    if (parts.length >= 5) {

        return new Date(
            parts[0],
            parts[1] - 1,
            parts[2],
            parts[3],
            parts[4]
        );

    }


    return new Date(
        dateTimeString
    );

}


/* =========================================================
   FIND CURRENT HOUR
========================================================= */

function findCurrentHourIndex(
    hourly,
    currentTime
) {

    if (
        !hourly ||
        !hourly.time ||
        hourly.time.length === 0
    ) {

        return -1;

    }


    /*
        Find the exact or nearest forecast hour.
    */

    let bestIndex = 0;

    let smallestDifference =
        Infinity;


    const currentDate =
        parseLocalDateTime(
            currentTime
        );


    for (
        let i = 0;
        i < hourly.time.length;
        i++
    ) {

        const hourDate =
            parseLocalDateTime(
                hourly.time[i]
            );


        const difference =
            Math.abs(
                hourDate.getTime() -
                currentDate.getTime()
            );


        if (
            difference <
            smallestDifference
        ) {

            smallestDifference =
                difference;

            bestIndex =
                i;

        }

    }


    return bestIndex;

}


/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

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


    if (
        [45, 48].includes(code)
    ) {

        return "Foggy";

    }


    if (
        [51, 53, 55].includes(code)
    ) {

        return "Drizzle";

    }


    if (
        [56, 57].includes(code)
    ) {

        return "Freezing drizzle";

    }


    if (
        [61, 63, 65].includes(code)
    ) {

        return "Rain";

    }


    if (
        [66, 67].includes(code)
    ) {

        return "Freezing rain";

    }


    if (
        [71, 73, 75, 77].includes(code)
    ) {

        return "Snow";

    }


    if (
        [80, 81, 82].includes(code)
    ) {

        return "Rain showers";

    }


    if (
        [85, 86].includes(code)
    ) {

        return "Snow showers";

    }


    if (
        [95, 96, 99].includes(code)
    ) {

        return "Thunderstorm";

    }


    return "Unknown weather";

}


/* =========================================================
   WEATHER ICON
========================================================= */

function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    }


    if (
        [1, 2].includes(code)
    ) {

        return "⛅";

    }


    if (code === 3) {

        return "☁️";

    }


    if (
        [45, 48].includes(code)
    ) {

        return "🌫️";

    }


    if (
        [51, 53, 55, 56, 57].includes(code)
    ) {

        return "🌦️";

    }


    if (
        [61, 63, 65, 66, 67].includes(code)
    ) {

        return "🌧️";

    }


    if (
        [71, 73, 75, 77, 85, 86].includes(code)
    ) {

        return "❄️";

    }


    if (
        [80, 81, 82].includes(code)
    ) {

        return "🌦️";

    }


    if (
        [95, 96, 99].includes(code)
    ) {

        return "⛈️";

    }


    return "🌤️";

}


/* =========================================================
   WEATHER SUMMARY
========================================================= */

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
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        data.hourly.precipitation_probability &&
        data.hourly.precipitation_probability[currentHour] !== undefined
    ) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];

    }


    let summary =
        `Current conditions are ${getWeatherDescription(code).toLowerCase()} with a temperature of approximately ${temperature}°C. `;


    if (rainChance >= 70) {

        summary +=
            "The probability of precipitation is high. ";

    }

    else if (rainChance >= 40) {

        summary +=
            "There is a moderate probability of precipitation. ";

    }

    else {

        summary +=
            "The probability of precipitation is currently low. ";

    }


    if (wind >= 40) {

        summary +=
            "Wind speeds are currently strong. ";

    }

    else if (wind >= 25) {

        summary +=
            "Moderate to noticeable winds are present. ";

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


/* =========================================================
   HOURLY FORECAST
========================================================= */

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


    if (startIndex < 0) {

        hourlyElement.innerHTML =
            "<p>Hourly forecast unavailable.</p>";

        return;

    }


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
            parseLocalDateTime(
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


        const wind =
            Math.round(
                hourly.wind_speed_10m[i]
            );


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
                🌧️ ${rain ?? 0}% rain
            </div>

            <div class="rain">
                💨 ${wind} km/h
            </div>

        `;


        hourlyElement.appendChild(
            card
        );

    }

}


/* =========================================================
   7 DAY FORECAST
========================================================= */

function displayDailyForecast(data) {

    const daily =
        data.daily;


    dailyElement.innerHTML =
        "";


    if (
        !daily ||
        !daily.time
    ) {

        dailyElement.innerHTML =
            "<p>Daily forecast unavailable.</p>";

        return;

    }


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            parseLocalDateTime(
                daily.time[i] +
                "T12:00"
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
                🌧️ ${rain ?? 0}%
            </div>

        `;


        dailyElement.appendChild(
            card
        );

    }

}


/* =========================================================
   FORMAT HOUR
========================================================= */

function formatHour(date) {

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric"
        }
    );

}


/* =========================================================
   FORMAT DAY
========================================================= */

function formatDay(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}


/* =========================================================
   SUNRISE / SUNSET
========================================================= */

function displaySunTimes(data) {

    if (
        !data.daily ||
        !data.daily.sunrise ||
        !data.daily.sunset
    ) {

        sunriseElement.textContent =
            "--";

        sunsetElement.textContent =
            "--";

        return;

    }


    const sunrise =
        parseLocalDateTime(
            data.daily.sunrise[0]
        );


    const sunset =
        parseLocalDateTime(
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


/* =========================================================
   MY LOCATION
========================================================= */

function getMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Your browser does not support location detection."
        );

        return;

    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            try {

                /*
                    Use reverse geocoding to get
                    a readable location name.
                */

                const reverseUrl =
                    "https://geocoding-api.open-meteo.com/v1/reverse?" +
                    "latitude=" +
                    encodeURIComponent(latitude) +
                    "&longitude=" +
                    encodeURIComponent(longitude) +
                    "&count=1" +
                    "&language=en" +
                    "&format=json";


                const response =
                    await fetch(
                        reverseUrl
                    );


                let name =
                    "Your Location";


                let country =
                    "";


                if (response.ok) {

                    const data =
                        await response.json();


                    if (
                        data.results &&
                        data.results.length > 0
                    ) {

                        name =
                            data.results[0].name ||
                            "Your Location";


                        country =
                            data.results[0].country ||
                            "";

                    }

                }


                await getWeather(

                    latitude,

                    longitude,

                    name,

                    country

                );


            } catch (error) {

                console.error(
                    "Location weather error:",
                    error
                );


                showError(
                    "Unable to load weather for your location."
                );


            } finally {

                hideLoading();

            }

        },


        function(error) {

            console.error(
                "Geolocation error:",
                error
            );


            let message =
                "Unable to access your location.";


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission was denied. Please allow location access in your browser.";

            }

            else if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                message =
                    "Your location could not be determined.";

            }

            else if (
                error.code ===
                error.TIMEOUT
            ) {

                message =
                    "Location request timed out. Please try again.";

            }


            showError(
                message
            );


            hideLoading();

        },

        {

            enableHighAccuracy: false,

            timeout: 10000,

            maximumAge: 300000

        }

    );

}


/* =========================================================
   ALERT INFORMATION
========================================================= */

function displayNoAlerts() {

    alertsElement.innerHTML = `

        <div class="no-alert">

            🔵 Official emergency alerts are not
            provided by this forecast data source.

            <br><br>

            Weather Summary provides forecast information,
            but it should not be used as the sole source
            for emergency or life-safety decisions.

            <br><br>

            For official warnings, users should check
            the responsible national meteorological,
            disaster-management or emergency authority
            for their location.

        </div>

    `;

}


/* =========================================================
   LOADING
========================================================= */

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


/* =========================================================
   ERROR
========================================================= */

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
