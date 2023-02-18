
require("dotenv").config()
const express=require("express");
const bodyParser=require("body-parser");
const nodemailer=require("nodemailer");
const app=express();

const {
    createPool
} = require("mysql");

const pool = createPool({
    host:process.env.HOST,
    user: process.env.SQLUSER,
    password:process.env.SQLPASSWORD,
    database:process.env.DATABASE,
    connectionLimit:10
})

var OTP=0;
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.USER,
        pass:process.env.PASSWORD
    },
    port: 465,
    host:"smtp.gmail.com"
})

app.post("/desktop/api/v1/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const userid=Number(req.body.userid);
    const string='select * from login where username= "'+ username + '" and password= "' + password +'"';
    pool.query(string,(err,result)=>{
        if(err){
            return console.log(err);
        }
        if(result.length==0){
            let data=[];
            let message="Email or Password incorrect";
            let obj={
                "status": false,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
        else{

            var OTP1=Math.floor(Math.random()*10000)+10000;
            OTP=OTP1
            const mailOptions={
                from:process.env.USER,
                to:"t.guptacool1909@gmail.com",
                subject:"OTP Verification",
                text:`OTP: ${OTP1}`
            }
            transporter.sendMail(mailOptions)
            console.log(OTP1);
            let data={
                user_id: userid,
                "user_email": username
            };
            let message="Login successfully";
            let obj={
                "status": true,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
    })

})

app.post("/desktop/api/v1/verify_otp",(req,res)=>{
    const otp=Number( req.body.otp);
    const userid=Number(req.body.userid);
    let token="";
    console.log(OTP);
    if(otp === OTP){        
                    let rand=Math.random().toString(36).substr(2);
                    let rand1=Math.random().toString(36).substr(2);
                    let token= rand+rand1;
                    const string='update login set token= "'+ token + '"where userid= "' + userid +'"';
                    pool.query(string,(err)=>{
                        if(err){
                            return console.log(err);
                        }
                        else{
                            console.log("Successful");
                        }
                    })
        let data={
            user_id: userid,
            "token": token
        };
        let message="Otp valid";
        let obj={
            "status": true,
            "data" : data,
            "message" :message
        }
        res.send(obj);
    }
    else{
        let data=[];
        let message="Otp not valid";
        let obj={
            "status": false,
            "data" : data,
            "message" :message
        }
        res.send(obj);
    }

})

app.post("/desktop/api/v1/verify_token",(req,res)=>{
    const token= req.body.token;
    const userid=Number(req.body.userid);
    const string='select token from login where userid= "'+ userid +'"';
    pool.query(string,(err,result)=>{
        if(err){
            return console.log(err);
        }
        if(token === result[0].token){
            var dateOB=new Date();
            var day=( dateOB.getDate());
            var month=(dateOB.getMonth());
            var year=(dateOB.getFullYear());
            const date=day+"-"+month+"-"+year;
            let hour=(dateOB.getHours());
            let min=(dateOB.getMinutes());
            let sec=(dateOB.getSeconds());
            const time=hour+":"+min+":"+sec;
            const insert='INSERT into  tracking(userid,date,time)values("'+ userid +'","'+date+'","'+time+'")';
            pool.query(insert,(err)=>{
                console.log(err);
            })
            let data=[];
            let message="Valid token";
            let obj={
                "status": true,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
        else{
            let data=[];
            let message="Token not valid";
            let obj={
                "status": false,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
    
    })
   
})

app.post("/desktop/api/v1/check_product",(req,res)=>{
    const token= req.body.token;
    const userid=Number(req.body.userid);
    const string='select token from login where userid= "'+ userid +'"';
    pool.query(string,(err,result)=>{
        if(err){
            return console.log(err);
        }
        if(token === result[0].token){
            let data={
                user_id: userid
            };
            let message="User already have product";
            let obj={
                "status": true,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
        else{
            let data=[];
            let message="There is no product found for this user";
            let obj={
                "status": false,
                "data" : data,
                "message" :message
            }
            res.send(obj);
        }
    
    })
   
})

app.listen(3000,()=>{
    console.log("Server started at 3000");
})


