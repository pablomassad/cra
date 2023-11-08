<template>
    <div class="backLogin">
        <img src="images/cra.png" class="logo">
        <div class="grdLogin">
            <q-input color="black" bg-color="white" type="text" filled v-model="pass" label="Ingrese constraseña" @keyup.enter="validate" class="doc" />
            <q-btn color="blue-10" icon="login" @click="validate" class="login" :disable="!pass" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import { ui } from 'fwk-q-ui'

const router = useRouter()

const pass = ref(appStore.state.pass)

onMounted(async () => {
    if (pass.value) validate()
})
const validate = async () => {
    appStore.set.pass(pass.value)
    const data = await appStore.actions.validateUser()
    if (data) {
        router.go(-1)
    } else {
        ui.actions.notify('Contraseña incorrecta', 'error')
    }
}
</script>

<style scoped>
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
}

.login {
    height: 50px;
}
</style>
