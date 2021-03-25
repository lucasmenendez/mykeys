<template>
    <div>
        <a href="" ref="download" style="display: none"/>
        <button class="button-primary" @click="download">
            <i class="fi fi-download"></i>
            Save & Download
        </button>
    </div>
</template>

<script>
import FileAPI from '@/lib/file';
import EventBus from '@/lib/eventbus';

export default {
    name: 'Download',
    props: {
        data: {
            type: Array,
            required: true
        }
    },
    methods: {
        async download() {
            try {
                const password = await FileAPI.requestPassword();
                const encrypted = await FileAPI.encrypt(this.data, password);
                await FileAPI.save(encrypted);
            } catch (error) {
                EventBus.$emit('error', 'Something was wrong... ' + error);
            }
        }
    }
}
</script>