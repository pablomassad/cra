import firebase from 'firebase/compat/app'
import { getMessaging } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, onSnapshot, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, setDoc, query, where, orderBy, writeBatch } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { ENVIRONMENTS } from 'src/environments'
import { ui } from 'fwk-q-ui'

const firebaseApp = initializeApp(ENVIRONMENTS.firebase)

const db = getFirestore()
const sto = getStorage()
const auth = getAuth()

const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}
const logout = async () => {
    return auth.signOut()
}
const register = async (name, email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
    return user.uid
}
const addQuote = (quote) => {
    if (!auth.currentUser) {
        return alert('Not Authorized')
    }
    return db.doc(`usersX/${auth.currentUser.id}`).set({ quote })
}
const isInitialized = async () => {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(() => {
            resolve(true)
        })
    })
}
const getCurrentUser = async () => {
    return auth.currentUser
}
const getCurrentUserQuote = async () => {
    const quote = await db
        .doc(`usersX/${auth.currentUser.uid}`)
        .get()
    return quote.get('quote')
}
const getCollection = async (colName) => {
    const colRef = collection(db, colName)
    const colSnapshot = await getDocs(colRef)
    const result = colSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    return result
}
const getCollectionFlex = async (colName, ops) => {
    let q
    let operator = '=='
    if (ops.op) operator = ops.op
    if (ops.field && ops.sortField) {
        q = query(collection(db, colName), where(ops.field, operator, ops.val), orderBy(ops.field, 'asc'), orderBy(ops.sortField, ops.sortDir))
    }
    if (ops.field && !ops.sortField) {
        q = query(collection(db, colName), where(ops.field, operator, ops.val))
    }
    if (!ops.field && ops.sortField) {
        q = query(collection(db, colName), orderBy(ops.sortField, ops.sortDir))
    }
    if (!ops.field && !ops.sortField) {
        q = query(collection(db, colName))
    }
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    return result
}
const getCollectionRef = (colName) => {
    const colRef = collection(db, colName)
    return colRef
}
const getDocument = async (col, d) => {
    const docRef = doc(db, col, d)
    const sn = await getDoc(docRef)
    const result = sn.data()
    return result
}
const addDocument = async (col, d) => {
    const colRef = collection(db, col)
    const docRef = await addDoc(colRef, d)
    return docRef
}
const setDocument = async (col, d, id) => {
    let docRef
    if (id) {
        const docRef = doc(db, col, id)
        await setDoc(docRef, d, { merge: true }).then(() => {
            console.log('Document has been added successfully')
        }).catch(error => {
            console.log(error)
        })
    } else {
        const ref = collection(db, col)
        removeUndefinedFields(d)
        await addDoc(ref, d)
    }
    return true
}
const emptyCollection = async (col) => {
    ui.actions.showLoading()
    const colRef = collection(db, col)
    const colSnapshot = await getDocs(colRef)
    const documents = colSnapshot.docs
    ui.actions.hideLoading()

    ui.actions.showLoading({
        type: 'progressCounter',
        color: 'red',
        total: documents.length,
        value: 0
    })
    let i = 0
    for (const d of documents) {
        await deleteDocument(col, d.id)
        // await sleep(5)
        ui.actions.setLoaderOps({
            type: 'progressCounter',
            color: 'red',
            total: documents.length,
            value: i++
        })
    }
    ui.actions.hideLoading()
}
const deleteCollection = async (col, batchSize) => {
    const colRef = collection(db, col)
    const q = query(collection(db, col), orderBy('__name__'))
    console.log('query:', q)
    // const query = colRef.orderBy('__name__').limit(batchSize) // collectionRef.orderBy('__name__').limit(batchSize)

    return new Promise((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject)
    })
}
const deleteDocument = async (col, id) => {
    const docRef = doc(db, col, id)
    await deleteDoc(docRef)
}
const uploadFile = (dest, f) => {
    const storageRef = ref(sto, dest)
    const uploadTask = uploadBytesResumable(storageRef, f)
    return uploadTask
}
const sendMessage = async (dest, titulo, descripcion) => {
    const message = {
        title: titulo,
        body: descripcion,
        data: {},
        topic: dest
    }
    try {
        await getMessaging().send(message)
        return true
    } catch (error) {
        return false
    }
}
const batchInsert = async (col, data) => {
    const batch = writeBatch(db)
    console.log('data len: ', data.length)
    const filteredData = data.filter(x => !!x['Fecha inicio'])
    console.log('data filtered len: ', filteredData.length)

    ui.actions.showLoading({
        type: 'progressCounter',
        color: 'blue',
        total: filteredData.length,
        value: 0
    })
    let i = 0
    for (const d of filteredData) {
        const docRef = doc(db, col, i.toString())
        ui.actions.setLoaderOps({
            type: 'progressCounter',
            color: 'blue',
            total: filteredData.length,
            value: i++
        })
        batch.set(docRef, d) // batch.set(docRef, d) // batch.create(docRef, d)
    }
    await batch.commit()
    ui.actions.hideLoading()
}
const fb = {
    db,
    sto,
    auth,
    login,
    logout,
    register,
    addQuote,
    onSnapshot,
    getDownloadURL,
    uploadFile,
    deleteObject,
    isInitialized,
    getCurrentUser,
    getCurrentUserQuote,
    getCollection,
    getCollectionRef,
    getCollectionFlex,
    getDocument,
    setDocument,
    addDocument,
    emptyCollection,
    deleteDocument,
    deleteCollection,
    sendMessage,
    batchInsert
}
export default fb

async function sleep (tout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, tout)
    })
}
async function deleteQueryBatch (query, resolve) {
    const snapshot = await query.get()
    const batchSize = snapshot.size
    if (batchSize === 0) { // When there are no documents left, we are done
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
        deleteQueryBatch(query, resolve)
    })
}
function removeUndefinedFields (data) {
    for (const key in data) {
        if (data[key] === undefined) {
            delete data[key]
        }
    }
    return data
}
