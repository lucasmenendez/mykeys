<template>
    <div>
        <div>
            <img src="images/logo.svg" width="150"/>
            <h1>👋 Welcome to MyKeys!</h1>
            <p>MyKeys is a simple web app to <b>manage collections of passwords as bookmarks</b>. It transforms your <b>encrypted passwords into a long url</b> that you can add to bookmarks to open it later.</p>
        </div>
        
        <h5>Instructions</h5>
        <ol>
            <li>
                <span>First you need to create a new collection to start storing your passwords:</span>
                <CreateCollection @created="data => $router.push({ name: 'manager', params: { data }})">Create new collection</CreateCollection>
            </li>
        </ol>
    </div>
</template>

<script>
import CreateCollection from '@/components/CreateCollection'

export default {
    name: 'Home',
    components: { CreateCollection }
}
</script>