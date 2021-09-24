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

// Schema 1 (for home/index page)
const itemSchema = new mongoose.Schema({
  name: String,
});

// Mongoose model : collection 1 (for home page)
const Item = mongoose.model("Item", itemSchema);

// Schema 2 (for custom lists)
const listSchema = {
  name: String,
  items: [itemSchema],
}; // this collection will store all the custom lists : the name key is the name of the custom list and items is an array/collection
// of documents of type item.

// Mongoose Model : collection 2 (for custom lists)
const List = mongoose.model("List", listSchema);

// default 3 items in the database (array)
const defaultItems = [
  { name: "Welcome to you TO-DO LIST :)" },
  { name: "Hit the + button to add a new item." },
  { name: "<-- Hit this checkbox to delete an item" },
];
/* #endregion */

// GLOBAL VARIABLES : Nil

// PAGES
/* #region */

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

// non index page route
app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName; // save the name of the route
  // Whenever the user tries to access a new Route, need to make a new list DOCUMENT for that route in the database if it doesn't already exist
  List.findOne({ name: customListName }, (err, item) => {
    if (err) console.log(err);
    else {
      if (item === null) {
        // couldn't find
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save(); // then add a new list
      } else {
        // if list found
        const name = item.name;
        const items = item.items;
        console.log(name, items);
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
