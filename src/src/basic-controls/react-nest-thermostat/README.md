## React Nest Thermostat
This (unofficial) React component provides a basic display of the Nest thermostat.

### Live Demo
View the [live demo](https://run.plnkr.co/plunks/SYkIZmFFL8tCHnTHMGJY/)! Note that this demo uses pre-compiled code, so it's a little messy to examine.

### Installation
```
npm install react-nest-thermostat
```

### Example Usage
You can run built-in demo example via few simple steps:<br />
1. `git clone https://github.com/KevinMellott91/react-nest-thermostat.git`<br />
2. `cd react-nest-thermostat`<br />
3. `npm install`<br />
4. `npm run-script basic-example`<br />
5. Browse to http://localhost:3000

### Component (primary) properties
- `away` (Boolean) - true/false to indicate if the Nest is in "away mode"
- `leaf` (Boolean) - true/false to indicate if the Nest is in "energy savings mode"
- `ambientTemperature` (Integer) - actual temperature detected by the Nest
- `targetTemperature` (Integer) - target temperature provided to the Nest
- `hvacMode` (String) - status of the HVAC operations
  - `off` - no action is being taken
  - `heating` - thermostat is actively heating
  - `cooling` - thermostat is actively cooling

### Inspiration
This work was inspired heavily by the [Nest Thermostat Control](http://codepen.io/dalhundal/pen/KpabZB/) Pen created by [Dal Hundal](http://codepen.io/dalhundal/).
