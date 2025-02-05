// "use strict";

const API = "7a3f6002a98fc2d02c36812581a3a212";

// Select elements
const dayEl = document.querySelector('.default-day');
const dateEl = document.querySelector('.default-date');
const btnEl = document.querySelector('.btn-search');
const inputEl = document.querySelector('.input-field');
const iconContainer = document.querySelector('.icons');
const dayInfoEl = document.querySelector('.day-info');
const listContentEl = document.querySelector('.list-content ul');

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display current day and date
const day = new Date();
dayEl.textContent = days[day.getDay()];
dateEl.textContent = `${day.getDate()} ${day.toLocaleString("default", { month: "long" })} ${day.getFullYear()}`;

// Event listener for search button
btnEl.addEventListener('click', async (e) => {
    e.preventDefault();
    if (inputEl.value.trim() !== "") {
        await findLocation(inputEl.value.trim());
        inputEl.value = "";
    } else {
        alert("Please enter a city name.");
    }
});

// Fetch weather data using Axios
async function findLocation(city) {
    iconContainer.innerHTML = "";
    dayInfoEl.innerHTML = "";
    listContentEl.innerHTML = "";

    try {
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API}`;
        const response = await axios.get(API_URL);
        const result = response.data;

        console.log("API Response:", result);

        if (result.cod === 200 || result.cod === "200") {
            displayImageContent(result);
            dayInfoEl.innerHTML = rightSideContent(result);
            await displayForecast(result.coord.lat, result.coord.lon);
        } else {
            iconContainer.innerHTML = `<h2 class="Weather-temp">${result.cod}</h2>
                                       <h3 class="cloudtxt">${result.message}</h3>`;
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        iconContainer.innerHTML = `<h3 class="cloudtxt">Failed to fetch weather data</h3>`;
    }
}

// Display weather icon, temperature, and description
function displayImageContent(data) {
    const iconCode = data.weather[0].icon;
    const imgUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    console.log("Weather Icon URL:", imgUrl);

    const imgEl = document.createElement("img");
    imgEl.src = imgUrl;
    imgEl.alt = "Weather Icon";
    imgEl.onerror = function () {
        this.onerror = null;
        this.src = 'fallback-image.png'; // Fallback image
    };

    const tempEl = document.createElement("h2");
    tempEl.className = "weather-temp";
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;

    const descEl = document.createElement("h3");
    descEl.className = "cloudtxt";
    descEl.textContent = data.weather[0].description;

    iconContainer.appendChild(imgEl);
    iconContainer.appendChild(tempEl);
    iconContainer.appendChild(descEl);
}

// Display right-side weather details
function rightSideContent(result) {
    return `
        <div class="content">
            <p class="title">Name</p>
            <span class="value">${result.name}</span>
        </div>
        <div class="content">
            <p class="title">Temp</p>
            <span class="value">${Math.round(result.main.temp)}°C</span>
        </div>
        <div class="content">
            <p class="title">HUMIDITY</p>
            <span class="value">${result.main.humidity}%</span>
        </div>
        <div class="content">
            <p class="title">WIND SPEED</p>
            <span class="value">${result.wind.speed} km/h</span>
        </div>`;
}

// Fetch and display 5-day forecast using Axios
async function displayForecast(lat, lon) {
    try {
        const forecast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;
        const response = await axios.get(forecast_API);
        const result = response.data;

        const uniqueForecastDays = [];
        const daysForecast = result.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        daysForecast.slice(0, 4).forEach((content) => {
            listContentEl.insertAdjacentHTML('beforeend', forecastTemplate(content));
        });

    } catch (error) {
        console.error("Error fetching forecast:", error);
        listContentEl.innerHTML = `<h3 class="cloudtxt">Failed to fetch forecast</h3>`;
    }
}

// Generate forecast HTML
function forecastTemplate(frContent) {
    const day = new Date(frContent.dt_txt);
    const dayName = days[day.getDay()].slice(0, 3);

    return `
        <li>
            <img src="https://openweathermap.org/img/wn/${frContent.weather[0].icon}@2x.png">
            <span>${dayName}</span>
            <span class="day-temp">${Math.round(frContent.main.temp)}°C</span>
        </li>`;
}
