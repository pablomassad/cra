<template>
    <div class="backIntegralmente">

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'

onMounted(async () => {
    await appStore.actions.init()
})
</script>

<style scoped></style>
