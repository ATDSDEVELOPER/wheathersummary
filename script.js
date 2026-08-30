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

const locationMessageElement =
    document.getElementById("locationMessage");


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

        hideLocationMessage();


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

            location.country || ""

        );


    } catch (error) {

        console.error(
            "Search error:",
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
   MY LOCATION
========================================= */

function getMyLocation() {

    hideError();

    hideLocationMessage();


    /*
        Check whether browser supports
        Geolocation.
    */

    if (!("geolocation" in navigator)) {

        showError(
            "Location services are not supported by your browser."
        );

        return;

    }


    /*
        Geolocation requires HTTPS
        except for localhost.
    */

    const isSecure =
        window.isSecureContext ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";


    if (!isSecure) {

        showError(
            "Location access requires a secure HTTPS connection."
        );

        return;

    }


    /*
        Disable button while obtaining
        the user's location.
    */

    locationButton.disabled = true;

    locationButton.textContent =
        "📍 Finding location...";


    showLoading();


    showLocationMessage(
        "📍 Requesting your location. Please allow location access if your browser asks."
    );


    /*
        IMPORTANT:
        We use a separate success/error
        callback instead of putting everything
        into one large function.
    */

    navigator.geolocation.getCurrentPosition(

        handleLocationSuccess,

        handleLocationError,

        {
            enableHighAccuracy: false,

            timeout: 15000,

            maximumAge: 300000
        }

    );

}


/* =========================================
   LOCATION SUCCESS
========================================= */

async function handleLocationSuccess(position) {

    try {

        /*
            Get coordinates from browser.
        */

        const latitude =
            position.coords.latitude;

        const longitude =
            position.coords.longitude;


        console.log(
            "Location found:",
            latitude,
            longitude
        );


        /*
            Basic coordinate validation.
        */

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "Invalid coordinates received."
            );

        }


        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {

            throw new Error(
                "Coordinates are outside valid range."
            );

        }


        showLocationMessage(
            "📍 Your location was found. Loading local weather..."
        );


        /*
            Get weather using the exact
            coordinates supplied by browser.
        */

        await getWeather(

            latitude,

            longitude,

            "Your Location",

            ""

        );


        /*
            Clear search input because this
            result comes from GPS/location.
        */

        cityInput.value = "";


        showLocationMessage(
            "📍 Weather shown for your current location."
        );


    } catch (error) {

        console.error(
            "Location weather error:",
            error
        );

        showError(
            "Your location was detected, but weather information could not be loaded. Please try again."
        );

    } finally {

        finishLocationButton();

        hideLoading();

    }

}


/* =========================================
   LOCATION ERROR
========================================= */

function handleLocationError(error) {

    console.error(
        "Geolocation error:",
        error
    );


    let message =
        "Unable to get your location.";


    /*
        Permission denied
    */

    if (error.code === 1) {

        message =
            "Location permission was denied. Please allow location access for this website in your browser settings, then try again.";

    }


    /*
        Position unavailable
    */

    else if (error.code === 2) {

        message =
            "Your location could not be determined. Please check that location services are enabled on your device.";

    }


    /*
        Timeout
    */

    else if (error.code === 3) {

        message =
            "Location detection timed out. Please try again or search for your city manually.";

    }


    showError(message);


    showLocationMessage(
        "📍 Location could not be detected. You can search for your city instead."
    );


    finishLocationButton();

    hideLoading();

}


/* =========================================
   RESET LOCATION BUTTON
========================================= */

function finishLocationButton() {

    locationButton.disabled = false;

    locationButton.textContent =
        "📍 My Location";

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


        console.log(
            "Weather request:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API request failed: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !data.current ||
            !data.hourly ||
            !data.daily
        ) {

            throw new Error(
                "Invalid weather data received."
            );

        }


        /*
            Display all weather sections.
        */

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


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        showError(
            "Unable to load weather information. Please check your internet connection and try again."
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


    /*
        Open-Meteo returns the local time
        for the selected timezone.
    */

    dateElement.textContent =
        formatWeatherDate(
            current.time
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
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (currentHour >= 0) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ] ?? 0;

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
   FORMAT WEATHER DATE
========================================= */

function formatWeatherDate(timeString) {

    if (!timeString) {

        return "--";

    }


    /*
        Open-Meteo's timezone=auto gives
        local time without timezone offset.

        We format the returned string
        directly instead of accidentally
        converting it to the user's timezone.
    */

    const parts =
        timeString.split("T");


    if (parts.length !== 2) {

        return timeString;

    }


    const datePart =
        parts[0];

    const timePart =
        parts[1];


    const date =
        new Date(
            `${datePart}T${timePart}:00`
        );


    if (Number.isNaN(date.getTime())) {

        return timeString;

    }


    return date.toLocaleString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
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
        !hourly.time ||
        hourly.time.length === 0
    ) {

        return -1;

    }


    if (currentTime) {

        const exactIndex =
            hourly.time.indexOf(
                currentTime
            );


        if (exactIndex !== -1) {

            return exactIndex;

        }

    }


    /*
        Find the closest hourly time.
    */

    const currentDate =
        currentTime
            ? new Date(
                `${currentTime}:00`
              )
            : new Date();


    let bestIndex = 0;

    let smallestDifference =
        Infinity;


    for (
        let i = 0;
        i < hourly.time.length;
        i++
    ) {

        const hourDate =
            new Date(
                `${hourly.time[i]}:00`
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

    if (
        [71, 73, 75, 77, 85, 86]
            .includes(code)
    ) {

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
            data.hourly,
            current.time
        );


    let rainChance = 0;


    if (currentHour >= 0) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ] ?? 0;

    }


    let summary =
        `Today is ${getWeatherDescription(code).toLowerCase()} with a temperature of around ${temperature}°C. `;


    if (rainChance >= 70) {

        summary +=
            "There is a high chance of rain, so carrying an umbrella is recommended. ";

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


    hourlyElement.innerHTML = "";


    const startIndex =
        findCurrentHourIndex(
            hourly,
            data.current.time
        );


    const safeStartIndex =
        startIndex >= 0
            ? startIndex
            : 0;


    const hoursToShow = 24;


    for (
        let i = safeStartIndex;
        i < safeStartIndex + hoursToShow;
        i++
    ) {

        if (
            i >= hourly.time.length
        ) {

            break;

        }


        const time =
            new Date(
                `${hourly.time[i]}:00`
            );


        const temperature =
            Math.round(
                hourly.temperature_2m[i]
            );


        const rain =
            hourly
                .precipitation_probability[i] ?? 0;


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
                `${daily.time[i]}T12:00:00`
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
                .precipitation_probability_max[i] ?? 0;


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
        new Date(
            `${data.daily.sunrise[0]}:00`
        );


    const sunset =
        new Date(
            `${data.daily.sunset[0]}:00`
        );


    sunriseElement.textContent =
        formatTime(
            sunrise
        );


    sunsetElement.textContent =
        formatTime(
            sunset
        );

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(date) {

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";

    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
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

            Official emergency weather warnings
            should be obtained from authoritative
            government or meteorological services.

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


/* =========================================
   LOCATION MESSAGE
========================================= */

function showLocationMessage(message) {

    locationMessageElement.textContent =
        message;

    locationMessageElement.classList.remove(
        "hidden"
    );

}


function hideLocationMessage() {

    locationMessageElement.classList.add(
        "hidden"
    );

}
