import functions from 'firebase-functions'
import admin from 'firebase-admin'

admin.initializeApp()

// exports.processNotificaciones = functions.storage.bucket().onUpload(event => {
//    const file = event.data

//    if (file.name === 'notificaciones.csv') {
//        const reader = new FileReader()
//        reader.onload = function () {
//            const data = reader.result

//            const rows = data.split('\n')
//            for (const row of rows) {
//                const document = {
//                    name: row.split(',')[0],
//                    age: row.split(',')[1]
//                }
//                admin.firestore().collection('users').add(document)
//            }
//        }
//        reader.readAsText(file)
//    }
// })
// exports.processClientes = functions.storage.bucket().onUpload(event => {
//    const file = event.data
//    if (file.name === 'clientes.csv') {
//        const reader = new FileReader()
//        reader.readAsText(file)

//        // Espera que cargue el archivo
//        // Lee la coleccion activa de clientes
//        // Obtiene el ordenamiento de la primer fila del csv y lo guarda en un array (orderArr)
//        // Obtiene los campos de la segunda fila del csv y lo guarda en un array (fieldsArr)
//        // Genera el nuevo array con los campos ordenados segun orderArr
//        // Actualiza la DB guardando el nuevo documento config
//        // Elimina del csv las 2 primeras filas ya utilizadas (quedan datos)
//        // Genera un array de objetos (clientesDocs) con toda la info
//        // Cambia variable local con nuevo nombre de coleccion alternativa de clientes (clientes <==> clientesAlt)
//        // Borra esta coleccion
//        // Inserta clientesDocs completo en esta ultima coleccion
//        // Actualiza config.colClientes en la DB por el nuevo nombre de la coleccion alternativa

//        reader.onload = async () => {
//            const cfgRef = admin.firestore().collection('options').doc('config')
//            const doc = await cfgRef.get()
//            const cfg = doc.data()
//            const colClientes = cfg.colClientes
//            console.log('config.colClientes activa:', colClientes)

//            const data = reader.result.split('\r\n')
//            const orderStr = data[0]
//            const orderArr = orderStr.split(';')
//            console.log('OrderArray:', orderArr)

//            const fieldsStr = data[1]
//            const fieldsArr = fieldsStr.split(';')
//            console.log('FieldsArray:', fieldsArr)

//            const orderFieldsArr = []
//            for (let i = 1; i <= orderArr.length; i++) {
//                const idx = orderArr.indexOf(i.toString())
//                orderFieldsArr.push(fieldsArr[idx])
//            }
//            console.log('orderFieldsArr:', orderFieldsArr)

//            data.shift() // borra Orden de campos
//            data.shift() // borra cabecera del data

//            const clientesDocs = data.map((str, i) => {
//                const valuesArray = str.split(';')
//                const doc = {}
//                fieldsArr.forEach((f, i) => {
//                    doc[f] = valuesArray[i]
//                })
//                return doc
//            })

//            const config = {
//                orden: orderFieldsArr,
//                colClientes: (colClientes === 'clientes') ? 'clientesAlt' : 'clientes'
//            }
//            console.log('config update:', config)
//            // await deleteCollection(config.colClientes)
//            // await insertCollection(config.colClientes, clientesDocs)
//            // await admin.firestore().doc('options/config').set(config)
//        }
//    }
// })

// Crea una función que se ejecutará cada 5 minutos
// exports.runEveryFiveMinutes = functions.https.onRequest((req, res) => {
//    // Programa la ejecución de la función
//    admin.functions().schedule('runEveryFiveMinutes', new Date(), () => {
//        // Ejecuta la función
//        exports.doSomething()
//    }, { repeat: 'every 5 minutes' })

//    res.send('La función se ejecutará cada 5 minutos')
// })
// exports.doSomething = functions.https.onRequest((req, res) => {
//    // Haz algo
//    res.send('La función se ejecutó')
// })

exports.helloPost = functions.https.onRequest((request, response) => {
    console.log('hola mundo')
    // functions.logger.info('Hello POST!', { structuredData: true })
    // response.send('Hello POST data: ' + JSON.stringify(request.body))
})

// async function insertCollection (col, docs) {
//    // await admin.firestore().collection(col).add(docs)
//    for (const doc of docs) {
//        await admin.firestore().collection('notificaciones').add(doc)
//        sleep(1000)
//    }
// }
// async function deleteCollection (col) {
//    admin.firestore().collection(col).delete()
//        .then(() => {
//            functions.logger.log('Collection deleted successfully')
//        })
//        .catch(error => {
//            functions.logger.log('Error deleting collection: ', error)
//        })
// }
// function sendPush (token, message) {
//    const payload = {
//        token,
//        notification: {
//            title: 'CRA: Notificacion',
//            body: message
//        }
//    }
//    admin.messaging().send(payload).then((response) => {
//        functions.logger.log('Successfully sent message: ', response)
//    }).catch((error) => {
//        functions.logger.log('error: ', error)
//    })
// }
// async function sleep (tout) {
//    return new Promise(resolve => {
//        setTimeout(() => {
//            resolve()
//        }, tout * 1000)
//    })
// }
