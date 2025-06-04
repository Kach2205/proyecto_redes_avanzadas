import time
from influxdb import InfluxDBClient
from datetime import  datetime, timedelta
from config import INFLUXDB_HOST, INFLUXDB_PORT, INFLUXDB_DB, MEASURES

client = InfluxDBClient(host=INFLUXDB_HOST, port = INFLUXDB_PORT)
client.switch_database(INFLUXDB_DB)

def getPromedio (measurement, minutes=5):

	try:
		query = f"""
			SELECT "value" FROM "{measurement}"
			WHERE time > now() - {minutes}m
		"""
		result = client.query(query)
		values = []
		for point in result.get_points(measurement=measurement):
			try:
				v=float(point['value'])
				values.append(v)
			except (TypeError, ValueError):
				continue
		if values:
			return sum(values) / len(values)
		else:
			return None
	except Exception as e:
		print(f"[ERROR] {measurement} : {e}")


def guardarPromedio (averages):

	valid_fields = {k: v for k, v in averages.items() if v is not None}
	if not valid_fields:
		print("No hay valores para guardar. Se omite el envio")
		return
	
	json_body = [{
		"measurement" : "promedios",
		"time" : datetime.utcnow().isoformat() + "Z",
		"fields" :valid_fields 
	}]
	client.write_points(json_body)
	print("Promedios guardados:", json_body)




if  __name__ == "__main__":
	print("Calculando promedios...")
	averages = {}
	while(1):
		for measure in MEASURES:
			avg = getPromedio(measure)
			if avg is not None:
				print(f"{measure} : {avg:.2f}")
			else:	
				print(f"{measure}  : sin datos")
			averages[measure] = avg
		guardarPromedio(averages)
		time.sleep(300)
