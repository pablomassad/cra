import { reactive, readonly, watch } from 'vue'
import { ui } from 'fwk-q-ui'
import { main } from 'fwk-q-main'
import fb from 'fwk-q-firebase'
import { ENVIRONMENTS } from 'src/environments'
import { LocalStorage } from 'quasar'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    pass: LocalStorage.getItem('CRA_pass'),
    notificaciones: undefined,
    processFinished: true,
    altas: { cnt: 0, total: 0 },
    bajas: { cnt: 0, total: 0 },
    mods: { cnt: 0, total: 0 }
})
const set = {
    settings (o) {
        console.log('store set.settings:', o)
        state.settings = o
    },
    pass (doc) {
        console.log('store pass:', doc)
        state.pass = doc
        LocalStorage.set('CRA_pass', doc)
    }
}
const actions = {
    monitorStatus (col, proxy) {
        console.log('start monitorStatus:', col)
        fb.realtimeOn('/tasks/' + col, proxy)
        state.processFinished = false
    },
    finishStatus (col) {
        console.log('finish monitorStatus:', col)
        fb.realtimeOff('/tasks/' + col)
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken('admin', vapidKey, (msg) => {
            ui.actions.notify(msg, 'success')
            state.processFinished = true
        })
    },
    async getSettings () {
        const bo = await fb.getDocument('opciones', 'backoffice')
        const config = await fb.getDocument('opciones', 'config')
        const res = { ...bo, ...config }
        set.settings(res)
        return res
    },
    async uploadFile (file, fn) {
        await fb.uploadFile(file, fn)
        console.log('store uploadFile finished:', fn)
    },
    async processClientes (file) {
        state.altas.cnt = 0
        state.bajas.cnt = 0
        state.mods.cnt = 0
        const dbClients = await fb.getCollection('clientes')

        const reader = new FileReader()
        reader.readAsText(file)
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                const text = e.target.result
                const newClients = await processFile(text)
                const { added, removed, modified } = compareArrays(dbClients, newClients)

                const updatedObj = {
                    clientsFilename: file.name,
                    clientsDatetime: new Date().getTime(),
                    clientsAdded: added.length,
                    clientsDeleted: removed.length,
                    clientsModified: modified.length
                }
                state.settings = { ...state.settings, ...updatedObj }
                await fb.setDocument('opciones', state.settings, 'backoffice')

                console.log('added:', added)
                state.altas.total = added.length
                let step = 1
                if (state.altas.total > 100) { step = 10 }

                let addCounter = 1
                for (const item of added) {
                    await fb.setDocument('clientes', item, item.id)
                    if (addCounter++ % step === 0) {
                        state.altas.cnt = addCounter
                    }
                }
                console.log('removed:', removed)
                state.bajas.total = removed.length
                for (const item of removed) {
                    await fb.deleteDocument('clientes', item.id)
                    state.bajas.cnt++
                }
                console.log('modified:', modified)
                state.mods.total = modified.length
                for (const item of modified) {
                    await fb.setDocument('clientes', item, item.id)
                    state.mods.cnt++
                }
                resolve()
            }
        })
    },
    async statNotificationsFromDate (d) {
        const ops = {
            field: 'fhEmision',
            op: '>',
            val: d
        }
        const res = await fb.getCollectionFlex('notificaciones', ops)
        return res
    },
    async logout () {
        if (main.state.isMobile) { await fb.unregisterFCM() }
        await fb.deleteDocument('fcmTokens', 'admin')
        set.pass('')
    },
    async validateUser () {
        ui.actions.showLoading()
        const result = (state.settings.password === state.pass)
        ui.actions.hideLoading()
        return result
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

async function processFile (text) {
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

    const config = { orden: orderFieldsArr }
    await fb.setDocument('opciones', config, 'config')

    const clientesDocs = []
    let idx = 0
    for (const str of data) {
        const valuesArray = str.split(';')
        const d = {}
        if (valuesArray[0] !== '') {
            fieldsArr.forEach((f, i) => {
                d[f] = valuesArray[i]
            })
            d.id = (idx++).toString()
            clientesDocs.push(d)
        }
    }
    return clientesDocs
}
function compareArrays (origData, newData) {
    const added = newData.filter(newItem => !origData.find(oldItem => oldItem.id === newItem.id))
    const removed = origData.filter(oldItem => !newData.find(newItem => newItem.id === oldItem.id))
    const modified = newData.filter(newItem => {
        const fndOld = origData.find(oldItem => oldItem.id === newItem.id)
        let result = false
        if (fndOld) {
            result = (JSON.stringify(newItem) !== JSON.stringify(fndOld)) // !deepEqual(fndOld, newItem)
        }
        return result
    })
    if (added.length && removed.length && modified.length) { ui.actions.notify('No hay cambios en la base de clientes!', 'info') }
    return { added, removed, modified }
}
function deepEqual (a, b) {
    if (a === b) return true
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) { return false }
    const keysA = Object.keys(a), keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false
    }
    return true
}
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
