<template>
    <div class="backIntegralmente" v-if="appStore.state.userData?.length">
        <q-carousel v-model="activeIndex" transition-prev="jump-right" transition-next="jump-left" swipeable animated control-color="blue-8" navigation class="carousel" @change="onChange">
            <q-carousel-slide v-for="(v, i) in appStore.state.userData" :key="i" :name="v.Patente">
                <div class="grdTitle">
                    <div></div>
                    <div v-if="v.Patente.length === 6">
                        <img src="images/patVieja.jpg" class="patViejaImg" />
                        <div class="patVieja">
                            <div>{{ v.Patente.substr(0, 3) }}</div>
                            <div>{{ v.Patente.substr(3, 3) }}</div>
                        </div>
                    </div>
                    <div v-if="v.Patente.length !== 6">
                        <img src="images/patNueva.png" class="patNuevaImg" />
                        <div class="patNueva">
                            <div>{{ v.Patente.substr(0, 2) }}</div>
                            <div>{{ v.Patente.substr(2, 3) }}</div>
                            <div>{{ v.Patente.substr(5, 2) }}</div>
                        </div>
                    </div>
                    <div></div>
                </div>
                <div class="title">POLIZA SEGURO AUTOMOTOR</div>
                <CardList :objectToMap="v" split defValue='' class="cardList" no-padding>
                </CardList>
            </q-carousel-slide>
        </q-carousel>

        <div class="notificaciones">
            <q-btn round color="blue-9" icon="mail" class="btnMensajes" @click="gotoMensajes"></q-btn>
            <div class="contadorMensajes" v-if="unreadCounter > 0">{{ unreadCounter }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import appStore from '../appStore'
import { useRouter } from 'vue-router'
import CardList from 'src/components/fwk-q-cardlist/index.vue'

const router = useRouter()
const activeIndex = ref(0)

const unreadCounter = computed(() => {
    if (!appStore.state.notificaciones) return 0
    const result = appStore.state.notificaciones.filter(x => !x.fhLectura)
    console.log('notificaciones leidas pendientes:', result.length)
    return result.length
})

console.log('HOME CONSTRUCTOR #########################')
onMounted(async () => {
    validateUser()
})
const gotoMensajes = () => {
    router.push('/notificaciones')
}
const onChange = (ev) => {
    console.log('onChange slide:', ev)
}
const validateUser = async () => {
    if (!appStore.state.document) {
        router.push('/login')
    } else {
        await appStore.actions.getSettings()
        const data = await appStore.actions.getDataByUser()
        activeIndex.value = data[0].Patente
        if (!appStore.fcmOK) { await appStore.actions.subscribeToFCM() }
        appStore.actions.getNotificacionesByUser()
    }
}

watch(() => appStore.state.document, (newdoc) => {
    console.log('watch document:', newdoc)
    validateUser()
})
</script>

<style scoped lang="scss">
.title {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 1px white;
    text-align: center;
}

.cardList {
    border-right: none;
    max-width: 600px;
    max-height: calc(100vh - 227px);
    overflow: auto;
    margin: auto;
    border-radius: 20px;
    box-shadow: 2px 2px 10px #555;
    padding-top: 16px;
}

.grdTitle {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: center;
    padding-top: 4px;
    height: 64px;
}

.patViejaImg {
    width: 130px;
    border-radius: 5px;
}

.patVieja {
    position: relative;
    top: -54px;
    left: 0px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    font-size: 28px;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 1px gray;
    color: #ffffff;
}

.patNuevaImg {
    width: 175px;
    border-radius: 5px;
}

.patNueva {
    position: relative;
    top: -53px;
    left: 0px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 10px;
    font-size: 31px;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 1px gray;
    color: rgb(45, 45, 45);
}

.carIcon {
    font-size: 30px;
    text-shadow: 1px 1px 3px gray;
    color: rgb(106, 60, 191);
}

.notificaciones {
    position: absolute;
    bottom: 20px;
    right: 20px;
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
    bottom: 27px;
    right: -7px;
}

.carousel {
    height: calc(100vh - 50px);
    background: #cacaca;
}

.body--dark {
    .carousel {
        background: #474747;
    }
}
</style>
