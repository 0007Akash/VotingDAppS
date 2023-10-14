const express = require('express');
const app = express();
const {Web3} = require("web3");
const ABI = require("./ABI.json")

app.use(express.json())
const web3 = new Web3("HTTP://127.0.0.1:7545")
const contractAddress = "0xF9Fd8140a7aE82eFD4dc43fD950A7643c32894E7";
const contract = new web3.eth.Contract(ABI,contractAddress);

const genderVerification = (gender)=>{
   const genderData = gender.toLowerCase();
   if(genderData==="male" || genderData==="female" || genderData==="others"){
     return true;
   }else{
     return false;
   }
}

const partyClashStatus=async(party)=>{
   const candidateInfo = await contract.methods.candidateList().call();
   const exists = candidateInfo.some((candidate)=>candidate.party===party);
   return exists;
}

app.post("/api/voter-verfication",(req,res)=>{
    const {gender} = req.body;
    const status = genderVerification(gender)
    if(status){
       res.status(200).json({message:"Registration successful"})
    }else{
        res.status(403).json({message:"Gender Invalid"})
    } 
})

app.post("/api/time-bound",(req,res)=>{
    const {startTime,endTime}=req.body;
    if(endTime-startTime<86400){
        res.status(200).json({message:"Voting Timer Started"})
    }else{
        res.status(403).json({message:"Voting Time Must Be Less Than 24 hours"})
    }
})

app.post("/api/candidate-verification",async(req,res)=>{
    const {gender,party}=req.body;
    const partyStatus = await partyClashStatus(party);
    const genderStatus = genderVerification(gender);

    if(genderStatus===true && partyStatus!==true){
        res.status(200).json({message:"Registration successfule"})
    }else{
        res.status(403).json({message:"Either Party Name or Gender is not valid"})
    }
})

app.listen(3000,()=>{
    console.log("Server is running")
})