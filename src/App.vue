<template>
    <div>
        <router-view></router-view>
        <Popup/>
    </div>
</template>

<script>
import Popup from '@/components/Popup'

export default {
    name: 'App',
    components: { Popup }
}
</script>