<template>
    <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { main } from 'fwk-quasar'
import { useRouter } from 'vue-router'
import { ENVIRONMENTS } from './environments'

const router = useRouter()

onMounted(() => {
    const pl = {
        info: {
            legajo: 'U506713',
            legajoCSG: '21SAD026',
            mockmode: false,
            isMobile: false,
            appname: 'cra',
            origApp: 'cra',
            tool: '/login'
        },
        data: {}
    }
    main.actions.init(ENVIRONMENTS, pl, true, true)
})

watch(() => main.state.info, async (newVal, oldVal) => {
    console.log('watch main.state.info...', newVal)
    router.push(newVal.tool)
})
</script>

<style scoped ></style >
