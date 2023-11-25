<template>
    <div class="backIntegralmente">
        <div style="position: relative" v-if="appStore.state.settings">
            <div class="uploader" @click="uploadClients" :class="{btnDisabled: clientsDisabled}">
                <q-icon name="person" size="lg"></q-icon>
                <div class="iconText">CLIENTES (csv)</div>
            </div>
            <div class="btnFrame">
                <div class="abm">
                    <div style="color:green">A:{{ `${appStore.state.altas.cnt}/${appStore.state.altas.total}` }}</div>
                    <div style="color:red">B:{{ `${appStore.state.bajas.cnt}/${appStore.state.bajas.total}` }}</div>
                    <div style="color:cornflowerblue">M:{{ `${appStore.state.mods.cnt}/${appStore.state.mods.total}` }}</div>
                </div>
            </div>
            <div class="rowFile filename">
                <div>{{ appStore.state.settings.clientsFilename }}</div>
                <div>{{ moment(appStore.state.settings.clientsDatetime).format('DD/MM/YY HH:mm') }}</div>
                <div>A:{{ appStore.state.settings.clientsAdded }}</div>
                <div>B:{{ appStore.state.settings.clientsDeleted }}</div>
                <div>M:{{ appStore.state.settings.clientsModified }}</div>
            </div>
        </div>
        <div style="position: relative">
            <div class="uploader" @click="uploadNotifications" :class="{btnDisabled: notificationsDisabled}">
                <q-icon name="mail"></q-icon>
                <div class="iconText">MENSAJES (csv)</div>
            </div>
            <div class="btnFrame">
                <div v-if="notificationsDisabled" class="monitor">
                    {{ pushStatus.progress }} / {{ pushStatus.total }}
                    <q-linear-progress :value="notiVal" color="green" class="q-mt-xs" />
                    <q-linear-progress :value="msgVal" color="blue" class="q-mt-xs" />
                </div>
            </div>
        </div>
        <div>
            <div class="title">Gráfico de Notificaciones</div>
            <div ref="refChart" style="position: relative;" v-if="chartEnabled"></div>
            <div class="refreshButton" @click="refreshStats">
                <q-icon name="refresh" class="refreshIcon"></q-icon>
            </div>
            <div class="legendFrame">
                <div class="legend" :style="{background: colorEnviados}"></div>
                <div class="legendText">Enviados</div>
                <div class="legend" :style="{background: colorRecibidos}"></div>
                <div class="legendText">Recibidos</div>
                <div class="legend" :style="{background: colorLeidos}"></div>
                <div class="legendText">Leidos</div>
            </div>
        </div>

        <input type="file" ref="refFileClients" @change="onUploadClients" style="display:none" accept=".csv" />
        <input type="file" ref="refFileNoti" @change="onUploadNotifications" style="display:none" accept=".csv" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import * as d3 from 'd3'
import { useRouter } from 'vue-router'

const router = useRouter()

const refFileClients = ref()
const clientsDisabled = ref(false)
const clientsStatus = ref({ progress: 0, total: 0 })

const refFileNoti = ref()
const notificationsDisabled = ref(false)
const pushStatus = ref({ progress: 0, total: 0 })
const notiStatus = ref({ progress: 0, total: 0 })
const msgStatus = ref({ progress: 0, total: 0 })

const cliVal = computed(() => {
    const result = (clientsStatus.value.progress === 0) ? 0 : (clientsStatus.value.progress / clientsStatus.value.total)
    return result
})
const notiVal = computed(() => {
    const result = (notiStatus.value.progress === 0) ? 0 : (notiStatus.value.progress / notiStatus.value.total)
    return result
})
const msgVal = computed(() => {
    const result = (msgStatus.value.progress === 0) ? 0 : (msgStatus.value.progress / msgStatus.value.total)
    return result
})

const chartEnabled = ref(false)
const refChart = ref()
const colorEnviados = '#166498'
const colorRecibidos = '#639bbf'
const colorLeidos = '#b3c0c8'

onMounted(async () => {
    await appStore.actions.getSettings()
    validateUser()
})
const refreshStats = async () => {
    chartEnabled.value = false
    const now = new Date()
    now.setHours(0)
    const notiStat = await appStore.actions.statNotificationsFromDate(now.getTime())
    const totEmitidos = notiStat.filter(x => x.fhEmision).length
    const totRecibidos = notiStat.filter(x => x.fhRecepcion).length
    const totLeidos = notiStat.filter(x => x.fhLectura).length
    chartEnabled.value = true
    setTimeout(() => {
        drawPie([totEmitidos, totRecibidos, totLeidos])
    }, 10)
}
const drawPie = (data) => {
    // d3.select('.notiPie').remove()
    console.log('drawPie:', data)
    const total = data[0] + data[1] + data[2]
    const percents = data.map(x => x * 100 / total)

    const width = 300
    const height = 300
    const radius = Math.min(width, height) / 2

    const colorScale = d3.scaleOrdinal()
        .domain(data.map((_, i) => i))
        .range([colorEnviados, colorRecibidos, colorLeidos])

    const svg = d3.select(refChart.value)
        .append('svg')
        .attr('style', 'position:absolute;right:0;left:0;margin:auto;filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.5));')
        .attr('width', width)
        .attr('height', height)
        // .attr('id', 'notiPie')
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

    const arc = d3.arc()
        .innerRadius(80)
        .outerRadius(radius)

    const pie = d3.pie()
        .value(d => d)

    const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc')

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(i))

    arcs.append('text')
        .attr('stroke', 'white')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => d.data)
}
const uploadClients = () => {
    refFileClients.value.click()
}
const onUploadClients = async (e) => {
    const file = e.target.files[0]
    clientsDisabled.value = true
    refFileClients.value.value = ''
    await appStore.actions.processClientes(file)
    clientsDisabled.value = false
    // await appStore.actions.uploadFile(file, 'clientes.csv')
    // appStore.actions.monitorStatus('clientes', clientsStatus)
}
const uploadNotifications = () => {
    refFileNoti.value.click()
}
const onUploadNotifications = async (e) => {
    const file = e.target.files[0]
    refFileNoti.value.value = ''
    notificationsDisabled.value = true
    await appStore.actions.uploadFile(file, 'notificaciones.csv')
    appStore.actions.monitorStatus('notificaciones', notiStatus)
    appStore.actions.monitorStatus('mensajes', msgStatus)
}
const validateUser = async () => {
    if (!appStore.state.pass) {
        router.push('/login')
    } else {
        await appStore.actions.subscribeToFCM()
        refreshStats()
    }
}

