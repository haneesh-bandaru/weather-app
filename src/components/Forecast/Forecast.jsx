import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AiOutlineSearch } from "react-icons/ai";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

import "./Forecast.css";

const Forecast = () => {
  const [place, setPlace] = useState("hongkong");
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [isDay, setIsDay] = useState(true);
  const [openSectionIndex, setOpenSectionIndex] = useState(null);
  const [localtimeEpoch, setLocaltimeEpoch] = useState(null);
  const [searchText, setSearchText] = useState("hongkong"); // Added a searchText state

  const API_KEY = "5df1326e36cf430a820180714231210";

  const fetchWeatherData = (location) => {
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=yes&alerts=yes`;

    axios
      .get(API_URL)
      .then((response) => {
        setWeatherData(response.data);
        setIsDay(response.data.current.is_day === 1);
        setLocaltimeEpoch(response.data.location.localtime_epoch);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        setIsDay(null);
      });
  };

  // Function to fetch hourly forecast for a specific date
  const fetchHourlyForecast = (date) => {
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${place}&dt=${date}&hour=12`;
    axios
      .get(API_URL)
      .then((response) => {
        setHourlyForecast(response.data.forecast.forecastday[0].hour);
      })
      .catch((error) => {
        console.error("Error fetching hourly forecast:", error);
      });
  };

  useEffect(() => {
    fetchWeatherData(searchText); // Fetch weather data based on searchText
  }, [searchText]);

  const toggleMoreInfo = (index, date) => {
    if (index === openSectionIndex) {
      setOpenSectionIndex(null);
    } else {
      fetchHourlyForecast(date); // Fetch hourly forecast for the selected date
      setOpenSectionIndex(index);
    }
  };

  const date = new Date(localtimeEpoch * 1000);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Handler for the search button
  const handleSearch = () => {
    fetchWeatherData(place);
    setPlace(""); // Clear the search text after searching
  };

  const handleTextInputChange = (event) => {
    const value = event.target.value;
    setPlace(value);
  };

  return (
    <div className={isDay ? "day-background" : "night-background"}>
      <Typography className="forecast-head" variant="h2">Climate Compass</Typography>
      <div className="forecast-search-div">
        <TextField
          className="forecast-search"
          id="filled-basic"
          label="Search"
          variant="outlined"
          value={place}
          onChange={handleTextInputChange}
        />
        <AiOutlineSearch
          onClick={handleSearch}
          className="forecast-search-button"
        />
      </div>
      {weatherData && isDay !== null ? (
        <>
          <div className="forecast-display">
            <div>
              <Typography variant="h2">{weatherData.location.name}</Typography>
              <Typography variant="h5">
                {" "}
                Temperature: {weatherData.current.temp_c}°C
              </Typography>
              <Typography variant="h6">
                Local Time: {hours}:{minutes}:{seconds}
              </Typography>
            </div>
            <div className="forecast-temp">
              <Typography variant="h6">
                {weatherData.current.condition.text}
              </Typography>
              <img
                src={weatherData.current.condition.icon}
                alt="Weather Icon"
              />
            </div>
          </div>
          <TableContainer
            component={Paper}
            style={{ background: "rgba(255, 255, 255, 0.5)" }}
          >
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Pressure</TableCell>
                  <TableCell>Humidity</TableCell>
                  <TableCell>Weather Condition</TableCell>
                  <TableCell>More Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weatherData.forecast.forecastday.map((day, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>{day.date}</TableCell>
                      <TableCell>
                        {weatherData.current.pressure_mb}hPa
                      </TableCell>
                      <TableCell>{day.day.avghumidity}%</TableCell>
                      <TableCell>{day.day.condition.text}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => toggleMoreInfo(index, day.date)}
                          size="small"
                          color="primary"
                          aria-label="expand"
                        >
                          {index === openSectionIndex ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {index === openSectionIndex && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="h6">Hourly Forecast:</Typography>
                          {hourlyForecast.map((hour, hourIndex) => (
                            <li key={hourIndex}>
                              Time: {hour.time} | Temp: {hour.temp_c}°C |
                              Condition: {hour.condition.text}
                            </li>
                          ))}
                          <li>Wind Speed: {day.day.maxwind_kph} km/h</li>
                          <li>Sunrise: {day.astro.sunrise}</li>
                          <li>Sunset: {day.astro.sunset}</li>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Forecast;
