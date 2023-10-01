<template>
    <div class="backLogin">
        <img src="cra.png" class="logo">
        <div class="grdLogin">
            <q-input color="black" bg-color="white" filled v-model="dni" label="Ingrese documento" @keyup.enter="validateDocument" class="doc" />
            <q-btn color="warning" icon="login" @click="validateDocument" class="login" :disable="!dni" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import { LocalStorage } from 'quasar'

const router = useRouter()

const dni = ref(LocalStorage.getItem('currUser'))

onMounted(async () => {
    if (dni.value) validateDocument()
})
const validateDocument = async () => {
    appStore.set.document(dni.value)
    const data = await appStore.actions.getDataByUser()
    if (data.length) {
        LocalStorage.set('currUser', dni.value)
        router.push('/home')
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
    width: 220px;
    max-width: 500px;
}

.backLogin {
    background: linear-gradient(#5a00db, #f300bc);
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
