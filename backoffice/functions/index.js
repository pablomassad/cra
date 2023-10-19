const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { getStorage } = require('firebase-admin/storage')

admin.initializeApp()

exports.getAddCounter = onRequest((request, response) => {
    logger.info('getAddCounter:', process.env.COUNTER)
    response.send(process.env.COUNTER)
})

exports.processClientes = functions.storage.bucket().object().onFinalize(async event => {
    const gcs = getStorage()
    const bucket = gcs.bucket(event.bucket)
    const NAME = 'clientes.csv'

    if (event.name === NAME) {
        const file = bucket.file(event.name)
        const dwFile = await file.download({ encoding: 'utf8' })
        const text = Buffer.concat(dwFile).toString('utf8')

        // Lee la coleccion activa de clientes
        // Obtiene el ordenamiento de la primer fila del csv y lo guarda en un array (orderArr)
        // Obtiene los campos de la segunda fila del csv y lo guarda en un array (fieldsArr)
        // Genera el nuevo array con los campos ordenados segun orderArr
        // Actualiza la DB guardando el nuevo documento config
        // Elimina del csv las 2 primeras filas ya utilizadas (quedan datos)
        // Genera un array de objetos (clientesDocs) con toda la info
        // Cambia variable local con nuevo nombre de coleccion alternativa de clientes (clientes <==> clientesAlt)
        // Borra esta coleccion
        // Inserta clientesDocs completo en esta ultima coleccion
        // Actualiza config.colClientes en la DB por el nuevo nombre de la coleccion alternativa
        const cfgRef = admin.firestore().collection('opciones').doc('config')
        const d = await cfgRef.get()
        const cfg = d.data()
        const colClientes = cfg.colClientes
        console.log('config.colClientes activa:', colClientes)

        const data = text.split('\r\n')
        const orderStr = data[0]
        const orderArr = orderStr.split(';')

        const fieldsStr = data[1]
        const fieldsArr = fieldsStr.split(';')

        const orderFieldsArr = []
        for (let i = 1; i <= orderArr.length; i++) {
            const idx = getIndex(i, orderArr)
            orderFieldsArr.push(fieldsArr[idx])
        }
        data.shift() // borra Orden de campos
        data.shift() // borra cabecera del data

        const clientesDocs = data.map((str, i) => {
            const valuesArray = str.split(';')
            const doc = {}
            fieldsArr.forEach((f, i) => {
                doc[f] = valuesArray[i]
            })
            return doc
        })

        const config = {
            borrame: true,
            orden: orderFieldsArr,
            colClientes: (colClientes === 'clientes') ? 'clientesAlt' : 'clientes'
        }
        console.log('config update:', config)
        console.log('delete collection:', config.colClientes)
        await deleteCollection(admin.firestore(), config.colClientes, 100)
        console.log('delete ok')
        await insertCollection(config.colClientes, clientesDocs)
        await admin.firestore().doc('opciones/config').set(config)
    }
    return null
})
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

function getIndex (id, orderArr) {
    let idx = -1
    orderArr.forEach((x, i) => {
        const flag = (Number(x) === Number(id))
        if (flag) {
            idx = i
        }
    })
    return idx
}
async function deleteCollection (db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath)
    const query = collectionRef.orderBy('__name__').limit(batchSize)

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject)
    })
}
async function deleteQueryBatch (db, query, resolve) {
    const snapshot = await query.get()
    console.log('collection counter:', snapshot.length)
    const batchSize = snapshot.size
    if (batchSize === 0) {
        resolve()
        return
    }
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
    })
    await batch.commit()
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve)
    })
}
async function insertCollection (col, data) {
    process.env.COUNTER = 0
    data.map(async d => {
        await admin.firestore().collection(col).add(d)
        process.env.COUNTER = process.env.COUNTER + 1
        await sleep(1)
    })
}
async function sleep (tout) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, tout * 1000)
    })
}
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
