import { storage, Context, PersistentVector, PersistentUnorderedMap, PersistentDeque, logging, ContractPromiseBatch, u128 } from "near-sdk-core"

import { AccountId, ONE_NEAR, XCC_GAS, assert_self, assert_single_promise_success } from "../../utils"
import { Tweet } from "./model";

const TWEET_LIMIT = 10;

@nearBindgen
export class nTwitter {
  private owner: AccountId;

  constructor(owner: AccountId) {
    this.owner = owner
  }

  get_owner(): AccountId {
    return this.owner;
  }

  get_accounts(): PersistentUnorderedMap<AccountId, PersistentVector<Tweet>> {
    return accounts
  }

  get_tweets(user: AccountId): Array<Tweet> {
    assert(accounts.contains(user), "User not registered")

    const user_tweets = accounts.getSome(user)
    const result = new Array<Tweet>(user_tweets.length)
    for (let i = 0; i < user_tweets.length; i++) {
      result[i] = user_tweets[i];
    }
    return result;
  }

  get_recent_tweets(): Array<Tweet> {
    const result = new Array<Tweet>(recentTweets.length)
    for (let i = 0; i < recentTweets.length; i++) {
      result[i] = recentTweets[i];
    }
    return result;
  }

  has_user_account(user: AccountId): bool {
    return accounts.contains(user)
  }

  @mutateState()
  create_account(): void {
    const signer = Context.sender;
    assert(!accounts.contains(signer), "Twitter Account has been initialised")
    accounts.set(signer, new PersistentVector<Tweet>(signer))

    logging.log("Account Created")
  }

  @mutateState()
  create_tweet(message: string): void {
    const signer = Context.sender;
    assert(accounts.contains(signer), "User must create an account first");
    // guard against invalid message size
    assert(message.length > 0, "Message length cannot be 0")
    assert(message.length < Tweet.max_length(), "Message length is too long, must be less than " + Tweet.max_length().toString() + " characters.")

    let signer_tweets: PersistentVector<Tweet> = accounts.getSome(signer);
    let tweet = new Tweet(message)
    signer_tweets.push(tweet);
    accounts.set(signer, signer_tweets);

    recentTweets.pushFront(tweet)
    if (recentTweets.length > TWEET_LIMIT) {
      recentTweets.popBack()
    }

    logging.log("Tweet posted")
  }

  @mutateState()
  on_transfer_complete(): void {
    assert_self()
    assert_single_promise_success()

    logging.log("transfer complete")
  }

  // private helper method used by read() and write() above
  private storageReport(): string {
    return `storage [ ${Context.storageUsage} bytes ]`
  }

  private assert_owner(): void {
    const caller = Context.predecessor
    assert(this.owner == caller, "Only the owner of this contract may call this method")
  }
}

const accounts: PersistentUnorderedMap<AccountId, PersistentVector<Tweet>> = new PersistentUnorderedMap<AccountId, PersistentVector<Tweet>>("a")
const recentTweets: PersistentDeque<Tweet> = new PersistentDeque<Tweet>("t")