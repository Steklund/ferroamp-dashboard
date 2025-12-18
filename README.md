# Ferroamp dashboard

This program is used to display data from an energyhub provided over MQTT from the energyhub.
Additionally a table for electricity prices from [elprisetjustnu](https://www.elprisetjustnu.se/) is provided.

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

