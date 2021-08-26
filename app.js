//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Amar-admin:Kituli-AmarAdmin@todolist.xbyw1.mongodb.net/todoDB", { useNewUrlParser: true });

const itemSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome To Your To Do List",
});
const item2 = new Item({
  name: "<-- Hit Here to Delete an Task",
});
const item3 = new Item({
  name: "Type below to Add new task",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Saved Deafault Items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    
  });
});

app.post("/delete", function(req,res){
  const checkedId= req.body.check;
  const listName= req.body.delList;


  if(listName==="Today"){
    Item.findByIdAndRemove(checkedId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Sucessfully Deleted Cheked items");
      }
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName} , {$pull: {items: {_id:checkedId}}} , function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

  
})

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item= new Item({
    name: itemName
  })
  

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
         foundList.items.push(item);
         foundList.save();
         res.redirect("/"+listName);

    })
  }

  
  
});


app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        // create one
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+ customListName);
      }else{
        // show that
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
