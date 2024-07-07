import {Request, Response, NextFunction} from 'express';
import logger from '../helper/logger';
import Contact from '../models/Contact';


const identify = async (req : Request, res : Response, next : NextFunction) => {

  const email       : string | undefined | null = req?.body?.email;
  const phoneNumber : number | undefined | null = req?.body?.phoneNumber;

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

    /** STEPS */
    // get all the rows that contains eighter email or phoneNumber order by createdAt

    // if not found then insert this entry as primary

    // if one primary found,
      // if input has both, but db has any one, update document
      // if input has both && db has both
        // if email is newOne -> insert as secondary in DB
        // if phoneNumber is newOne -> insert as secondary in DB

    // if multiple entries found
      // collect all emails
      // collect all phoneNumbers
      // if current email not in all_emails
        // if all_emails length is less then all entries, insert new entry as seconday, && update all_emails
        // else create new secondary entry && update all_emails
      // if current phoneNumber not in all_phoneNumbers
        // if all phoneNumber length is less than all entries, insert new entry as seconday && update all_phoneNumbers
        // else create new secondary entry && update all_phoneNumbers
      // if multiple primary found
        // update rest of the entries as secondary and first one will be primary
      // return result

    
    const allContactsResult = await Contact.getAllContacts(email, (phoneNumber)?.toString());
    
    if (!allContactsResult || !allContactsResult.rowCount || allContactsResult.rowCount <= 0) {
      const insertResult = await Contact.insertOne(email || null, (phoneNumber)?.toString() || null, null, 'primary');
      
      if (!insertResult.rows || !insertResult.rows[0]) {
        throw new Error('FAILED_TO_IDENTIFY_CONTECT')
      }
      const resObj = {
        success : true,
        message : "SUCCESS",
        request : req.body,
        contact : {
          primaryContatctId : insertResult.rows[0].id,
          emails : email ? [insertResult.rows[0].email] : [],
          phoneNumbers : phoneNumber ? [insertResult.rows[0].phonenumber] : [],
          secondaryContactIds : []
        }
      }
      return res.status(200).send(resObj);
    } else if (allContactsResult.rowCount === 1) {
      
      let existingData = allContactsResult.rows[0];
      let finalEmailArr : Array<string> = [];
      let finalPhoneNumberArr : Array<string>  = [];
      let finalSecondaryIds : Array<number>  = [];
      let updateKeys = [];
      let updateValues = [];
      let insertSecondary = false;

      if (email && phoneNumber) {

        if (!existingData.email) {
          // update email
          updateKeys.push("email")
          updateValues.push(email)

        } else if (!existingData.phonenumber) {
          // update phoneNumber
          updateKeys.push("phoneNumber")
          updateValues.push((phoneNumber).toString())
        } else if (existingData.email === email && existingData.phonenumber !== (phoneNumber).toString()) {
          // create secondary
          insertSecondary = true;
        } else if (existingData.email !== email && existingData.phonenumber === (phoneNumber).toString()) {
          // create secondary
          insertSecondary = true;
        }

      }

      if( updateKeys.length > 0 ) {

        const result = await Contact.updateOne(existingData.id, updateKeys, updateValues);

        if (result && result.rows) {
          existingData = result.rows[0]
        }

        
      }
      
      if (existingData.email) {
        finalEmailArr.push((existingData.email).toString());
      }
      if (existingData.phonenumber) {
        finalPhoneNumberArr.push((existingData.phonenumber).toString());
      }

      if (insertSecondary) {
        const result = await Contact.insertOne(  email || null, (phoneNumber)?.toString() || null, existingData.id, 'secondary' );
        if (result && result.rowCount && result.rowCount > 0) {
          if (email && email !== existingData.email) {
            finalEmailArr.push((email).toString())
          }
          if (phoneNumber && (phoneNumber).toString() !== existingData.phonenumber) {
            finalPhoneNumberArr.push((phoneNumber).toString())
          }

          finalSecondaryIds.push(result.rows[0].id);
        }
      }

      // return this one;
      const resObj = {
        success : true,
        message : "SUCCESS",
        request : req.body,
        contact : {
          primaryContatctId : existingData.id,
          emails : finalEmailArr,
          phoneNumbers : finalPhoneNumberArr,
          secondaryContactIds : finalSecondaryIds
        }
      }
      return res.status(200).send(resObj);

    } else {

      let multipleResults = allContactsResult.rows;
      let allEmailObj : any = {};
      let allPhoneNumberObj : any = {};
      let allSecondaryIds : string[] = [];
      let primaryContatctId : number | null = null;
      let updateAsSecondaryIds : number[] = [];
      let hasCurrentMail : boolean = false;
      let hasCurrentPhoneNumber : boolean = false;

      for (let index = 0; index < multipleResults.length; index++) {

        const tId = multipleResults[index].id
        const tEmail = multipleResults[index].email
        const tPhoneNumber = multipleResults[index].phonenumber
        const tLinkPrecedence = multipleResults[index].linkPrecedence

        if (tEmail) {
          allEmailObj[tEmail] = true;
        }
        if (tPhoneNumber) {
          allPhoneNumberObj[tPhoneNumber] = true;
        }

        if(tLinkPrecedence === "primary") {
          if (!primaryContatctId) {
            primaryContatctId = tId;
          } else {
            // need to update as secondary
            updateAsSecondaryIds.push(tId);
          }
        }

        if (email && !hasCurrentMail && tEmail === email) {
          hasCurrentMail = true;
        }
        if (phoneNumber && !hasCurrentPhoneNumber && tPhoneNumber === (phoneNumber)?.toString()) {
          hasCurrentPhoneNumber = true;
        }

        if (primaryContatctId && tId !== primaryContatctId) {
          allSecondaryIds.push((tId).toString());
        }
      }

      if (!primaryContatctId) { // all are secondary, need to make 1st one primary && rest all are secondary
        
        logger({type : 'error', log : 'ALL_ARE_SECONDARY SOMETHING_WENT_WRONG', multipleResults});

        for (let index = 0; index < multipleResults.length; index++) {
          const { id } = multipleResults[index];
          if (!primaryContatctId) {
            primaryContatctId = id;
          } else {
            updateAsSecondaryIds.push(id);
          }
        }

        if (primaryContatctId) {
          await Contact.updateOne(primaryContatctId, ["linkedId", "linkPrecedence"], [null, "primary"]);
        }
      }

      // update as secondary for this primaryContatctId
      if (updateAsSecondaryIds.length > 0) {
        await Contact.updateMany( updateAsSecondaryIds, ["linkedId", "linkPrecedence"], [primaryContatctId, "secondary"] )
      }


      if (email && !hasCurrentMail && hasCurrentPhoneNumber) {
        const result = await Contact.insertOne(  email || null, (phoneNumber)?.toString() || null, primaryContatctId, 'secondary' );
        if (result && result.rows && result.rows[0]) {
          allSecondaryIds.push((result.rows[0].id).toString())
          allEmailObj[email] = true;
        }
      }
      if (phoneNumber && !hasCurrentPhoneNumber && hasCurrentMail) {
        const result = await Contact.insertOne(  email || null, (phoneNumber)?.toString() || null, primaryContatctId, 'secondary' );
        if (result && result.rows && result.rows[0]) {
          allSecondaryIds.push((result.rows[0].id).toString())
          allPhoneNumberObj[(phoneNumber).toString()] = true;
        }
      }

      // return this one;
      const resObj = {
        success : true,
        message : "SUCCESS_2",
        request : req.body,
        contact : {
          primaryContatctId : primaryContatctId,
          emails : Object.keys(allEmailObj),
          phoneNumbers : Object.keys(allPhoneNumberObj),
          secondaryContactIds : allSecondaryIds,
        }
      }
      return res.status(200).send(resObj);
    }
  
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