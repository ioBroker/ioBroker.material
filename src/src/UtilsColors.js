/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
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

class UtilsColors {
    static hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * Taken from here: https://gist.github.com/mjackson/5311256
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    static hslToRgb(h, s, l) {
        let r, g, b;

        if (!s) {
            r = g = b = l; // achromatic
        } else {

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = UtilsColors.hue2rgb(p, q, h + 1/3);
            g = UtilsColors.hue2rgb(p, q, h);
            b = UtilsColors.hue2rgb(p, q, h - 1/3);
        }

        return [r * 255, g * 255, b * 255];
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * Taken from here: https://gist.github.com/mjackson/5311256
     *
     * @param   {number}  r       The red color value
     * @param   {number}  g       The green color value
     * @param   {number}  b       The blue color value
     * @return  {Array}           The HSL representation
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default: break;
            }

            h /= 6;
        }

        return [ h, s, l ];
    }

    static limit(x) {
        if (x < 0) {
            return 0;
        } else
        if (x > 255) {
            return 255;
        } else {
            return Math.round(x);
        }
    }

    // taken from here https://gist.github.com/paulkaplan/5184275
    static temperatureToRGB(kelvin) {
        let temp = kelvin / 100;
        let red;
        let green;
        let blue;

        if (temp <= 66) {
            red = 255;
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;

            if (temp <= 19) {
                blue = 0;
            } else {
                blue = temp - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            }
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);

            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);
            blue = 255;
        }

        return [
            UtilsColors.limit(red,   0, 255),
            UtilsColors.limit(green, 0, 255),
            UtilsColors.limit(blue,  0, 255)
        ]
    }

    static rgb2temperature(r, g, b) {
        let temperature;
        let testRGB;
        let epsilon = 0.4;
        let minTemperature = 2200;
        let maxTemperature = 6500;
        while (maxTemperature - minTemperature > epsilon) {
            temperature = (maxTemperature + minTemperature) / 2;
            testRGB = UtilsColors.temperatureToRGB(temperature);
            if ((testRGB.blue / testRGB.red) >= (b / r)) {
                maxTemperature = temperature;
            } else {
                minTemperature = temperature;
            }
        }
        return Math.round(temperature);
    }

    static rgb2string(rgbArray) {
        let r = UtilsColors.limit(rgbArray[0]).toString(16);
        let g = UtilsColors.limit(rgbArray[1]).toString(16);
        let b = UtilsColors.limit(rgbArray[2]).toString(16);
        if (r.length < 2) r = '0' + r;
        if (g.length < 2) g = '0' + g;
        if (b.length < 2) b = '0' + b;
        return '#' + r + g + b;
    }

    static hex2array(hex) {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return [r, g, b];
    }

    static hexToRgbA(hex, a) {
        if (!hex) {
            return '';
        }
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        if (a !== undefined) {
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        } else {
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }
    }
}

export default UtilsColors;
