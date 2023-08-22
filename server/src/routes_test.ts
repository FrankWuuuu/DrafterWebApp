import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { Dummy, loadDraft, makeDraft, makeTurn } from './routes';


describe('routes', function() {

  it('Dummy', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/dummy', query: {name: 'Kevin'}});
    const res1 = httpMocks.createResponse();
    Dummy(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getJSONData(), 'Hi, Kevin');
  });


  it('routes', function(){

    //add a draft
    let req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "1",
          options: "a\nb\nc\nd\ne\nff",
          drafters: "ben\nbob"
        }   }); 
    let res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {id: 1});

    
    //fail add a draft fail - rounds not a number
    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "tt",
          options: "1 \n 2 \n 4 \n 3 \n 6 \n 10 \n",
          drafters: "ben\nbob"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepEqual(res1._getData(), "rounds didnt represent a number");
    
    //load the draft
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "1"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {
      turn : "ben",
      drafterChoices: {"ben": [], "bob":[]},
      optionsLeft : ["a","b","c","d","e","ff"],
      isOver: false,
      drafters: ["ben", "bob"]  
    });

    //make a turn
    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "1",
            choice:"e"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "e was drafted by ben and there are 1 rounds left");

    //load after making one turn
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "1"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {
      turn : "bob",
      drafterChoices: {"ben": ["e"], "bob":[]},
      optionsLeft : ["a","b","c","d","ff"],
      isOver: false,
      drafters: ["ben", "bob"]  
    });

    // make another turn
    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "1",
            choice:"d"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "d was drafted by bob and there are 0 rounds left");

    //load after making 2 turns
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "1"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {
      turn : "ben",
      drafterChoices: {"ben": ["e"], "bob":["d"]},
      optionsLeft : ["a","b","c","ff"],
      isOver: true,
      drafters: ["ben", "bob"]  
    });



    //add a draft
    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "2",
          options: "1\n2\n3\n4\n5",
          drafters: "ben\nbob\nbepo"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {id: 2});

    //make 5 turns
    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "2",
            choice:"1"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "1 was drafted by ben and there are 2 rounds left");

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "2",
            choice:"2"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "2 was drafted by bob and there are 2 rounds left");

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "2",
            choice:"5"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "5 was drafted by bepo and there are 1 rounds left");

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "2",
            choice:"3"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "3 was drafted by ben and there are 1 rounds left");

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "2",
            choice:"4"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "4 was drafted by bob and there are 1 rounds left");


    //load after making 5 turns
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "2"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {
      turn : "bepo",
      drafterChoices: {"ben": ["1", "3"], "bob":["2", "4"], "bepo":["5"]},
      optionsLeft :[],
      isOver: true,
      drafters: ["ben", "bob", "bepo"]  
    });


    //add a draft that is over already
    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "1",
          options: "",
          drafters: "ben\nbob"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {id: 3});

    //load draft
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "3"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {
      turn : "ben",
      drafterChoices: {"ben": [], "bob":[]},
      optionsLeft : [""],
      isOver: true,
      drafters: ["ben", "bob"]  
    });


    // test 400s for make
    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: 1,
          options: "",
          drafters: "ben\nbob"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "1",
          options: true,
          drafters: "ben\nbob"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "1",
          options: "",
          drafters: []
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);


    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "d",
          options: "",
          drafters: "[]"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "1",
          options: "",
          drafters: ""
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);


    //test 400s for load
    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: 3}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: undefined}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "adiavjd"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', 
      query:{draftid: "1000000000"}
          }); 
    res1 = httpMocks.createResponse();
    loadDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);


    //test 400s make turn
    //add a draft
    req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/make', 
        body: {
          rounds: "",
          options: "a\nb\nc\nd\ne\nff\na",
          drafters: "la\nle"
        }   }); 
    res1 = httpMocks.createResponse();
    makeDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {id: 4});

    //make a turn
    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "4",
            choice:"a"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), "a was drafted by la and there are 9007199254740991 rounds left");

    //make turns that fails
    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: true,
            choice:"a"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "true",
            choice:"a"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "4",
            choice:true}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 400);

    req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/load', 
        query:{draftid: "true",
            choice:"bgfnvakepolvkojia"}
        }); 
    res1 = httpMocks.createResponse();
    makeTurn(req1,res1 )
    assert.strictEqual(res1._getStatusCode(), 400);

  });

  
});
