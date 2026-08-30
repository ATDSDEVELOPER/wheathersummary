/* =========================================
   RESET
========================================= */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}


/* =========================================
   BODY
========================================= */

body {

    min-height: 100vh;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    background:
        linear-gradient(
            135deg,
            #38bdf8,
            #2563eb,
            #1e1b4b
        );

    color: white;

    padding: 20px;

}


/* =========================================
   MAIN APP
========================================= */

.app {

    width: 100%;

    max-width: 1000px;

    margin: auto;

}


/* =========================================
   NAVIGATION
========================================= */

.site-nav {

    display: flex;

    justify-content: center;

    align-items: center;

    flex-wrap: wrap;

    gap: 8px;

    margin-bottom: 30px;

}


.site-nav a {

    color: white;

    text-decoration: none;

    padding: 9px 13px;

    border-radius: 10px;

    background:
        rgba(255,255,255,0.12);

    font-size: 14px;

    transition: 0.2s;

}


.site-nav a:hover {

    background:
        rgba(255,255,255,0.25);

    transform:
        translateY(-1px);

}


/* =========================================
   HEADER
========================================= */

.header {

    text-align: center;

    margin-bottom: 30px;

}


.header h1 {

    font-size: 40px;

    margin-bottom: 10px;

}


.header p {

    opacity: 0.85;

    font-size: 16px;

}


/* =========================================
   SEARCH
========================================= */

.search-section {

    display: flex;

    gap: 10px;

    margin-bottom: 25px;

}


.search-section input {

    flex: 1;

    padding: 16px;

    border: none;

    border-radius: 12px;

    outline: none;

    font-size: 16px;

}


button {

    border: none;

    border-radius: 12px;

    padding: 15px 20px;

    background: #0ea5e9;

    color: white;

    font-size: 15px;

    font-weight: bold;

    cursor: pointer;

    transition: 0.2s;

}


button:hover {

    background: #0284c7;

    transform:
        translateY(-1px);

}


button:disabled {

    opacity: 0.6;

    cursor: not-allowed;

    transform: none;

}


/* =========================================
   CARDS
========================================= */

.card {

    background:
        rgba(255,255,255,0.13);

    backdrop-filter:
        blur(15px);

    -webkit-backdrop-filter:
        blur(15px);

    border:
        1px solid
        rgba(255,255,255,0.1);

    border-radius: 20px;

    padding: 25px;

    margin-bottom: 20px;

    box-shadow:
        0 10px 30px
        rgba(0,0,0,0.15);

}


/* =========================================
   CURRENT WEATHER
========================================= */

.current-weather {

    text-align: center;

}


#city {

    font-size: 32px;

    margin-bottom: 5px;

}


#date {

    opacity: 0.7;

}


/* =========================================
   MAIN WEATHER
========================================= */

.main-weather {

    display: flex;

    justify-content: center;

    align-items: center;

    gap: 30px;

    margin: 25px 0;

}


.weather-icon {

    font-size: 90px;

}


#temperature {

    font-size: 70px;

    font-weight: bold;

}


#condition {

    font-size: 21px;

    margin:
        5px 0 10px;

}


.temperature-area p {

    opacity: 0.8;

}


/* =========================================
   WEATHER DETAILS
========================================= */

.details {

    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 15px;

}


.detail {

    padding: 18px;

    border-radius: 15px;

    background:
        rgba(255,255,255,0.1);

}


.detail span {

    display: block;

    font-size: 27px;

    margin-bottom: 8px;

}


.detail strong {

    display: block;

    font-size: 18px;

}


.detail small {

    display: block;

    margin-top: 5px;

    opacity: 0.7;

}


/* =========================================
   SUMMARY
========================================= */

.summary-card h2,
.alerts-section h2,
.forecast-section h2 {

    margin-bottom: 15px;

}


.summary-card p {

    line-height: 1.7;

    font-size: 17px;

}


/* =========================================
   ADVERTISEMENT
========================================= */

.ad-container {

    min-height: 90px;

    margin:
        20px 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 12px;

    background:
        rgba(255,255,255,0.06);

    color:
        rgba(255,255,255,0.55);

    font-size: 12px;

}


/* =========================================
   ALERTS
========================================= */

.no-alert {

    background:
        rgba(59,130,246,0.2);

    border-left:
        5px solid #3b82f6;

    padding: 18px;

    border-radius: 10px;

    line-height: 1.6;

}


.alert {

    padding: 18px;

    border-radius: 12px;

    margin-bottom: 12px;

}


.alert h3 {

    margin-bottom: 8px;

}


.alert p {

    line-height: 1.5;

}


