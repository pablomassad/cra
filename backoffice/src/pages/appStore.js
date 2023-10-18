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
    pass (doc) {
        console.log('store pass:', doc)
        state.pass = doc
    },
    settings (o) {
        console.log('store set.settings:', o)
        state.settings = o
    }
}
const actions = {
    async uploadFile (file, fn) {
        fb.uploadFile(file, fn)
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken('admin', vapidKey)
    },
    async updateFieldsOrder (fieldsOrder) {
        await fb.setDocument('opciones', fieldsOrder, 'config')
    },
    async sendNotificacions () {
        console.log('store sendNotificacions:', state.notificaciones.length)
        ui.actions.showLoading({
            type: 'progressBar',
            color: 'blue',
            timeout: state.notificaciones.length * state.settings.fcmDelay
        })
        for (const msg in state.notificaciones) {
            const o = {
                topic: msg['N De documento'],
                title: 'CRA Aviso',
                body: msg.Mensaje,
                img: 'https://pp-cra.web.app/images/craLoRes.png',
                tokenKey: 'c9d19f3de37737eceb9daadf9f359f08a6ea4f1d'
            }
            await fb.sendFcmMessage(o)
            await sleep(state.settings.fcmDelay)
        }
        ui.actions.hideLoading()
    },
    async insertCollection (col, data) {
        console.log('store insertCollection')
        console.time('createCol')
        for (const doc of data) {
            await fb.setDocument('notificaciones', doc)
            sleep(1000)
        }
        console.timeEnd('createCol')
    },
    async getSettings () {
        const res = await fb.getDocument('opciones', 'backoffice')
        set.settings(res)
        return res
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
