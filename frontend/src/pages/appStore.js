import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    document: LocalStorage.getItem('CRA_doc'),
    selVehiculo: undefined,
    userData: undefined,
    notificaciones: undefined,
    notification: undefined
})
const set = {
    settings (o) {
        console.log('store set.settings:', o)
        state.settings = o
    },
    document (doc) {
        console.log('store setDocument:', doc)
        state.document = doc
        LocalStorage.set('CRA_doc', doc)
    },
    vehiculo (v) {
        console.log('store setSelVehiculo:', v)
        state.selVehiculo = v
    },
    userData (ud) {
        console.log('store setUserData:', ud)
        state.userData = ud
    },
    notificaciones (msgs) {
        console.log('store setNotificaciones:', msgs)
        state.notificaciones = msgs
    },
    notification (n) {
        console.log('store setNotification:', n)
        state.notification = n
    },
    fieldsOrder (arr) {
        console.log('store set.fieldsOrder:', arr)
        state.fieldsOrder = arr
    }
}
const actions = {
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken(state.document, vapidKey, state.document)
    },
    async getSettings () {
        const fe = await fb.getDocument('opciones', 'frontend')
        const config = await fb.getDocument('opciones', 'config')
        const res = { ...fe, ...config }
        set.settings(res)
        return res
    },
    async validateUser () {
        ui.actions.showLoading()
        const dataArr = await fb.getCollectionFlex(state.settings.colClientes, { field: 'Documento', op: '==', val: state.document })
        ui.actions.hideLoading()
        return dataArr
    },
    async getDataByUser () {
        ui.actions.showLoading()
        const dataArr = await actions.validateUser()
        const arr = []
        if (dataArr?.length) {
            dataArr.forEach((doc, i) => {
                delete doc.id
                const o = {}
                state.settings.orden.forEach(f => {
                    o[f] = dataArr[i][f]
                })
                arr.push(o)
            })
            set.userData(arr)
        } else {
            ui.actions.notify('El usuario no existe!. Pruebe con otro documento.', 'error')
        }
        ui.actions.hideLoading()
        return arr
    },
    async getNotificacionesByUser () {
        ui.actions.showLoading()
        const data = await fb.getCollectionFlex('notificaciones', { field: 'N De documento', op: '==', val: state.document })
        if (!data?.length) {
            ui.actions.notify('No hay nuevas notificaciones', 'info', { position: 'center' })
        }
        const msgArr = processMessages(data)
        console.log(msgArr)
        set.notificaciones(msgArr)
        ui.actions.hideLoading()
        return msgArr
    },
    async updateNotifications (field) {
        console.log('store updateNotifications:', field)
        for (const n of state.notificaciones) {
            const fh = {}
            if (!n[field]) {
                fh[field] = new Date().getTime()
                await fb.setDocument('notificaciones', fh, n.id)
            }
        }
    },
    async deleteNotifications (arr) {
        for (const n of arr) {
            await fb.deleteDocument('notificaciones', n.id)
        }
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

function processMessages (data) {
    const notiArray = []
    data.forEach(noti => {
        // <a href="tel:1234567890">1234567890</a>.
        const regTel = /@T(.*?)@/gm
        noti.Mensaje = noti.Mensaje.replace(regTel, ($0, $1) => {
            const replaceStr = '<a href="tel:' + $1 + '">' + $1 + '</a>'
            return replaceStr
        })
        const regLink = /@L(.*?)@/gm
        noti.Mensaje = noti.Mensaje.replace(regLink, ($0, $1) => {
            const replaceStr = '<a href="' + $1 + '">' + $1 + '</a>'
            return replaceStr
        })
        noti.forDelete = false
        notiArray.push(noti)
    })
    const sorted = notiArray.sort((a, b) => b.fhEmision - a.fhEmision)
    const maxArray = sorted.slice(0, 20)
    return maxArray
}
// function InitFCM () {
//    fb.initFCM(srvAcc)
// }
async function getToken () {
    const token = await fb.getFCMToken('BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP - CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4')
    console.log('CRA client token:', token)
}
async function subscribeToTopic () {
    const result = await fb.subscribeToTopic(state.document, 'AAAAc787IoI:APA91bHogsWCGsk8LDJvjUTstI1k0bRvnC2G21wzrg93mCr_6bARKS5xoD45br-zDwvC-lh8-4mkAs9kVn0am2VjbZ2soBDMUs7Kj9K_II19AHkP_u3CZYN47xajg4Z_NLHb8wNM9t87')
    console.log('CRA client subscribeToTopic:', state.document)
    return result
}
