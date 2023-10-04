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
            <div ref="refChart" id="chart" style="position: relative;"></div>
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

const refChart = ref()
const colorEnviados = '#166498'
const colorRecibidos = '#639bbf'
const colorLeidos = '#b3c0c8'

onMounted(async () => {
    ui.actions.setTitle('Backoffice')
    drawPie()
})
const drawPie = () => {
    const data = [220, 200, 130]

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
const onUploadClients = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = async () => {
        const data = reader.result.split('\r\n')

        const orderStr = data[0]
        const orderArr = orderStr.split(';')
        console.log('OrderArray:', orderArr)

        const fieldsStr = data[1]
        const fieldsArr = fieldsStr.split(';')
        console.log('FieldsArray:', fieldsArr)

        const config = {
            orden: []
        }
        for (let i = 1; i <= orderArr.length; i++) {
            const idx = orderArr.indexOf(i.toString())
            config.orden.push(fieldsArr[idx])
        }
        await appStore.actions.updateFieldsOrder(config)
        data.shift() // borra Orden de campos
        data.shift() // borra cabecera del data

        await appStore.actions.deleteCollection()

        const clientesDocs = data.map((str, i) => {
            const valuesArray = str.split(';')
            const doc = {}
            fieldsArr.forEach((f, i) => {
                doc[f] = valuesArray[i]
            })
            return doc
        })
        await appStore.actions.insertCollection('clientes', clientesDocs)
    }
}
const uploadNotifications = () => {
    refFileNoti.value.click()
}
const onUploadNotifications = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = async () => {
        const data = reader.result.split('\r\n')

        const tmpStr = data[0]
        const tmpArr = tmpStr.split(';')

        const fieldsStr = data[1]
        const fieldsArr = fieldsStr.split(';')
        console.log('FieldsArray:', fieldsArr)

        data.shift() // borra cabecera del data
        data.shift() // borra campos tabla

        const notiDocs = data.map((str, i) => {
            const valuesArray = str.split(';')
            const doc = {
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

<style scoped>
.legendFrame {
    position: relative;
    display: grid;
    grid-template-columns: 30px 1fr 30px 1fr 30px 1fr;
    column-gap: 5px;
    align-items: center;
    width: 350px;
    margin: auto;
    padding-top: 330px;
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
</style>
