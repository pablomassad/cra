<template>
    <div class="backIntegralmente">
        <div class="uploader">
            <q-icon name="person" size="lg"></q-icon>
            <div class="iconText">CLIENTES (csv)</div>
        </div>
        <div class="uploader">
            <q-icon name="mail"></q-icon>
            <div class="iconText">MENSAJES (csv)</div>
        </div>
        <ProgBarLoader v-if="ui.state.loaderOps.type === 'progressBar'" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProgBarLoader from 'fwk-q-progressbar'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'

onMounted(async () => {

})
</script>

<style scoped>
.uploader {
    border-radius: 20px;
    height: 100px;
    width: 300px;
    background: #00669a;
    color: white;
    font-size: 22px;
    font-weight: bold;
    text-shadow: 1px 1px 1px black;
    text-align: center;
    padding: 10px;
    margin: 20px auto;
    box-shadow: 3px 3px 8px black;
}
</style>
