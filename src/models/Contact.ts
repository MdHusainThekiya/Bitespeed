import { pool } from '../db/pgClient';
import util from '../helper/util';


const createTable = async () => {
  // Create a table if it does not exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Contact (
      id SERIAL PRIMARY KEY,
      phoneNumber VARCHAR(20),
      email VARCHAR(100),
      linkedId INT,
      linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP WITH TIME ZONE
    )
  `;
  await pool.query(createTableQuery);
}

const getAllContacts = async (email : string | null | undefined, phoneNumber : string | null | undefined) => {
  let whereQuery = "";
  let orderQuery = " ORDER BY id asc";
  if (email) {
    whereQuery = ` WHERE email = '${email}'`;
  }
  if (phoneNumber) {
    whereQuery += (whereQuery !== "") ? ` OR phoneNumber = '${phoneNumber}'` : ` WHERE phoneNumber = '${phoneNumber}'`;
  }

  let idSubQuery = "SELECT id FROM Contact" + whereQuery;
  let linkedIdSubQuery = "SELECT linkedid FROM Contact" + whereQuery;

  let query = "SELECT * from Contact WHERE";
  query += " id IN ("+ idSubQuery + ") or linkedid IN ("+ idSubQuery +") or id IN ("+ linkedIdSubQuery +") or linkedid IN ("+linkedIdSubQuery+")"
  query += orderQuery;

  return await pool.query(query);  
}

const insertOne = async (email : string | null, phoneNumber : string | null, linkedId : number | null, linkPrecedence : string) => {

  let query = 'INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

  let currentStamp = util.getStandaredDateTime("");

  return await pool.query(query, [ phoneNumber, email, linkedId, linkPrecedence, currentStamp, currentStamp ])

}

const updateOne = async (id : number, keysArray : Array<string | number | null>, valuesArray : Array<string | number | null> ) => {

  keysArray.push('updatedAt')
  valuesArray.push(util.getStandaredDateTime(""))

  let dollerRef = '';
  for (let index = 0; index < keysArray.length; index++) {
    if (dollerRef === '') {
      dollerRef = `${keysArray[index]} = $${index + 1}`;
    } else {
      dollerRef += `, ${keysArray[index]} = $${index + 1}`
    }
  }

  let query = 'UPDATE Contact SET '+ dollerRef +' WHERE id = '+ id +' RETURNING *';

  return await pool.query(query, valuesArray)
}

const updateMany = async (id : number[], keysArray : Array<string | number | null>, valuesArray : Array<string | number | null> ) => {

  keysArray.push('updatedAt')
  valuesArray.push(util.getStandaredDateTime(""))

  let dollerRef = '';
  for (let index = 0; index < keysArray.length; index++) {
    if (dollerRef === '') {
      dollerRef = `${keysArray[index]} = $${index + 1}`;
    } else {
      dollerRef += `, ${keysArray[index]} = $${index + 1}`
    }
  }

  let query = 'UPDATE Contact SET '+ dollerRef +' WHERE id IN ('+ id.join(",") +') RETURNING *';

  return await pool.query(query, valuesArray)
}


export default {
  createTable,
  getAllContacts,
  insertOne,
  updateOne,
  updateMany
};