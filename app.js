//jshint esversion:6
require("dotenv").config();
const user = process.env.USER;
const password = process.env.PASSWORD;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://"+user+":"+password+"@cluster0.5kmrw.mongodb.net/todolistDB?retryWrites=true&w=majority",  {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose.set('useFindAndModify', false);
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1= new Item({
  name: "Eating"
})
const item2= new Item({
  name: "Sleeping"
})
const item3= new Item({
  name: "Playing"
})
const defaultItems = [item1, item2, item3];
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   } else{
//     console.log("Items inserted succesfully");
//   }
// })
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("list", listSchema);
app.get("/", function(req, res) {
  Item.find({}, function(err, items){
    if(err){
      console.log(err);
    }
    else{
      if(items.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            res.redirect("/");
          }
        });
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      if(err){
        console.log(err);
      }
      else{
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

});
app.post("/delete", function(req, res){
  const itemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findOneAndDelete ({_id: itemID}, function(err){
      if(err){
        console.log(err);
      }
      else{
         res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},
      {$pull: {items: {_id: itemID}}},
      function(err, foundList){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/" + listName);
      }
    })
  }


});
app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, function(err, foundList){
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});
app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started succesfully");
});
