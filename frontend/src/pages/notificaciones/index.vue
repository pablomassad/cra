<template>
    <div class="backIntegralmente frame">
        <!--<q-pull-to-refresh @refresh="refresh" style="height: 100px;">-->
        <div class="listFrame" v-if="appStore.state.notificaciones.length">
            <div v-for="v in appStore.state.notificaciones" :key="v" class="noti">
                <div class="mensaje">
                    <div class="fechahora">{{ moment(v.fhEmision).format('DD/MM/YYYY HH:mm') }}</div>
                    <div class="msgText" v-html="v.Mensaje"></div>
                </div>
            </div>
        </div>
        <div v-else class="noData">
            Por el momento no hay notificaciones!
        </div>
        <!--</q-pull-to-refresh>-->
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'

onMounted(async () => {
    refreshNotifications()
})
const refresh = async (done) => {
    refreshNotifications()
    setTimeout(() => {
        done()
    }, 1000)
}
const refreshNotifications = async () => {
    console.log('refreshNotifications update fhLectura')
    await appStore.actions.getNotificacionesByUser()
    await appStore.actions.updateNotifications('fhLectura')
}
</script>

<style scoped lang="scss">
.noData {
    position: absolute;
    left: 0;
    right: 0;
    /*border: 1px solid rgb(64, 64, 64);*/
    border-radius: 20px;
    height: 150px;
    width: 300px;
    background: #c7ecff;
    color: #0082cf;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    padding: 42px 10px;
    margin: 150px auto;
    box-shadow: inset 3px 3px 8px #8c8a8a;
    text-shadow: 1px 1px 1px white;
}

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
    align-items: center;
    width: 100%;
    max-width: 600px;
    margin: auto;
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

.frame {
    height: calc(100vh - 50px);
    overflow: auto;
    background-color: lightgray;
}

.body--dark {
    .frame {
        background-color: rgb(103, 103, 103);
    }

    .mensaje {
        background-color: black;
        color: white;
    }
}
</style>
