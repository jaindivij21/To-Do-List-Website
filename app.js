//* MAIN app.js

//  REQUIREMENTS
/* #region   */
const e = require("express");
const express = require("express");
const https = require("https"); // used to get and post (usually) API requests
const mongoose = require("mongoose"); // require database
const _ = require("lodash");
const day = require(__dirname + "/public/javascripts/date.js");
/* #endregion */

// APP CONST
/* #region   */
const app = express();
app.use(express.static(__dirname + "/public")); // serves static files
app.set("view engine", "ejs"); // EJS Templating : Tells our app to use EJS as its view engine
app.use(express.urlencoded({ extended: true })); // body parser
/* #endregion */

//* MAIN

// SETUP DATABASE
/* #region */
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
  { name: "Welcome to your TO-DO LIST :)" },
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
        List.distinct("name", (err, result) => {
          if (!err) {
            // use EJS's render function to get list.html by passing variable day string (the key being kindOfDay)
            res.render("list", {
              listList: result,
              listTitle: currDate,
              newItems: items,
            });
          }
        });
      }
    }
  });
});

// non index page route
app.get("/list/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName); // save the name of the route
  // Whenever the user tries to access a new Route, need to make a new list DOCUMENT for that route in the database if it doesn't already exist
  List.findOne({ name: customListName }, (err, foundList) => {
    if (err) console.log(err);
    else {
      //? Note Item is an Object
      if (!foundList) {
        // couldn't find
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save(); // then add a new list

        // redirect the route back
        res.redirect(`/list/${customListName}`);
      } else {
        List.distinct("name", (err, result) => {
          if (!err) {
            // if list found : show the list
            res.render("list", {
              listTitle: customListName,
              newItems: foundList.items,
              listList: result,
            });
          }
        });
      }
    }
  });
});

// index page : post request (new Item form)
app.post("/", (req, res) => {
  const currDate = day.getDate();
  // req the data posted back through a form into a variable
  const itemName = req.body.listItem;
  const listName = req.body.list;
  // store this new Item into the MongoDB data base (in a new document) -> now decide where to insert this document
  // in Item collection? then just save.
  const item = new Item({ name: itemName });
  if (listName === currDate.substr(0, currDate.indexOf(" "))) {
    item.save(); // saves into the Item Collection
    // redirect to home route
    res.redirect("/");
  } else {
    // found list is an object that contains array
    List.findOne({ name: listName }, (err, foundList) => {
      if (err) console.log(err);
      else {
        foundList.items.push(item); // add the new item in the array inside of the object found list
        foundList.save(); // save the entire object
        res.redirect(`/list/${listName}`);
      }
    });
  }
});

// index page: post request (delete item form)
app.post("/delete", (req, res) => {
  const currDate = day.getDate();
  const checkedItemID = req.body.checkbox;
  const listName = req.body.list;

  // check which list are we deleting from
  if (currDate === listName) {
    // main list
    // Delete the item by using the above ID
    Item.findByIdAndRemove(checkedItemID, (err) => {
      if (err) console.log(err);
      else {
        console.log("Successfully deleted the item!");
      }
    });
    // Redirect to the index page
    res.redirect("/");
  } else {
    //? Documentation: https://docs.mongodb.com/manual/reference/operator/update/pull/
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemID } } },
      (err, foundList) => {
        if (!err) {
          res.redirect(`/list/${listName}`);
        }
      }
    );
  }
});
/* #endregion */

// LISTEN: BROWSER PORT
/* #region   */
app.listen(process.env.PORT || 3000, () => {
  console.log("The server has started!");
});
/* #endregion */
