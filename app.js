//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-fluke:0891224058@cluster0-5lmfe.mongodb.net/todolistDB", {useNewUrlParser: 1,useUnifiedTopology: true,useFindAndModify: false });
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome to todolist."
});
const item2 = new Item({
  name: "Hit the + button to add new item."
});
const item3 = new Item({
  name: "<-- hit this to delete an item."
});


const listSchema = {
  name: String,
  item: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
Item.find({},function(err,founditem){
  const day = date.getDate();
    if(founditem.length === 0){
      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log("err");
        }else{
          console.log("Successfully saved default item to db");
        }
        res.redirect("/");
      });
    }else{
      res.render("list", {listTitle: day, newListItems: founditem});
    }
});

});

app.post("/", function(req, res){

  const ItemName = req.body.newItem;
  const ListName = req.body.list;
  const day = date.getDate();
  const item = new Item({
     name : ItemName
   });
  if(ListName === day){

     item.save();
     res.redirect("/");
  }else {
    List.findOne({name:ListName},function(err,foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + ListName);
    });
  }


});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();
  if(listName === day){
    Item.deleteOne({_id:checkedItem},function(err){
      if(err){
        console.log("err");
      }else{
      console.log("Successfully Delete");
      }
    res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName =  _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,founditem){
    if(err){
      console.log(err);
    }else if(founditem){
        res.render("list", {listTitle: founditem.name , newListItems: founditem.item});
    }else{

      const list = new List({
        name: customListName,
        item: [item1,item2,item3]
      });

      list.save();
      res.redirect("/" + customListName);
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
