<template>
    <div class="backIntegralmente">
        <div class="tituloCliente">{{ appStore.state.userData[0].nombre }}</div>
        <br />
        <div class="listFrame">
            <div v-for="v in appStore.state.notificaciones" :key="v">
                <div class="mensaje">
                    <div class="fechahora">{{ moment(v.fhEmision).format('DD/MM/YYYY HH:mm') }}</div>
                    <div class="msgText">{{ v.Mensaje }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'
import moment from 'moment'

onMounted(async () => {
    ui.actions.setTitle('Mensajes')
    appStore.actions.updateNotifications('fhLectura')
})
</script>

<style scoped>
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
}

.mensaje {
    background-color: white;
    color: #555;
    border-radius: 10px;
    box-shadow: 1px 1px 3px gray;
    padding: 8px;
    margin: 8px;
}

.msgText {
    text-align: justify;
    padding: 10px 0;
}
</style>
