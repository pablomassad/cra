const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { getStorage } = require('firebase-admin/storage')
const process = require('process')

admin.initializeApp()
const dbRt = admin.database()
const db = admin.firestore()

// exports.subscribeTopic = onRequest(async (request, response) => {
//    const tokenDoc = await getTokenById('admin')
//    logger.info('subscribeToTopics: ', 'admin => ' + tokenDoc.fcmToken)
//    await admin.messaging().subscribeTopic(tokenDoc.fcmToken, 'admin')
//    response.send('subscribed to topic:' + tokenDoc.fcmToken)
// })
exports.getStatus = onRequest(async (request, response) => { // ?task=clients || ?task=notifications
    const refRt = dbRt.ref('/tasks/' + request.params['0']) // request.query.task)
    const sn = await refRt.once('value')
    if (!sn.exists()) {
        logger.info('getStatus:', 'No task pending')
        response.send({ result: 'No task pending' })
    } else {
        const st = sn.val()
        logger.info('getStatus:', st)
        response.send(st)
    }
})
exports.processStorageUpload = functions.storage.bucket().object().onFinalize(async event => {
    const gcs = getStorage()
    const bucket = gcs.bucket(event.bucket)
    const CLIENTES = 'clientes.csv'
    const NOTIFICACIONES = 'notificaciones.csv'

    if (event.name === CLIENTES) {
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
        const data = text.split('\r\n')

        const orderStr = data[0]
        const orderArr = orderStr.split(';')
        // functions.logger.log('clientes orderArr:', orderArr)

        const fieldsStr = data[1]
        const fieldsArr = fieldsStr.split(';')
        // functions.logger.log('clientes fieldsArr:', fieldsArr)

        const orderFieldsArr = []
        for (let i = 1; i <= orderArr.length; i++) {
            const idx = getIndex(i, orderArr)
            orderFieldsArr.push(fieldsArr[idx])
        }
        // functions.logger.log('clientes orderFieldsArr:', orderFieldsArr)

        data.shift() // borra Orden de campos
        data.shift() // borra cabecera del data

        functions.logger.log('data len:', data.length)

        const clientesDocs = []
        for (const str of data) {
            const valuesArray = str.split(';')
            const doc = {}
            if (valuesArray[0] !== '') {
                fieldsArr.forEach((f, i) => {
                    doc[f] = valuesArray[i]
                    doc.id = i
                })
                clientesDocs.push(doc)
            }
        }
        functions.logger.log('clientesDocs len:', clientesDocs.length)

        const cfgRef = db.collection('opciones').doc('config')
        const d = await cfgRef.get()
        const cfg = d.data()

        const config = {
            orden: orderFieldsArr
        }
        await deleteCollection('clientes', 5)
        functions.logger.log('delete finished')
        await insertCollection('clientes', clientesDocs)
        functions.logger.log('insertion finished')
        await db.doc('opciones/config').set(config)
        functions.logger.log('update clients ok:', config)
        sendPush('admin',
            'CRA Aviso',
            'La actualización de Clientes ha finalizado OK')
        functions.logger.log('sent msg to ', 'admin')
    }
    if (event.name === NOTIFICACIONES) {
        const file = bucket.file(event.name)
        const dwFile = await file.download({ encoding: 'utf8' })
        const text = Buffer.concat(dwFile).toString('utf8')

        const data = text.split('\r\n')

        const fieldsStr = data[0]
        const fieldsArr = fieldsStr.split(';')
        functions.logger.log('FieldsArray:', fieldsArr)

        data.shift() // borra cabecera del data

        const notiDocs = data.map((str, i) => {
            const valuesArray = str.split(';')
            const doc = {
                id: new Date().getTime(),
                fhEmision: new Date().getTime()
            }
            fieldsArr.forEach((f, i) => {
                doc[f] = valuesArray[i]
            })
            return doc
        })
        await insertCollection('notificaciones', notiDocs)
        functions.logger.log('insertion finished')
        await sendNotifications(notiDocs)
        functions.logger.log('sent notifications finished')
        await sendPush('admin',
            'CRA Aviso',
            'Las notificaciones han sido enviadas!')
        functions.logger.log('sent msg to ', 'admin')
    }
    return null
})

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
async function deleteCollection (col, batchSize) {
    const colRef = db.collection(col)
    const qsn = await colRef.get()
    const data = qsn.docs
    const total = data.length
    let partial = total
    functions.logger.log('total for delete: ', total)
    if (total === 0) return

    const refRt = dbRt.ref('/tasks/clientes')
    await refRt.set({ progress: partial, total })

    for (const d of data) {
        await db.collection(col).doc(d.id).delete()
        partial--
        if (partial % 50 === 0) {
            functions.logger.log('delete counter ', partial)
            await refRt.set({ progress: partial, total })
        }
    }
    functions.logger.log('delete counter final', partial)
    await refRt.set({ progress: partial, total })

    // const query = collectionRef.orderBy('__name__').limit(batchSize)
    // return new Promise((resolve, reject) => {
    //    deleteQueryBatch(db, query, resolve, total).catch(reject)
    // })
}
async function insertCollection (col, data) {
    let colRt = col
    if (colRt.indexOf('cliente') > 0) { colRt = 'clientes' }
    const refRt = dbRt.ref('tasks/' + col)

    let i = 1
    const total = data.length - 1
    functions.logger.log('total data in ', col, total)
    const filteredData = data.filter(x => !evalUndefinedFields(x)) //  !!x['Fecha inicio'])
    functions.logger.log('data to be inserted: ', filteredData.length)

    for (const d of filteredData) {
        await db.collection(col).add(d)
        await refRt.set({ progress: i++, total })
        if (i % 10 === 0) {
            functions.logger.log('insert counter ', i)
        }
        // await sleep(100)
    }
    // await refRt.set({ progress: 0, total: 0 })
}
async function sendNotifications (docs) {
    let i = 1
    const total = docs.length - 1
    const refRt = dbRt.ref('tasks/mensajes')

    for (const d of docs) {
        const dni = d['N De documento']
        functions.logger.log('Documento:', dni)
        if (dni) {
            const keys = Object.keys(d)
            const tipo = d[keys[2]]
            await sendPush(
                dni,
                `CRA: ${tipo}`,
                'Descripción, Estimado cliente tiene una notificación pendiente  para leer de CR Asociados Seguros y Servicios. Ingresá para verla.')
            await refRt.set({ progress: i++, total })
            await sleep(300)
        }
    }
    // await refRt.set({ progress: 0, total: 0 })
}
async function sendPush (id, title, body) {
    const tokenDoc = await getTokenById(id)
    if (!tokenDoc) return

    const token = tokenDoc.fcmToken
    functions.logger.log('Token:', token)
    const payload = {
        token,
        notification: {
            title,
            body
        }
    }
    const response = await admin.messaging().send(payload)
    functions.logger.log('Successfully sent all messages:', response)
}
async function getTokenById (id) {
    const tokenRef = db.collection('fcmTokens').doc(id)
    const ds = await tokenRef.get()
    const tokenDoc = ds.data()
    return tokenDoc
}
async function sleep (tout) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, tout)
    })
}
function evalUndefinedFields (doc) {
    let flag = false
    for (const key in doc) {
        if (doc[key] === undefined) {
            flag = true
        }
    }
    return flag
}
async function deleteQueryBatch (db, query, resolve, total) {
    const snapshot = await query.get()
    const batchSize = snapshot.size
    functions.logger.log('batchSize for delete: ', batchSize)
    const refRt = dbRt.ref('/tasks/clientes')

    if (batchSize === 0) {
        await refRt.set({ progress: 0, total })
        resolve()
        return
    }
    let i = 0
    const batch = db.batch()
    functions.logger.log(' snapshot.docs len ', snapshot.docs.length)
    for (const doc of snapshot.docs) {
        batch.delete(doc.ref)
        partial = partial - (i++)
        if ((i % 1) === 0) {
            functions.logger.log('delete counter ', partial)
            await refRt.set({ progress: partial, total })
        }
    }
    await batch.commit()
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve)
    })
}

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
