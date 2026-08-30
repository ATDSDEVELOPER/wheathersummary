```javascript
/* =========================================================
   WEATHER SUMMARY
   Open-Meteo Weather + Geocoding
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


/* =========================================================
   REQUEST CONTROL
========================================================= */

let requestInProgress = false;


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
   SEARCH WEATHER BY CITY
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


    if (requestInProgress) {

        return;
    }


    try {

        requestInProgress = true;

        setButtonsDisabled(true);

        showLoading(
            "Finding city..."
        );


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
                "The location service is unavailable."
            );
        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            throw new Error(
                "City not found. Please check the spelling and try again."
            );
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
            "City search error:",
            error
        );

        showError(
            error.message ||
            "Unable to find this city."
        );


    } finally {

        requestInProgress = false;

        setButtonsDisabled(false);

        hideLoading();
    }

}


/* =========================================================
   MY LOCATION
========================================================= */

function getMyLocation() {

    if (requestInProgress) {

        return;
    }


    /*
       Check whether browser supports geolocation.
    */

    if (!navigator.geolocation) {

        showError(
            "Location detection is not supported by your browser. Please search for your city instead."
        );

        return;
    }


    /*
       Geolocation requires HTTPS.

       GitHub Pages uses HTTPS, so your website
       should pass this check.
    */

    if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
    ) {

        showError(
            "Location access requires HTTPS. Please open the HTTPS version of this website."
        );

        return;
    }


    requestInProgress = true;

    setButtonsDisabled(true);

    showLoading(
        "Requesting your location..."
    );


    /*
       Ask browser for location.
    */

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                /*
                   Validate coordinates.
                */

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    throw new Error(
                        "Your browser returned an invalid location."
                    );
                }


                showLoading(
                    "Loading weather for your location..."
                );


                /*
                   Reverse geocode coordinates so
                   we can display the city name.
                */

                const location =
                    await reverseGeocode(
                        latitude,
                        longitude
                    );


                const locationName =
                    location.name ||
                    "Your Location";


                const country =
                    location.country ||
                    "";


                /*
                   Load weather.
                */

                await getWeather(

                    latitude,

                    longitude,

                    locationName,

                    country

                );


            } catch (error) {

                console.error(
                    "My Location error:",
                    error
                );


                showError(
                    error.message ||
                    "Unable to load weather for your location."
                );

            } finally {

                requestInProgress = false;

                setButtonsDisabled(false);

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


            /*
               Different browser location errors.
            */

            switch (error.code) {

                case error.PERMISSION_DENIED:

                    message =
                        "Location permission was denied. Please allow location access in your browser settings, then click My Location again.";

                    break;


                case error.POSITION_UNAVAILABLE:

                    message =
                        "Your location could not be determined. Check your device's location services or search for your city instead.";

                    break;


                case error.TIMEOUT:

                    message =
                        "Location request timed out. Please try My Location again.";

                    break;


                default:

                    message =
                        "Unable to access your location. Please try again or search for your city.";

            }


            showError(message);

            requestInProgress = false;

            setButtonsDisabled(false);

            hideLoading();
        },


        {
            enableHighAccuracy: false,

            timeout: 15000,

            maximumAge: 300000
        }

    );

}


/* =========================================================
   REVERSE GEOCODING
========================================================= */

async function reverseGeocode(
    latitude,
    longitude
) {

    const url =
        "https://geocoding-api.open-meteo.com/v1/reverse?" +
        "latitude=" +
        encodeURIComponent(latitude) +
        "&longitude=" +
        encodeURIComponent(longitude) +
        "&count=1" +
        "&language=en" +
        "&format=json";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Reverse location service is unavailable."
            );
        }


        const data =
            await response.json();


        if (
            data.results &&
            data.results.length > 0
        ) {

            return data.results[0];
        }


        /*
           Reverse geocoding is helpful but not
           required for weather.

           If it fails, still use coordinates.
        */

        return {
            name: "Your Location",
            country: ""
        };


    } catch (error) {

        console.warn(
            "Reverse geocoding failed:",
            error
        );


        return {
            name: "Your Location",
            country: ""
        };
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

        showLoading(
            "Loading weather information..."
        );


        /*
           Open-Meteo forecast API.
        */

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
                "The weather service is currently unavailable."
            );
        }


        const data =
            await response.json();


        /*
           Check API response.
        */

        if (
            !data.current ||
            !data.hourly ||
            !data.daily
        ) {

            throw new Error(
                "The weather service returned incomplete data."
            );
        }


        /*
           Display all weather information.
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


        hideError();


    } catch (error) {

        console.error(
            "Weather API error:",
            error
        );


        showError(
            error.message ||
            "Unable to load weather information."
        );

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


    /*
       Location name.
    */

    cityElement.textContent =
        country
            ? `${name}, ${country}`
            : name;


    /*
       Date/time.
    */

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


    /*
       Temperature.
    */

    temperatureElement.textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;


    /*
       Feels like.
    */

    feelsLikeElement.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    /*
       Humidity.
    */

    humidityElement.textContent =
        `${current.relative_humidity_2m}%`;


    /*
       Wind.
    */

    windElement.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    /*
       Pressure.
    */

    pressureElement.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    /*
       Current weather code.
    */

    const code =
        current.weather_code;


    conditionElement.textContent =
        getWeatherDescription(code);


    weatherIconElement.textContent =
        getWeatherIcon(code);


    /*
       Rain probability.
    */

    const currentHour =
        findCurrentHourIndex(
            data.hourly
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        data.hourly.precipitation_probability &&
        data.hourly.precipitation_probability[currentHour] !== undefined
    ) {

        rainChance =
            data.hourly.precipitation_probability[
                currentHour
            ];
    }


    rainChanceElement.textContent =
        `${rainChance}%`;
}


/* =========================================================
   FIND CURRENT HOUR
========================================================= */

function findCurrentHourIndex(hourly) {

    if (
        !hourly ||
        !hourly.time ||
        hourly.time.length === 0
    ) {

        return 0;
    }


    const now =
        new Date();


    /*
       Find closest forecast hour.
    */

    let closestIndex = 0;

    let smallestDifference =
        Infinity;


    for (
        let i = 0;
        i < hourly.time.length;
        i++
    ) {

        const time =
            new Date(
                hourly.time[i]
            );


        const difference =
            Math.abs(
                time.getTime() -
                now.getTime()
            );


        if (
            difference <
            smallestDifference
        ) {

            smallestDifference =
                difference;

            closestIndex =
                i;
        }
    }


    return closestIndex;
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


/* =========================================================
   WEATHER ICON
========================================================= */

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
            data.hourly
        );


    let rainChance = 0;


    if (
        currentHour >= 0 &&
        data.hourly.precipitation_probability
    ) {

        rainChance =
            data.hourly
                .precipitation_probability[
                    currentHour
                ];
    }


    let summary =
        `Current conditions are ${getWeatherDescription(code).toLowerCase()} with a temperature of around ${temperature}°C. `;


    if (rainChance >= 70) {

        summary +=
            "There is a high chance of rain. Carrying an umbrella may be useful. ";

    }

    else if (rainChance >= 40) {

        summary +=
            "There is a moderate chance of rain. ";

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


/* =========================================================
   HOURLY FORECAST
========================================================= */

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
            hourly.precipitation_probability[i] ?? 0;


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
                🌧️ ${rain}% rain
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
            daily.precipitation_probability_max[i] ?? 0;


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


/* =========================================================
   ALERT PLACEHOLDER
========================================================= */

function displayNoAlerts() {

    alertsElement.innerHTML = `

        <div class="no-alert">

            🔵 No official emergency alert service
            is connected to this website yet.

            <br><br>

            Weather forecasts shown here are
            provided for general information.

            <br><br>

            For emergency situations, always
            follow warnings and instructions from
            your local official authorities.

        </div>

    `;
}


/* =========================================================
   LOADING
========================================================= */

function showLoading(message) {

    loadingElement.textContent =
        message || "Loading weather...";


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


/* =========================================================
   DISABLE BUTTONS
========================================================= */

function setButtonsDisabled(disabled) {

    searchButton.disabled =
        disabled;

    locationButton.disabled =
        disabled;

    cityInput.disabled =
        disabled;
}
```
