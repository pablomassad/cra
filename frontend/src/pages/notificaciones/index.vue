<template>
    <div class="backIntegralmente">
        <div class="tituloCliente">{{ appStore.state.userData[0].nombre }}</div>
        <br />
        <div class="listFrame">
            <div v-for="v in appStore.state.notificaciones" :key="v">
                <div class="mensaje">
                    <div class="fechahora">{{ v.fhEmision }}</div>
                    <div class="msg">{{ v.Mensaje }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'

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

.mensaje {
    background-color: rgb(76, 144, 76);
    border-radius: 10px;
    box-shadow: 1px 1px 3px gray;
    padding: 8px;
    margin: 8px;
}
</style>
