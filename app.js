//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",);
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your Todo list"
});
const item2 = new Item({
  name: "Hit a + button to add new item"
});
const item3 = new Item({
  name: "<--Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];
const ListSchema = {
  name: String,
  items: [itemsSchema]
};
const list = mongoose.model("List", ListSchema);
app.get("/", function (req, res) {
  const day = "Today";
  Item.find().then((data) => {
    if (data.length === 0) {
      Item.insertMany(
        defaultItems
      ).then(function () {
        console.log("Data inserted") // Success 
      }).catch(function (error) {
        console.log(error)     // Failure 
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: data });
    }
  });
});
app.post("/", function (req, res) {
   const itemName = req.body.newItem;
   const listname = req.body.list;
   const item4 = new Item({
     name: itemName
   });
   if(listname === "Today")
   {
    item4.save();
    res.redirect("/");
   }
   else
   {
    list.findOne({name:listname}).then(function(data){
      data.items.push(item4);
      data.save();
      res.redirect("/"+listname);
    })
   }
});
app.post("/delete", async function (req, res) {
  const checkeditemId = req.body.checkbox;
  const listname = req.body.listName;
if(listname == "Today")
{
  Item.deleteOne({ _id: checkeditemId }).then(function () {
    console.log("Blog deleted"); // Success
  }).catch(function (error) {
    console.log(error); // Failure
  });
  res.redirect("/");
}
else
{
  await list.findOneAndUpdate({name:listname}, {$pull:{items:{_id:checkeditemId}}});
  res.redirect("/"+listname);
}
});
app.get("/:customListName", function (req, res) {
  const listName = _.capitalize(req.params.customListName);
  list.findOne({ name:  listName })
  .then((data) => {
      if (data) {
        res.render("list", { listTitle: data.name, newListItems: data.items });
      } else {
          const newitem = new list({
          name:listName,
          items:defaultItems
          });
          newitem.save();
          res.redirect("/:"+listName);
          }     
  })
  .catch((error) => {
      console.error("Error:", error);
  });
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});