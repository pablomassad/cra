<template>
    <div class="backIntegralmente">
        <div class="tituloCliente">{{ appStore.state.userData[0].nombre }}</div>
        <div class="notificaciones">
            <q-btn :label="Mensajes" icon="mail"></q-btn>
            <div class="contadorMensajes">{{ appStore.state.notificaciones.length }}</div>
        </div>
        <br />
        <div v-for="v in appStore.state.userData">
            <q-btn :label="`${v.marca} ${v.dominio}`" icon="directions_car" @click="onCarSelected(v)"></q-btn>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import appStore from '../appStore'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
    appStore.actions.getDataByUser(appStore.state.clientId)
    appStore.actions.getNotificacionesByUser(appStore.state.clientId)
})
const onCarSelected = (v) => {
    appStore.actions.setSelVehiculo(v)
    router.push('/poliza')
}
</script>

<style scoped>
.tituloCliente {
    font-size: 22px;
    font-weight: bold;
}

.notificaciones {
    width: 200px;
}

.contadorMensajes {
    background-color: red;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    box-shadow: 1px 1px 3px gray;
    color: white;
    font-size: 12px;
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>
