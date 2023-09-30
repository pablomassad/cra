import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'

const state = reactive({
    document: undefined,
    selVehiculo: undefined,
    userData: undefined,
    notificaciones: undefined
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
    setNotificaciones (msgs) {
        console.log('store setNotificaciones:', msgs)
        state.notificaciones = msgs
    },
    async getDataByUser () {
        ui.actions.showLoading()
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
        const data = await fb.getCollectionFlex('notificaciones', { field: 'Documento', op: '==', val: state.document })
        if (data?.length) {
            actions.setNotificaciones(data)
        } else {
            ui.actions.notify('No hay nuevas notificaciones', 'info')
        }
        ui.actions.hideLoading()
    }
}

export default {
    state: readonly(state),
    actions
}
