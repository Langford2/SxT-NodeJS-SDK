// File containing Examples to run the SDK.

import * as dotenv from 'dotenv' 
dotenv.config();

import fs, { access, write } from 'fs';

import SpaceAndTimeSDK from "./SpaceAndTimeSDK.js";
import Utils from './utils/utils-functions.js';		
import SQLOperation from './BiscuitConstants.js';		
import { ED25519PublicKeyUint, ED25519PrivateKeyUint, b64PrivateKey, b64PublicKey, hexEncodedPrivateKey, hexEncodedPublicKey, biscuitPrivateKey } from "./utils/keygen.js";
import  {biscuit, block, authorizer, Biscuit, KeyPair, Fact, PrivateKey} from '@biscuit-auth/biscuit-wasm';

const initSDK = SpaceAndTimeSDK.init();

let userId = process.env.USERID;
let joinCode = process.env.JOINCODE;
let scheme = process.env.SCHEME;

/** AUTHENTICATION BLOCK STARTS **/

if(accessToken) {
    let [ validAccessTokenResponse, validAccessTokenError ] = await initSDK.validateToken();
    if(validAccessTokenResponse) {
        console.log('Valid access token provided.');
        console.log('Valid User ID: ', validAccessTokenResponse);
    }
    else {
       let [ refreshTokenResponse, refreshTokenError ] = await initSDK.refreshToken();
       console.log('Refreshed Tokens: ', refreshTokenResponse);

       if(!refreshTokenResponse) {
            let [ tokenResponse, tokenError ] = await initSDK.AuthenticateUser();
            if(!tokenError) console.log(tokenResponse); 
            else {
            console.log('Invalid User Tokens Provided');
            console.log(tokenError);
          }
       }
    }
}
else {

    let [ tokenResponse, tokenError ] = await initSDK.AuthenticateUser();
    if(!tokenError) console.log(tokenResponse); 
    else {
        console.log('Invalid User Tokens Provided');
        console.log(tokenError);
    }
}


/** Calls to Authentication APIs **/

// Check if a UserId is already in use. 
let [ checkUserIDResponse, checkUserIDError ] = await initSDK.checkUserId(userId);
console.log(checkUserIDResponse, checkUserIDError);

// Authenticate Yourself using the Space And Time SDK 
let [ tokenResponse, tokenError ] = await initSDK.AuthenticateUser();
console.log(tokenResponse, tokenError);

// Reading access and refresh tokens from the file
const fileContents = fs.readFileSync('session.txt','utf8');
const fileLines = fileContents.split(/\r?\n/);

let accessToken = fileLines[0];
let refreshToken = fileLines[1];

// Rotate Tokens
let [ rotateTokenResponse, rotateTokenError ] = await initSDK.rotateTokens();
console.log(rotateTokenResponse, rotateTokenError);

// Validate your Access Token by getting back the UserID
let [ validateTokenResponse, validateTokenError ] = await initSDK.validateToken();
console.log(validateTokenResponse, validateTokenError);

// Refresh your token by using the RefreshToken
let [ refreshTokenResponse, refreshTokenError ] = await initSDK.refreshToken();
console.log(refreshTokenResponse, refreshTokenError);

// Logout or end your authenticated session by using a RefreshToken
let [ logoutResponse, logoutError ] = await initSDK.logout();
console.log(logoutResponse, logoutError);

let accessTokenValue = accessToken;

let scope = "ALL";
let schema = "ETHEREUM";
let owned = true;
let column = "BLOCK_NUMBER";
let tableName = "FUNGIBLETOKEN_WALLET";

/** Calls to Discovery APIs **/

// List the Schemas
let [getSchemaResponse, getSchemaError] =  await initSDK.getSchemas();
console.log(getSchemaResponse, getSchemaError);

// List the Tables of a given Schema
// Scope value Options - ALL = all tables, PUBLIC = non-permissioned tables, PRIVATE = tables created by requesting user
let [getTableResponse, getTableError] = await initSDK.getTables(scope,schema);
console.log(getTableResponse, getTableError);

// List Table Column MetaData
let [getTableColumnResponse, getTableColumnError] = await initSDK.getTableColumns(schema, tableName);
console.log(getTableColumnResponse, getTableColumnError);

// List Table Index MetaData
let [getTableIndexesResponse, getTableIndexesError] = await initSDK.getTableIndexes(schema, tableName);
console.log(getTableIndexesResponse, getTableIndexesError);

