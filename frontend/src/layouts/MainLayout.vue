<template>
    <Layout>
        <template #drawer>
            <div class="menuRow">
                <q-icon name="update" class="iconMenu" />
                <div class="rowText" @click="searchUpdates()">Buscar actualización</div>
            </div>
            <q-separator />
            <div class="menuRow">
                <q-icon name="logout" class="iconMenu" />
                <div class="rowText" @click="logout()">Salir</div>
            </div>
            <q-separator />
        </template>
    </Layout>

    <ConfirmDialog v-if="prompt" :prompt="prompt" :message="dialogMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
</template>

<script setup>
import { ref } from 'vue'
import Layout from './fwk-q-layout/index.vue'
import appStore from 'src/pages/appStore'
import ConfirmDialog from 'fwk-q-confirmdialog'
import { ENVIRONMENTS } from 'src/environments'
import { LocalStorage } from 'quasar'

const prompt = ref(false)
const dialogMessage = ref('')
const onAcceptDialog = ref()
const onCancelDialog = ref()

const searchUpdates = () => {
    if (ENVIRONMENTS.versionName < appStore.state.config.version) {
        prompt.value = true
        dialogMessage.value = 'Hay una nueva version de la aplicación, desea instalarla?'
        onAcceptDialog.value = async () => {
            window.open(ENVIRONMENTS.url, '_system')
        }
        onCancelDialog.value = () => {
            prompt.value = false
        }
    }
}
const logout = () => {
    LocalStorage.set('CRA_currUser', '')
    window.location.reload()
}
</script>

<style scoped>
.menuRow {
    display: flex;
    align-items: center;
    margin: 10px;
}

.rowText {
    font-size: 15px;
    color: gray;
}

.iconMenu {
    font-size: 26px;
    text-shadow: 1px 1px 1px gray;
    margin-right: 10px;
    color: purple
}
</style>
