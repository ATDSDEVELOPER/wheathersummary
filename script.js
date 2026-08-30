"use strict";

/*
 * Weather Summary
 * Weather data: Open-Meteo
 *
 * APIs:
 * Geocoding:
 * https://geocoding-api.open-meteo.com/v1/search
 *
 * Forecast:
 * https://api.open-meteo.com/v1/forecast
 */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_API =
    "https://api.open-meteo.com/v1/forecast";


const elements = {
    cityInput: document.getElementById("cityInput"),
    searchButton: document.getElementById("searchButton"),
    locationButton: document.getElementById("locationButton"),

    loading: document.getElementById("loading"),
    error: document.getElementById("error"),

    city: document.getElementById("city"),
    date: document.getElementById("date"),

    weatherIcon: document.getElementById("weatherIcon"),
    temperature: document.getElementById("temperature"),
    condition: document.getElementById("condition"),
    feelsLike: document.getElementById("feelsLike"),

    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    rainChance: document.getElementById("rainChance"),
    pressure: document.getElementById("pressure"),

    summary: document.getElementById("summary"),
    alerts: document.getElementById("alerts"),

    hourlyForecast: document.getElementById("hourlyForecast"),
    dailyForecast: document.getElementById("dailyForecast"),

    sunrise: document.getElementById("sunrise"),
    sunset: document.getElementById("sunset"),

    copyrightYear: document.getElementById("copyrightYear")
};


let currentRequestId = 0;


/*
 * Weather code descriptions
 * Based on WMO weather interpretation codes.
 */

