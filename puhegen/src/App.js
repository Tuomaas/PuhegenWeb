import React, { Component } from 'react';
import './App.css';
import axios from 'axios' //http pyyntöjen teko kirjasto 





class Title extends Component{
  render(){
    return(
      <div className="Title">
        <h2>Tervetuloa vaalipuhe/pöhinä generaattoriin!</h2>
      </div>
    )
  }
}

class Info extends Component{
  render(){
    return(
      <div className="Info">
        <h2>Info</h2>
        <p>Tämän ohjelma luo "satunnaisesti" tekstiä ylen vaalikoneen kunnallisvaalien ehdokkaiden vastauksista. </p>
        <div><span>Datan lähde : </span><a href="https://yle.fi/uutiset/3-9526290">Yle</a></div>
        <br/>
        <p>Tällä hetkellä ohejelma on toteutettu käyttäen (Node.js,React.js ja Java). Palvelin ei ole kovin kehittynyt ja periaatteessa kykenee vain palvelemaan yhtä henkiöä kerralla.</p>
        <p>Copyright Tuomas</p>
      </div>
    )
  }
}

class Lause extends Component{
  render(){


    if(this.props.ladataanko === true){
      return(
        <div className="Lause">
          <div className="Lataus"></div>
        </div>
      )
    }

    if(this.props.puhe === ""){
      return(
        <div className="Lause">
          <p>aseta lauseen pituus ja paina nappia!</p>
        </div>
      )
    }


    return(
      <div className="Lause">
        <p>{this.props.puhe}</p>
        </div>
    )
  }
}

class PuhegenAsetukset extends Component{

  render(){
    return(
      <div className = "InputForm">
        <form onSubmit = {this.props.createNewPuheReq}>

        <div>
          Luotavan lauseen sana määrä : <input 
          value = {this.props.puhePituus}
          onChange = {this.props.handlePituusChange}
          />
        </div>

        <div>
          <button className="Button" type="submit">Luo vaalipöhinää</button>
        </div>

      </form>
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      puhe : "",
      puhePituus : 0,
      ladataanko : false
    }
  }

  render() {
    return (
      <div className="App">
          <Title />
          <PuhegenAsetukset  handlePituusChange={this.handlePituusChange} createNewPuheReq={this.createNewPuheReq}/>
          <Lause puhe={this.state.puhe} ladataanko={this.state.ladataanko}/>
          <Info />
      </div>
    );
  }


  handlePituusChange = (event) =>{
    this.setState({puhePituus : event.target.value})
  }

  testIfReqIsFresh = (response,serverReqPuhe) =>{
     //Jos palvelimen vastaus on sama kun aikaisemmin --> kysytään uudestaan joka 2,5 sec TODO onko viisasta
     console.log("Katsotaan onko saatu vastaus uusi. Vastaus: ", response.data , " === nykyinen: " , this.state.puhe )
     
     //herokussa ä on Ã¤ ja ö on Ãļ, joten ne pitää muokata tässä pois
     let vastausDataMuokattu = response.data
     vastausDataMuokattu = vastausDataMuokattu.replace("Ãļ", "ö");
     vastausDataMuokattu = vastausDataMuokattu.replace("Ã¤", "ä");
     
     if(vastausDataMuokattu === this.state.puhe){
      //Huomattiin, että saatu vastaus on sama kuin mikä meillä on jo joten pyydetään uudestaan sekunnin päästä
      return new Promise( () =>{
        setTimeout( () =>{
          axios.get(serverReqPuhe).then(response =>{
            this.testIfReqIsFresh(response,serverReqPuhe)
          })
        },2500)
      })

    }else{
      this.setState({puhe : vastausDataMuokattu,ladataanko:false}, () => console.log("Muokataan state.puhe uusi state : ", this.state.puhe))
    }
  }

  createNewPuheReq = (event) =>{
    event.preventDefault()

    console.log("Kysytään palvelimelta uutta lausetta pituudelta :",this.state.puhePituus)

    let serverReqCreate = 'http://localhost:3001/luoUusiPuhe/' + this.state.puhePituus
    let serverReqPuhe = 'http://localhost:3001/puhe/'

    let serverReqCreateProxy = '/luoUusiPuhe/' + this.state.puhePituus
    let serverReqPuheProxy = '/puhe'

    //Kutsutaan palvelin 'http://localhost:3001/luoUusiPuhe/ osoitteella ja sen jälkeen kun saadaan vastaus suoritetaan alempi then()
    axios.get(serverReqCreateProxy).then(renponse =>{
      //Luodaan uusi promise jota käytetään aync timeouttina eli odotetaan 2sec, ja sen jälkeen kysytään palvelimelta
      //uutta lausetta.
      this.setState({ladataanko:true})
      return new Promise( () =>{
        setTimeout( () =>{
          //tehdään pyyntö palvelimelle ja tuloksen saannin jälkeen asetetaan se stateen.
          axios.get(serverReqPuheProxy).then(response =>{
            
           this.testIfReqIsFresh(response,serverReqPuheProxy)
            //console.log("vastaus : ", response.data)
            
          })

          
        },2000)

      })

    }).catch( error =>{
      //Virhe on tapahtunut
      console.log("Promise virhe : ", error)
  })


  }

}

export default App;
