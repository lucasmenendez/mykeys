<template>
     <div class="table">
        <div class="row" v-for="(row, index) in rows" :key="JSON.stringify(row)">
            <div class="column" v-for="column in columns" :key="column.key" :data-label="column.key">
                <slot name="cell" v-bind="{ index, row, column }"></slot>
            </div>
            <div 
                class="column"
                v-if="$scopedSlots.action" 
                :data-label="actionsLabel">
                <slot name="action" v-bind="{ index, item: row }"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Table',
    props: {
        columns: {
            type: Array,
            required: true
        },
        rows: {
            type: Array,
            required: true
        },
        actionsLabel: {
            type: String,
            default: 'actions'
        }
    }
}
</script>

<style scoped>
.table {
    display: inline-block;
    vertical-align: top;
    width: 96%;
    margin: 20px 2%;
    padding: 10px 20px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0px 10px 20px -15px #000;
}

.table .row {
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    border-bottom: 1px solid #ddd;
}

.table .row:last-child {
    border: none;
}

.table .row .column {
    flex-grow: 1;
    padding: 5px 0;
}

.table .row:first-child {
    position: relative;
    margin-top: 36px;
    border-top: 1px dashed #ddd;
}

.table .row:first-child .column:before {
    content: attr(data-label);
    position: absolute;
    top: -36px;
    width: auto;
    height: 36px;
    line-height: 36px;
    text-transform: capitalize;
    font-size: .9em;
}


@media screen and (max-width: 1080px) {
    .table {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        border: none;
        box-shadow: none;
    }

    .table .row, 
    .table .row:last-child {
        display: inline-block;
        width: auto;
        flex-grow: 1;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 1vh 1vw;
        padding: 20px 10px 10px;
        box-shadow: 0px 10px 20px -15px #000;
    }

    .table .row .column {
        display: block;
    }

    .table .row:first-child {
        margin-top: 1vh;
        border-top: 1px solid #ddd;;
    }

    .table .row:first-child .column:before,
    .table .row .column:before {
        content: attr(data-label);
        position: relative;
        display: block;
        top: auto;
        height: auto;
        line-height: initial;
        text-transform: capitalize;
        font-size: .75em;
        margin: 0 10px;
        padding: 0;
        color: #999;
        border: none;
    }

    .table .row .column[data-label="actions"] {
        text-align: right;
    }

    .table .row .column[data-label="actions"]:before {
        display: none;
    }
}
</style>