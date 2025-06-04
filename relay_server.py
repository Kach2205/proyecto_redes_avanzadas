from flask import Flask, request
import requests

app = Flask(__name__)

FORWARD_URL = 'http://10.100.0.107:2001/record'

@app.route('/record', methods=['POST'])
def webhook():
	data = request.get_json(force=True)
	print("Recibido:", data)

	try:
		responde = requests.post(FORWARD_URL, json=data)
		print("Reenvio con status:", response.status_code)
		return {"status": "reenviado"}, 200
	except Exception as e:
		print("Error al reenviar:", e)
		return {"error": str(e)}, 500

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=6000)
