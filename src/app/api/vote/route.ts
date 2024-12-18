import { AnchorError, Program } from "@coral-xyz/anchor";
import { Votingdapp } from "@project/anchor";
import { ActionGetRequest, ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import BN from 'bn.js';
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";



const IDL = require('@/../anchor/target/idl/votingdapp.json')

export const OPTIONS = GET;
export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://cdn.loveandlemons.com/wp-content/uploads/2023/06/homemade-ice-cream-recipe.jpg',
    title: 'vote for your favorite ice cream flavor',
    description: 'vote between vanilla and chocolate',
    label: 'vote',
    links: {
      actions: [
        {
          label: 'vote for vanilla',
          href: '/api/vote?candidate=vanilla',
          type: "transaction"
        },
        {
          label: 'vote for chocolate',
          href: 'api/vote?candidate=chocolate',
          type: "transaction"
        }
      ]
    }
  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request:Request) {
  
  const url = new URL(request.url);
  const candidate = url.searchParams.get('candidate');

  if(candidate !== 'vanilla' && candidate !== 'chocolate') {
    return new Response('invalid candidate', {status: 400 ,headers: ACTIONS_CORS_HEADERS})
  } 

  const connection = new Connection("http://127.0.0.1:8899","confirmed");
  
  const Program:Program<Votingdapp> =new Program(IDL,{connection});

  const body: ActionPostRequest = await request.json();

  let voter = new PublicKey(body.account) ;
  
  try{
     voter = new PublicKey(body.account);
     
  }catch(e){
    return new Response("invalid account", {status: 400 ,headers: ACTIONS_CORS_HEADERS})
  }
 
  //
  const instruction = await Program.methods
     .vote(candidate,new BN(1))
     .accounts({
        signer:voter,
  })
  .instruction(); //
  

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction(
    {
      feePayer:voter,
      blockhash:blockhash.blockhash,
      lastValidBlockHeight:blockhash.lastValidBlockHeight,
    }
  )
      .add(instruction);

  
  const response = await createPostResponse({
    fields: {
      transaction:transaction
    }
  });

  return Response.json(response,{headers: ACTIONS_CORS_HEADERS})
}
