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
                const password = prompt('Enter your password:');
                if (password) {
                    EventBus.$emit('info', 'Encryping content and downloading...');
                    const encrypted = await FileAPI.encrypt(this.data, password);
                    this.save(encrypted);
                } else EventBus.$emit('error', 'You must to enter a password.');
            } catch (error) {
                console.error(error);
                EventBus.$emit('error', 'Something was wrong generating the file... ;(');
            }
        },
        save(content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            this.$refs.download.setAttribute('href', url);
            this.$refs.download.setAttribute('download', 'passwords.txt');
            this.$refs.download.click();
        }
    }
}
</script>