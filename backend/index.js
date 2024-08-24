
const port = 4000;
const express = require("express");


const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect(
    "mongodb+srv://kanwar2523:" +
    encodeURIComponent("2523@kanW") +
    "@cluster0.jiwijkk.mongodb.net/ecommerce",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process if unable to connect to MongoDB
});
app.get("/", (req, res) => {
    res.send("Welcome to the E-Commerce API!");
  });

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({ storage: storage });

// Serve uploaded images statically
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// API endpoint for file upload
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Define Product Schema
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type : String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true
    }
});

// API endpoint for adding a product
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            let last_product = last_product_array[0];
            id = last_product.id + 1;
        } else {
            id = 1;
        }
        
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save(); // Save the product to the database

        console.log("Product saved:", product);
        res.json({ success: true, product });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Failed to add product" });
    }
});


// API endpoint for deleting a product
app.post('/removeproduct', async (req, res) => {
   await Product.findOneAndDelete({id:req.body.id});
   console.log("Removed");
   res.json({
    success: true,
    name:req.body.name
   })
});

// API endpoint for getting all products
app.get("/allproducts", async (req, res) => {
    try {
        const products = await Product.find({});
        console.log("All Products Fetched");
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
});
const Users =mongoose.model('Users',{
    name:{
            type:String,
    },
    email:{
        type: String, 
        unique:true,
    },
    password:{
             type:Object,
    },
    cartData:{
            type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})
//API Endpoint for adding a new user
app.post("/signup",async(req,res)=>{
    let check =await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart={}
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
        
    }
    const user= new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,    
    })
    await user.save();
    const data={
        user:{
            id:user.id
        }
    }

    const jwt = require('jsonwebtoken');

// Assuming 'data' is an object containing the payload you want to include in the JWT

// Sign the JWT token
const token = jwt.sign(data, 'secret_ecom');

// Send the token back as a JSON response
res.json({ success: true, token });

})

app.post('/login', async(req,res)=>{
    let user=await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare=req.body.password===user.password;
        if (passCompare) {
            const data ={
                user:{
                    id:user.id
                }
            }
            const jwt = require('jsonwebtoken');
            const token=jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:" Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:'User not found.'});
    }
})
app.get('/newcollections',async(req,res)=>{
    let products= await Product.find({});
    let newcollection=products.slice(1).slice(-8);
    console.log("newcollections fetched");
    res.send(newcollection);
})
//endpoint for popular in women
app.get("/popularinwomen", async (req, res) => {
    let products = await Product.find({category:"women"});
    let popular_in_women =products.slice(0,4);
    console.log(popular_in_women);
    res.send(popular_in_women);
})

// Start the server
app.listen(port, () => {
    console.log("Server is running on Port", port);
});