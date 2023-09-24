<template>
    <div class="backIntegralmente">

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'


onMounted(async () => {
    await appStore.actions.init()
})
</script>

<style scoped></style>
