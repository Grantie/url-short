const express = require("express");
const app = express();
const shortid = require("shortid");
require("dotenv/config");

const { initializeApp } = require("firebase/app");
const { getDatabase, set, ref, get } = require("firebase/database");
const firebaseConfig = {
  apiKey: "AIzaSyARhuLKvBwr-5KzA42cggDJqlQ5tzPZSp4",
  authDomain: "url-short-grantie.firebaseapp.com",
  projectId: "url-short-grantie",
  storageBucket: "url-short-grantie.appspot.com",
  messagingSenderId: "55303400859",
  appId: "1:55303400859:web:945181fe6ebc60b582853e"
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

app.use(express.urlencoded({ extended: false }));
app.set("view-engine", "ejs");

app.get("/", (req, res) => {
  res.render("create.ejs");
});

app.post("/create", (req, res) => {
  var password = req.body.password;
  var longUrl = req.body.longUrl;
  var iframe = req.body.iframe;
  if (parseInt(iframe) != 1) iframe = null;
  if (!password || !longUrl) return false;

  if (process.env.ADMINPASS === password) {
    const id = shortid.generate();
    if (parseInt(iframe) == 1) {
      set(ref(db, `/urls/${id}`), {
        longUrl: longUrl,
        timestamp: Date.now(),
        clicks: 0,
        iframe: 1,
      });
    } else {
      set(ref(db, `/urls/${id}`), {
        longUrl: longUrl,
        timestamp: Date.now(),
        clicks: 0,
      });
    }
    res.render("success.ejs", { shortUrl: `https://link.tikogrant.com/!${id}`, longUrl: longUrl });
  } else {
    res.render("incorrectPassword.ejs");
  }
});

app.get("/!:id", (req, res) => {
  var id = req.params.id;
  if (!id) return false;
  get(ref(db, `/urls/${id}`)).then((snapshot) => {
    if (snapshot.val() == null) {
      res.render("404.ejs");
    } else {
      var longUrl = snapshot.val().longUrl;
      set(ref(db, `/urls/${id}/clicks`), snapshot.val().clicks + 1);
      if (snapshot.val().iframe != null) {
        res.render("iframe.ejs", { url: longUrl });
      } else {
        res.redirect(longUrl);
      }
    }
  });
});

app.listen(5000, () => {
  console.log("-- SERVER ONLINE --");
});