
import express from "express"; // npm install -D @types/express
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // npm install -D jsonwebtoken
import { ContentModel, LinkModel, UserModel } from "./db.js";
import z from "zod";
import { hash } from "zod";
import bcrypt from "bcrypt";
import "./db.js"
import { JWT_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";



const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async(req,res) => {
    //zod validation,hash the password
    const requireBody = z.object({
        username:z.string().min(4).max(20),
        password:z.string().min(6).max(15),
    });
    
    const parsedData = requireBody.safeParse(req.body);

    if(!parsedData.success){
        res.json({
            message:"Incorrect Format",
            error:parsedData.error,
        });
    }

    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password,5);
    console.log("hashedpassword",hashedPassword);

     try {
     await UserModel.create({
        username:username,
        password: hashedPassword,
});

    res.json({
        message:"User signed up"
    });
}catch (error){
    res.status(411).json({
        message:"Username already exists",
    });
}
})

app.post("/api/v1/signin",async (req,res) => {
    const username=req.body.username;
    const password=req.body.password;

    const existingUser = await UserModel.findOne({
       username,
    })
     if (!existingUser){
        res.status(404).json({
            message:"User does not exist"
        })
     }

     const passwordMatch = await bcrypt.compare(password,(existingUser as any).password);
      
     if(passwordMatch){
        const token=jwt.sign({
            id:(existingUser as any)._id
        },JWT_SECRET)

        res.json({
            token
        })
     }
     else{
        res.status(403).json({
            message:"Incorrect Credentials"
        })
     }
});


app.post("/api/v1/content",userMiddleware,async (req,res) => {
  const link = req.body.link;
  const type = req.body.type;

  await ContentModel.create({
    link,
    type,
    title:req.body.title,
    //@ts-ignore
    userId:req.userId,
    tags:[]
  })
  return res.json({
    message:"Content added"
  })
  
});

app.get("/api/v1/content",userMiddleware,async (req,res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId:userId
    }).populate("userId","username")
    res.json({
        content
    })

})

app.delete("/api/v1/content",userMiddleware,async (req,res) => {
    const contentId = req.body.contentId;

    try{
    await ContentModel.deleteMany({
        _id:contentId,
        //@ts-ignore
        userId:req.userId
    })
    res.json({
        message:"Deleted"
    })
} catch(error) {
    res.status(411).json({
        message:"Content Does not exist"
    })
}

})

app.post("/api/v1/brain/share",userMiddleware,async (req,res) => {
 const share =req.body.share;
 if(share) {
    
    const existingLink = await LinkModel.findOne({
        // @ts-ignore
        userId: req.userId
    });
    if (existingLink) {
        res.json({
            hash:existingLink.hash
        })
        return;
    }
    const hash = random(10)
    await LinkModel.create({
        //@ts-ignore
        userId: req.userId,
        hash:hash
    })

     res.json({
        hash
 })
 }else {
    await LinkModel.deleteOne({
        //@ts-ignore
        userId:req.userId
    });
     res.json({
    message: "Removed link"
 })
 }
})

app.get("/api/v1/brain/:shareLink",async(req,res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
       hash 
    });

    if(!link){
       res.status(411).json({
       message:"Sorry incorrect input"
       })

       return;
    
    }

    //userid
    const content = await ContentModel.find({
        userId:link.userId
    })
    
    console.log(link);
    const user = await UserModel.findOne({
        _id:link.userId
    })

    if(!user){
           res.status(411).json({
       message:"user not found,error should ideally not happen"
       })

       return;

    }

    res.json({
        username: user.username, // ?. = optional chaining
        content:content
    })
    
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




