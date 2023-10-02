<template>
    <div class="infoFrame">
        <q-toggle :modelValue="mode" checked-icon="nightlight_round" color="#2572b0" :label="label" unchecked-icon="light_mode" @update:modelValue="changeMode">
        </q-toggle>
    </div>
</template>

<script setup>
const emit = defineEmits(['change'])
const props = defineProps({
    mode: Boolean,
    label: String
})

const changeMode = (val) => {
    emit('change', val)
}
</script>

<style lang="scss" scoped>
.infoFrame {
    padding-top: 5px;
    min-width: 145px;
    text-align: center;
}
</style>
