require("dotenv").config();
// Module Imports.
const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressSanitizer = require("express-sanitizer"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override");
const PORT = process.env.PORT || 3000;

//APP CONFIG.

mongoose.set("useUnifiedTopology", true);
mongoose.connect(
  process.env.MONGODBURI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log(`Connected to the DataBase!`);
  }
);
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

const Blog = require("./model/blog");
//RESTFUL ROUTES
app.get("/", function (req, res) {
  res.redirect("/blogs");
});
app.get("/blogs", function (req, res) {
  Blog.find({}, function (err, blogs) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

app.get("/blogs/new", function (req, res) {
  res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function (req, res) {
  //Sanitize to prevent unwanted user input.
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
      console.log("Blog created!");
    }
  });
});
//SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});
//EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});
//UPDATE ROUTE
app.put("/blogs/:id", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(
    req.params.id,
    req.body.blog,
    function (err, updatedBlog) {
      if (err) {
        res.redirect("/blogs");
      } else {
        res.redirect("/blogs/" + req.params.id);
      }
    }
  );
});
//DELETE ROUTE
app.delete("/blogs/:id", function (req, res) {
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(PORT, function () {
  console.log(`Server for Blog App has started on ${PORT}`);
});
