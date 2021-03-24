<template>
    <div :class="[ 'popup', style, showed ? 'showed' : '' ]">
        {{ msg }}
    </div>
</template>

<script>
import EventBus from '@/lib/eventbus'

export default {
    name: 'Popup',
    data: () => ({
        style: 'info',
        msg: '',
        showed: false
    }),
    mounted() {
        EventBus.$on('error', msg => this.show('error', msg));
        EventBus.$on('success', msg => this.show('success', msg));
        EventBus.$on('info', msg => this.show('info', msg));
    },
    methods: {
        show(style, msg) {
            this.style = style;
            this.msg = msg;
            
            this.showed = true;
            setTimeout(() => this.showed = false, 2000);
        }
    }
}
</script>

<style scoped>
.popup {
    position: fixed;
    bottom: 0; left: 0;
    display: block;
    width: 100%;
    padding: 15px 20px;
    box-sizing: border-box;
    box-shadow: 0px 0px 30px -15px black;
    
    visibility: hidden;
    opacity: 0;
    transition: all .2s ease-in-out;
    z-index: 10;
}

.popup.info {
    background: #2980b9;
    color: white;
}

.popup.success {
    background: #27ae60;
    color: white;
}

.popup.error {
    background: red;
    color: white;
}

.popup.showed {
    visibility: visible;
    opacity: 1;
}

</style>