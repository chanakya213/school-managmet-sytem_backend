const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const middleware = require("./middleware");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/school", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected with SchoolDB");
  });
// login schema for the managment

const managmentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Managment = new mongoose.model("managment", managmentSchema);

// student schema for registering new stuident

const studentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  admission: {
    type: Number,
    required: true,
  },
  classname: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
});

let Student = new mongoose.model("student", studentSchema);

// this is faculty schema

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: Number,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
});

const Faculty = new mongoose.model("faculty", facultySchema);

// this is a events schema to manage events

const eventsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Event = new mongoose.model("event", eventsSchema);

app.get("/", (req, res) => {
  res.send("hello from simple server :)");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email[0] === "v") {
      const exist = await Managment.findOne({ email });
      if (!exist) {
        return res.status(400).send("email incorrect");
      }
      if (password !== exist.password) {
        return res.status(400).send("password is incorrect");
      }
      const payload = {
        user: {
          id: exist.id,
        },
      };
      jwt.sign(
        payload,
        "iwillad,dotENV,toprotect,this,password",
        { expiresIn: "2h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      res.status(200).send(email[0]);
    }
  } catch (error) {
    res.send(400).send(error);
  }
});

// app.post('/login',async (req, res) => {
//     try {
//         const { email , password} = req.body;
// const exist = await Managment.findOne({email});
// if(!exist){
//     return res.status(400).send("email incorrect");
// }if(password !== exist.password){
//     return res.status(400).send("password is incorrect");
// }
// const payload = {
//   user : {
//       id:exist.id
//   }
// }
// jwt.sign(payload,"iwilladddotENVtoprotectthispassword",{expiresIn:"5h"},(err,token)=>{
//     if(err) throw err
//     res.json({token});
// })
//     } catch (error) {
//         res.send(400).send(error);

//     }
// });

// app.post("/signup", async (req,res)=>{
//     try {
//         const { email , password } = req.body;
//         const exist = await Managment.findOne({email});
//         if(exist){
//             res.status(400).send("school already exist");
//         }
//         const newmanagment = new Managment({email,password});
//          await newmanagment.save();
//          res.status(200).send("successfully reagistered");
//     } catch(err){
//         res.status(400).send(err);
//         res.send("something went wrong");
//     }
// });

app.patch("/student/:id", middleware, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { $set: req.body });
    res.status(200).send("Student Details Updated Successully");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/student", middleware, async (req, res) => {
  try {
    const students = await Student.find();
    if (!students) {
      res.status(400).send("students not found");
    }
    res.json(students);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/student/:id", middleware, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id });
    if (!student) {
      res.status(400).send("students not found");
    }
    res.json(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/student", middleware, async (req, res) => {
  try {
    const { fullname, admission, classname, phonenumber, address, village } =
      req.body;
    const exist = await Student.findOne({ admission });
    if (exist) {
      return res
        .status(400)
        .send("Student Alredy Exist With Same Admission Number");
    }
    const newstudent = new Student({
      fullname,
      admission,
      classname,
      phonenumber,
      address,
      village,
    });
    newstudent.save();
    return res.status(200).send("Student Registered Successfully");
  } catch (err) {
    res.send("oh..! some error accured");
  }
});

app.delete("/student/:id", middleware, async (req, res) => {
  try {
    const exist = await Student.findById(req.params.id);
    if (!exist) {
      return res.send("Student Not Found");
    }
    await Student.deleteOne({ _id: req.params.id });
    res.status(200).send("student data deleted successfully");
  } catch (error) {
    return res.status(400).send(error + "unexpected error accured");
  }
});

// for faculty of the school to get and post new details in to the server

app.post("/faculty", middleware, async (req, res) => {
  try {
    const { name, designation, phonenumber, village } = req.body;
    const teacher = new Faculty({ name, designation, phonenumber, village });
    await teacher.save();
    res.status(200).send("TEACHER REGISTERED SUCCESSFULLY");
  } catch (error) {
    res.send("something went wrong");
  }
});

app.get("/faculty", middleware, async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (error) {
    res.status(400).send("somethiong went wrong");
  }
});

app.get("/faculty/:id", middleware, async (req, res) => {
  try {
    const exist = await Faculty.findOne({ _id: req.params.id });
    if (!exist) {
      return res.status(400).send("not able to find the Teacher");
    }
    const faculty = await Faculty.findOne({ _id: req.params.id });
    res.json(faculty);
  } catch (error) {
    res.status(400).send("somethiong went wrong");
  }
});

app.patch("/faculty/:id", middleware, async (req, res) => {
  try {
    await Faculty.findByIdAndUpdate(req.params.id, { $set: req.body });
    res.status(200).send("Faculty details Updated Successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/faculty/:id", middleware, async (req, res) => {
  try {
    await Faculty.deleteOne({ _id: req.params.id });
    res.status(200).send("One faculty member deleted successfully");
  } catch (error) {
    res.status(400).send("somethiong went wrong");
  }
});

// this section iof for events which deplays on home screen

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(400).send("something went wrong");
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id });
    res.json(event);
  } catch (error) {
    res.status(400).send("something went wrong");
  }
});

app.post("/events", middleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newevent = new Event({ title, content });
    await newevent.save();
    res.status(200).send("event added successfully");
  } catch (error) {
    res.send("an error accured");
  }
});

app.delete("/events/:id", middleware, async (req, res) => {
  try {
    await Event.deleteOne({ _id: req.params.id });
    res.status(200).send("Event deleted successfully");
  } catch (error) {
    res.status(400).send("something went wrong");
  }
});

app.listen(5000, () => {
  console.log(`Server started on port 5000`);
});
