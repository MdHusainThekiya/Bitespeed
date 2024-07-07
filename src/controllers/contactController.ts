import {Request, Response, NextFunction} from 'express';
import logger from '../helper/logger';
import Contact from '../models/Contact';

interface Contact {
  id : number,
  phonenumber : string | null,
  email : string | null,
  linkedid : number | null,
  linkprecedence : string | null,
  createdat : string,
  updatedat : string,
  deletedat : string | null,
}

const identify = async (req : Request, res : Response, next : NextFunction) => {

  const email       : string | undefined | null = req?.body?.email;
  const phoneNumber : string | undefined | null = req?.body?.phoneNumber && (req?.body?.phoneNumber).toString();

  if (!email && !phoneNumber) {
    const resObj = {
      success : false,
      message : "EMAIL_OR_PHONENUMBER_IS_MADNATORY",
      request : req.body,
      contact : {}
    }
    logger({ type: 'error', log: resObj.message, ...resObj });
    return res.status(400).send(resObj);
  }

  try {

    /** STEPS TO FOLLOW
     * 
     * 1. get all the rows that contains eighter email or phoneNumber order by createdAt 
     * 
     * 2. if not found then insert this entry as primary    
     *     
     * 3. if one primary found, 
     *    3.1. if input has both, but db has any one, update document 
     *    3.2. if input has both && db has both 
     *    3.3. if email is newOne -> insert as secondary in DB 
     *    3.4. if phoneNumber is newOne -> insert as secondary in DB       
     * 
     * 4. if multiple entries found 
     *    4.1. collect all emails 
     *    4.2. collect all phoneNumbers
     *    4.3. collect multiple primaries
     *    
     *    4.4. if multiple primary found then make one primary and rest all seconday
     *    4.5. if current email not fount in all_emails, create one
     *    4.5. if current phoneNumber not fount in all_phoneNumbers, create one
     *    4.6. get all secondaryIds and prepare for result
     * 
     * 5. return success result
     */


    /** STEP - 1 */
    const allContactsResult = await Contact.getAllContacts(email, phoneNumber);
    let primaryContatctId : number            = 0;
    let emailList : Set<string>               = new Set();
    let phoneNumberList : Set<string>         = new Set();
    let secondaryContactIdsList : Set<number> = new Set();


    if (!allContactsResult || !allContactsResult.rowCount || allContactsResult.rowCount <= 0) {
      
      /** STEP - 2 */
      const insertResult = await Contact.insertOne(email || null, phoneNumber || null, null, 'primary');
      
      if (!insertResult.rows || !insertResult.rows[0]) {
        throw new Error('FAILED_TO_IDENTIFY_CONTECT')
      }

      primaryContatctId = insertResult.rows[0].id;
      email && emailList.add(email);
      phoneNumber && phoneNumberList.add(phoneNumber);

    } else if (allContactsResult.rowCount === 1) {
      
      /** STEP - 3 */
      let existingSingleData : Contact = allContactsResult.rows[0];
      primaryContatctId = existingSingleData.id;
      let insertSecondary = false;
      
      if ( email
        && phoneNumber 
        && (
             (!existingSingleData.email)
          || (!existingSingleData.phonenumber)
          || (existingSingleData.email !== email)
          || (existingSingleData.phonenumber !== phoneNumber)
        )
      ) {
        insertSecondary = true;
      }
      
      existingSingleData.email && emailList.add((existingSingleData.email).toString());
      existingSingleData.phonenumber && phoneNumberList.add((existingSingleData.phonenumber).toString());

      if (insertSecondary && email && phoneNumber) {
        const result = await Contact.insertOne(  email, phoneNumber, existingSingleData.id, 'secondary' );
        if (result && result.rowCount && result.rowCount > 0) {
          email && emailList.add((email).toString())
          phoneNumber && phoneNumberList.add(phoneNumber)
          result.rows[0] && secondaryContactIdsList.add(result.rows[0].id);
        }
      }

    } else {

      /** STEP - 4 */
      let existingMultiData : Contact[] = allContactsResult.rows;
      let updateAsSecondaryIds : number[]   = [];

      for (let index = 0; index < existingMultiData.length; index++) {

        const { id : tId, email : tEmail, phonenumber : tPhoneNumber, linkprecedence : tLinkPrecedence } = existingMultiData[index];

        tEmail && emailList.add(tEmail);
        tPhoneNumber && phoneNumberList.add(tPhoneNumber);

        if(tLinkPrecedence && tLinkPrecedence === "primary") {
          if (!primaryContatctId) {
            primaryContatctId = tId;
          } else {
            updateAsSecondaryIds.push(tId);
          }
        }

        if (tId && primaryContatctId && tId !== primaryContatctId) {
          secondaryContactIdsList.add(tId);
        }

      }

      if (!primaryContatctId) { // all are secondary, need to make 1st one primary && rest all are secondary
        
        logger({type : 'error', log : 'ALL_ARE_SECONDARY SOMETHING_WENT_WRONG', existingMultiData});

        for (let index = 0; index < existingMultiData.length; index++) {
          const { id } = existingMultiData[index];
          if (!primaryContatctId) {
            primaryContatctId = id;
          } else {
            updateAsSecondaryIds.push(id);
          }
        }

        if (primaryContatctId) {
          // update as primary
          await Contact.updateOne(primaryContatctId, ["linkedId", "linkPrecedence"], [null, "primary"]);
        }
      }

      // update as secondary for this primaryContatctId
      if (updateAsSecondaryIds.length > 0) {
        await Contact.updateMany( updateAsSecondaryIds, ["linkedId", "linkPrecedence"], [primaryContatctId, "secondary"] )
      }

      // insert as secondary
      if (primaryContatctId && email && phoneNumber && (!emailList.has(email) || !phoneNumberList.has(phoneNumber))) {
        const result = await Contact.insertOne(  email || null, phoneNumber || null, primaryContatctId, 'secondary' );
        if (result && result.rows && result.rows[0]) {
          emailList.add(email);
          phoneNumberList.add(phoneNumber);
          secondaryContactIdsList.add(result.rows[0].id)
        }
      }

    }

    /** STEP - 5 */
    const resObj = {
      success : true,
      message : "SUCCESS",
      request : req.body,
      contact : {
        primaryContatctId : primaryContatctId,
        emails : Array.from(emailList),
        phoneNumbers : Array.from(phoneNumberList),
        secondaryContactIds : Array.from(secondaryContactIdsList)
      }
    }
    return res.status(200).send(resObj);
  
  } catch (error) {
    
    const resObj = {
      success : false,
      message : "INTERNAL_OPERATION_ERROR",
      request : req.body,
      error   : (error as Error).message,
      contact : {}
    }
    logger({ type: 'error', log: resObj.message, ...resObj, error : (error as Error) });
    return res.status(500).send(resObj);

  }
}


export default {
  identify
}