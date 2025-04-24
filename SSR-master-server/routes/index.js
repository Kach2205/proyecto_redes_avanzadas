const { AES } = require('crypto-js');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var CryptoJS = require('crypto-js');
var crate = require('crate');


/*PRUEBA MQTT*/
const mqtt = require('mqtt')

const url = 'mqtt://localhost:3004'

const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
}

const client  = mqtt.connect(url, options)

//client.suscribe(['temperatura','humedad','co2','volatiles'], function(err){
//	if(!err){
//		console.log('Suscrito correctamente a los topics');
//	}else{
//		console.error('Error al suscribirse', err);
//	}
//};
client.on('connect', function () {
  console.log('Connected to mosquitto')
  client.publish('test', 'Hello mqtt')
  })

/*FIN PRUEBA MQTT*/


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

router.get('/record', function (req, res, next) {
  var now = new Date();
  var logfile_name = __dirname + '/../public/logs/' + req.query.id_nodo + "-" + now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + '.csv'

  fs.stat(logfile_name, function (err, stat) {
    if (err == null) {
      console.log('File %s exists', logfile_name);
      let content = req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + "\r\n";
      append2file(logfile_name, content);

    } else if (err.code === 'ENOENT') {
      // file does not exist
      let content = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n' + req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + "\r\n";
      append2file(logfile_name, content);
    } else {
      console.log('Some other error: ', err.code);
    }
  });




      client.publish('temperatura', req.query.temperatura)
      client.publish('humedad', req.query.humedad)
      client.publish('co2', req.query.co2)
      client.publish('volatiles', req.query.volatiles)
  //res.render('index', { title: 'Express' });
  res.send("Saving: " + req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + " in: " + logfile_name);
});

router.post('/record', function (req, res, next) {
  // Obtenemos la fecha actual
  var now = new Date();
  var decrypted = CryptoJS.AES.decrypt();

  // Construimos el nombre del archivo de log en función del id_nodo y la fecha actual
  var logfile_name = __dirname + '/../public/logs/' +
    req.body.id_nodo + "-" +
    now.getFullYear() + "-" +
    (now.getMonth() + 1) + "-" + // Sumar 1 al mes, ya que getMonth() retorna 0-11
    now.getDate() + '.csv';

  // Verificamos si el archivo ya existe
  fs.stat(logfile_name, function (err, stat) {
    if (err == null) {
      // Si el archivo existe, agregamos una nueva línea con los datos recibidos
      console.log('El archivo %s ya existe', logfile_name);
      let content = req.body.id_nodo + ';' +
        now.getTime() + ";" +
        req.body.temperatura + ";" +
        req.body.humedad + ";" +
        req.body.co2 + ";" +
        req.body.volatiles + "\r\n";
      append2file(logfile_name, content);


    } else if (err.code === 'ENOENT') {
      // Si el archivo no existe, creamos uno nuevo con una cabecera y luego agregamos los datos
      let content = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n' +
        req.body.id_nodo + ';' +
        now.getTime() + ";" +
        req.body.temperatura + ";" +
        req.body.humedad + ";" +
        req.body.co2 + ";" +
        req.body.volatiles + "\r\n";
      append2file(logfile_name, content);
    } else {
      console.error('Ocurrió un error: ', err.code);
    }
  });

      client.publish('temperatura', req.query.temperatura)
      client.publish('humedad', req.query.humedad)
      client.publish('co2', req.query.co2)
      client.publish('volatiles', req.query.volatiles)
  res.send("Saving: " + req.body.id_nodo + ';' + now.getTime() + ";" + req.body.temperatura + ";" + req.body.humedad + ";" + req.body.co2 + ";" + req.body.volatiles + " in: " + logfile_name);
});

function append2file(file2append, content) {
  fs.appendFile(file2append, content, function (err) {
    if (err) throw err;
    console.log("Saving: " + content + " in: " + file2append);
  });
}

module.exports = router;
