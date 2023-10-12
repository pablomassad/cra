import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'

const state = reactive({
    document: LocalStorage.getItem('CRA_doc'),
    selVehiculo: undefined,
    userData: undefined,
    notificaciones: undefined,
    opciones: undefined
})
const set = {
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
    opciones (ops) {
        console.log('store set.opciones:', ops)
        state.opciones = ops
    }
}
const actions = {
    async getToken () {
        const token = await fb.getFCMToken('BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP - CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4')
        console.log('CRA client token:', token)
    },
    async subscribeToTopic () {
        const result = await fb.subscribeToTopic(state.document, 'AAAAc787IoI:APA91bHogsWCGsk8LDJvjUTstI1k0bRvnC2G21wzrg93mCr_6bARKS5xoD45br-zDwvC-lh8-4mkAs9kVn0am2VjbZ2soBDMUs7Kj9K_II19AHkP_u3CZYN47xajg4Z_NLHb8wNM9t87')
        console.log('CRA client subscribeToTopic:', state.document)
        return result
    },
    async getOpciones () {
        const res = await fb.getDocument('opciones', 'config')
        set.opciones(res)
    },
    async validateUser () {
        const dataArr = await fb.getCollectionFlex('clientes', { field: 'Documento', op: '==', val: state.document })
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
                state.opciones.orden.forEach(f => {
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
    return notiArray
}
