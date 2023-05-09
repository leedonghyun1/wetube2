import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, confirmPassword, location } = req.body;
  const pageTitle = "Join";
  if (password !== confirmPassword) {
    return res.status(400).render("join", { pageTitle, errorMessage: "Confirm password is not matched with password." })
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", { pageTitle, errorMessage: "This username or email already exists." })
  }
  try {
    await User.create({
      name,
      username,
      password,
      email,
      location,
    })
    res.redirect("/login");
  }
  catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => res.render("login", { pageTitle: "Log In" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Log In";
  const user = await User.findOne({ username, githubLoginOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wetube can't find user or valid password",
    });
  }
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wetube can't find user or valid password"
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success",`안녕하세요, ${username} 님`);
  return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize"
  const config = {
    client_id: process.env.CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email"
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token"
  const config = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code
  };
  const params = new URLSearchParams(config).toString()
  const finalUrl = `${baseUrl}?${params}`;


  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {

    const { access_token } = tokenRequest
    const apiUrl = "https://api.github.com"
    const userData = await (await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })
    ).json();

    const emailData = await (await fetch(`${apiUrl}/user/emails`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })
    ).json();

    const emailObj = emailData.find(
      email => email.primary === true && email.verified === true
    )
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        password: "",
        email: emailObj.email,
        githubLoginOnly: true,
        location: userData.location,
      });
    }
    else {
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/login")
    }
  } else {
    return res.redirect("/login");
  };
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const { session: {
    user: { _id, avatarUrl }
  },
    body: { name, email, username, location },
    file,
  } = req;
  console.log(file);
  const updateUser = await User.findByIdAndUpdate(_id, {
    avatarUrl: file ? file.location : avatarUrl,
    name,
    email,
    username,
    location,
  },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {

  const { session: {
    user: { _id, password } },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req;

  const user = await User.findByIdAndUpdate(_id);

  const passwordCompare = await bcrypt.compare(oldPassword, user.password)

  if (!passwordCompare) {
    return res.status(400).render("users/change-password", { pageTitle: "Change Password", errorMessage: "Old password does not match." });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("users/change-password", { pageTitle: "Change Password", errorMessage: "New password does not match." });
  }
  user.password = newPassword;
  await user.save(); // userSchema.pre 실행
  req.session.user.password = user.password;
  return res.redirect("/users/logout");
};

export const seeUserProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    }
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("users/user-profile", { pageTitle: `${user.username} Profile`, user });
}
