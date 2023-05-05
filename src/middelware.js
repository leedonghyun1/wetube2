import multer from "multer";

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
}


export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 5000000,
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 20000000,
  },
});