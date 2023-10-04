import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'

const state = reactive({
    document: undefined,
    notificaciones: undefined
})
const set = {
    document (doc) {
        console.log('store setDocument:', doc)
        state.document = doc
    },
    opciones (ops) {
        console.log('store set.opciones:', ops)
        state.opciones = ops
    }
}
const actions = {
    async updateFieldsOrder (fieldsOrder) {
        await fb.setDocument('opciones', fieldsOrder, 'config')
    },
    async sendNotificacions () {
        console.log('store sendNotificacions:', state.notificaciones.length)
        ui.actions.showLoading({
            type: 'progressBar',
            color: 'blue',
            timeout: state.notificaciones.length * state.opciones.backoffice.fcmDelay
        })
        for (const msg in state.notificaciones) {
            await fb.sendMessage(state.document, 'CRA Aviso', msg)
            await sleep(state.opciones.backoffice.fcmDelay)
        }
        ui.actions.hideLoading()
    },
    async deleteCollection () {
        console.log('store deleteCollection')
        console.time('deleteCol')
        await fb.emptyCollection('clientes')
        console.timeEnd('deleteCol')
    },
    async insertCollection (col, data) {
        console.log('store insertCollection')
        console.time('createCol')
        await fb.batchInsert(col, data)
        console.timeEnd('createCol')
    },
    async getOpciones () {
        const res = await fb.getDocument('opciones', 'backoffice')
        set.opciones(res)
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