const weatherCodes = {
    0: {
        description: "Clear sky",
        iconDay: "☀️",
        iconNight: "🌙"
    },

    1: {
        description: "Mainly clear",
        iconDay: "🌤️",
        iconNight: "🌙"
    },

    2: {
        description: "Partly cloudy",
        iconDay: "⛅",
        iconNight: "☁️"
    },

    3: {
        description: "Overcast",
        iconDay: "☁️",
        iconNight: "☁️"
    },

    45: {
        description: "Fog",
        iconDay: "🌫️",
        iconNight: "🌫️"
    },

    48: {
        description: "Depositing rime fog",
        iconDay: "🌫️",
        iconNight: "🌫️"
    },

    51: {
        description: "Light drizzle",
        iconDay: "🌦️",
        iconNight: "🌧️"
    },

    53: {
        description: "Moderate drizzle",
        iconDay: "🌦️",
        iconNight: "🌧️"
    },

    55: {
        description: "Dense drizzle",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    56: {
        description: "Light freezing drizzle",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    57: {
        description: "Dense freezing drizzle",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    61: {
        description: "Slight rain",
        iconDay: "🌦️",
        iconNight: "🌧️"
    },

    63: {
        description: "Moderate rain",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    65: {
        description: "Heavy rain",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    66: {
        description: "Light freezing rain",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    67: {
        description: "Heavy freezing rain",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    71: {
        description: "Slight snow fall",
        iconDay: "🌨️",
        iconNight: "🌨️"
    },

    73: {
        description: "Moderate snow fall",
        iconDay: "🌨️",
        iconNight: "🌨️"
    },

    75: {
        description: "Heavy snow fall",
        iconDay: "❄️",
        iconNight: "❄️"
    },

    77: {
        description: "Snow grains",
        iconDay: "❄️",
        iconNight: "❄️"
    },

    80: {
        description: "Slight rain showers",
        iconDay: "🌦️",
        iconNight: "🌧️"
    },

    81: {
        description: "Moderate rain showers",
        iconDay: "🌧️",
        iconNight: "🌧️"
    },

    82: {
        description: "Violent rain showers",
        iconDay: "⛈️",
        iconNight: "⛈️"
    },

    85: {
        description: "Slight snow showers",
        iconDay: "🌨️",
        iconNight: "🌨️"
    },

    86: {
        description: "Heavy snow showers",
        iconDay: "❄️",
        iconNight: "❄️"
    },

    95: {
        description: "Thunderstorm",
        iconDay: "⛈️",
        iconNight: "⛈️"
    },

    96: {
        description: "Thunderstorm with slight hail",
        iconDay: "⛈️",
        iconNight: "⛈️"
    },

    99: {
        description: "Thunderstorm with heavy hail",
        iconDay: "⛈️",
        iconNight: "⛈️"
    }
};


/*
 * Application startup
 */

document.addEventListener("DOMContentLoaded", () => {

    if (elements.copyrightYear) {
        elements.copyrightYear.textContent =
            new Date().getFullYear();
    }

    elements.searchButton.addEventListener(
        "click",
        handleSearch
    );

    elements.locationButton.addEventListener(
        "click",
        getUserLocation
    );

    elements.cityInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                handleSearch();
            }

        }
    );

    /*
     * Load a default location.
     * Colombo is used only as the initial display location.
     */
    loadWeather(
        6.9271,
        79.8612,
        "Colombo",
        "Sri Lanka"
    );

});


/*
 * Search button
 */

async function handleSearch() {

    const city =
        elements.cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        elements.cityInput.focus();

        return;
    }

    try {

        setLoading(true);

        hideError();

        const locations =
            await geocodeCity(city);

        if (
            !locations ||
            locations.length === 0
        ) {

            throw new Error(
                "No location was found. Please check the city name and try again."
            );

        }

        /*
         * The first Open-Meteo result is normally
         * the closest/best matching result.
         */
        const location = locations[0];

        await loadWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country || ""
        );

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to retrieve weather information."
        );

    } finally {

        setLoading(false);

    }
}


/*
 * Open-Meteo Geocoding API
 */

async function geocodeCity(city) {

    const url =
        new URL(GEOCODING_API);

    url.searchParams.set(
        "name",
        city
    );

    url.searchParams.set(
        "count",
        "5"
    );

    url.searchParams.set(
        "language",
        "en"
    );

    url.searchParams.set(
        "format",
        "json"
    );

    const response =
        await fetch(url.toString());

    if (!response.ok) {

        throw new Error(
            "The location search service is temporarily unavailable."
        );

    }

    const data =
        await response.json();

    return data.results || [];
}


/*
 * Get weather for a location
 */

async function loadWeather(
    latitude,
    longitude,
    locationName,
    countryName = ""
) {

    const requestId =
        ++currentRequestId;

    try {

        setLoading(true);

        hideError();

        const data =
            await fetchWeather(
                latitude,
                longitude
            );

        /*
         * Ignore an older request if the user
         * started another search.
         */
        if (
            requestId !== currentRequestId
        ) {
            return;
        }

        renderWeather(
            data,
            locationName,
            countryName
        );

    } catch (error) {

        console.error(error);

        if (
            requestId === currentRequestId
        ) {

            showError(
                error.message ||
                "Unable to load weather information."
            );

        }

    } finally {

        if (
            requestId === currentRequestId
        ) {

            setLoading(false);

        }

    }
}


/*
 * Open-Meteo Forecast API
 */

async function fetchWeather(
    latitude,
    longitude
) {

    const url =
        new URL(FORECAST_API);

    url.searchParams.set(
        "latitude",
        latitude
    );

    url.searchParams.set(
        "longitude",
        longitude
    );

    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "is_day"
        ].join(",")
    );

    url.searchParams.set(
        "hourly",
        [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation_probability",
            "precipitation",
            "weather_code",
            "wind_speed_10m"
        ].join(",")
    );

    url.searchParams.set(
        "daily",
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "precipitation_probability_max",
            "precipitation_sum",
            "sunrise",
            "sunset",
            "wind_speed_10m_max"
        ].join(",")
    );

    url.searchParams.set(
        "timezone",
        "auto"
    );

    url.searchParams.set(
        "forecast_days",
        "7"
    );

    const response =
        await fetch(url.toString());

    if (!response.ok) {

        throw new Error(
            "The weather service is temporarily unavailable. Please try again later."
        );

    }

    const data =
        await response.json();

    if (
        data.error
    ) {

        throw new Error(
            data.reason ||
            "The weather service returned an error."
        );

    }

    return data;
}


/*
 * Render complete weather page
 */

function renderWeather(
    data,
    locationName,
    countryName
) {

    const current =
        data.current;

    const hourly =
        data.hourly;

    const daily =
        data.daily;


    /*
     * Location
     */

    elements.city.textContent =
        countryName
            ? `${locationName}, ${countryName}`
            : locationName;


    /*
     * Current date/time
     */

    elements.date.textContent =
        formatDateTime(
            current.time
        );


    /*
     * Current weather
     */

    const currentWeather =
        getWeatherInfo(
            current.weather_code,
            current.is_day
        );

    elements.weatherIcon.textContent =
        currentWeather.icon;

    elements.temperature.textContent =
        formatTemperature(
            current.temperature_2m
        );

    elements.condition.textContent =
        currentWeather.description;

    elements.feelsLike.textContent =
        formatTemperature(
            current.apparent_temperature
        );


    /*
     * Details
     */

    elements.humidity.textContent =
        `${round(current.relative_humidity_2m)}%`;

    elements.wind.textContent =
        `${round(current.wind_speed_10m)} km/h`;

    const currentHourIndex =
        findCurrentHourIndex(
            hourly.time,
            current.time
        );

    const rainProbability =
        currentHourIndex >= 0
            ? hourly.precipitation_probability[
                currentHourIndex
            ]
            : null;

    elements.rainChance.textContent =
        rainProbability == null
            ? "--"
            : `${round(rainProbability)}%`;

    elements.pressure.textContent =
        `${round(current.surface_pressure)} hPa`;


    /*
     * Summary
     */

    elements.summary.textContent =
        createDailySummary(
            data
        );


    /*
     * Alerts
     */

    renderAlertInformation();


    /*
     * Hourly forecast
     */

    renderHourlyForecast(
        hourly,
        current.time
    );


    /*
     * Daily forecast
     */

    renderDailyForecast(
        daily
    );


    /*
     * Sunrise / sunset
     */

    if (
        daily.sunrise &&
        daily.sunrise.length > 0
    ) {

        elements.sunrise.textContent =
            formatTime(
                daily.sunrise[0]
            );

    }

    if (
        daily.sunset &&
        daily.sunset.length > 0
    ) {

        elements.sunset.textContent =
            formatTime(
                daily.sunset[0]
            );

    }

}


