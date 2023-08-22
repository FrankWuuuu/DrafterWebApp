import React, { ChangeEvent, Component } from "react";


interface inDraftState {
  // will probably need something here
  errorGoBack:boolean;
  turn: string;
  drafterChoices: Map<string, string[]>;
  optionsLeft: string[];
  isOver: boolean;
  drafters: string[];
  firstFetch:boolean;
  pickOption?: string;
  time: number;
//   whoWentFirst: string


  
}

interface inDraftProps {
    drafterName: string
    id : number
    onBack: ()=>void;
}

//generates what should be seen when someone is watching or participating in a draft
export class InDraft extends Component<inDraftProps, inDraftState> {
    constructor(props: any) {
        super(props);
    
        this.state = {
            errorGoBack: false,
            turn: "",
            drafterChoices: new Map,
            optionsLeft: [],
            isOver: false,
            drafters: [],
            firstFetch: false,
            // pickOption: "none"
            // whoWentFirst: ""
            time:1
         }; 
    }

    componentDidMount = () => {
        
        fetch(
            "/api/load?draftid="+this.props.id
          ).then(this.handleLoadRepsonse)
          .catch(this.handleServerError)
            
        
        setInterval(() => 
        {
            if(!this.state.isOver){
                fetch(
                    "/api/load?draftid="+this.props.id
                    ).then(this.handleLoadRepsonse)
                    .catch(this.handleServerError)
            }
    
        }, 1000)

          

    }

    render = (): JSX.Element => {

        // note* i recognize that by fetching and setting the state, render is called again, thus render is infinitely looping
        // however this works perfectly because I want the component to refresh to see if the another player drafted, 
        // fetch(
        //     "/api/load?draftid="+this.props.id
        //   ).then(this.handleLoadRepsonse)
        //   .catch(this.handleServerError)

        // console.log(this.state)
        


        if(this.state.errorGoBack){
            return <div>
                <p>something wrong happened</p>
                    <button onClick={this.props.onBack}>back</button>
            </div>
        }


        const drafterChoicesHtml:JSX.Element[] = []
        if(this.state.firstFetch){
            const drafterChoices = Object.entries(this.state.drafterChoices);
          
            // const drafters: string[] = this.state.drafters;

            let iterList:number = 0;
            let iterWhosTurn: number = 0;
            let iterPick:number = 1;
            // console.log( drafterChoices[iterWhosTurn])

            while(drafterChoices[iterWhosTurn][1][iterList] !== undefined){
                drafterChoicesHtml.push(<tr key = {drafterChoices[iterWhosTurn][1][iterList]}>
                    <td>{iterPick}</td>
                    <td>{drafterChoices[iterWhosTurn][1][iterList]}</td>
                    <td>{drafterChoices[iterWhosTurn][0]}</td>
                </tr>)

                iterPick = iterPick+1;
                iterWhosTurn = iterWhosTurn +1;
                if(iterWhosTurn === drafterChoices.length){
                    iterWhosTurn=0;
                    iterList = iterList+1;
                }
            }
                
        }
        
        
        let bottomPart:JSX.Element
        if(this.state.isOver){
            bottomPart = <p>game over</p>;
        }else{
            if(this.props.drafterName !== this.state.turn){
                bottomPart= <p>it is {this.state.turn}'s turn to pick</p>

            }else{
                const draftOptionsSelect:JSX.Element[] = []
                for(let option of this.state.optionsLeft){
                    draftOptionsSelect.push(<option value = {option} key={option}>{option}</option>)
                }
                bottomPart = <div>
                    <p>Your turn to pick:</p>
                    <select onChange={this.handleOptionSelection}>
                        {draftOptionsSelect}
                    </select>
                    <button onClick={this.handleOptionPicked}>draft</button>
                </div>
            }
        }
        
    



        
        return<div>
            <h1>Draft {this.props.id}</h1>
            <table>
                <thead>
                <tr>
                    <th>Num </th>
                    <th>Pick</th>
                    <th>Drafter</th>
                </tr>

                {drafterChoicesHtml}
                </thead>
            </table>
            <br></br>
            {bottomPart}



        </div>
    }

    //handles when a drafter picks an option to be drafted on their turn
    handleOptionPicked = (): void => {
        console.log(this.state.pickOption)
        fetch("/api/turn?draftid="+ this.props.id+"&choice="+this.state.pickOption,
            {
                method:"POST"
            }
        ).then(this.handleTurnResponse)
        .catch(this.handleServerError)
    }

    //handles the fetch promise from making a turn
    handleTurnResponse = (res: Response) =>{
        if(res.status === 200){
            res.text().then(this.handleTurnText).catch(this.handleServerError)
        }else{
            this.handleServerError(res);
        }
    }

    
    //handles the text from the response of making a turn
    handleTurnText = (text: string) =>{
        console.log(text)
    }


    //handles when user changes the selection in the dropdown menue for the draft options
    handleOptionSelection = (evt:ChangeEvent<HTMLSelectElement>): void => {
        console.log(evt.target.value)
        this.setState({pickOption: evt.target.value})
    }





    // handleLoadRepsonseFirst = (res: Response) =>{
        
    //     if (res.status === 200){
    //         res.json().then(this.handleLoadDataFirst).catch(this.handleServerError)
    //     }else{
    //         this.handleServerError(res)
    //     }
    // }

    // handleLoadDataFirst = (data: any) =>{
    //     const optionsChanged:boolean = this.state.optionsLeft.length !==data.optionsLeft.length;
        
    //     this.setState({
    //         turn: data.turn,
    //         drafterChoices: data.drafterChoices,
    //         optionsLeft: data.optionsLeft,
    //         isOver: data.isOver,
    //         // whoWentFirst: data.whoWentFirst,
    //         drafters: data.drafters,
    //         firstFetch:true,
    //     })

    //     if (optionsChanged){
    //         this.setState({
    //             pickOption: data.optionsLeft[0]})
    //     }
    // }

    //handles the response from the fetch for loading the page
    handleLoadRepsonse = (res: Response) =>{
        
        if (res.status === 200){
            res.json().then(this.handleLoadData).catch(this.handleServerError)
        }else{
            this.handleServerError(res)
        }
    }

    //handles the json of the promise from fetching the load page information
    handleLoadData = (data: any) =>{
        const optionsChanged:boolean = this.state.optionsLeft.length !==data.optionsLeft.length;
        
        this.setState({
            turn: data.turn,
            drafterChoices: data.drafterChoices,
            optionsLeft: data.optionsLeft,
            isOver: data.isOver,
            // whoWentFirst: data.whoWentFirst,
            drafters: data.drafters,
            firstFetch:true,
        })

        if (optionsChanged){
            this.setState({
                pickOption: data.optionsLeft[0]})
        }
    }

    //creates an error page
    handleServerError= (res: Response) => {
        res.text().then(this.logErrorMessage)
        console.log("Something wrong happened")
        this.setState({errorGoBack: true})
    }

    //logs the error message
    logErrorMessage = (message:string) =>{
        console.log(message)
    }


    


}