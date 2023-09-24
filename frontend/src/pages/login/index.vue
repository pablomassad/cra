<template>
    <div class="backIntegralmente">
        <q-input outlined v-model="dni" label="Ingrese documento" @keyup.enter="validateDocument" />
        <q-btn color="primary" icon="login" @click="validateDocument" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'

const router = useRouter()

const dni = ref()

onMounted(async () => {
})
const validateDocument = () => {
    appStore.actions.setDocument(dni.value || 20005205)
    router.push('/home')
}
</script>

<style scoped></style>
