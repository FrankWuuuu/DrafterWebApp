import { Request, Response } from "express";

const allDrafts: Map<number /**id */, draft>= new Map;

let curID = 1;
///////////////////////////////////////////////////////////////////////////////////////////
type draft = {
  roundsLeft: number;
  optionsLeft: string[];
  drafters: string[];
  Turn: number
  isOver: boolean;
  drafterChoices: Map<string, string[]>;
  // whoWentFirst:string;
}

/**
 * adds a draft to the list
 * body requires rounds - # of rounds
 * options - string that represends the list of things being drafted
 * drafters - string that represents list of drafters names                
 */
export function makeDraft (req: Request, res: Response){

 
  
  
  //testing type errors
  // const tempDraftMap:Map<string, any>= new Map;
  if(typeof req.body.rounds !== "string"){
    res.status(400).send("rounds wasn't a string");
    return;
  }
  if(typeof req.body.options !== "string"){
    res.status(400).send("rounds wasn't a string");
    return;
  }
  if(typeof req.body.drafters !== "string"){
    res.status(400).send("rounds wasn't a string");
    return;
  }
  
  
  //get body 
  const options: string[] = req.body.options.split("\n")
  const drafters: string[] = req.body.drafters.split("\n")

  let rounds:number
  if (req.body.rounds=== ""){
    rounds = 9007199254740991
  }else{
    rounds = Number(req.body.rounds)
    if(Number.isNaN(rounds)){
      res.status(400).send("rounds didnt represent a number");
      return;
    }
  }
   
  //test rounds is a number
 

  // console.log(drafters)
  if(drafters.length===1){
    res.status(400).send("need atleast 2 drafters");
    return;
  }

   // make an id for the draft
   let newId:number = curID
   curID = curID+1;
   
  
  
  //making arrays for drafter choices
  const tempDrafterChoices: Map<string, string[]>= new Map;
  for (let name of drafters){
    tempDrafterChoices.set(name, [])
  }
  // tempDraftMap.set("drafterChoices", tempDrafterChoices);
  
  const myNewDraft: draft = {
    roundsLeft: rounds,
    optionsLeft: options,
    drafters: drafters,
    Turn: 0,
    isOver: false,
    drafterChoices: tempDrafterChoices,
    // whoWentFirst: drafters[0],
  }
  
   //check if draft is over before it starts
   if(myNewDraft.roundsLeft===0 || (myNewDraft.optionsLeft.length===1 &&myNewDraft.optionsLeft[0] ==="" )){
    myNewDraft.isOver = true;
  }

  allDrafts.set(newId, myNewDraft);

  // console.log(allDrafts)
  res.send({id: newId})
}




//loads the information for the draft page - requires draftid
export function loadDraft(req: Request, res: Response) {
  const id = first(req.query.draftid);
  if (id === undefined || typeof id !== 'string') {
    res.status(400).send("missing id parameter");
    return;
  }
  const idNumber:number = Number(id);
  if(Number.isNaN(idNumber)){
    res.status(400).send("id didnt represent a number");
    return;
  }

  const draft = allDrafts.get(idNumber)
  if (draft === undefined){
    res.status(400).send("draft of that id doesn't exist");
    return;
  }

  res.send({
    turn : draft.drafters[draft.Turn],
    drafterChoices: Object.fromEntries(draft.drafterChoices),
    optionsLeft : draft.optionsLeft,
    isOver: draft.isOver,
    // whoWentFirst: draft.whoWentFirst,
    drafters: draft.drafters,
  })
}

//make turn makes a choice in a draft - requires choice
export function makeTurn(req: Request, res: Response) {

  //get the id from query
  const id = first(req.query.draftid);
  if (id === undefined || typeof id !== 'string') {
    res.status(400).send("missing id parameter");
    return;
  }
  const idNumber:number = Number(id);
  if(Number.isNaN(idNumber)|| !Number.isInteger(idNumber)|| idNumber<0){
    res.status(400).send("id didnt represent a valid number");
    return;
  }
  

  const draft = allDrafts.get(idNumber);
  if (draft === undefined){
    res.status(400).send("draft was undefined");
    return;
  }

 

  //get the choice from query
  const choice = first(req.query.choice)
  if (choice === undefined || typeof choice !== 'string') {
    res.status(400).send("missing id parameter");
    return;
  }


  //remove choice from the options
  const options:string[] = draft.optionsLeft;
  if (options===undefined || !Array.isArray(draft.optionsLeft) ){
    res.status(400).send("options was not array");
    return;
  }
  if( !options.includes(choice)){
    res.status(400).send("choice was not valid");
  }
  
  draft.optionsLeft = options.filter(item => item != choice);



  //add choice to drafter choice
  const drafterChoices = draft.drafterChoices.get(draft.drafters[draft.Turn]);
  if (drafterChoices=== undefined || !Array.isArray(drafterChoices)){
    res.status(400).send("drafter choices was not valid");
    return;
  }

  drafterChoices.push(choice);

  const sendPartOne:string = choice+ " was drafted by "+  draft.drafters[draft.Turn];
  
  
  


  // change player turn
  let drafters: string[] = draft.drafters;
  let curTurn:number= draft.Turn+1;
  if ( curTurn === drafters.length){
    draft.Turn = 0;
    draft.roundsLeft = draft.roundsLeft-1;
    if(draft.roundsLeft === 0 ){
      draft.isOver = true;
    }
  }else{
    draft.Turn = curTurn;
  }

  if( draft.optionsLeft.length ===0){
    draft.isOver = true;
  }


  res.send(sendPartOne+ " and there are "+ draft.roundsLeft+ " rounds left")
  
  
  // console.log(allDrafts)




}







/** Returns a list of all the named save files. */
export function Dummy(req: Request, res: Response) {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('missing "name" parameter');
  } else {
    res.json(`Hi, ${name}`);
  }
}


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string|undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}

