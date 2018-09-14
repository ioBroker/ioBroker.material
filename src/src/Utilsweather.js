/**
 * Copyright 2018 binarywritter <binarywritter@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

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
        
