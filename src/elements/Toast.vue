<template>
    <transition name="fade">
        <div class="toast" :class="[ type ]" v-if="visible">
            <div class="content">
                <slot name="content"></slot>
            </div>
            <i class="icon fi fi-close-a" @click="visible = false"></i>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'Toast',
    props: {
        duration: {
            type: Number,
            default: 2500
        },
        type: {
            type: String,
            default: 'default',
            validator: t => [ 'error', 'success', 'default' ].includes(t)
        }
    },
    data: () => ({
        visible: false
    }),
    mounted() {
        this.show();
    },
    methods: {
        show() {
            this.visible = true;
            this.$emit('visible');
            setTimeout(() => {
                this.visible = false;
                this.$emit('hidden');
            }, this.duration);
        }
    }
}
</script>

<style scoped>
.toast {
    display: flex;
    position: fixed;
    top: 0; left: 50%;
    width: 600px;
    max-width: 90%;
    margin: 2vh 0;
    padding: 10px 20px;
    background: #bdc3c7;
    color: black;
    z-index: 100;
    transform: translateX(-50%);
    transition: all .2s ease-in-out;
    border-radius: 8px;
    box-shadow: 0px 10px 20px -17px #000;
    flex-wrap: nowrap;
    align-items: center;
}

.toast.success {
    background: #27ae60;
    color: white;
}

.toast.error {
    background: #e74c3c;
    color: white;
}

.toast .content {
    flex-grow: 1;
}

.toast .icon {
    cursor: pointer;
}

.fade-enter, .fade-leave-to {
    visibility: hidden;
    opacity: 0;
}
</style>