/*
 * Weather information
 */

function getWeatherInfo(
    code,
    isDay = 1
) {

    const info =
        weatherCodes[code] ||
        {
            description: "Unknown conditions",
            iconDay: "🌤️",
            iconNight: "🌙"
        };

    return {
        description: info.description,
        icon: isDay
            ? info.iconDay
            : info.iconNight
    };
}


/*
 * Current weather summary
 */

function createDailySummary(
    data
) {

    const current =
        data.current;

    const daily =
        data.daily;

    const weather =
        getWeatherInfo(
            current.weather_code,
            current.is_day
        );

    const todayRain =
        daily.precipitation_probability_max &&
        daily.precipitation_probability_max.length
            ? daily.precipitation_probability_max[0]
            : null;

    const maxTemp =
        daily.temperature_2m_max &&
        daily.temperature_2m_max.length
            ? daily.temperature_2m_max[0]
            : null;

    const minTemp =
        daily.temperature_2m_min &&
        daily.temperature_2m_min.length
            ? daily.temperature_2m_min[0]
            : null;

    let summary =
        `Current conditions are ${weather.description.toLowerCase()} with a temperature of ${formatTemperature(current.temperature_2m)}. `;

    summary +=
        `It feels like ${formatTemperature(current.apparent_temperature)}. `;

    if (
        maxTemp !== null &&
        minTemp !== null
    ) {

        summary +=
            `Today's temperature is expected to range from ${formatTemperature(minTemp)} to ${formatTemperature(maxTemp)}. `;

    }

    if (
        todayRain !== null
    ) {

        summary +=
            `The maximum precipitation probability today is ${round(todayRain)}%.`;

    }

    return summary;
}


/*
 * Render alerts notice
 */

function renderAlertInformation() {

    elements.alerts.innerHTML = `
        <div class="no-alert">
            🔵 Weather Summary does not provide official
            emergency warnings.
            <br><br>
            For important weather warnings, please check
            your country's official meteorological or
            emergency authority.
        </div>
    `;

}


/*
 * Hourly forecast
 */

function renderHourlyForecast(
    hourly,
    currentTime
) {

    if (
        !hourly ||
        !hourly.time ||
        hourly.time.length === 0
    ) {

        elements.hourlyForecast.innerHTML =
            "<p>Hourly forecast is currently unavailable.</p>";

        return;
    }


    const startIndex =
        findCurrentHourIndex(
            hourly.time,
            currentTime
        );


    const firstIndex =
        startIndex >= 0
            ? startIndex
            : 0;


    const endIndex =
        Math.min(
            firstIndex + 24,
            hourly.time.length
        );


    let html = "";


    for (
        let i = firstIndex;
        i < endIndex;
        i++
    ) {

        const time =
            hourly.time[i];

        const temperature =
            hourly.temperature_2m[i];

        const rain =
            hourly.precipitation_probability[i];

        const code =
            hourly.weather_code[i];

        const weather =
            getWeatherInfo(
                code,
                isDayTime(time)
            );


        html += `
            <div class="hour">

                <strong>
                    ${escapeHtml(
                        formatHour(time)
                    )}
                </strong>

                <div class="icon"
                     aria-hidden="true">
                    ${weather.icon}
                </div>

                <div class="temp">
                    ${escapeHtml(
                        formatTemperature(temperature)
                    )}
                </div>

                <div class="condition">
                    ${escapeHtml(
                        weather.description
                    )}
                </div>

                <div class="rain">
                    🌧️ ${
                        rain == null
                            ? "--"
                            : `${round(rain)}%`
                    }
                </div>

            </div>
        `;

    }


    elements.hourlyForecast.innerHTML =
        html;
}


/*
 * Daily forecast
 */

