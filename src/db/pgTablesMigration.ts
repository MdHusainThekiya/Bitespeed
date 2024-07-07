/** import all tables */
import Contact from '../models/Contact';

export default async () => {

  await Contact.createTable(); // create if not exists

}