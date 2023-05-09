import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials : {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_PASSWORD
  },
});

const imageMulterUploader = multerS3({
  s3: s3,
  bucket: 'momawetube/images',
  acl: "public-read",
});
const videoMulterUploader = multerS3({
  s3: s3,
  bucket: 'momawetube/videos',
  acl: "public-read",
});

export const localsMiddelware = (req, res, next) => {

  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  else {
    return res.redirect("/login");
  }
};

export const publicOnlyMiddelware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  }
  else {
    req.flash("error","Not authorized");
    return res.redirect("/");
  }
};


export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 5000000,
  },
  storage: imageMulterUploader,  
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 20000000,
  },
  storage: videoMulterUploader,
});