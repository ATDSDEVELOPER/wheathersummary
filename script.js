/* =========================================
NAVIGATION
========================================= */

.navigation {

```
display: flex;

justify-content: center;

align-items: center;

flex-wrap: wrap;

gap: 10px;

margin-bottom: 25px;

padding: 12px;

background: rgba(255,255,255,0.10);

border-radius: 15px;
```

}

.navigation a {

```
color: white;

text-decoration: none;

font-size: 14px;

font-weight: bold;

padding: 8px 12px;

border-radius: 8px;

transition: 0.2s;
```

}

.navigation a:hover {

```
background: rgba(255,255,255,0.18);
```

}

/* =========================================
ALERT INTRO
========================================= */

.alert-intro {

```
margin-bottom: 15px;

line-height: 1.6;

opacity: 0.85;
```

}

/* =========================================
ALERT DISCLAIMER
========================================= */

.alert-disclaimer {

```
margin-top: 15px;

font-size: 13px;

line-height: 1.6;

opacity: 0.7;
```

}

/* =========================================
ALERT SOURCE
========================================= */

.alert-source {

```
margin-top: 10px;

font-size: 13px;

opacity: 0.85;
```

}

.alert-source a {

```
color: white;

font-weight: bold;
```

}

/* =========================================
ALERT TIMES
========================================= */

.alert-time {

```
margin-top: 10px;

font-size: 13px;

opacity: 0.85;
```

}

/* =========================================
ALERT INSTRUCTIONS
========================================= */

.alert-instructions {

```
margin-top: 12px;

line-height: 1.6;
```

}

/* =========================================
INFORMATION CARD
========================================= */

.information-card h2 {

```
margin-bottom: 12px;
```

}

.information-card p {

```
line-height: 1.7;

margin-bottom: 12px;
```

}

/* =========================================
FOOTER LINKS
========================================= */

.footer-links {

```
display: flex;

justify-content: center;

flex-wrap: wrap;

gap: 15px;

margin-top: 12px;
```

}

.footer-links a {

```
color: white;

text-decoration: none;
```

}

.footer-links a:hover {

```
text-decoration: underline;
```

}

/* =========================================
MOBILE NAVIGATION
========================================= */

@media (max-width: 700px) {

```
.navigation {

    flex-direction: column;

    align-items: stretch;

    text-align: center;

}

.navigation a {

    display: block;

}
```

}
