<template>
    <Box class="generated-url">
        <template v-slot:content>
            <div class="content">
                <div class="header">
                    <i class="icon fi fi-check"></i>
                    <h3 class="title">Success!</h3>
                    <p class="text">Click on the following button to copy your encrypted password URL. Share or save the link as a bookmark to use your encrypted passwords later!</p>
                </div>

                <Button class="copy primary" @click="copy">
                    <i class="fi left fi-copy"></i> Copy my password URL!
                </Button>
                <small class="link">
                    <router-link :to="{ name: 'decrypt', params: { blob }}">Open now</router-link>
                </small>
            </div>
        </template>
        <template v-slot:extra>
            <div class="extra">
                <h4 class="title">How it works?</h4>
                <p class="text">The URL contains an unreadable string of characters containing your encrypted passwords. So your data remains in the URL and not on any server.</p>

                <div class="url">
                    <span class="domain" data-label="Our application">{{ origin }}</span>
                    <span class="path" data-label="Your passwords">{{ path }}</span>
                </div>
            </div>
        </template>
    </Box>
</template>

<script>
import Box from '@/elements/Box';
import Button from '@/elements/Button';

export default {
    name: 'GeneratedUrl',
    props: {
        blob: {
            type: String,
            required: true
        }
    },
    computed: {
        origin() {
            const { origin } = window.location;
            return origin + '/';
        },
        path() {
            const { href } = this.$router.resolve({ name: 'manager', params: { blob: this.blob }});
            return href;
        }
    },
    methods: {
        async copy() {
            try {
                const url = this.origin + this.path;
                await navigator.clipboard.writeText(url);
                this.$emit('copied');
            } catch (error) {
                this.$emit('error', error);
            }
        }
    },
    components: { Box, Button }
}
</script>

<style scoped>
.generated-url {
    display: block;
    margin: 20px auto;
    max-width: 600px;
    width: 96%;
    text-align: center;
}

.generated-url .content {
    padding: 3vh 20px;
}

.generated-url .header {
    display: block;
}

.generated-url .header .icon {
    color: #27ae60;
    font-size: 3em;
    margin: 2vh 0;
}

.generated-url .header .title {
    margin: 2vh 0
}

.generated-url .header .text {
    margin: 2vh 0;
    font-size: .9em;
}

.generated-url .copy {
    display: block;
    margin: 3vh auto 1vh;
}

.generated-url .link a {
    color: #222;
}

.generated-url .extra {
    padding: 1vh 2vw;
    font-size: .8em;
    text-align: left;
    color: #555;
}

.generated-url .extra .title {
    font-weight: normal;
    margin: 1vh 0 6px;
    font-size: 1.05em;
}

.generated-url .extra .url {
    display: flex;
    vertical-align: top;
    width: 98%;
    height: auto;
    margin: 2vh 1%;
    overflow: auto;
}

.generated-url .extra .url span:after {
    content: attr(data-label);
    display: block;
    background: inherit;
    font-size: .8em;
    margin-top: 4px;
}


.generated-url .extra .url .domain {
    color: #777;
}

.generated-url .extra .url .path {
    flex-grow: 1;
    font-weight: normal;
}
</style>