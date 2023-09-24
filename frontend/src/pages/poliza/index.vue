<template>
    <div class="backIntegralmente">
        <div class="tituloPoliza">Datos de POLIZA</div>
        <div class="polizaFrame">
            <div class="label">Asegurado</div>
            <div class="value">{{ pol.nombre }}</div>
            <div class="label">Compañia</div>
            <div class="value">{{ pol.compania }}</div>
            <div class="label">Poliza</div>
            <div class="value">{{ pol.poliza }}</div>
            <div class="label">Vigencia</div>
            <div class="value">{{ `${pol.fechaInicio} - ${pol.fechaVto}` }}</div>
            <div class="label">Vehiculo</div>
            <div class="value">{{ `${pol.marca} - ${pol.modelo}` }}</div>
            <div class="label">Tipo</div>
            <div class="value">{{ pol.tipo }}</div>
            <div class="label">Año</div>
            <div class="value">{{ pol.año }}</div>
            <div class="label">Patente</div>
            <div class="value">{{ pol.dominio }}</div>
            <div class="label">Cobertura</div>
            <div class="value">{{ pol.cobertura }}</div>
            <div class="label">Suma asegurada</div>
            <div class="value">{{ pol.sumaAsegurada }}</div>
            <div class="label">Uso</div>
            <div class="value">{{ pol.uso }}</div>
            <div class="label">Vencimiento de cuotas</div>
            <div class="value">{{ pol.vencimientos }}</div>
        </div>
        <q-btn label="Descargar" icon="picture_as_pdf" @click="download"></q-btn>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'

const pol = appStore.state.selVehiculo

onMounted(async () => {

})
</script>

<style scoped>
.tituloPoliza {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}

.polizaFrame {
    margin: 8px;
    padding: 8px;
    box-shadow: 1px 1px 5px gray;
    border-radius: 10px;
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
</style>
