<template>
  <div>
    <v-row v-if="data" class="mt-5 mb-5 elevation-3">
      <v-col cols="12" md="12">
        <plotly
          :displayModeBar="false"
          :data="data"
          :layout="layout"/>
      </v-col>
      <v-col cols="12" class="ml-5">
        <span class="ml-5 caption">{{ caption }}</span>
        <v-btn @click="download(data, downloadTitle)" x-small class="ml-3 primary">Data</v-btn>
      </v-col>      
    </v-row>
  </div>
</template>
  
<script>
  import { DateTime } from 'luxon'
  
  function exportCSVFile(data, fileTitle) {
    let colums={}
    let series = data.filter(v => !v.noexport) 
    series.forEach((ser, serIndex) => {
      ser.x.forEach((x, dataIndex) => {
        if (!colums[x]) {
          let xVal = x
          if ((typeof x) == 'string') {
            xVal = DateTime.fromISO(x)
          }
          colums[x] = {x: xVal, xRaw: x, ys: new Array(data.length)}
        }
        colums[x].ys[serIndex] = ser.y[dataIndex]
      })
    })

    let sorted = Object.values(colums).sort((a, b) => a.x - b.x)
    let csv = 'Series,' + sorted.map(e => e.xRaw).join(',') + '\n'
    for (let i = 0; i < series.length; i++) {
      csv += series[i].name + ', ' + sorted.map(e => e.ys[i]).join(',') + '\n'
    }
  
    let exportedFilename = fileTitle + '.csv' || 'export.csv'
  
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
  
  export default {
    name: 'ChartCard',
    components: {
      Plotly: () => import(/* webpackChunkName: "plotly" */ '@/components/shared/Plotly.vue')
    },
    props: {
      data: Array,
      layout: Object,
      caption: String,
      downloadTitle: String
    },
    data () {
      return {}
    },
    computed: {
    },
    mounted () {
      if (this.month) {
        this.generate()
      }
    },
    methods: {
      download(data, name){
        exportCSVFile(data, name)
      }
    },
    watch: {
    }
  }
</script>