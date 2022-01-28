import { nTwitter } from "../assembly";
import { PersistentUnorderedMap, PersistentVector, VMContext } from "near-sdk-as";
import { Tweet } from "../assembly/model";
import { AccountId } from "../../utils"

const owner = "alice"
const user1 = "bob"
const user2 = "carol"

let contract: nTwitter

function createTweet(text: string): Tweet {
  return new Tweet(text);
}

const message = "hi"
const tweet = createTweet(message);

beforeEach(() => {
  contract = new nTwitter(owner)
})

describe("Contract", () => {

  it("can be initialized with owner", () => {
    // who owns this lottery? -> AccountId
    expect(contract.get_owner()).toBe(owner)
  });

  it("can be initialized with empty accounts", () => {
    expect(contract.get_accounts()).toStrictEqual(new PersistentUnorderedMap<AccountId, PersistentVector<Tweet>>("a"))
  });

  it("can be initialized with empty recent tweets", () => {
    expect(contract.get_recent_tweets().length).toBe(
      0,
      'should be zero message'
    );
  });

  it("can be initialized with no user accounts", () => {
    expect(contract.has_user_account(user1)).toBe(
      false,
      'should have no user account created'
    );
  });

  throws("error when getting empty user tweets", () => {
    expect(contract.get_tweets(user1)).toBeNull()
  });
})

describe("Contract interface for Accounts", () => {
  // VIEW method tests

  it("create user account", () => {
    VMContext.setSigner_account_id(user1)
    contract.create_account()

    const accounts = contract.get_accounts()
    expect(accounts.contains(user1)).toBe(true)

    const user1_tweets = contract.get_tweets(user1)
    expect(user1_tweets).not.toBeNull()
    expect(user1_tweets.length).toBe(0)
  })

  // CHANGE method tests
  it("saves new tweet to user account", () => {
    VMContext.setSigner_account_id(user1)

    contract.create_account()
    contract.create_tweet(message)

    const user1_tweets = contract.get_tweets(user1)
    expect(user1_tweets).not.toBeNull()
    expect(user1_tweets.length).toBe(
      1,
      'should be one message'
    );
    expect(user1_tweets).toIncludeEqual(
      tweet,
      'messages should include:\n' + message
    );

    const recent_tweets = contract.get_recent_tweets();
    expect(recent_tweets).not.toBeNull()
    expect(recent_tweets.length).toBe(
      1,
      'should be one message'
    );
    expect(recent_tweets).toIncludeEqual(
      tweet,
      'messages should include:\n' + message
    );
  })
})
