<template>
    <a v-if="sku" :href="thanos_route" target="_blank">
        <p class="thanos">Open in Thanos</p>
    </a>
    <a v-if="!sku">
        <p class="thanos">SKU is Null</p>
    </a>
</template>

<script>
import { ref, watch } from 'vue';
import { createDirectus, rest, readItem, updateItem } from '@directus/sdk';

export default {
    props: {
        route: {
            type: String,
            default: '',
        },
        primaryKey: {
            type: [String, Number],
            default: '',
        },
        collection: {
            type: String,
            default: '',
        }
    },
    emits: ['input'],
    setup(props, { emit }) {
        const itemData = ref(null);
        const sku = ref('');
        const thanos_route = ref('');

        const fetchData = async () => {
            const client = createDirectus('http://0.0.0.0:8055/').with(rest());
            const result = await client.request(readItem(props.collection, props.primaryKey));
            sku.value = result.sku;

            if (sku.value) {
                const formattedValue = sku.value.split('').join('/');
                thanos_route.value = `https://www.redirect/${props.collection}/${formattedValue}/${sku.value}/.com`;

                await client.request(updateItem(props.collection, props.primaryKey, { thanos_route: thanos_route.value }));
            } else {
                thanos_route.value = '';
            }
        };

        watch(() => props.primaryKey, fetchData);
        watch(() => props.collection, fetchData);

        return {
            itemData,
            sku,
            thanos_route,
        };
    },
};
</script>

<style scoped>
.thanos {
    padding: 15px;
    background-color: #336aea;
    border-radius: 5px;
    margin-top: 10px;
    transition: transform 1s ease;
    display:flex;
    justify-content: center;
    align-items: center;
}
.thanos:hover {
    background-color: #2d5ac3
}
</style>