import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor' //essential for interacting with smart contracts.
import { Keypair, PublicKey } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

const IDL = require('../target/idl/votingdapp.json')  // Loads the Interface Definition Language (IDL) file that describes the smart contract's methods and types. This is essential for type safety in interactions with the contract.

const votingAddress = new PublicKey("FRJmEYh58FmPDWsMfQmZ2oXC1oTA6Ppe4YjjkegHSEbT");

//A Jest function that groups related tests. It takes a string (the name of the test suite) and a callback function containing individual tests.
describe('votingdapp', () => {
  // Configure the client to use the local cluster.

  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env()); //Sets the provider to use the local cluster environment.
  let votingProgram: Program<Votingdapp> = anchor.workspace.Votingdapp as Program<Votingdapp>; //Creates a new instance of the Program class, which is used to interact with the smart contract.

  beforeAll(async () => {
    /*context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);  //Initializes the Anchor testing context. It sets up a local cluster environment where tests can run against a deployed version of your program

    provider = new BankrunProvider(context); //This provider will handle transactions and account management during tests.

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider //The provider created to facilitate interactions with the blockchain
    );*/
  })

  // Increase timeout for all tests
  jest.setTimeout(30000);  // 30 seconds
  it('initialized Poll', async () => { //Another Jest function that defines an individual test case. The first argument is a description of what the test does, and the second argument is an asynchronous function containing the test logic.

    await votingProgram.methods.initializePoll(
      new anchor.BN(1), //A BigNumber representing the poll ID
      "what is your favorite color?",
      new anchor.BN(0), //A BigNumber representing when to start polling (in Unix time).
      new anchor.BN(1832766567), //A BigNumber indicating when to end polling
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync([new anchor.BN(1).toArrayLike(Buffer, 'le', 8)], votingAddress); //Generates the address of the poll account using the poll ID and the program ID.

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("what is your favorite color?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  })


  it("initialize candidate", async () => {
    await votingProgram.methods.initializeCandidate(
      "vanilla",
      new anchor.BN(1)
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "chocolate",
      new anchor.BN(1)
    ).rpc();

    const [chocolateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("chocolate")], votingAddress);

    const chocolateCandidate = await votingProgram.account.candidate.fetch(chocolateAddress);

    console.log(chocolateCandidate);
    expect(chocolateCandidate.candidateVotes.toNumber()).toEqual(0);

    const [vanillaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("vanilla")], votingAddress);

    const vanillaCandidate = await votingProgram.account.candidate.fetch(vanillaAddress);
    console.log(vanillaCandidate);
    expect(vanillaCandidate.candidateVotes.toNumber()).toEqual(0);
  })

  it("vote", async () => {
    await votingProgram.methods.vote(
      "vanilla",
      new anchor.BN(1)
    ).rpc();

    const [vanillaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("vanilla")], votingAddress);

    const vanillaCandidate = await votingProgram.account.candidate.fetch(vanillaAddress);
    console.log(vanillaCandidate);
    expect(vanillaCandidate.candidateVotes.toNumber()).toEqual(1);
  });
})