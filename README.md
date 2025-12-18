# Ferroamp dashboard

This program is used to display data from an energyhub that provides data over MQTT.
Additionally a table for electricity prices from [elprisetjustnu](https://www.elprisetjustnu.se/) is provided.

The entire program could very likely be replaced by grafana.

## Setup

### mosquitto config

Enter energyhub specific credentials in the **bridge.conf.template**
The fields **address**, **username**, and **password** are provided by Ferroamp.
```
connection ferroamp
address ip-to-ferroamp:1883

topic extapi/data/ehub both 0
topic extapi/data/sso both 0
topic extapi/data/eso both 0
topic extapi/data/esm both 0

try_private false
start_type automatic
cleansession true
clientid mosquitto-bridge

username usr
password pswd
```

Create a directory for the .conf file
```bash
mkdir mosquitto/conf.d
```
And copy the template to the location:
```bash
cp bridge-template.conf mosquitto/conf.d/bridge.conf
```

### Change electric price region
Currently to change the region for the electric price simply modify line 29 in [ElprisTable.tsx](https://github.com/Steklund/ferroamp-dashboard/blob/main/src/components/ElprisTable.tsx)
```typescript
const return_url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_SE1.json`
```
Instead of SE1 type out one of the other zones (SE1, SE2, SE3, SE4).

### Build the react part
Simply run
```bash
npm install
```
Followed by
```bash
npm run build
```

### Docker
Start the containers by running
```bash
docker compose up
```
One can add the **-d** flag to make it run detatched.

## Features

Currently the dashboard has two pages, the first is designed to run on a horizontal monitor and contains information about the grid, solar and batteries. I took the liberty to blur some information.

The first page will be served on **localhost**
![failed](https://github.com/Steklund/ferroamp-dashboard/blob/main/dashboard_localhost.png "localhost")

The second dashboard page is designed to be viewed on a vertical display and simply displays the electric prices with some simple highlighting.

The second page will be served on **localhost/electric-price**
![failed](https://github.com/Steklund/ferroamp-dashboard/blob/main/dashboard_electric-price.png "localhost/electric-price")


