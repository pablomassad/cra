<template>
    <div class="backIntegralmente">
        <div class="tituloCliente">{{ appStore.state.userData[0].nombre }}</div>
        <br />
        <div v-for="v in appStore.state.notificaciones" :key="v">
            <div class="mensaje">
                {{ `${v.fechaEmision} ${v.mensaje}` }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'

onMounted(async () => {
    await appStore.actions.init()
})
</script>

<style scoped>
.tituloCliente {
    font-size: 22px;
    font-weight: bold;
}

.mensaje {
    background-color: green;
    border-radius: 10px;
    box-shadow: 1px 1px 3px gray;
    padding: 8px;
    margin: 8px;
}
</style>
