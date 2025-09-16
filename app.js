const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv')
dotenv.config();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const nodemailer=require('nodemailer')
const { title } = require('process');
const cors=require('cors')
const app=express();
const port=process.env.port || 3000
app.use(express.json());
app.use(cors());
//Db setup
async function connection(){
  await  mongoose.connect(process.env.MONGOODBURL)
  
}

//schema
let productschema=new mongoose.Schema({
    name:{
     type:String,
     required:true
    },
    price:{
     type:Number,
     required:true
    },
    image:{
     type:String,
     required:true
    }
})
let productmodel=mongoose.model('products',productschema)
//user models
let userschema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    
    
    
})
let usermodel=mongoose.model('users',userschema)

app.get('/status',function(req,res){
 res.json({
    status:"Active"
 })
})

//api-insert products in db

app.post('/products',async function(req,res){
   try {
    const {name,price,image}=req.body
    let product=  productmodel({name,price,image})
    await product.save()
    res.status(201).json({
        message:"product is added📱"
    })
   } catch (error) {
    res.json({
        error:error.message
    })
   }
})



//api-fetch all products
app.get('/products',async function(req,res){
   try {
   let product=await productmodel.find()
   res.status(200).json({product});
   } catch (error) {
    res.json({
        error:error.message
    })
   }
})
//api--->user registration
app.post('/register', async function(req,res){
    try {
        const{username,password,email}=req.body;
     let user=await usermodel.findOne({username})
     if (user) return res.json({message:"user alerady exists"})
     //verified
    let hashedpassword=await bcrypt.hash(password,5)
    let finaluser=await usermodel({username,password:hashedpassword,email})
    await finaluser.save()
    let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:"prajnyategginmath@klebcahubli.in",
            pass:process.env.GMAILPASS
        }
    });

    let mailoptions={
        from:'prajnyategginmath@klebcahubli.in',
        to:email,
        subject:'Registration successful',
        html:'<p>Registration successful! welcome ${username}</p>'
    };
    await transporter.sendMail(mailoptions);
    res.json({message:"registration successfull"})
    res.status(201).json({
        message:"registration successful"
    })
    
    } catch (error) {
        res.json({
            error:error.message
        })
    }
})

//api--->login
app.post('/login',async function(req,res){
    try {
        const{username,password}=req.body;
        let user=await usermodel.findOne({username})
        if(!user) return res.status(404).json({message:"user not found"})
        //check the password
    let checkpassword=bcrypt.compare(password,user.password)
    if(!checkpassword) return res.status(403).json({message:"invalid credentials"})
    //token generation
let token=jwt.sign({userid:unser.id},process.env.SECRET,{expiresIn:'1hr'})
if(!token) return res.json('token required');
res.status(201).json({
    message:"login succesful",
    token
})
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        
    }
})




app.listen(port,function(){
    console.log(`the server is running on ${port}`)
    connection();
})