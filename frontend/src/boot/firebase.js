import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import firebase from 'firebase/compat/app'
import { getFirestore, onSnapshot, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, setDoc, query } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { ENVIRONMENTS } from '../environments'

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
    const col = collection(db, colName)
    const colSnapshot = await getDocs(col)
    const result = colSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    return result
}
const getCollectionByCriteria = async (colName, field, val, op) => {
    let operator = '=='
    if (op) operator = op
    const q = query(collection(db, colName), where(field, operator, val))
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
    const docRef = doc(db, col, d.id || id)
    await setDoc(docRef, d, { merge: true })
    return true
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
    getDocument,
    setDocument,
    addDocument,
    deleteDocument
}

export default fb
