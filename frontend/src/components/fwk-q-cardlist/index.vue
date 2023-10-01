<template>
    <q-card class="q-ma-sm q-pa-sm editCard" :style="{borderRight: isEditCard ? `7px solid ${editCardColor}` : 'none'}" @click="emit('change', objectToMap)">
        <slot name="header"></slot>
        <div v-for="(value, key, idx) in localData" :key="key">
            <CardItem :title="key" :description="value" :split="split" :defValue="defValue" :noPadding="noPadding" />
            <q-separator v-show="(idx < len) && !noSeparator" />
        </div>
        <!--<q-separator />-->
        <div v-if="errorMsg" class="otError">{{ errorMsg }}</div>
        <slot name="extra"> </slot>
    </q-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import CardItem from './CardItem.vue'

const emit = defineEmits(['change'])
const props = defineProps({
    objectToMap: {
        type: Object,
        required: true
    },
    split: {
        type: Boolean,
        default: false
    },
    noSeparator: {
        type: Boolean,
        default: false
    },
    noPadding: {
        type: Boolean,
        default: false
    },
    defValue: {
        type: String,
        default: undefined
    },
    errorMsg: {
        type: String,
        default: ''
    },
    isEditCard: {
        type: Boolean,
        default: false
    },
    editCardColor: {
        type: String,
        default: '#ff6d00'
    }
})

const localData = ref({})
const len = ref(0)

onMounted(() => {
    console.log('props.objectToMap:', props.objectToMap)
    processObjToMap()
})
const processObjToMap = () => {
    for (const key in props.objectToMap) {
        const value = props.objectToMap[key]
        if ((value !== undefined) || props.defValue) {
            localData.value[key] = value || props.defValue
        }
    }
    len.value = Object.keys(localData.value).length - 1
}
watch(() => props.objectToMap, (newVal) => {
    processObjToMap()
})
</script>

<style lang="scss" scoped>
.q-dark {
    background: #272727;
}

.otError {
    color: rgb(164, 1, 1);
    font-weight: bold;
    text-align: center;
    font-size: 15px;
    background: lightgray;
    border-radius: 5px;
    margin: 0 auto;
    margin-top: 5px;
    padding: 2px;
}

.editCard {}
</style>
