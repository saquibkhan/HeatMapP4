var fs = require('fs');
var os = require('os');
var debug = require('debug')('main');
var Liner = require('./liner');
var P4Filter = require('./p4Filter');
var path = require('path');
var http = require("http");
var url = require('url');

var depotPath = '';
var dataFile = path.resolve(__dirname, 'datas.csv');
var tmpAllFiles = path.resolve(__dirname, 'files.txt');
var tmpAllChanglists = path.resolve(__dirname, 'changes.txt');

debug('Process Arg: ' + process.argv);

debug(dataFile);
debug(tmpAllFiles);
debug(tmpAllChanglists);

var exec = require('child_process').exec;

var changeDesc = {};
var excludeFilters = [];

if (!process.argv[2])
{
  console.log('Usage:');
  console.log('heatmap-p4 depotPath [--clear-cache] [--exclude] [exclude patterns]');
  process.exit();
}
else
{
  depotPath = process.argv[2] + '...';
  debug('depotPath: ' + depotPath);
}

if (process.argv[3] && process.argv[3] === '--clear-cache')
{
  console.log('removing cache...');
  removeFile(dataFile);
  removeFile(tmpAllFiles);
  removeFile(tmpAllChanglists);
}
else
{
  console.log('Using existing cache');
}

if (process.argv[3] && process.argv[3] === '--exclude')
{
  processFilters(4);
}
else if (process.argv[4] && process.argv[4] === '--exclude')
{
  processFilters(5);
}

function processFilters(index)
{
  debug('processing filters');
  while (process.argv[index])
  {
    excludeFilters.push(process.argv[index].toLowerCase());
    index++;
  }
  debug('exclude filters: ' + excludeFilters);
}

function removeFile(file)
{
  if (fs.existsSync(file))
  {
    fs.unlinkSync(file);
  }
}

console.log('Please Wait...');

fs.exists(dataFile, function(exists){
  if (!exists)
  {
    var headerLine = 'date,commits,filePath' + os.EOL;
    fs.writeFile(dataFile, headerLine, {'flag': 'w+'}, function (err) {
      if (err)
      {
        debug(err);
      }
    });

    fs.exists(tmpAllFiles, function(exists){
      if (!exists)
      {
        GenereateFilePath();
      }
      else
      {
        FetchChangeLists();
      }
    });
  }
  else
  {
    RunServer();    
  }
});



function GenereateFilePath()
{
  debug('Generating files...');
  var filesWriteStream = fs.createWriteStream(tmpAllFiles);
  var spawn = require('child_process').spawn,
  ls = spawn('p4', ['files', depotPath]);
  var liner = new Liner();
  var p4Filter = new P4Filter({excludeFilters: excludeFilters.length > 0? excludeFilters: null});
  ls.stdout
  .pipe(liner)
  .pipe(p4Filter)
  .pipe(filesWriteStream);

  ls.stderr.on('data', function (data) {
    debug('stderr: ' + data);
  });

  ls.on('close', function (code) {    
    FetchChangeLists();
  });
}


function FetchChangeListsInternal()
{
  debug('Fetching changelists...');

  var liner = new Liner();
  var spawn = require('child_process').spawn,
  ls = spawn('p4', ['changes', '-s', 'submitted', depotPath]);
  ls.stdout.pipe(liner);

  var datePattern = /[0-9]*\/[0-9]*\/[0-9]*/;
  var changePattern = /Change ([0-9]*)/;

  liner.on('readable', function () {
    var line = '';
    while (line = liner.read())
    {
      var changeMatch = changePattern.exec(line);
      var dateMatch = datePattern.exec(line);

      if (changeMatch && changeMatch[1])
      {
        if (dateMatch && dateMatch[0])
        {
          changeDesc[changeMatch[1]] = dateMatch[0];
        }
      }
    }
  });

  ls.stderr.on('data', function (data) {
    debug('stderr: ' + data);
  });

  ls.on('close', function (code) {

    var data = JSON.stringify(changeDesc);
    fs.writeFile(tmpAllChanglists, data, {'flag':'w+'}, function(err){
      if (err)
      {
        debug('Changelist write error: ' + err);
        return;
      }
      debug('Changelists cached');
      ProcessFiles();
    })    
  });
}

function FetchChangeLists()
{
  
  fs.exists(tmpAllChanglists, function(exists){
    if (exists)
    {
      //Read From File
      fs.readFile(tmpAllChanglists, function(err, data){
        if (err)
        {
          debug('Changelist Read error: ' + err);
        }
        changeDesc = JSON.parse(data);
        debug('Changelists cache loaded');

        ProcessFiles();
      });
    }
    else
    {
      FetchChangeListsInternal();
    }
  });

}

function ProcessFiles()
{
  debug('Processing files...');
  debug('Please wait...');
  
  var liner = new Liner();
  var filesReadStream = fs.createReadStream(tmpAllFiles);
  filesReadStream.pipe(liner);

  var filePattern = /(\/\/.*)#([0-9]*).*change ([0-9]*)/i;

  filesReadStream.on('error', function(err){
    debug(err);
  });

  liner.on('readable', function () {
    var line = '';
    while (line = liner.read())
    {
      //debug(line);
      var fileMatch = filePattern.exec(line);
      if (fileMatch && fileMatch[1], fileMatch[2], fileMatch[3])
      {
        var file = fileMatch[1];
        var commits = fileMatch[2];
        var changelist = fileMatch[3];
        var date = changeDesc[changelist];

        var newLine = date + ',' + commits + ',' + file + os.EOL;
        //debug(newLine);
        fs.appendFile(dataFile, newLine, function (err) {
          if (err)
          {
            debug(err);
          }
        });
      }
    }
  });

  liner.on('finish', function(){
    RunServer();
  })
}

function ServeStaticFiles(request, response)
{
  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = path.resolve(__dirname, 'index.html');
  else
    filePath = __dirname + request.url;

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
    contentType = 'text/javascript';
    break;
    case '.css':
    contentType = 'text/css';
    break;
    case '.json':
    contentType = 'application/json';
    break;
    case '.png':
    contentType = 'image/png';
    break;      
    case '.jpg':
    contentType = 'image/jpg';
    break;
    case '.wav':
    contentType = 'audio/wav';
    break;
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT'){
        fs.readFile('./404.html', function(error, content) {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
        response.end(); 
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

function RunServer()
{
  console.log('Running server at 0.0.0.0:8000');
  http.createServer(function(req, res){

  ServeStaticFiles(req, res);

  }).listen(8000);
}