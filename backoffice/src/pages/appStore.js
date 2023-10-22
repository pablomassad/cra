import { reactive, readonly, watch } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { ENVIRONMENTS } from 'src/environments'
import { getDatabase, onValue, ref as refRt, child, get } from 'firebase/database'
import { initializeApp } from 'firebase/app'

fb.initFirebase(ENVIRONMENTS.firebase)

const app = initializeApp(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    pass: undefined,
    notificaciones: undefined
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
    monitorStatus (col, proxyRef) {
        console.log('monitorStatus:', col)
        fb.realtimeOn('/tasks/' + col, proxyRef)
    },
    finishStatus (col) {
        console.log('finishStatus:', col)
        fb.realtimeOff('/tasks/' + col)
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken('admin', vapidKey, 'admin')
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
    getTasks (col) {
        const route = '/tasks/' + col
        const dbRt = getDatabase(app)
        const dbRefValue = refRt(dbRt, route)
        console.log('getTasks: ', route)
        onValue(dbRefValue, (snapshot) => {
            console.log('onValue event....')
            const data = snapshot.val()
            console.log('onValue data:', data)
        }, (error) => {
            console.error('onValue error: ', error)
        })
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

async function sleep (tout) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, tout * 1000)
    })
}
