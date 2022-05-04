const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgresql",
  database: "skatepark",
  port: 5432,
});

async function consultarSkaters() {
  try {
    const result = await pool.query(`SELECT * FROM skaters`);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
}

async function nuevoSkater(
  email,
  nombre,
  password,
  experiencia,
  especialidad,
  foto
) {
  try {
    const result = await pool.query(
      `INSERT INTO skaters
          (email, nombre, password, anos_experiencia, especialidad, foto, estado)
          VALUES ('${email}','${nombre}','${password}','${experiencia}','${especialidad}','${foto}',false) RETURNING *`
    );
    //console.log(`Usuario ${result.rows[0].nombre} creado con éxito`);
    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
}
async function getSkaters(email, password) {
  const result = await pool.query(
    `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`
  );
  return result.rows;
}
async function updateStatus(id, estado) {
  const result = await pool.query(
    `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *;`
  );
  //console.log(`Estado del usuario '${result.rows[0].nombre}' actualizado con éxito`);
  const usuario = result.rows[0];
  return usuario;
}
async function updateSkater(
  email,
  nombre,
  password,
  experiencia,
  especialidad
) {
  try {
    const result = await pool.query(
      `UPDATE skaters SET nombre = '${nombre}', password = '${password}', anos_experiencia = '${experiencia}', especialidad = '${especialidad}' WHERE email = '${email}' RETURNING *`
    );
    console.log(`Usuario ${result.rows[0].nombre} actualizado con éxito`);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
}
async function getFoto(email) {
  try {
      const result = await pool.query(`SELECT foto FROM skaters WHERE email = '${email}'`)
      return result.rows[0];
  } catch (error) {
      console.log(error);
  }
}
async function deleteUsuario(email) {
  try {
      const result = await pool.query(`DELETE FROM skaters WHERE email = '${email}' RETURNING *`);
      console.log('Usuario eliminado con éxito');
      return result.rows;
  } catch (error) {
      console.log(error);
  }
}
module.exports = {
  consultarSkaters,
  nuevoSkater,
  getSkaters,
  updateStatus,
  updateSkater,
  getFoto,
  deleteUsuario,
};
