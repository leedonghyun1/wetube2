import express from "express";
import { getEdit, postEdit, logout, seeUserProfile, startGithubLogin, finishGithubLogin, postChangePassword, getChangePassword } from "../controllers/userController"
import { avatarUpload, protectorMiddleware, publicOnlyMiddelware } from "../middelware";

const userRotuer = express.Router();
  
userRotuer.get("/logout", protectorMiddleware, logout);
userRotuer.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRotuer.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRotuer.get("/github/start", publicOnlyMiddelware ,startGithubLogin);
userRotuer.get("/github/finish", publicOnlyMiddelware ,finishGithubLogin);
userRotuer.get("/:id", seeUserProfile);
  

export default userRotuer;