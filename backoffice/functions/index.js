import functions from 'firebase-functions'
import vision from '@google-cloud/vision'
import admin from 'firebase-admin'
import fs from 'fs'

// Ensure these are the same as the one in ../firebase/messaging
export const FCM_TOKEN_COLLECTION = 'fcmTokens'
export const FCM_TOKEN_KEY = 'fcmToken'

// Ensure this is the same as the one in ../firebase/firestore
export const RECEIPT_COLLECTION = 'receipts'

admin.initializeApp()
export const readReceiptDetails = functions.storage.object().onFinalize(async (object) => {
    const imageBucket = `gs://${object.bucket}/${object.name}`
    const client = new vision.ImageAnnotatorClient()

    const [textDetections] = await client.textDetection(imageBucket)
    const [annotation] = textDetections.textAnnotations
    const text = annotation ? annotation.description : ''

    // Parse text

    // Get user ID
    const re = /(.*)\//
    const uid = re.exec(object.name)[1]

    // Check whether receipt already exists by checking for existing imageBucket so a document isn't
    // created for the same receipt
    const doc = await admin.firestore().collection(RECEIPT_COLLECTION).where('imageBucket', '==', imageBucket).get()
    if (doc.empty) {
        const receipt = {
            address: '123 Happy St, Bestcity, World 67890',
            amount: '23.45',
            date: new Date(),
            imageBucket,
            items: 'best appetizer, best main dish, best dessert',
            isConfirmed: false,
            locationName: 'Best Restaurant',
            uid
        }
        await admin.firestore().collection(RECEIPT_COLLECTION).add(receipt)
    }

    const documentSnapshot = await admin.firestore().collection(FCM_TOKEN_COLLECTION).doc(uid).get()
    const token = documentSnapshot.data()[FCM_TOKEN_KEY]

    const message = 'Your receipt is ready for review and confirmation!'

    const payload = {
        token,
        notification: {
            title: 'CRA: Notificacion',
            body: message
        }
    }

    admin.messaging().send(payload).then((response) => {
        // Response is a message ID string.
        functions.logger.log('Successfully sent message: ', response)
    }).catch((error) => {
        functions.logger.log('error: ', error)
    })
})

// Crea una función que se ejecutará cuando se suba un archivo
exports.processNotificaciones = functions.storage.bucket().onUpload(event => {
    const file = event.data

    if (file.name === 'notificaciones.csv') {
        const reader = new FileReader()
        reader.onload = function () {
            const data = reader.result

            const rows = data.split('\n')
            for (const row of rows) {
                const document = {
                    name: row.split(',')[0],
                    age: row.split(',')[1]
                }
                admin.firestore().collection('users').add(document)
            }
        }
        reader.readAsText(file)
    }
})

// Crea una función que se ejecutará cuando se suba un archivo
exports.processClientes = functions.storage.bucket().onUpload(event => {
    const file = event.data

    if (file.name === 'clientes.csv') {
        const reader = new FileReader()
        reader.onload = function () {
            const data = reader.result

            const rows = data.split('\n')
            for (const row of rows) {
                const document = {
                    name: row.split(',')[0],
                    age: row.split(',')[1]
                }
                admin.firestore().collection('users').add(document)
            }
        }
        reader.readAsText(file)
    }
})

// Crea una función que se ejecute cuando se suba un archivo
exports.uploadCSV = functions.storage.bucket().onUpload(event => {
    // Obtén la referencia al archivo subido
    const file = event.data

    // Lee el archivo CSV
    const reader = new FileReader()
    reader.onload = function () {
        // Obtén los datos del archivo CSV
        const data = reader.result

        // Sube los datos del archivo CSV a Cloud Firestore
        admin.firestore().collection('data').add({
            data
        })
    }
    reader.readAsText(file)
})

// Crea una función que se ejecutará cada 5 minutos
exports.runEveryFiveMinutes = functions.https.onRequest((req, res) => {
    // Programa la ejecución de la función
    admin.functions().schedule('runEveryFiveMinutes', new Date(), () => {
        // Ejecuta la función
        exports.doSomething()
    }, { repeat: 'every 5 minutes' })

    // Responde a la solicitud
    res.send('La función se ejecutará cada 5 minutos')
})

// Crea una función que se ejecutará cuando se ejecute la función programada
exports.doSomething = functions.https.onRequest((req, res) => {
    // Haz algo
    res.send('La función se ejecutó')
})

// Create a function that deletes a collection
exports.deleteCollection = functions.https.onRequest((req, res) => {
    const collectionName = req.query.collectionName
    admin.firestore().collection(collectionName).delete()
        .then(() => {
            res.send('Collection deleted successfully')
        })
        .catch(error => {
            console.error(error)
            res.status(500).send('An error occurred while deleting the collection')
        })
})
