#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod votingdapp {
    use super::*;

    // _ctx is used when we need to access the accounts of the transaction and the signer .
    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64,
    description:String,
    poll_start:u64,
    poll_end:u64) -> Result<()> {
        let poll = &mut ctx.accounts.poll; //
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.candidate_amount = 0;
        Ok(())
    }
}

#[derive(Accounts)] // This attribute macro automatically implements necessary traits for struct validation in Anchor.Use this when defining a struct that specifies which accounts are required for a particular instruction.

// This struct is used to define the accounts that will be used in the program.
//<info> is used to define the lifetime of the accounts.
#[instruction(poll_id: u64)] //This attribute allows you to specify parameters for your instruction function, making them accessible within the function.Use this when you want to pass additional arguments to your instruction beyond the context and accounts.
pub struct InitializePoll<'info>{ 
 
    #[account(mut)] // This attribute indicates that the signer account can be modified during the transaction.
    pub signer:Signer<'info>, // This attribute is used to    define the signer account.
    #[account(
       init,
       payer = signer,
       space = 8 + Poll::INIT_SPACE, //Allocates space for storing account data; here, it adds some overhead (8 bytes) to accommodate metadata
       seeds = [poll_id.to_le_bytes().as_ref()], //Defines seeds for generating a program-derived address (PDA) based on poll_id.Use these attributes when you need a unique address for an account derived from specific inputs.
       bump ,//A bump seed used in PDA generation to ensure uniqueness
   
    )] // this is  for  the  account  that  will  be  used in  the  program for the  poll.
     pub poll: Account<'info,Poll>,  
     pub system_program: Program<'info, System>, // Defines a reference to the system program, allowing interactions with Solana's built-in system functionalities (like account creation)
}

#[account] //Marks this struct as an account type managed by Anchor.
#[derive(InitSpace)] // Automatically implements space initialization logic for accounts of this type.
pub struct Poll {   
   pub poll_id:u64,
   #[max_len(280)]
   pub description :String,
   pub poll_start:u64,
   pub poll_end:u64,
   pub candidate_amount:u64,
}