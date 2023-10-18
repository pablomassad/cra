<template>
    <div class="backIntegralmente">
        <div class="uploader" @click="uploadClients">
            <q-icon name="person" size="lg"></q-icon>
            <div class="iconText">CLIENTES (csv)</div>
        </div>
        <div class="uploader" @click="uploadNotifications">
            <q-icon name="mail"></q-icon>
            <div class="iconText">MENSAJES (csv)</div>
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

        <input type="file" ref="refFileClients" @change="onUploadClients" style="display:none" />
        <input type="file" ref="refFileNoti" @change="onUploadNotifications($event)" style="display:none" />

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'
import * as d3 from 'd3'

const refFileClients = ref()
const refFileNoti = ref()

const chartEnabled = ref(false)
const refChart = ref()
const colorEnviados = '#166498'
const colorRecibidos = '#639bbf'
const colorLeidos = '#b3c0c8'

onMounted(async () => {
    // ui.actions.setTitle('Backoffice')
    refreshStats()
    await appStore.actions.subscribeToFCM()
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
    await appStore.actions.uploadFile(file, 'clientes.csv')
}
const uploadNotifications = () => {
    refFileNoti.value.click()
}
const onUploadNotifications = async (e) => {
    const file = e.target.files[0]
    await appStore.actions.uploadFile(file, 'notificaciones.csv')
}
const onUploadNotificationsOld = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = async () => {
        const data = reader.result.split('\r\n')

        const fieldsStr = data[0]
        const fieldsArr = fieldsStr.split(';')
        console.log('FieldsArray:', fieldsArr)

        data.shift() // borra cabecera del data

        const notiDocs = data.map((str, i) => {
            const valuesArray = str.split(';')
            const doc = {
                id: new Date().getTime(),
                fhEmision: new Date().getTime()
            }
            fieldsArr.forEach((f, i) => {
                doc[f] = valuesArray[i]
            })
            return doc
        })
        console.log('notiDocs array created:', notiDocs)
        await appStore.actions.insertCollection('notificaciones', notiDocs)
    }
}
</script>

<style lang="scss" scoped>
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
    border: 3px solid rgb(28, 106, 230);
    border-radius: 20px;
    height: 100px;
    width: 300px;
    background: #c7ecff;
    color: #0082cf;
    font-size: 22px;
    font-weight: bold;
    /* text-shadow: 1px 1px 1px black; */
    text-align: center;
    padding: 10px;
    margin: 20px auto;
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
