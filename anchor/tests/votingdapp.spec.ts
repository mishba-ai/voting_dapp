import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

const IDL = require('../target/idl/votingdapp.json')  // Load the IDL.

const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  it('initialized Poll', async () => {
    const context = await startAnchor("",[{name:"voting",programId:votingAddress}],[]);
    const provider = new BankrunProvider(context);
    
    const votingProgram = new Program<Votingdapp>(
      IDL,
      provider
    )
    
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "what us your favorite color?",
      new anchor.BN(0),
      new anchor.BN(Voting),
    )

  })
})
