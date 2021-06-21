# General
- copy from root the package.json into src/src in gulpfile
- Apply/Ok/Save always on the right, Cancel is on the left
- All dialog buttons are contained
- Think about autoFocus
- Use startIcon in buttons

- Add new widget dialog
 - If possible with dynamic picture (because of themes)
 - If possible with demo data
 - If not possible - static picture

- Don't forget about comma/point in floats

- Make translation for icon selector work

- Nothing here: fix the background

- Charts: detect  `custom.${defaultHistory}`. Give all datapoints into Component "objs"


## Two sizes of icons

## Clock
## Thermostat
- On mobile devices hide contorls in chart-dialog and make it maximal big
- ? Tooltips for values: actual temperature / target temerature
## Temperature
- Tooltips: Temperature / Humidity
- Show Humidity on chart (and all others that have history ON)

## Switch
- Show charts for switch: ON/OFF, voltage, current, frequency, consumption, power

## RGB
- 2 modes:
  <!-- - Color temperature + Dimmer  -->
- Show by Color temperature the Kelvin and not percent  
- Tooltip of power, Color type

## Weather
- https://demo.home-assistant.io/#/lovelace/0
- Use IDs from channel detector
- Chart opacity 0.4
- Show dialog with chart if humidity or temperature with "custom.history.0"
- Big size - increase fonts and images
- Type detector to detect current

## Weather current (as type detector)