function renderDailyForecast(
    daily
) {

    if (
        !daily ||
        !daily.time ||
        daily.time.length === 0
    ) {

        elements.dailyForecast.innerHTML =
            "<p>Daily forecast is currently unavailable.</p>";

        return;
    }


    let html = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            daily.time[i];

        const code =
            daily.weather_code[i];

        const max =
            daily.temperature_2m_max[i];

        const min =
            daily.temperature_2m_min[i];

        const rain =
            daily.precipitation_probability_max[i];

        const precipitation =
            daily.precipitation_sum[i];

        const wind =
            daily.wind_speed_10m_max[i];

        const weather =
            getWeatherInfo(
                code,
                1
            );


        html += `
            <div class="day">

                <div class="day-name">
                    ${escapeHtml(
                        formatDayName(date, i)
                    )}
                </div>

                <div class="icon"
                     aria-hidden="true">
                    ${weather.iconDay || weather.icon}
                </div>

                <div class="day-condition">
                    ${escapeHtml(
                        weather.description
                    )}
                </div>

                <div class="temps">
                    ${escapeHtml(
                        formatTemperature(max)
                    )}
                    /
                    ${escapeHtml(
                        formatTemperature(min)
                    )}
                </div>

                <div class="rain">
                    🌧️ ${
                        rain == null
                            ? "--"
                            : `${round(rain)}%`
                    }
                    <br>
                    💧 ${
                        precipitation == null
                            ? "--"
                            : `${round(precipitation, 1)} mm`
                    }
                    <br>
                    💨 ${
                        wind == null
                            ? "--"
                            : `${round(wind)} km/h`
                    }
                </div>

            </div>
        `;

    }


    elements.dailyForecast.innerHTML =
        html;
}


/*
 * Find current hour
 */

function findCurrentHourIndex(
    times,
    currentTime
) {

    if (
        !Array.isArray(times)
    ) {
        return -1;
    }

    const currentDate =
        new Date(currentTime);

    if (
        Number.isNaN(
            currentDate.getTime()
        )
    ) {
        return -1;
    }


    let bestIndex = -1;
    let bestDifference = Infinity;


    times.forEach(
        (time, index) => {

            const date =
                new Date(time);

            const difference =
                Math.abs(
                    date.getTime() -
                    currentDate.getTime()
                );

            if (
                difference < bestDifference
            ) {

                bestDifference =
                    difference;

                bestIndex =
                    index;

            }

        }
    );


    return bestIndex;
}


/*
 * User location
 */

function getUserLocation() {

    hideError();


    if (
        !navigator.geolocation
    ) {

        showError(
            "Geolocation is not supported by this browser."
        );

        return;
    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(
        async position => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                await loadWeather(
                    latitude,
                    longitude,
                    "My Location",
                    ""
                );


            } catch (error) {

                console.error(error);

                showError(
                    "Unable to load weather for your location."
                );

            } finally {

                setLoading(false);

            }

        },

        error => {

            console.error(error);

            setLoading(false);

            let message =
                "Unable to access your location.";

            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission was denied. Please allow location access or search for a city manually.";

            } else if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                message =
                    "Your location could not be determined. Please search for a city manually.";

            } else if (
                error.code ===
                error.TIMEOUT
            ) {

                message =
                    "The location request timed out. Please try again.";

            }

            showError(message);

        },

        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}


/*
 * Loading state
 */

function setLoading(
    isLoading
) {

    if (
        isLoading
    ) {

        elements.loading.classList.remove(
            "hidden"
        );

        elements.searchButton.disabled =
            true;

        elements.locationButton.disabled =
            true;

    } else {

        elements.loading.classList.add(
            "hidden"
        );

        elements.searchButton.disabled =
            false;

        elements.locationButton.disabled =
            false;

    }

}


/*
 * Error handling
 */

function showError(
    message
) {

    elements.error.textContent =
        message;

    elements.error.classList.remove(
        "hidden"
    );

}


function hideError() {

    elements.error.textContent =
        "";

    elements.error.classList.add(
        "hidden"
    );

}


/*
 * Formatting helpers
 */

function round(
    value,
    decimals = 0
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--";

    }

    return Number(value).toFixed(
        decimals
    );
}


function formatTemperature(
    value
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--°C";

    }

    return `${round(value)}°C`;
}


function formatDateTime(
    value
) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


function formatHour(
    value
) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


function formatTime(
    value
) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


function formatDayName(
    value,
    index
) {

    if (index === 0) {
        return "Today";
    }

    const date =
        new Date(`${value}T12:00:00`);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}


function isDayTime(
    value
) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return true;
    }

    const hour =
        date.getHours();

    return hour >= 6 && hour < 18;
}


/*
 * Prevent HTML injection when inserting
 * API-provided text into HTML.
 */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
