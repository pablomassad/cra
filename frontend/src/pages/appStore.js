import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'

const state = reactive({
    document: undefined,
    selVehiculo: undefined,
    userData: undefined,
    notificaciones: undefined,
    fieldsOrder: undefined
})
const set = {
    document (doc) {
        console.log('store setDocument:', doc)
        state.document = doc
    },
    vehiculo (v) {
        console.log('store setSelVehiculo:', v)
        state.selVehiculo = v
    },
    userData (ud) {
        console.log('store setUserData:', ud)
        state.userData = ud
    },
    fieldsOrder (fo) {
        console.log('store setFieldsOrder:', fo)
        state.fieldsOrder = fo
    },
    notificaciones (msgs) {
        console.log('store setNotificaciones:', msgs)
        state.notificaciones = msgs
    }
}
const actions = {
    async getDataByUser () {
        ui.actions.showLoading()
        const res = await fb.getDocument('opciones', 'polizas')
        set.fieldsOrder(res.orden)

        const dataArr = await fb.getCollectionFlex('clientes', { field: 'Documento', op: '==', val: state.document })
        const arr = []
        if (dataArr?.length) {
            dataArr.forEach((doc, i) => {
                delete doc.id
                const o = {}
                state.fieldsOrder.forEach(f => {
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
        if (data?.length) {
            set.notificaciones(data)
        } else {
            ui.actions.notify('No hay nuevas notificaciones', 'info')
        }
        ui.actions.hideLoading()
    },
    async updateNotifications (field) {
        console.log('store updateNotifications:', field)
        for (const n of state.notificaciones) {
            if (!n[field]) {
                n[field] = new Date().getTime()
                await fb.setDocument('notificaciones', n, n.id)
            }
        }
    }
}

export default {
    set,
    state: readonly(state),
    actions
}
