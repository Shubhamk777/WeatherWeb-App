// Object to handle weather-related functions
let weather = {
  // Your OpenWeatherMap API key
  apiKey: "aba6ff9d6de967d5eac6fd79114693cc",
  
  // Function to fetch weather data for a given city
  fetchWeather: function (city) {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" + // URL to fetch weather data
        city + // City name to search for
        "&units=metric&appid=" + // Units in metric and API key
        this.apiKey // Your OpenWeatherMap API key
    )
      .then((response) => {
        if (!response.ok) { // Check if the response is not OK
          alert("No weather found."); // Alert the user if there's an issue
          throw new Error("No weather found."); // Throw an error
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => this.displayWeather(data)) // Pass the data to displayWeather function
      .catch((error) => console.error("Error fetching weather data:", error)); // Handle any errors
  },
  
  // Function to fetch weather data based on latitude and longitude
  fetchWeatherByCoords: function (latitude, longitude) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.apiKey}` // URL to fetch weather data using coordinates
    )
      .then((response) => {
        if (!response.ok) { // Check if the response is not OK
          alert("No weather found."); // Alert the user if there's an issue
          throw new Error("No weather found."); // Throw an error
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => this.displayWeather(data)) // Pass the data to displayWeather function
      .catch((error) => console.error("Error fetching weather data:", error)); // Handle any errors
  },
  
  // Function to display weather data on the webpage
  displayWeather: function (data) {
    const { name } = data; // Extract the city name
    const { icon, description } = data.weather[0]; // Extract the weather icon and description
    const { temp, feels_like, humidity } = data.main; // Extract temperature, feels like temperature, and humidity
    const { speed } = data.wind; // Extract wind speed

    // Update the weather card with the fetched data
    document.querySelector(".city").innerText = "Weather in " + name; // Set the city name
    document.querySelector(".icon").src = // Set the weather icon image source
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description; // Set the weather description
    document.querySelector(".temp").innerText = temp + "°C"; // Set the temperature
    document.querySelector(".feels-like").innerText = "Feels like: " + feels_like + "°C"; // Set the feels like temperature
    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%"; // Set the humidity
    document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h"; // Set the wind speed
    document.querySelector(".weather").classList.remove("loading"); // Remove the loading class to show weather details

    // Fetch a background image based on the city name
    this.fetchImage(name);
  },
  
  // Function to fetch a background image from Unsplash
  fetchImage: function (city) {
    const unsplashApiKey = "s2AgoX9BsYSAlnseTx7f4eUghswY4l8FtV4-RS_a-QQ"; // Your Unsplash API key
    
    // Fetch images related to city landmarks
    fetch(`https://api.unsplash.com/search/photos?query=${city} monuments&client_id=${unsplashApiKey}`) // URL to search for landmark images
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        if (data.results.length > 0) { // Check if any images are found
          // If images are found, use the first image
          document.body.style.backgroundImage = `url(${data.results[0].urls.regular})`; // Set the background image
        } else {
          // If no landmark images are found, search for general city images
          fetch(`https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashApiKey}`) // URL to search for general city images
            .then((response) => response.json()) // Parse the JSON response
            .then((data) => {
              if (data.results.length > 0) { // Check if any images are found
                document.body.style.backgroundImage = `url(${data.results[0].urls.regular})`; // Set the background image
              } else {
                // If no images are found, use a default background image
                document.body.style.backgroundImage = `url('default-background.jpg')`; // Set the default background image
              }
            })
            .catch((error) => console.error('Error fetching image:', error)); // Handle any errors
        }
      })
      .catch((error) => console.error('Error fetching image:', error)); // Handle any errors
  },
  
  // Function to start a weather search based on user input
  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value); // Get the value from the search bar and fetch weather data
  },
};

// Object to handle geocoding functions
let geocode = {
  // Function to reverse geocode latitude and longitude into a city name
  reverseGeocode: function (latitude, longitude) {
    var apikey = "90a096f90b3e4715b6f2e536d934c5af"; // Your OpenCageData API key
    var api_url = "https://api.opencagedata.com/geocode/v1/json"; // OpenCageData API URL
    var request_url =
      api_url +
      "?" +
      "key=" +
      apikey + // Your API key
      "&q=" +
      encodeURIComponent(latitude + "," + longitude) + // Encoded latitude and longitude
      "&pretty=1" +
      "&no_annotations=1"; // Format and annotation options
    var request = new XMLHttpRequest(); // Create a new XMLHttpRequest object
    request.open("GET", request_url, true); // Open a GET request

    // Function to handle the response
    request.onload = function () {
      if (request.status == 200) { // Check if the response status is OK
        var data = JSON.parse(request.responseText); // Parse the JSON response
        console.log("Geocode Data: ", data);  // Log the geocode data for debugging
        const city = data.results[0].components.city; // Extract the city name
        if (city) {
          weather.fetchWeather(city); // Fetch weather data for the city
        } else {
          console.error("City not found in geocode data"); // Log an error if city is not found
          alert("City not found in geocode data"); // Alert the user
        }
      } else if (request.status <= 500) { // Check for client-side errors
        console.log("Unable to geocode! Response code: " + request.status); // Log the response code
        var data = JSON.parse(request.responseText); // Parse the JSON response
        console.log("Error message: " + data.status.message); // Log the error message
      } else { // Check for server-side errors
        console.log("Server error"); // Log a server error
      }
    };

    // Function to handle network errors
    request.onerror = function () {
      console.log("Unable to connect to server"); // Log a network error
    };

    request.send(); // Send the request
  },
  
  // Function to get the user's current location and fetch weather data
  getLocation: function() {
    function success (data) {
      console.log("Geolocation Data: ", data);  // Log geolocation data for debugging
      weather.fetchWeatherByCoords(data.coords.latitude, data.coords.longitude); // Fetch weather data based on coordinates
    }
    
    // Check if geolocation is supported
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, function (error) { // Get current position and handle errors
        console.error("Geolocation error: ", error); // Log the geolocation error
        alert("Geolocation error: " + error.message); // Alert the user
        weather.fetchWeather("Patna");  // Fallback to Patna if there's an error
      });
    } else {
      console.error("Geolocation not supported by this browser."); // Log if geolocation is not supported
      alert("Geolocation not supported by this browser."); // Alert the user
      weather.fetchWeather("Patna"); // Fallback to Patna
    }
  }
};

// Add event listener to search button
document.querySelector(".search button").addEventListener("click", function () {
  weather.search(); // Trigger a weather search when the button is clicked
});

// Add event listener to search bar for Enter key press
document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key == "Enter") { // Check if the Enter key is pressed
    weather.search(); // Trigger a weather search
  }
});

// Call getLocation on page load to auto-detect the user's location
geocode.getLocation();

// Function to update the current date and time
function updateTimeDate() {
  const now = new Date(); // Create a new Date object with the current date and time
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; // Options for date formatting
  const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' }; // Options for time formatting

  // Update the date and time elements on the page
  document.getElementById('current-date').innerText = now.toLocaleDateString(undefined, optionsDate); // Set the current date
  document.getElementById('current-time').innerText = now.toLocaleTimeString(undefined, optionsTime); // Set the current time
}

// Call updateTimeDate every second to keep the time and date updated
setInterval(updateTimeDate, 1000);

// Initial call to set the time and date immediately
updateTimeDate();
