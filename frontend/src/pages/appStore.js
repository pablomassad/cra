import { reactive, readonly } from 'vue'
import axios from 'redaxios'
import fb from 'src/boot/firebase'

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
        const data = await fb.getCollectionByCriteria('clientes', 'documento', Number(state.document))
        actions.setUserData(data)
    },
    async getNotificacionesByUser () {
        const data = await fb.getCollectionByCriteria('notificaciones', 'documento', Number(state.document))
        actions.setNotificaciones(data)
    }
}

export default {
    state: readonly(state),
    actions
}
