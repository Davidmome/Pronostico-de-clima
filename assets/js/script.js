var weatherApiURL = 'https://api.openweathermap.org';
var weatherApiKey = 'df9a543bbcae6532e35063e680539f9e';
var searchHistory = [];
var userForm = document.querySelector('#user-form');
var formInput = document.querySelector('#usercity');
var today = document.querySelector('#today');
var forecastcont = document.querySelector('#forecast');
var searchRecord = document.querySelector('#Record');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function rendersearchRecord(){
    searchRecord.innerHTML = '';

    for (var i = searchHistory.length -1; i>= 0; i--){
        var btn = document.createElement('button');
        btn.setAttribute('type','button');
        btn.setAttribute('aria-controls','today forecast');
        btn.classList.add('history-btn', 'btn-history');

        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchRecord.append(btn);
    }
};

function appendHistory(search){
    if (searchHistory.indexOf(search) !== -1){
        return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    rendersearchRecord();
};

function initSearchHistory(){
    var locHistory = localStorage.getItem('search-history');
    if (locHistory){
        searchHistory = JSON.parse(locHistory);
    }
    rendersearchRecord();
};

function renderWeather(city, weather){
    var date = dayjs().format('M/D/YYYY');

    var temp= weather.main.temp;
    var wind = weather.wind.speed;
    var humidity = weather.main.humidity;
    var Url = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var description = weather.weather[0].description || weather[0].main;

    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h2');
    var weatherImg = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);

    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    heading.textContent = `${city}(${date})`;
    weatherImg.setAttribute('src', Url);
    weatherImg.setAttribute('alt', description);
    weatherImg.setAttribute('class', 'weather-img');
    heading.append(weatherImg);
    tempEl.textContent = `Temp: ${temp}F`;
    windEl.textContent = `Wind: ${wind}mph`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    cardBody.append(heading,tempEl,windEl,humidityEl);

    today.innerHTML = '';
    today.append(card);
};
    function renderForecastCard(forecast){
        var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
        var iconDescription = forecast.weather[0].description;
        var temp = forecast.main.temp;
        var humidity = forecast.main.humidity;
        var wind = forecast.wind.speed;
    

    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h3');
    var weatherImg = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherImg,tempEl,windEl,humidityEl);

    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('clas', 'card-text');
    humidityEl.setAttribute('class', 'class-text');

    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    weatherImg.setAttribute('src', iconUrl);
    weatherImg.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${temp} F`;
    windEl.textContent = `Wind: ${wind} mph`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastcont.append(col);
};

    function renderForecast(forecastday){
        var startDate = dayjs().add(1, 'day').startOf('day').unix();
        var endDate = dayjs().add(6, 'day').startOf('day').unix();

        var headingCol = document.createElement('div');
        var heading = document.createElement('h3');

        headingCol.setAttribute('class', 'col-12');
        heading.textContent = '5 Day Forecast';
        headingCol.append(heading);

        forecastcont.innerHTML = '';
        forecastcont.append(headingCol);

        for (var i = 0; i < forecastday.length; i++){
            if (forecastday[i].dt >= startDate && forecastday[i].dt < endDate){
                if (forecastday[i].dt_txt.slice(11, 13) == '12'){
                    renderForecastCard(forecastday[i]);
                }
            }
        }
    };

    function rendercity(city, data){
        renderWeather(city,data.list[0],data.city.timezone);
        renderForecast(data.list);
    };

    function fetchWeather(location){
        var {lat} = location;
        var {lon} = location;
        var city = location.name;

        var apiURL = `${weatherApiURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;

        fetch(apiURL).then(function(res){
            return res.json();
        }).then(function(data){
            rendercity(city,data);
        }).catch(function(err){
            console.error(err);
        });
    };

    function fetchCoordinates(search){
        var apiURL = `${weatherApiURL}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

        fetch(apiURL).then(function(response){
            return response.json();
        }).then(function(data){
            if (data[0]){
                appendHistory(search);
                fetchWeather(data[0]);
            } else{
                alert('Error: Location not found');
            }
        }).catch(function(error){
            console.error(error);
        });
    };

    function SearchForm(a){
        if(!formInput.value){
            return;
        }

        a.preventDefault();
        var search = formInput.value.trim();
        fetchCoordinates(search);
        formInput.value = '';
    };

    function SearchHistoryClick(a){
        if (!a.target.matches('.btn-history')){
            return;
        }
        var btn = a.target;
        var search = btn.getAttribute('data-search');
        fetchCoordinates(search);
    };

    initSearchHistory();
    userForm.addEventListener('submit',SearchForm);
    searchRecord.addEventListener('click', SearchHistoryClick);