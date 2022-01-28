import { context, u128 } from "near-sdk-as";
import { AccountId } from "../../utils";

/** 
 * Exporting a new class PostedMessage so it can be used outside of this file.
 */
@nearBindgen
export class Tweet {
  public static max_length(): i32 { return 280 as i32 };

  premium: boolean;
  sender: AccountId;

  constructor(public text: string) {
    this.premium = context.attachedDeposit >= u128.from('10000000000000000000000');
    this.sender = context.sender;
  }
}
