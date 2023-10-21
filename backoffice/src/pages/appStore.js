import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { ENVIRONMENTS } from 'src/environments'

fb.initFirebase(ENVIRONMENTS.firebase)

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
