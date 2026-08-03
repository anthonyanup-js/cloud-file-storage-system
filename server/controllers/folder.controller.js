import Folder from "../models/folder.model.js";
import File from "../models/file.model.js";
import customError from "../utils/customError.js";

export const createFolder = async (req, res) => {
  const { folderName } = req.body;
  const parentFolder = req.params.parentFolder || null;
  const createdBy = req.userId || 1;

  if (!folderName.trim()) {
    throw new customError("Folder Name Required", 400);
    return;
  }

  if (!createdBy) {
    throw new customError("Unauthorized Access", 401);
    return;
  }

  const newFolder = new Folder({
    createdBy,
    folderName,
    parentFolder,
  });
  await newFolder.save();

  const folder = newFolder.toObject();
  delete folder.createdBy;

  res.status(201).json({ folder });
};

export const deleteFolder = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.userId || 1;

  if (!id) {
    throw new customError("Folder Id Required", 400);
    return;
  }

  if (!createdBy) {
    throw new customError("Unauthorized Access", 401);
    return;
  }

  const rootFolder = await Folder.findOne({
    _id: id,
    createdBy,
  });

  if (!rootFolder) {
    throw new customError("Folder Not Found", 400);
    return;
  }

  //use itterative approach
  const stack = [rootFolder._id];
  while (stack.length) {
    const folderId = stack.pop();
    //delete the files from s3 before deleteing it from DB
    //also delete files from s3 (implement it later)
    const [folders] = await Promise.all([
      Folder.find({ parentFolder: folderId, createdBy }),
      File.deleteMany({ parentFolder: folderId, createdBy }),
      Folder.deleteOne({ _id: folderId, createdBy }),
    ]);
    folders.forEach((folder) => stack.push(folder._id));
  }
  //also delete files from s3 (implement it later)
  res.status(200).json({ message: "folder deleted successfullt" });
};

export const renameFolder = async (req, res) => {
  const { id } = req.params;
  const { folderName } = req.body;
  const createdBy = req.userId || 1;

  if (!createdBy) {
    throw new customError("Unauthorized Access", 401);
    return;
  }

  if (!id || !folderName.trim()) {
    throw new customError("All Fields Are Required", 400);
    return;
  }
  const folder = await Folder.findOneAndUpdate(
    { _id: id, createdBy },
    { folderName },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!folder) {
    throw new customError("Folder Not Found", 400);
  }

  res.status(200).json({ folder });
};

export const getFolderContent = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.userId || 1;
  const parentFolder = id || null;

  if (!createdBy) {
    throw new customError("Unauthorized Access", 401);
    return;
  }

  const folders = await Folder.find({ parentFolder, createdBy });
  const files = await File.find({ parentFolder, createdBy });
  res.status(200).json({ folders, files });
};
