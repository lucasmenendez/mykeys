<template>
    <Container>
        <router-view></router-view>
        <Credits/>
    </Container>
</template>

<script>
import Credits from '@/components/Credits';

import Container from '@/elements/Container';

export default {
    name: 'App',
    components: { Container, Credits }
}
</script>

<style>
.fi.left { margin-right: 10px;}
.fi.right { margin-left: 10px;}
</style>