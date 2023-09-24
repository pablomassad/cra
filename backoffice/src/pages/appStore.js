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
    }
}

export default {
    state: readonly(state),
    actions
}
