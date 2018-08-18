

//C:\Users\Tuomas\Desktop\mooc\Puhegen\Java\javaClasses\Server.class
//'java',['-classpath' ,'C:\\Users\\Tuomas\\Desktop\\mooc\\Puhegen\\Java\\javaClasses', 'Server']

//vaadittavat luokat
const { spawn } = require('child_process');
const iconv = require('iconv-lite');
const express = require('express')
const cors = require('cors')



//app 
const app = express();
let router = express.Router()
let currentPuhe = "TestiALOITUS"; //Edellisin palautettu puhe
app.use(cors())

let javaClasspath2 = 'java -classpath C:\\Users\\Tuomas\\Desktop\\mooc\\Puhegen\\Java\\javaClasses Server'
let javaClasspath = 'java -classpath ' + __dirname + '\\javaClasses Server'; //HUOM Server on isolla!
let javaClasspathHEROKU = 'java -classpath ' + __dirname + '/javaClasses Server';
console.log(javaClasspath)

//Käynnistetään puhegen JAVA ohjelma 
const child = require('child_process').exec(
    javaClasspathHEROKU,
    //encoding --> buffer,joka aihettaa sen että callbackit palauttaa kirjaimet muodossa esim(123,332,342,234)
    //muuten ä å ö tuhoutuisivat. Jostain syystä utf8 ei tue niitä?
    { encoding: 'buffer' },
    function(err, stdout, stderr) {
      console.log("Stdout function :" ,stdout)
   }
);

//Callback 
child.stdout.on('data', function(data) {

  //Tähän tulee data ohjelmasta se on buffer muodossa joten se pitää muuntaa oikeaan muotoon
  outData = iconv.decode(Buffer.from(data),'ISO-8859-4');
  console.log(outData);

  //asetetaan saatu puhe(outData) nykyiseksi puheeksi
  currentPuhe = outData;

});
child.stderr.on('data', function(data) {
  console.log('std error: ' + data);
  console.log("type of data : ",typeof data)
});
child.on('close', function(code) {
  console.log('closing code: ' + code);
})


app.use('/puhe',function (req, res, next) {
  //child.stdin.write("18 \n") //TODO luo puhe vain /luoUusiPuhe/:length käyttäen muuten voidaan palauttaa edellinen uutena
  console.log('avataan /puhe:')
  console.log('Time:', Date.now())
  next()
})

app.get('/luoUusiPuhe/:length',(request, response) =>{

 
  //Luodaan pyynnöstä java ohjelmalle kirjoitettava pyyntö muotoa --> pituus(int) \n(käyttäytyy kuten ENTER)
  try{
    const length = request.params.length;
    console.log("Vastaan otettiin uuden lauseen teon pyyntö. Pituus : " , length)
    luoPuhe(length)
    
    //TODO miten palauttaa vasta kun puhe on valmis?
    response.end("Pyyntö vastaan otettu");
  }catch (error){
    console.log(error)

  }
  
})


app.get('/',(request, response) =>{

  response.send("Moi")
  
})

app.get('/puhe',(request, response) =>{

  try{
    response.send(currentPuhe);
    console.log("Vastattiin :" ,currentPuhe)
  }catch(error){
    console.log(error)
  }
  
  
})

let luoPuhe = (pituus) =>{

  try{
    pyyntö = pituus + "\n"
    child.stdin.write(pyyntö)
  }catch(error){
    console.log(error)
  }
  
}



//"build": "cd puhegen && build",  
//Port jolle ohjelma avataan

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
