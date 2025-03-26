import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import mongoose from "mongoose";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

// const db = new pg.Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });
// db.connect()
// .then(() => {
//     console.log("Database is connected successfully!");
//   })
//   .catch((err) => {
//     console.error("Database connection error:", err.stack);
//   });




const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/innovaconnect";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database is connected successfully!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

  const userSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true, enum: ["startup", "investor"] },
    },
    { collection: "users" } // Explicitly setting collection name
  );
  
  // Explicitly define collection name as "users"
  const User = mongoose.model("User", userSchema);



// CHANGES START: Middleware to check user role
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function ensureRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).send("Access Denied");
  };
}
// CHANGES END

app.get("/", (req, res) => {
  res.render("explore.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// CHANGES START: Restricting secrets page to authenticated users
app.get("/secrets", ensureAuthenticated, (req, res) => {
  res.render("secrets.ejs", { user: req.user });
});
// CHANGES END

// CHANGES START: Role-based access for startup dashboard and investor dashboard
app.get("/startup-dashboard", ensureRole("startup"), (req, res) => {
  res.render("startdashboard.ejs", { user: req.user });
});

app.get("/investor-dashboard", ensureRole("investor"), (req, res) => {
  res.render("invdashboard.ejs", { user: req.user });
});
// CHANGES END

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}))

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

// CHANGES START: Modify Login Route to redirect based on role
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    if (req.user.role === "startup") {
      res.redirect("/startup-dashboard");
    } else if (req.user.role === "investor") {
      res.redirect("/investor-dashboard");
    } else {
      res.send("role is unknown");
    }
  }
);
// CHANGES END

// CHANGES START: Register Route with Role Selection
app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect("/login"); // Redirect if user exists
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ email, password: hash, role });
    const savedUser = await newUser.save();

    req.login(savedUser, (err) => {
      if (err) {
        console.error("Error logging in user:", err);
        return res.redirect("/login");
      }

      res.redirect(role === "startup" ? "/startup-dashboard" : "/investor-dashboard");
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Server Error");
  }
});

// CHANGES END

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true }, // Use "email" instead of "username"
    async function verify(req, email, password, cb) {
      try {
        // Find the user by email in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
          return cb(null, false, { message: "User not found" }); // No user found
        }

        // Check if role matches
        if (req.body.role !== user.role) {
          return cb(null, false, { message: "Role didn't match" });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return cb(null, false, { message: "Incorrect password" });
        }

        return cb(null, user); // Success
      } catch (err) {
        console.error("Database error:", err);
        return cb(err);
      }
    }
  )
);

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        profile.email,
      ]);
      if (result.rows.length === 0) {
        const newUser = await db.query(
          "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
          [profile.email, "google", "investor"] // Defaulting Google users as investors
        );
        return cb(null, newUser.rows[0]);
      } else {
        return cb(null, result.rows[0]);
      }
    } catch (err) {
      return cb(err);
    }
  }
)
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
