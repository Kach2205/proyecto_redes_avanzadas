import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
	print(Recibido)

client = mqtt.Client(client_id="middlewareMQTT", clean_session=True, userdata=None)
client.on_message=on_message

client.connect("test.mosquito.org", 1883,60)
client.subscribe("REID/Alvaro/#")

client.loop_forever()
