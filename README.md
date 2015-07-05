ArcheoloP4
===========

Referecnce: [ArcheoloGit](https://github.com/marmelab/ArcheoloGit)

This is similiar to ArcheoloGit but for perforce

Where should you focus the maintenance efforts? ArcheoloGit is a visualization of age and dev activity for software, powered by d3.js.


* clone the project

```sh
    git clone https://github.com/saquibkhan/ArcheoloP4.git
    cd ArcheoloP4
```

* install server dependencies using Bower

```sh
bower install
```

* run the `run.sh` script with the path of the project you want to analyze as argument.

```sh
./run.sh /depot path
```

* run a simple local server on the root, for instance with SimpleHttpServer:

```sh
# Python 2.7
python -m SimpleHTTPServer
# Python 3
python -m http.server
```

* browse to the index, for instance [http://0.0.0.0:8000/](http://0.0.0.0:8000/) if you use SimpleHttpServer

![angular.js ArcheoloGit](http://marmelab.com/ArcheoloGit/angularjs.png)