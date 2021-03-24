<template>
    <div class="container">
        <h1>👋 Welcome to MyKeys!</h1>
        <span class="separator transparent"></span>
        <p>MyKeys is a simple webapp to <b>manage your passwords</b>. It works uploading and downloading an <b>encrypted file</b>, so the webapp does not stores any data in any server. Everything happens in your browser.</p>
        <span class="separator"></span>

        <div class="menu">
            <p>To start, select your encrypted file o create a new one:</p>
            <div class="row">
                <div class="five columns">
                    <button class="button-primary" @click.prevent="openUploader">Upload file</button>
                    <input type="file" ref="file" style="display: none;" @change="loadFile"/>
                </div>
                <div class="two columns"><p style="padding-top: 4px">or</p></div>
                <div class="five columns"><button @click="createFile">Create new file</button></div>
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
        openUploader() {
            const input = this.$refs.file;
            input.click();
        },
        async loadFile(event) {
            try {
                if (event.target.files.length === 0) throw 'No file selected';

                const file = event.target.files[0];
                const encrypted = await FileAPI.read(file);
                
                const password = prompt('Enter your password.');
                if (password !== null) {
                    const data = await FileAPI.decrypt(encrypted, password);
                    
                    this.$router.push({ name: 'manager', params: { data }});
                } else throw 'You must to enter a password.'
            } catch (error) {
                this.$refs.file.value = '';
                console.error(error);
                EventBus.$emit('error', 'Something was wrong... Have you entered the correct password?');
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