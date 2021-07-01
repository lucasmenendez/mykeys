<template>
    <div>
        <Jumbo v-bind="{ picture, title, description }">
            <template v-slot:menu>
                <Button @click="$router.push({ name: 'faq' })">FAQ</Button>
            </template>
        </Jumbo>
        
        <QuickStart/>
    </div>
</template>

<script>
import Button from '@/elements/Button';

import Jumbo from '@/components/Jumbo';
import QuickStart from '@/components/QuickStart';

export default {
    name: 'Home',
    data: () => ({
        picture: 'images/logo-white.svg',
        title: '👋 Welcome to MyKeys!',
        description: 'MyKeys is a simple web app to <b>manage collections of passwords as bookmarks</b>. It transforms your <b>encrypted passwords into a long url</b> that you can add to bookmarks to open it later or share with your friends.'
    }),
    components: { Button, Jumbo, QuickStart }
}
</script>