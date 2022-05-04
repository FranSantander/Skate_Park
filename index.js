//Importación
const express = require("express");
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
//const path = require("path");
const secretKey = "secreto";
const {
  consultarSkaters,
  nuevoSkater,
  getSkaters,
  updateStatus,
  updateSkater,
  getFoto,
  deleteUsuario,
} = require("./consultas");
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
    helpers: {
      fixInde: function (valor) {
        return parseInt(valor) + 1;
      },
    },
  })
);
app.set("view engine", "handlebars");

//Ruta raíz
app.get("/", async (req, res) => {
  try {
    const usuarios = await consultarSkaters();
    res.render("Index", { usuarios });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

//Ruta para ver Registro
app.get("/registro", function (req, res) {
  res.render("Registro");
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
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

//Ruta para ver Login
app.get("/login", function (req, res) {
  res.render("Login");
});

//Ruta para iniciar sesión
app.post("/verify", async function (req, res) {
  const { email, password } = req.body;
  const user = await getSkaters(email, password);
  if (user) {
    if (user.estado) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 180,
          data: user,
        },
        secretKey
      );
      res.send(token);
    } else {
      res.status(401).send({
        error: "Este usuario aún no ha sido validado para subir imágenes",
        code: 401,
      });
    }
  } else {
    res.status(404).send({
      error: "Este usuario no está registrado en la base de datos",
      code: 404,
    });
  }
});
//Ruta para modificar el estado los usuarios
app.put("/usuarios", async (req, res) => {
  const { id, estado } = req.body;
  try {
    const usuario = await updateStatus(id, estado);
    res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

//Ruta de los administradores
app.get("/Admin", async (req, res) => {
  try {
    const usuarios = await consultarSkaters();
    res.render("Admin", { usuarios });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

//Ruta modificar datos usuarios
app.get("/Datos", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (decoded === undefined) {
      return res.status(401).send({
        error: "401 Unauthorized",
        message: "Usted no esta autorizado para estar aqui",
      });
    }
    const { data } = decoded;
    const { email, nombre, password, anos_experiencia, especialidad } =
      data;
    err
      ? res.status(401).send({
          error: "401 Unauthorized",
          message: "Usted no esta autorizado para estar aqui",
          token_error: err.message,
        })
      : res.render("Datos", {
          email,
          nombre,
          password,
          anos_experiencia,
          especialidad,
        });
  });
});

//Ruta para actualizar un usuario
app.put("/update", async (req, res) => {
  const { email, nombre, password, experiencia, especialidad } = req.body;
  try {
    const usuario = await updateSkater(
      email,
      nombre,
      password,
      experiencia,
      especialidad
    );
    res.status(200).send(usuario);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//Ruta para eliminar un usuario
app.delete("/delete/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const { foto } = await getFoto(email);
    const usuario = await deleteUsuario(email);
    fs.unlink(`${__dirname}/public/uploads/${foto}`, (err) => {
      if (err) console.log(err);
      res.status(200).send(usuario);
    });
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});