watch(() => appStore.state.processFinished, (newVal) => {
    console.log('watch finish process:', newVal)
    if (newVal) {
        if (clientsDisabled.value) {
            console.log('watch finish clients')
            clientsDisabled.value = false
            appStore.actions.finishStatus('clientes')
            clientsStatus.value.progress = 0
        }
        if (notificationsDisabled.value) {
            console.log('watch finish notifications')
            notificationsDisabled.value = false
            appStore.actions.finishStatus('mensajes')
            notiStatus.value.progress = 0
            msgStatus.value.progress = 0
            refreshStats()
        }
    }
})
watch(() => notiStatus.value.progress, (newProgress) => {
    console.log('watch progress:', newProgress)
    pushStatus.value = notiStatus.value
})
watch(() => msgStatus.value.progress, (newProgress) => {
    console.log('watch mensajes:', newProgress)
    console.log('watch mensajes total:', msgStatus.value.total)

    pushStatus.value = msgStatus.value
    if (newProgress === msgStatus.value.total - 1) {
        console.log('processFinished = TRUE')
        appStore.set.processFinished(true)
    }
})
watch(() => appStore.state.pass, (newPass) => {
    console.log('watch pass:', newPass)
    validateUser()
})
</script>

<style lang="scss" scoped>
.rowFile {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.btnFrame {
    position: absolute;
    top: 76px;
    left: 0px;
    right: 0px;
}

.abm {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    color: #0082cf;
    font-size: 15px;
    font-weight: bold;
    width: 280px;
    margin: auto;
    margin-top: 14px;
    text-align: center;
}

.filename {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #1c7293;
}

.monitor {
    color: #0082cf;
    font-size: 13px;
    width: 250px;
    margin: auto;
    text-align: center;
}

.btnDisabled {
    opacity: 0.5;
    pointer-events: none;
}

.refreshButton {
    z-index: 10000;
    position: relative;
    top: 115px;
    border-radius: 50%;
    background: radial-gradient(farthest-corner at 0% 0%, rgb(191, 216, 251), rgb(20, 85, 170));
    border: 2px solid #e2f3ff;
    box-shadow: 2px 2px 10px gray;
    width: 70px;
    height: 70px;
    margin: auto;
}

.refreshButton:active {
    box-shadow: inset 3px 3px 10px;
    border: none;
}

.refreshIcon {
    font-size: 45px;
    text-shadow: 1px 1px 2px gray;
    padding: 12px;
    color: #bdd6ff;
}

.legendFrame {
    position: relative;
    display: grid;
    grid-template-columns: 30px 1fr 30px 1fr 30px 1fr;
    column-gap: 5px;
    align-items: center;
    width: 350px;
    margin: auto;
    padding-top: 260px;
    padding-left: 16px;
}

.legendText {
    font-weight: bold;
    font-size: 17px;
    color: #075d92;
}

.legend {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 1px 1px 4px gray;
}

.enviados {
    background-color: lightblue;
}

.recibidos {
    background-color: rgb(152, 90, 188);
}

.leidos {
    background-color: rgb(0, 213, 43);
}

.title {
    font-size: 25px;
    font-weight: bold;
    text-align: center;
    margin: 50px 0 20px;
    color: #1b4b99;
    text-shadow: 1px 1px 1px white;
}

.chart {
    margin: auto;
    position: absolute;
    right: 0;
    left: 0;
    filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.5));
}

.uploader {
    position: relative;
    border: 3px solid #1c6ae6;
    border-radius: 20px;
    height: 124px;
    width: 300px;
    background: #c7ecff;
    color: #0082cf;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    padding: 10px;
    margin: 30px auto 10px;
    box-shadow: 3px 3px 8px #8c8a8a;
}

.uploader:active {
    box-shadow: inset 1px 1px 3px;
    padding-top: 12px;
}

.body--dark {
    .uploader {
        background: #8aa4b1;
        color: #ace0ff;
        box-shadow: none;
    }

    .title {
        color: #e9edf3;
        text-shadow: 1px 1px 1px #5c85f1;
    }

    .legendText {
        color: #e7eaeb;
    }
}
</style>
