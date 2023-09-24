import { reactive, readonly } from 'vue'
import axios from 'redaxios'
import fb from 'src/boot/firebase'

const state = reactive({
})
const actions = {

}

export default {
    state: readonly(state),
    actions
}
