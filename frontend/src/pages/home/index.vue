<template>
    <div class="backIntegralmente" v-if="appStore.state.userData?.length">
        <!--<q-carousel v-model="slide" transition-prev="jump-right" transition-next="jump-left" swipeable animated control-color="gray" prev-icon="arrow_left" next-icon="arrow_right" navigation-icon="radio_button_unchecked" navigation padding arrows class="text-gray shadow-4 rounded-borders carousel" @change="onChange">-->
        <q-carousel v-model="slide" transition-prev="jump-right" transition-next="jump-left" swipeable animated control-color="black" navigation-icon="radio_button_checked" navigation class="carousel" @change="onChange">

            <q-carousel-slide v-for="v in appStore.state.userData" :key="v" name="v.Patente">
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
                <CardList :objectToMap="v" split defValue='' class="cardList" no-padding>
                </CardList>
            </q-carousel-slide>
        </q-carousel>

        <div class="notificaciones">
            <q-btn round color="primary" icon="mail" class="btnMensajes" @click="gotoMensajes"></q-btn>
            <div class="contadorMensajes" v-if="appStore.state.notificaciones?.length > 0">{{ appStore.state.notificaciones?.length }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from '../appStore'
import { useRouter } from 'vue-router'
import CardList from 'src/components/fwk-q-cardlist/index.vue'

const router = useRouter()
const slide = ref(appStore.state.userData[0].Patente)

onMounted(async () => {
    ui.actions.setTitle('Informacion')
    await appStore.actions.getNotificacionesByUser()
    appStore.actions.updateNotifications('fhRecepcion')
})
const onCarSelected = (v) => {
    appStore.actions.setSelVehiculo(v)
    router.push('/poliza')
}
const gotoMensajes = () => {
    router.push('/notificaciones')
}
const onChange = (ev) => {
    console.log('onChange slide:', ev)
}
</script>

<style scoped>
.cardList {
    border-right: none;
    max-width: 600px;
    max-height: calc(100vh - 227px);
    overflow: auto;
    margin: auto;
    border-radius: 20px;
    box-shadow: 2px 2px 10px #555;
}

.carousel {
    height: calc(100vh - 50px);
    background: #b8b0de;
}

.grdTitle {
    display: grid;
    grid-template-columns: 1fr 120px 1fr;
    justify-items: center;
    padding-top: 16px;
}

.patViejaImg {
    width: 130px;
    border-radius: 5px;
}

.patVieja {
    position: relative;
    top: -56px;
    left: 0px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    font-size: 31px;
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
</style>
