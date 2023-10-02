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

        <input type="file" ref="refFileClients" @change="onUploadClients" style="display:none" />
        <input type="file" ref="refFileNoti" @change="onUploadNotifications($event)" style="display:none" />

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'

const refFileClients = ref()
const refFileNoti = ref()

onMounted(async () => {
    ui.actions.setTitle('Backoffice')
})

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
