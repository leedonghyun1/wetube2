
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRotuer from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddelware } from "./middelware";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
// cwd => Current Working Direcory
app.set("views", process.cwd() + "/src/views");

// app.use((req, res, next)=>{
//   res.header("Cross-Origin-Embedder-Policy","require-corp");
//   res.header("Cross-Origin-Opener-Policy","same-origin");
//   next();
// });
app.use(logger);
app.use(express.urlencoded({ extended: true }));

// 백엔드로 넘어오는 텍스트 확인 가능.
app.use(express.json());

//로그인 된 사람들만 세션 정보를 백엔드에서 보유
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: {
  //   maxAge: 20000,
  // },
  store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
}))

// localsMiddelware는 위 session middelware 다음에 오기 때문에 가능.
app.use(flash());
app.use(localsMiddelware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRotuer);
app.use("/api", apiRouter);

export default app;



