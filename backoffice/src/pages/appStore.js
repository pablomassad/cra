import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'src/boot/firebase'

const MSG_DELAY = 1

const state = reactive({
    document: undefined,
    notificaciones: undefined
})
const actions = {
    setDocument (doc) {
        console.log('store setDocument:', doc)
        state.document = doc
    },
    async sendNotificacions () {
        console.log('store sendNotificacions:', state.notificaciones.length)
        ui.actions.showLoading({
            type: 'progressBar',
            color: 'blue',
            timeout: state.notificaciones.length * MSG_DELAY
        })
        for (const msg in state.notificaciones) {
            await fb.sendMessage(state.document, 'CRA Aviso', msg)
            await sleep(MSG_DELAY)
        }
        ui.actions.hideLoading()
    }
}

export default {
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
