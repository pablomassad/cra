<template>
    <div class="backIntegralmente" v-if="appStore.state.userData?.length && appStore.state.notificaciones?.length">
        <div class="tituloCliente">{{ appStore.state.userData[0].nombre }}</div>
        <div class="notificaciones">
            <q-btn color="primary" label="Mensajes" icon="mail" class="btnMensajes" @click="gotoMensajes"></q-btn>
            <div class="contadorMensajes">{{ appStore.state.notificaciones.length }}</div>
        </div>
        <br />
        <div class="listFrame">
            <div v-for="v in appStore.state.userData" :key="v">
                <q-btn color="primary" :label="`${v.marca}   /  ${v.dominio}`" icon="directions_car" @click="onCarSelected(v)" class="btnVehiculo"></q-btn>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from '../appStore'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
    ui.actions.setTitle('Informacion')
    appStore.actions.getDataByUser()
    appStore.actions.getNotificacionesByUser()
})
const onCarSelected = (v) => {
    appStore.actions.setSelVehiculo(v)
    router.push('/poliza')
}
const gotoMensajes = () => {
    router.push('/notificaciones')
}
</script>

<style scoped>
.notificaciones {
    position: relative;
    width: 300px;
    margin: auto;
}

.btnMensajes {
    width: 100%;
}

.btnVehiculo {
    position: relative;
    width: 300px;
    margin: auto;
}

.contadorMensajes {
    background-color: red;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    box-shadow: 1px 1px 3px gray;
    color: white;
    font-size: 12px;
    position: absolute;
    padding-left: 6px;
    top: -9px;
    left: 287px;
}
</style>
