import express from "express";
import { getJoin, postJoin, getLogin, postLogin } from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { publicOnlyMiddelware } from "../middelware";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddelware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicOnlyMiddelware).get(getLogin).post(postLogin); 
rootRouter.get("/search", search);

export default rootRouter;