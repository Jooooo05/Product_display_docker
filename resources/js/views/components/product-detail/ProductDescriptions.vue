<script setup>
const props = defineProps({
    content: {
        type: String,
        default: "",
    },
});
</script>

<template>
    <div>
        <p
            class="v-col-lg-10 px-0 mb-0 text-h6 text-lightText"
            style="white-space: pre-line"
        >
            {{ props.content }}
        </p>
    </div>
</template>
