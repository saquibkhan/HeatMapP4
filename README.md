HeatMapP4
===========

####Purpose
Where should you focus the maintenance efforts? HeatMapP4 is a visualization of age and dev activity for software, powered by d3.js.

####Legends
1. Block size specifies the number of changelists, larger the area means ,ore changes done
2. Color goes from red to green depending on tha last change date, if changed recently then block will be shown as red
3. Each block can represent a file or folder based on depth chosen

####Usage
```sh
npm install heatmap-p4 -g
heatmap-p4 depotPath [--clear-cache] [--exclude] [exclude patterns]
```

Browse to [http://0.0.0.0:8000/](http://0.0.0.0:8000/)


Referecnce: [ArcheoloGit](https://github.com/marmelab/ArcheoloGit)


![angular.js ArcheoloGit](http://marmelab.com/ArcheoloGit/angularjs.png)