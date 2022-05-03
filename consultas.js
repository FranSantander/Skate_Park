const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgresql",
  database: "skatepark",
  port: 5432,
});

async function nuevoSkater(email, nombre, password, experiencia, especialidad, foto) {
  try {
      const result = await pool.query(
          `INSERT INTO skaters
          (email, nombre, password, anos_experiencia, especialidad, foto, estado)
          VALUES ('${email}','${nombre}','${password}','${experiencia}','${especialidad}','${foto}',false) RETURNING *`);
      console.log(`Usuario ${result.rows[0].nombre} creado con éxito`);
      return result.rows;
  } catch (e) {
      console.log(e);
  }
}

module.exports = { nuevoSkater };
