import express from "express";
import { Dummy, loadDraft, makeDraft, makeTurn } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.get("/api/dummy", Dummy);
app.post("/api/make", makeDraft);
app.get("/api/load", loadDraft);
app.post("/api/turn", makeTurn);

app.listen(port, () => console.log(`Server listening on ${port}`));
