import { reactive, readonly } from 'vue'
import axios from 'redaxios'
import fb from 'src/boot/firebase'

const state = reactive({
    selVehiculo: undefined,
    vehiculos: undefined,
    notificaciones: undefined
})
const actions = {
    setSelVehiculo (v) {
        console.log('store setSelVehiculo:', v)
        state.selVehiculo = v
    },
    setVehiculos (data) {
        console.log('store setVehiculos:', data)
        state.vehiculos = data
    },
    setNotificaciones (msgs) {
        console.log('store setNotificaciones:', msgs)
        state.notificaciones = msgs
    },
    async getVehiculosByUser (dni) {
        const data = await fb.getCollectionByCriteria('clientes', 'dni', dni)
        actions.setVehiculos(res)
    },
    async getNotificacionesByUser (dni) {
        const data = await fb.getCollectionByCriteria('notificaciones', 'dni', dni)
        actions.setNotificaciones(res)
    }
}

export default {
    state: readonly(state),
    actions
}
