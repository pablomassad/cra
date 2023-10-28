import { reactive, readonly, watch } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { ENVIRONMENTS } from 'src/environments'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    pass: undefined,
    notificaciones: undefined,
    processFinished: true,
    altas: 0,
    bajas: 0,
    mods: 0
})
const set = {
    settings (o) {
        console.log('store set.settings:', o)
        state.settings = o
    },
    pass (doc) {
        console.log('store pass:', doc)
        state.pass = doc
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
        state.altas = 0
        state.bajas = 0
        state.mods = 0
        ui.actions.showLoading()
        const dbClients = await fb.getCollection('clientes')

        const reader = new FileReader()
        reader.readAsText(file)
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                const text = e.target.result
                const newClients = await processFile(text)
                const { added, removed, modified } = compareArrays(dbClients, newClients)

                console.log('added:', added)
                for (const item of added) {
                    await fb.setDocument('clientes', item, item.id)
                    state.altas++
                }
                console.log('removed:', removed)
                for (const item of removed) {
                    await fb.deleteDocument('clientes', item.id)
                    state.bajas++
                }
                console.log('modified:', modified)
                for (const item of modified) {
                    await fb.setDocument('clientes', item, item.id)
                    state.mods++
                }
                ui.actions.hideLoading()
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
    await fb.setDocument('opciones', config)

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
        const oldItem = origData.find(oldItem => oldItem.id === newItem.id)
        let result = false
        if (oldItem) {
            result = !deepEqual(oldItem, newItem)
        }
        return result
    })
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
