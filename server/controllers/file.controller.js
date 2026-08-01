import File from "../models/file.model"
import customError from "../utils/customError"
import crypto from "crypto";

export const getAllFiles=async(req,res)=>{
    const {id:parentFolder}=req.paramsi
    const createdBy=req.userId
    if(!createdBy){
        throw new customError("Unauthorized Access",400)
        return
    }
  
    const files=await File.find({createdBy,parentFolder})

    res.status(200).json({files})

}

export const uploadFile=(req,res)=>{
    const {id:parentFolders}=req.params
    const createdBy=req.userId ||1
    const {fileName,fileSize,mimeType,parentFolders,s3Key}=req.body

    const newFile=await File.create({
        createdBy,
        fileName,
        fileSize,
        mimeType,
        parentFolders,
        s3Key
    })

    res.status(201).json({newFile})
    

}

export const renameFile=async (req,res)=>{
    const createdBy=req.userId || 1
    const fileId=req.params.id
    const newFileName=req.body
    if(!createdBy || fileId || newFileName) {
        throw new customError("All fields are required",400)
        return
    }
    const updatedFile=await File.updateOne({
        _id:fileId,
        createdBy,
    },{$set:{fileName:newFileName}},{
        new:true,
        runValidators: true
    })

    if(!updatedFile){
        throw new customError("All fields are required",400)
        return 
    }
    res.status(200).json({updatedFile})
}

export const deleteFile=(req,res)=>{
    //delete file in s3 after that in db
    const createdBy=req.userId
    const {id}=req.params
    await File.deleteOne({_id:id,createdBy})
    res.status(200).json({message:"File deleted successfully"})

}


//signed urls
export const getViewSignedUrl=async(req,res)=>{

}

export const getUploadSignedUrl=async(req,res)=>{
    // generate unique id using crypto
    //set the content type

    
}

export const getDownloadSignedUrl=async(req,res)=>{
    
}