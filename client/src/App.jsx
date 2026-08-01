import { useEffect } from 'react'
import {useState} from 'react'
import axiosInstance from "./config/axios.config.js"

const App = () => {
  const [content,setContent]=useState([])
  //{fileName:"anup.jpg",isFolder:false},{fileName:"newFolder",isFolder:true}
  const [file,setFile]=useState(null)
  const [currentFolder,setCurrentFolder]=useState([])


  async function getAllContent(){
    const {data}=await axiosInstance.post("/get",{
      body:currentFolder[currentFolder.length-1]
    })
    setContent(data)

  }


  async function uploadContent(){
    const {name,size,type}=file
    //upload in s3 then delete in DB
    const {data}=await axiosInstance.post("/upload",{name:name,size:size,type:type,path:currentFolder})
    setContent([...content,data])

    

  }

  async function deleteContent(contentID){
        //delete in s3 then delete in DB

    await axiosInstance.delete(`/${contentID}`)
    setContent(content.filter((item)=>item._id!==contentID))
  }


  function renameContent(){}
  function downloadContent(){}
  function viewContent(){
    //view folder
    axiosInstance.get(`/${item.fileName}`)
  }


  async function creteFolder(){
    const folderName=prompt("Enter folder name")
    //upload the folder name in s3 first then in DB
    const {data}=await axiosInstance.post("/new-folder",{
      folderName,
      path:currentFolder
    })
    setContent([...content,data])



  }



    useEffect(()=>{
    //fetch all files and folder whose parent folder is null
    getAllContent()
  },[])
  return (
    <div>
      <h1>File Uploader</h1>
      <button onClick={creteFolder}> CREATE FOLDER +</button>


      <input type="file" onChange={(e)=>{setFile(e.target.files[0])}} />
      <button onClick={uploadContent}>UPLOAD</button>
      <ol>
        {
          content.map((item)=>(
            <li key={item._id}>{item.fileName} {item.isFolder===false && <button onClick={downloadContent}>Download</button>} <button onClick={viewContent}>View</button> <button onClick={()=>deleteContent(item._id)}>Delete</button>
            </li>
            
          ))
        }
        </ol>




    </div>
  )
}

export default App