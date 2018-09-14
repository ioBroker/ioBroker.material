import fetch from 'whatwg-fetch';
let rootUrl = 'http://api.openweathermap.org/data/2.5/weather?q=';
let apiUrl = '&appid=2de143494c0b295cca9337e1e96b00e0';

module.exports = {
  get: function(place) {
    return fetch(rootUrl + place + apiUrl, {
      headers: {
        //It is not necesary
        }
      })
      .then(function(response) {
        return response.json();
      });
     }
};
        
