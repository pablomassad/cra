<template>
    <div class="backIntegralmente">
        <q-pull-to-refresh v-if="appStore.state.notificaciones" @refresh="refresh">
            <div class="listFrame">
                <div v-for="v in appStore.state.notificaciones" :key="v" class="noti">
                    <div class="mensaje">
                        <div class="fechahora">{{ moment(v.fhEmision).format('DD/MM/YYYY HH:mm') }}</div>
                        <div class="msgText" v-html="v.Mensaje"></div>
                    </div>
                </div>
            </div>
        </q-pull-to-refresh>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'

onMounted(async () => {
    appStore.actions.updateNotifications('fhLectura')
})
const refresh = async (done) => {
    setTimeout(() => {
        done()
    }, 1000)
}
</script>

<style scoped>
.delAllBar {
    background: #934293;
    display: flex;
    color: white;
    font-size: 18px;
    align-items: center;
    padding-left: 16px;
}

.delIcon {
    position: absolute;
    top: 4px;
    right: 60px;
    font-size: 40px;
    text-shadow: 1px 1px 1px gray;
    color: rgb(255 207 255);
    z-index: 100000;
}

.noti {
    display: flex;
    align-items: center;
}

.tituloCliente {
    font-size: 22px;
    font-weight: bold;
}

.listFrame {
    position: relative;
    padding: 16px;
    margin: auto;
    width: auto;
}

.fechahora {
    text-align: right;
    font-style: italic;
    font-weight: bold;
}

.mensaje {
    background-color: white;
    color: #555;
    border-radius: 10px;
    box-shadow: 1px 1px 3px gray;
    padding: 8px;
    margin: 8px;
}

.mensaje:active {
    background-color: rgb(229, 229, 229);
    box-shadow: inset 2px 2px 5px gray;
}

.msgText {
    text-align: justify;
    padding: 10px 0;
}
</style>
