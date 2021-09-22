//* MAIN app.js

//  REQUIREMENTS
/* #region   */
const express = require("express");
const https = require("https"); // used to get and post (usually) API requests
const mongoose = require("mongoose"); // require database
const day = require(__dirname + "/public/javascripts/date.js");
/* #endregion */

// APP CONST
/* #region   */
const app = express();
app.use(express.static("public")); // serves static files
app.set("view engine", "ejs"); // EJS Templating : Tells our app to use EJS as its view engine
app.use(express.urlencoded({ extended: true })); // body parser
/* #endregion */

//* MAIN

// SETUP DATABASE
/* #region   */
// Database name
const dbName = "todolistDB";
// connection URL
const url = `mongodb://localhost:27017/${dbName}`;
// connect to the Data base
mongoose.connect(url);

// Schema
const itemSchema = new mongoose.Schema({
  name: String,
});

// Mongoose model : collection
const Item = mongoose.model("Item", itemSchema);

// default 3 items in the database
const defaultItems = [
  { name: "Welcome to you TO-DO LIST :)" },
  { name: "Hit the + button to add a new item." },
  { name: "<-- Hit this checkbox to delete an item" },
];
/* #endregion */

// GLOBAL VARIABLES : Nil

// PAGES
/* #region   */
// index page : get request
app.get("/", (req, res) => {
  const currDate = day.getDate(); // get date function

  // use database find method to get the data, to print it on the page
  Item.find((err, items) => {
    if (err) console.log(err);
    else {
      // if the items array is empty : then add the default items to it, otherwise dont
      if (items.length === 0) {
        // Add these default items to the list
        Item.insertMany(defaultItems, (err) => {
          if (err) console.log(err);
          else console.log("Successfully added the default items to the list!");
        });
        res.redirect("/");
      } else {
        // use EJS's render function to get list.html by passing variable day string (the key being kindOfDay)
        res.render("list", { listTitle: currDate, newItems: items });
      }
    }
  });
});

// index page : post request (new Item form)
app.post("/", (req, res) => {
  // req the data posted back through a form into a variable
  const itemName = req.body.listItem;

  // store this new Item into the MongoDB data base (in a new document)
  const item = new Item({ name: itemName });
  item.save();

  // redirect to home route
  res.redirect("/");
});

// index page: post request (delete item form)
app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkbox;

  // Delete the item by using the above ID
  Item.findByIdAndRemove(checkedItemID, (err) => {
    if (err) console.log(err);
    else {
      console.log("Successfully deleted the item!");
    }
  });

  // Redirect to the index page
  res.redirect("/");
});
/* #endregion */

// LISTEN: BROWSER PORT
/* #region   */
app.listen(process.env.PORT || 3000, () => {
  console.log("The server has started!");
});

/* #endregion */
