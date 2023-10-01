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
const actions = {
    setDocument (doc) {
        console.log('store setDocument:', doc)
        state.document = doc
    },
    setSelVehiculo (v) {
        console.log('store setSelVehiculo:', v)
        state.selVehiculo = v
    },
    setUserData (data) {
        console.log('store setUserData:', data)
        state.userData = data
    },
    setFieldsOrder (fo) {
        console.log('store setFieldsOrder:', fo)
        state.fieldsOrder = fo
    },
    setNotificaciones (msgs) {
        console.log('store setNotificaciones:', msgs)
        state.notificaciones = msgs
    },
    async getDataByUser () {
        ui.actions.showLoading()
        const res = await fb.getDocument('opciones', 'polizas')
        actions.setFieldsOrder(res.orden)

        const data = await fb.getCollectionFlex('clientes', { field: 'Documento', op: '==', val: state.document })
        if (data?.length) {
            actions.setUserData(data)
        } else {
            ui.actions.notify('El usuario no existe!. Pruebe con otro documento.', 'error')
        }
        ui.actions.hideLoading()
        return data
    },
    async getNotificacionesByUser () {
        ui.actions.showLoading()
        const data = await fb.getCollectionFlex('notificaciones', { field: 'N De documento', op: '==', val: state.document })
        if (data?.length) {
            actions.setNotificaciones(data)
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
    state: readonly(state),
    actions
}
