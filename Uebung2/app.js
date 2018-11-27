/**
* Main app für API in WE2
*
*@author Lennart Reinke, Matej Juric, Michael Berneburg
*/
"use strict";
//node module
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
//small db, input lost after restart
const store = new (require("simple-memory-store"))();
store.initWithDefaultData();
//own module
const HttpError = require("./http-error.js");
//Server application
const app = express();
app.use(express.static(path.join("public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// add route to our static files
//app.use(express.static("public"));

//Logging
app.use((req, res, next)=>{
    console.log("Request of type "+req.method+" to URL  "+req.originalUrl);
    next();
});
//Logging end
//Version controll
app.use((req, res, next)=>{
    const versionWanted = req.get("Accept-Version");
    if(versionWanted !== undefined && versionWanted !== "1.0"){
        let err = new HttpError("Accept-Version cannot be fulfilled", 406);
        next(err);
    }else{
        //If everything is OK call next handler
        next();
    }
});
//Version controll end
//Type check
app.use((req, res, next) => {
    if(["POST", "PUT"].includes(req.method)&& !req.is("application/json")){
        let err = new HttpError("you sent wrong Content-Type", 415);
        next(err);
        return;
    }
    if(!req.accepts("json")){
        let err = new HttpError("only response of apllication/json supportd", 406);
        next(err);
        return;
    }
    //If everything is OK
    next();
});
//Type check end
//Requests
//CREATE    READ    UPDATE  DELETE  CRUD
//POST      GET     PUT**   DELETE  HTTP
app.get("/tweets",(req, res, next)=>{
        res.json(store.select("tweets"));
});
app.post("/tweets",(req, res, next)=>{
        let result = store.insert("tweets", req.body);
        res.send("added tweet "+ req.params.id);
        res.status(201).json(result);
});
app.route("/tweets/:id")
    .get((req, res, next)=>{
        res.json(store.select("tweets", req.params.id));
    })
    .put((req, res, next) =>{
        store.replace("tweets", req.params.id, req.body);
        res.status(200).end();
    })
    .delete((req, res, next) =>{
        store.remove("tweets", req.params.id);
        res.send("deleted tweet "+req.params.id);
        res.status(200).end();
        
    });
//Requests end 
//Errorhandling
app.use((req, res, next) => {
    let err = new HttpError("Not Found",  404);
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    //res.send(err.message);
});
////Errorhandling end
//Server start
app.listen(3000, (err) => {
    if (err !== undefined) {
        console.log("Error on startup: "+err);
    }else {
        console.log("Listening on port 3000");
    }
});
//Server start end
