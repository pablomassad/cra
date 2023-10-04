<template>
    <q-layout view="lHh Lpr lFf" class="frameLayout">
        <q-header elevated class="tbxFrame">
            <q-toolbar>
                <q-icon v-show="!(isInitPage && isRoot)" name="arrow_back_ios" @click="onBack" />
                <q-toolbar-title :class="`title ${main.state.mockmode ? 'mockModeOn' : ''}`">
                    <slot name="title">
                        <div @click="showInfo" v-touch-swipe.mouse.right="setMockMode" class="text-h6 title">{{ ui.state.title }}</div>
                    </slot>
                </q-toolbar-title>
                <q-avatar color="grey" class="avatarInitials">
                    <q-icon name="person" class="avatarIcon" />
                    <slot name="states">
                    </slot>
                    <q-menu transition-show="jump-down" transition-hide="jump-up" fit style="width='200px'">
                        <q-item-section v-close-popup>
                            <toggle-dark-mode v-if="!disableDark" :mode="darkmode" label="Modo Oscuro" @change="toggleMode"></toggle-dark-mode>
                            <slot name="drawer">
                            </slot>
                            <div class="env">v{{ main.state.environment.versionName }}</div>
                        </q-item-section>
                    </q-menu>
                </q-avatar>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view v-slot="{Component}">
                <!--<transition name="slide" mode="out-in">-->
                <component :is="Component" :key="$route.path" />
                <!--</transition>-->
            </router-view>
            <!--<RouterView v-slot="{Component}">
                <Transition @enter="onEnter" @leave="onLeave" name="routes" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>-->
        </q-page-container>
        <ConfirmDialog :prompt="prompt" :message="dialogMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />

        <ProgBarLoader v-if="ui.state.loaderOps.type === 'progressBar'" />
        <ProgCounterLoader v-if="ui.state.loaderOps.type === 'progressCounter'" />
    </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { main } from 'fwk-quasar'
import { ui } from 'fwk-q-ui'
import { useRouter } from 'vue-router'
import ProgBarLoader from 'fwk-q-progressbar'
import ProgCounterLoader from 'fwk-q-progresscounter'
import ConfirmDialog from 'fwk-q-confirmdialog'
import ToggleDarkMode from './ToggleDarkMode.vue'
import { useQuasar } from 'quasar'
import SAF from 'fwk-q-saf'

const $q = useQuasar()
const props = defineProps({
    showSAF: {
        type: Boolean,
        default: false
    },
    disableDark: {
        type: Boolean,
        default: false
    },
    completeMsg: {
        type: String
    },
    isRoot: {
        type: Boolean,
        default: false
    }
})

const router = useRouter()
const prompt = ref(false)
const dialogMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()
const darkmode = ref()

const isInitPage = computed(() => router.currentRoute.value.path.indexOf(main.state.info?.tool) !== -1)

onMounted(() => {
    main.actions.setValidatePendings(async (to, from, next) => {
        const flag = await confirmBack()
        if (flag) next()
        else router.go(1)
    })
    main.actions.setNotifyInfo((res) => {
        const m = res?.info?.msg || res?.info?.message
        if (m) {
            console.log('Notify INFO:', m)
            ui.actions.notify(m, res.info.type)
            res = (res.info.data) ? res.info.data : (res.info.type !== 'error')
        }
        return res
    })
    main.actions.setNotifyCatch((error) => {
        console.log('Notify ERROR:', error)
        ui.actions.notify(error.message, 'error')
    })
    const isActive = $q.localStorage.getItem('darkMode')
    const flag = (isActive == null ? false : isActive)
    toggleMode(flag)
})
const toggleMode = (val) => {
    $q.dark.set(val)
    darkmode.value = val
    $q.localStorage.set('darkMode', val)
}
const onBack = async () => {
    if (isInitPage.value) {
        main.actions.exitApplication()
    } else {
        console.log('ui.state.preventBack:', ui.state.preventBack.toString())
        const res = await confirmBack()
        if (res) router.go(-1)
    }
}
const confirmBack = () => {
    return new Promise((resolve) => {
        if (ui.state.preventBack) {
            prompt.value = true
            dialogMessage.value = ui.state.dialogMessage
            onAcceptDialog.value = () => {
                prompt.value = false
                ui.actions.setPreventBack(false)
                resolve(true)
            }
            onCancelDialog.value = () => {
                prompt.value = false
                resolve(false)
            }
        } else { resolve(true) }
    })
}
const showInfo = () => {
    const msg = `${main.state.userInfoMsg?.username} / ${main.state.userInfoMsg?.usernameCSG} / v${main.state.environment.versionName} / ${main.state.environment.environment}`
    ui.actions.notify(msg, 'info')
}
const setMockMode = () => {
    main.actions.setMockMode()
    ui.actions.notify(`mockMode ${main.state.mockmode ? 'activado' : 'desactivado'}`, 'info')
}
</script>

<style lang="scss" scoped>
.avatarIcon {
    color: #004bb8;
    font-size: 35px;
}

.avatarInitials {
    margin: 0 -5px 0 10px;
    background: radial-gradient(gray, #aaa);
    box-shadow: inset 1px 1px 2px #616161;
    color: white;
    font-size: 36px;
    font-weight: bold;
    letter-spacing: -1px;
    text-shadow: 1px 1px 1px black;
    width: 37px;
    height: 37px;
}

.env {
    padding: 5px;
    font-size: 16px;
    text-align: center;
    color: $toolbox-primary;
}

.title {
    text-align: center;
    font-weight: bold;
    padding: 0px;
    display: flex;
}

.mockModeOn {
    color: #aaa;
}

.tbxFrame {
    background: -webkit-linear-gradient(#2c328f, #1f6bc2) !important;
    font-size: 2rem;
}

.tbxFrameNew {
    //background: -webkit-linear-gradient(#2675b5, #004f7d) !important;
    background: #2572B0;
}

.body--light {
    .frameLayout {
        //background: -webkit-radial-gradient(#fff, #737373 115%) !important;
        background: lightgray;
    }
}

.body--dark {
    .frameLayout {
        //background: -webkit-radial-gradient(#fff, #737373 115%) !important;
        background: #0a0a0a;
    }
}
</style>
