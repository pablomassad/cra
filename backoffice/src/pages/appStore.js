import { reactive, readonly } from 'vue'
import axios from 'redaxios'
import { professionals } from 'src/pages/professionals'
import fb from '../boot/firebase'

let srv

const state = reactive({
    staff: professionals,
    users: [],
    config: { lat: -33.92, lng: -60.59 },
    userDates: [],
    currentDate: undefined,
    currentTrack: []
})
const actions = {
    async init () {
        srv = await axios.create()
        state.users = [...state.staff]
        state.users.unshift({
            photo: 'PGV',
            name: 'Pablo Alberto Massad',
            profession: 'Ingeniero',
            topic: 'PAM'
        })
        console.log('staff:', state.staff)
        console.log('users:', state.users)
    },
    setUserDates (dates) {
        console.log('store setUserDates:', dates)
        state.userDates = dates
    },
    setCurrentDate (d) {
        console.log('store setCurrentDate:', d)
        state.currentDate = d
    },
    setCurrentTrack (coords) {
        console.log('store setCurrentTrack:', coords)
        state.currentTrack = coords
    },
    async getUserDates (usr) {
        const res = await fb.getCollection(`userTracks/${usr}/trackDates`)
        actions.setUserDates(res)
    },
    async getCurrentTrack (usr, userDate) {
        console.log('store getCurrentTrack:', usr, userDate)
        actions.setCurrentDate(userDate)
        const res = await fb.getCollection(`userTracks/${usr}/trackDates/${userDate}/coords`)
        actions.setCurrentTrack(res)
    },
    async command (topic, cmd, args) {
        console.log('store command:', topic, cmd)
        const p0 = `topic=${topic}`
        const p1 = `&cmd=${cmd}`
        const p2 = `&args=${args}`
        srv.get(`https://us-central1-pp-integralmente.cloudfunctions.net/command?${p0}${p1}${p2}`)
    }
}

export default {
    state: readonly(state),
    actions
}
