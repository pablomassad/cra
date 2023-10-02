<template>
    <div class="backIntegralmente" v-if="localData.Asegurado">
        <CardList :objectToMap="localData" split defValue=''>
            <template #header>
                <div class="grdTitle">
                    <div></div>
                    <q-icon name="directions_car" class="carIcon" />
                    <div class="title">{{ localData.Patente }}</div>
                    <div></div>
                </div>
            </template>
        </CardList>
        <!--<div class="listFrame">
            <q-btn color="primary" label="Descargar" icon="picture_as_pdf" @click="download" class="btnDownload"></q-btn>
        </div>-->
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import CardList from 'fwk-q-cardlist'
import appStore from 'src/pages/appStore'

const localData = ref({})

onMounted(async () => {
    ui.actions.setTitle('Póliza')
    const tmp = { ...appStore.state.selVehiculo }
    delete tmp.id
    appStore.state.opciones.orden.forEach((f, i) => {
        localData.value[f] = tmp[f]
    })
    console.log('localData:', localData.value)
})
</script>

<style scoped>
.grdTitle {
    display: grid;
    grid-template-columns: 1fr 50px 120px 1fr;
    width: 100%;
    justify-items: center;
    align-items: center;
}

.title {
    font-size: 25px;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 1px gray;
    margin: 20px 0;
}

.carIcon {
    font-size: 30px;
    text-shadow: 1px 1px 3px gray;
    color: rgb(106, 60, 191);
}

.polizaFrame {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: white;
    margin: 16px;
    padding: 16px;
    box-shadow: 1px 1px 5px gray;
    border-radius: 10px;
    row-gap: 10px;
    max-width: 600px;
    margin: auto 16px;
}

.label {
    color: primary;
    font-size: 14px;
    font-weight: 700;
}

.value {
    color: #757575;
    font-size: 0.75rem;
    text-align: right;
}

.btnDownload {
    width: 300px;
    margin: 20px auto;
    text-align: center;
}
</style>
