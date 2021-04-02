<template>
    <div class="container">
        <img class="logo" src="images/logo.svg"/>
        <h1>👋 Welcome to MyKeys!</h1>
        <span class="separator transparent"></span>
        <p>MyKeys is a simple web app to <b>manage your passwords</b>. It works by uploading and downloading an <b>encrypted file</b>, so the web app does not store any data on any server. Everything happens in your browser.</p>
        <span class="separator"></span>

        <div class="menu">
            <p>To start, select your encrypted file o create a new one:</p>
            <div class="row">
                <div class="five columns">
                    <button class="button-primary" @click.prevent="loadFile">Upload file</button>
                </div>
                <div class="two columns">
                    <p style="padding-top: 4px">or</p>
                </div>
                <div class="five columns">
                    <button @click="createFile">Create new file</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FileAPI from '@/lib/file';
import EventBus from '@/lib/eventbus';

export default {
    name: 'Home',
    methods: {
        async loadFile() {
            try {
                const encrypted = await FileAPI.open();
                const password = await FileAPI.requestPassword();
                const data = await FileAPI.decrypt(encrypted, password);
                this.$router.push({ name: 'manager', params: { data }});
            } catch (error) {
                EventBus.$emit('error', 'Something was wrong... ' + error);
            }
        },
        createFile() {
            const data = [{
                "alias": "Example credentials",
                "username": "myusername",
                "password": "mys3cr3tp4ssw0rd",
                "description": "http://myservi.ce/login"
            }];
            this.$router.push({ name: 'manager', params: { data }});
        }
    }
}
</script>

<style scoped>
    .container {
        text-align: center; 
        margin-top: 10vh;
    }

    .logo { 
        max-height: 10vh;
        margin: 16px 0;
    }
    
    .separator {
        display: inline-block;
        width: 80%;
        height: 1px;
        margin: 16px 10%;
        background: #ccc;
    }

    .separator.transparent { background: transparent; }

    .menu {
        display: inline-block; 
        width: 100%;
        max-width: 500px;
    }
</style>