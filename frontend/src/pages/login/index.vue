<template>
    <div class="backLogin">
        <img src="images/cra.png" class="logo">
        <div class="grdLogin">
            <q-input type="number" filled v-model="dni" label="Ingrese documento" @keyup.enter="validateDocument" class="doc" />
            <q-btn color="blue-10" icon="login" @click="validateDocument" class="login" :disable="!dni" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import { ui } from 'fwk-q-ui'

const router = useRouter()

const dni = ref(appStore.state.document)

onMounted(async () => {
    if (dni.value) validateDocument()
})
const validateDocument = async () => {
    appStore.set.document(dni.value)
    const data = await appStore.actions.validateUser()
    if (data.length) {
        router.go(-1)
    } else {
        ui.actions.notify('DNI no encontrado. Por favor comunicarse con CRA Asociados.', 'error')
    }
}
</script>

<style scoped lang="scss">
.logo {
    position: absolute;
    top: 10%;
    right: 0;
    left: 0;
    margin: auto;
    width: 70vw;
    max-width: 500px;
}

.backLogin {
    background: linear-gradient(#a9b0ff, #303294);
    margin: 0;
    padding: 0;
}

.grdLogin {
    display: grid;
    grid-template-columns: 1fr 50px;
    height: 100vh;
    align-items: center;
    width: 300px;
    margin: auto;
    column-gap: 10px;
}

.doc {
    margin: auto;
    width: 100%;
    background-color: #d2d2d2
}

.login {
    height: 50px;
}

.body--dark {
    .doc {
        color: rgb(255, 255, 255);
        background-color: #505050;
    }
}
</style>
