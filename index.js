//Importación
const express = require("express");
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
//const path = require("path");
const secretKey = "secreto";
const { nuevoSkater } = require("./consultas");
const app = express();

app.listen(3000, console.log("Server on port 3000"));

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido",
  })
);
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/layout`,
  })
);
app.set("view engine", "handlebars");

//Ruta Home
app.get("/", (req, res) => {
  res.render("index");
});

//Ruta para ver Registro
app.get("/registro", function (req, res) {
  res.render("Registro");
});

//Ruta para ver Login
app.get("/login", function (req, res) {
  res.render("Login");
});

//Ruta para ingresar nuevo usuario
app.post("/registrar", async (req, res) => {
  const { email, nombre, password, experiencia, especialidad } = req.body;
  const { foto } = req.files;
  const name = foto.name;
  try {
    const registro = await nuevoSkater(
      email,
      nombre,
      password,
      experiencia,
      especialidad,
      name
    ).then(() => {
      foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
        if (err) res.status(500).send("Error al subir la imagen");
        res.status(201).redirect("/login");
      });
    });
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});
