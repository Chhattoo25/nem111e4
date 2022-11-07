const express = require("express");
const { connection } = require("./config/db");
const { UserModel } = require("./model/User.model");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { authentication } = require("./middleware/authentication");
const { TodoModel } = require("./model/Todo.model");
require("dotenv").config();

const app = express();

app.use(express.json());
const PORT = process.env.PORT || 8000;
app.get("/", (req, res) => {
  res.send("welcome");
});

//SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const isUser = await UserModel.findOne({ email });
  if (isUser) {
    res.send("User already exist try logging in");
  } else {
    bcrypt.hash(password, 5, async function (err, hash) {
      if (err) {
        res.send("something went wrong,please try again later");
      }

      const new_user = new UserModel({
        email,
        password: hash,
      });
      try {
        await new_user.save();
        res.send({ msg: "signup success", new_user });
      } catch (err) {
        res.send("something went wrong please try again later ");
      }
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  const user_id = user._id;
  const hashed_password = user.password;
  console.log(user);
  bcrypt.compare(password, hashed_password, function (err, result) {
    if (err) {
      res.send("something went wrong try again later");
    }
    const token = jwt.sign({ user_id: user_id }, process.env.SECRET_KEY);
    if (result) {
      res.send({ msg: "Login succesfull", token });
    } else {
      res.send("Login Failed");
    }
  });
});

app.post("/todos/create", authentication, async (req, res) => {
  const { taskname, status, tag, user_id } = req.body;
  const new_todo = new TodoModel({
    taskname,
    status,
    tag,
    user_id: user_id,
  });
  await new_todo.save();
  res.send({ new_todo });
});

app.get("/todos", async (req, res) => {
  const { user_id } = req.body;
  console.log(user_id);
  const todos = await TodoModel.find({ user_id: user_id });
  console.log(todos);
  res.send({ todos });
});

app.patch("/todos/update", async (req, res) => {
  const {taskname, status, tag, user_id } = req.body;

  const todos = await TodoModel.findByIdAndUpdate({ user_id: user_id });
  if(todos){
 todos.taskname = taskname;
 todos.status = status;
 todos.tag = tag; 
 const updateTodo = await todos.save( )
 res.json(updateTodo)
  }
  else{
 res.status(400).send("Not found ")
  }
  res.send("getTodo");
});

app.delete("/todos/delete/:todo_id", async (req, res) => {
  const { user_id } = req.body;
  try {
    const { todo_id } = req.params;

   const todo =  await TodoModel.findByIdAndDelete(todo_id);
    return res.status(200).send({ message: "Todo Deleted" ,todo});
  } catch (err) {
    console.log(err);
    return res.status(401).send({ msg: err.message });
  }

  console.log(todos);
  res.send("getTodo");
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("connected to DB successfully");
  } catch (err) {
    console.log(err);
    console.log("err connected to DB");
  }
  console.log("server started at http://loclhost:8080");
});
