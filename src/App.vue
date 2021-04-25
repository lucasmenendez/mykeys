<template>
    <Container>
        <Notification/>
        <router-view></router-view>
        <Credits/>
    </Container>
</template>

<script>
import Container from '@/elements/Container';

import Notification from '@/components/Notification';
import Credits from '@/components/Credits';

export default {
    name: 'App',
    components: { Container, Notification, Credits }
}
</script>

<style>
.fi.left { margin-right: 10px;}
.fi.right { margin-left: 10px;}
::-webkit-scrollbar {display: none;}
</style>