// List Table Primary MetaData
let [getPrimaryKeyResponse, getPrimaryKeyError] = await initSDK.getPrimaryKeys(schema, tableName);
console.log(getPrimaryKeyResponse, getPrimaryKeyError);

// List Table Relationship MetaData including table, column, and primary key references for all tables of a schema
let [tableRelationshipResponse, tableRelationshipError] = await initSDK.getTableRelationships(schema, scope);
console.log(tableRelationshipResponse, tableRelationshipError);

// List all Primary Key References by the provided foreign key reference.
let [primaryKeyReferenceResponse, primaryKeyReferenceError] = await initSDK.getPrimaryKeyReferences(schema, tableName, column);
console.log(primaryKeyReferenceResponse, primaryKeyReferenceError);

// List all Foreign Key References referencing the provided primary key.
let [foreignKeyReferenceResponse, foreignKeyReferenceError] = await initSDK.getForeignKeyReferences(schema, tableName, column);
console.log(foreignKeyReferenceResponse, foreignKeyReferenceError);

/** Calls to CoreSQL APIs **/
let accessTokenParam = accessToken;
let mainPublicKey = "";
let mainPrivateKey = "";
let biscuitArray = ["EpABCiYKD..."]
let biscuitToken = "";
let accessType = "public_append";

let createSchemaSQLText = "CREATE SCHEMA ETH";
let createSqlText = "CREATE TABLE ETH.TESTETH12 (ID INT PRIMARY KEY, TEST VARCHAR)";
let dropSqlText = "DROP TABLE ETH.TESTETH12"
let insertSqlText = "INSERT INTO ETH.TESTETH12 VALUES(4, 'x4')"
let selectSqlStatement = "SELECT * FROM ETH.TESTETH12"

let resources = ["ETH.TESTETH12"];

// Generate Biscuits
let [ biscuitArrayResponse, biscuitArrayError ] = initSDK.generateBiscuits(biscuitPrivateKey, ["ETHEREUM.CONTRACTS", "ETHEREUM.TRANSACTIONS"], false, ["SELECT", "INSERT", "UPDATE", "DELETE"]);
console.log(biscuitArrayResponse, biscuitArrayError)

// Create a Schema
let [ createSchemaResponse, createSchemaError ] = await initSDK.CreateSchema(createSchemaSQLText);
console.log(createSchemaResponse, createSchemaError);

// DDL

// Can be used to Create a table
let [CreateTableResponse, CreateTableError] = await initSDK.CreateTable(createSqlText, accessType, mainPublicKey, biscuitArray);
console.log(CreateTableResponse, CreateTableError);

// Can be used to Drop
let [DDLresponse, DDLerror] = await initSDK.DDL(dropSqlText, biscuitArray);
console.log(DDLresponse, DDLerror);

// DML

// Can be used to insert, update, delete and merge
let [DMLResponse, DMLError] = await initSDK.DML(resources, insertSqlText, biscuitArray);
console.log(DMLResponse, DMLError);

// DQL

// Can be used to select
// Selects all if rowCount = 0
let [DQLResponse, DQLError] = await initSDK.DQL(resources, selectSqlStatement, biscuitArray);
console.log(DQLResponse, DQLError);

/** Calls to Blockchain **/
let chainId = "ETHEREUM" // Blockchain

// Get blockchains supported by the platform
let [ getBlockchainResponse, getBlockchainError ] = await initSDK.getBlockchains();
console.log(getBlockchainResponse, getBlockchainError)

// Get schemas for the provided blockchain
let [ getBlockchainSchemasResponse, getBlockchainSchemasError ] = await initSDK.getBlockchainSchemas(chainId)
console.log(getBlockchainSchemasResponse, getBlockchainSchemasError);

// Get Metadata for the provided blockchain
let [ getBlockchainInformationResponse, getBlockchainInformationError ] = await initSDK.getBlockchainInformation(chainId);
console.log(getBlockchainInformationResponse, getBlockchainInformationError);

/** Calls to Views **/

let parametersRequest = [
    {
        name: "BLOCK_NUMBER",
        type: "Integer"
    }
]

let resourceId = "ETH.BLOCK"
let viewText = "SELECT * FROM ETH.BLOCK WHERE BLOCK_NUMBER = {{BLOCK_NUMBER}} "
let viewName = "block-view-js1"; //block-view-last-1
let description = "display blocks by their block_number";
let updateDescription = "block view end update 98" 
let publish = true;


let [executeViewResponse, executeViewError] = await initSDK.executeView(viewName, parametersRequest);
console.log(executeViewResponse, executeViewError);
