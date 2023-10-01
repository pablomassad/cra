<template>
    <div :class="(split) ? 'row no-wrap' : 'column'" class="justify-between square q-gutter-sm" :style="{padding: (noPadding) ? '4px 10px' : '10px'}">
        <div class=" text-subtitle2 text-weight-bold cardListLabel">{{ title }}</div>
        <div :class="(split) ? 'text-right' : 'text-left'" class="text-caption text-weight-medium multipleLines cardListVal">{{ description }}</div>
    </div>
</template>

<script setup>
const props = defineProps(['title', 'description', 'split', 'noPadding'])
</script>

<style lang="scss" scoped>
.multipleLines {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
}

.cardListVal {
    color: #757575;
}

.cardListLabel {
    color: #2572b0;
}

.body--dark {
    .cardListLabel {
        color: #3197EB
    }

    .cardListVal {
        color: white;
    }
}
</style>
