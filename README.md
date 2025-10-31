Change up the bridge.conf.template with ip, usr and pwd and then copy it to the destination

mkdir -p mosquitto/conf.d
cp bridge-template.conf mosquitto/conf.d/bridge.conf