.alert-extreme {

    background:
        rgba(127,29,29,0.85);

    border-left:
        6px solid #ef4444;

}


.alert-severe {

    background:
        rgba(154,52,18,0.85);

    border-left:
        6px solid #f97316;

}


.alert-moderate {

    background:
        rgba(161,98,7,0.85);

    border-left:
        6px solid #facc15;

}


.alert-minor {

    background:
        rgba(30,64,175,0.85);

    border-left:
        6px solid #60a5fa;

}


/* =========================================
   HOURLY FORECAST
========================================= */

.hourly-container {

    display: flex;

    gap: 12px;

    overflow-x: auto;

    padding-bottom: 10px;

}


.hour {

    min-width: 120px;

    padding: 15px;

    text-align: center;

    background:
        rgba(255,255,255,0.1);

    border-radius: 15px;

    flex-shrink: 0;

}


.hour strong {

    font-size: 14px;

}


.hour .icon {

    font-size: 32px;

    margin: 10px 0;

}


.hour .temp {

    font-size: 20px;

    font-weight: bold;

}


.hour .condition {

    font-size: 13px;

    margin-top: 5px;

}


.hour .rain {

    font-size: 13px;

    margin-top: 8px;

    opacity: 0.8;

}


/* =========================================
   DAILY FORECAST
========================================= */

.daily-container {

    display: flex;

    flex-direction: column;

    gap: 10px;

}


.day {

    display: grid;

    grid-template-columns:
        90px
        60px
        1fr
        120px
        100px;

    align-items: center;

    gap: 15px;

    padding: 15px;

    background:
        rgba(255,255,255,0.1);

    border-radius: 12px;

}


.day .icon {

    font-size: 32px;

}


.day .temps {

    font-weight: bold;

}


.day .rain {

    font-size: 14px;

    opacity: 0.8;

}


/* =========================================
   SUNRISE / SUNSET
========================================= */

.sun-section {

    display: flex;

    justify-content: space-around;

    text-align: center;

}


.sun-item {

    display: flex;

    flex-direction: column;

    gap: 7px;

}


.sun-item span {

    font-size: 35px;

}


.sun-item strong {

    font-size: 20px;

}


.sun-item small {

    opacity: 0.7;

}


/* =========================================
   LOADING
========================================= */

.loading {

    text-align: center;

    padding: 15px;

    background:
        rgba(255,255,255,0.1);

    border-radius: 10px;

    margin-bottom: 20px;

}


/* =========================================
   ERROR
========================================= */

.error {

    background:
        rgba(239,68,68,0.3);

    border-left:
        5px solid #ef4444;

    padding: 15px;

    margin-bottom: 20px;

    border-radius: 10px;

    line-height: 1.5;

}


/* =========================================
   HIDDEN
========================================= */

.hidden {

    display: none;

}


/* =========================================
   FOOTER
========================================= */

footer {

    text-align: center;

    opacity: 0.75;

    padding: 25px 10px;

    font-size: 13px;

}


.footer-links {

    display: flex;

    justify-content: center;

    flex-wrap: wrap;

    gap: 12px;

    margin: 15px 0;

}


.footer-links a {

    color: white;

    text-decoration: none;

}


.footer-links a:hover {

    text-decoration: underline;

}


.copyright {

    opacity: 0.65;

}


/* =========================================
   MOBILE
========================================= */

@media (max-width: 700px) {


    body {

        padding: 15px;

    }


    .site-nav {

        gap: 6px;

    }


    .site-nav a {

        font-size: 13px;

        padding: 8px 10px;

    }


    .header h1 {

        font-size: 29px;

    }


    .search-section {

        flex-direction: column;

    }


    .main-weather {

        flex-direction: column;

        gap: 10px;

    }


    .weather-icon {

        font-size: 70px;

    }


    #temperature {

        font-size: 55px;

    }


    .details {

        grid-template-columns:
            repeat(2, 1fr);

    }


    .day {

        grid-template-columns:
            60px
            45px
            1fr;

    }


    .day .temps {

        text-align: right;

    }


    .day .rain {

        display: none;

    }


    .sun-section {

        gap: 30px;

    }

}


/* =========================================
   SMALL PHONES
========================================= */

@media (max-width: 420px) {


    .details {

        grid-template-columns:
            1fr 1fr;

        gap: 8px;

    }


    .detail {

        padding: 12px;

    }


    .detail span {

        font-size: 23px;

    }


    .detail strong {

        font-size: 16px;

    }


    .card {

        padding: 18px;

    }


    .footer-links {

        flex-direction: column;

        gap: 8px;

    }

}
