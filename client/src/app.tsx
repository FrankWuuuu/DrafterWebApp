import React, { ChangeEvent, Component } from "react";
import { InDraft } from "./inDraft";


interface AppState {
  whichPage: PageType,
  sendInDraftName?: string;
  sendInDraftid?: number;
  makeRound:string;
  makeOptions:string;
  MakeNames:string;
  joinName: string;
  joinID: string;
  errorGoBack:boolean;

}

type PageType= "home"|"inDraft"

//generates the entire app
export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {
      whichPage: "home",
      makeRound:"",
      makeOptions:"",
      MakeNames:"",
      joinName: "",
      joinID: "",
      errorGoBack: false
    };
  }

  render = (): JSX.Element => {


    const child= {
      display: "inline-block",
      padding: "1rem 1rem",
      // verticalAlign: "middle",
    };

    if(this.state.errorGoBack){
      return <div>
          <p>something wrong happened</p>
              <button onClick={this.onBackFromHome}>back</button>
      </div>
    }

    if(this.state.whichPage === "home"){
      
      return<div>
        
        <div>
          <h1>Create a new Draft</h1>
          <label>Number of Rounds: </label>
          <input type="text" onChange={this.handleMakeRoundsChange}></input>
          <br></br>
          <br></br>
          
          <div  >{/* side by side textboxes */}
            <div style= {child}>{/* options box */}
              <label>Draft Options: </label>
              <br></br>
              <textarea rows = {10} onChange={this.handleMakeOptionsChange}></textarea>
            </div>

            <div style= {child}>{/* drafters box */}
              <label>Drafter Names (make in order, with yourself first): </label>
              <br></br>
              <textarea rows = {10} onChange={this.handleMakeNamesChange}></textarea>
            </div>
          </div>
          <button onClick={this.handleMakeButtonClick}>Make Draft</button>

        </div>

        {/* join draft */}
        <div>
          <h1>Join Existing Draft</h1>
          <label>Name: </label>
          <input type="text" onChange={this.handleJoinNameChange}></input>
          <br></br>
          <br></br>

          <label>ID: </label>
          <input type="text" onChange={this.handleJoinIDChange}></input>
          <br></br>
          <br></br>
          <button onClick={this.handleJoinButtonClick}>Join</button>
        </div>

      </div>
    }else{
      if (this.state.sendInDraftName === undefined || this.state.sendInDraftid === undefined){
        throw new Error("something wrong happened")
      }
      return <InDraft 
        drafterName = {this.state.sendInDraftName} 
        id = {this.state.sendInDraftid}
        onBack= {this.onBack}
         />
    }
  };


  //make draft handle functions

        // handles when the textbox for the # of rounds is changed
        handleMakeRoundsChange = (evt: ChangeEvent<HTMLInputElement>):void =>{
          this.setState({makeRound: evt.target.value});
        }
        
        
        // handles when the textbox for the list of options is changed
        handleMakeOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>):void =>{
          this.setState({makeOptions: evt.target.value})
        }

        // handles when the textbox for the list of drafters is changed
        handleMakeNamesChange = (evt: ChangeEvent<HTMLTextAreaElement>):void =>{
          this.setState({MakeNames: evt.target.value})
        }

        //fetches the makedraft api when the button is clicked
        handleMakeButtonClick = () :void =>{
          fetch(
            '/api/make',
            {
              method:"POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                rounds: this.state.makeRound,
                options: this.state.makeOptions,
                drafters: this.state.MakeNames,
              })
            }
          ).then(this.handleMakeResponse)
        }
      
      //handles the make draft response
      handleMakeResponse = (res: Response) => {
        if(res.status ===200){
          res.json().then(this.handleMakeWorked)
          .catch(this.handleServerError)
          

        }else{
          res.text().then(this.handleMightBeRoundsNotNumberErrorOrNoDrafterError)
          .catch(this.handleServerError)
        }
      }
       
      
      //handle the json fo the make draft response
      handleMakeWorked = (res: any) =>{


        const firstNameInNameList:string = this.state.MakeNames.split("\n")[0];
        this.setState({
          sendInDraftid: res.id,
          whichPage:"inDraft",
          sendInDraftName: firstNameInNameList
        });
      }

      //handles potential errors with the make draft api
      handleMightBeRoundsNotNumberErrorOrNoDrafterError= (sendText:string) => {
        if (sendText === "rounds didnt represent a number"){
          alert("Number of rounds must be a number")
        }else if   (sendText === "need atleast 2 drafters"){
          alert("please put atleast two drafters")
        }else{
          this.makeError()
        }
      }
      
      //makes an error page
      makeError= () => {
        console.log("Something wrong happened")
        this.setState({errorGoBack: true})
      }
      

      //makes an error page if a failed promise is caught
      handleServerError= (res: Response) => {
        res.text().then(this.logErrorMessage)
        console.log("Something wrong happened")
        this.setState({errorGoBack: true})
      }
  
      //logs the error message from an api
      logErrorMessage = (message:string) =>{
          console.log(message)
      }

  //join draft handle functions

        //handles when the text box for the name is changed
        handleJoinNameChange = (evt: ChangeEvent<HTMLInputElement>):void =>{
          this.setState({joinName: evt.target.value})
        }

        
        //handles when the text box for the draft id is changed
        handleJoinIDChange = (evt: ChangeEvent<HTMLInputElement>):void =>{
          this.setState({joinID: evt.target.value})
        }

        //sends client to indraft page when button is clicked
        handleJoinButtonClick = () :void =>{
          this.setState({
            sendInDraftid: Number(this.state.joinID),
            sendInDraftName: this.state.joinName,
            whichPage: "inDraft"
          })
        }


        //goes back to the first page
        onBack= ():void=>{
          console.log(this.state.whichPage)
          this.setState({whichPage:"home"})
          console.log(this.state.whichPage)
          
        };

        
        //goes back to the first page
        onBackFromHome= ():void=>{
          this.setState({errorGoBack:false})
          this.setState({whichPage:"home"})
          
        };

}
