#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variable with contract name"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"
[ -z "$USER" ] && echo "Missing \$USER environment variable" && exit 1
[ -z "$USER" ] || echo "Found it! \$USER is set to [ $USER ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'view' functions on the contract"
echo
echo "(run this script again to see changes made by this file)"
echo ---------------------------------------------------------
echo

near view $CONTRACT get_owner

echo
echo

near view $CONTRACT get_accounts

#near view $CONTRACT get_tweets '{"user":"'"$USER"'"}'

near view $CONTRACT get_recent_tweets

#near view $CONTRACT read '{"key":"some-key"}'

echo
echo 'About to call create_account() on the contract'
echo near call \$CONTRACT create_account --account_id \$USER
echo
echo \$CONTRACT is $CONTRACT
echo \$USER is $USER
echo

near call $CONTRACT create_account --account_id $USER
echo
near call $CONTRACT create_tweet '{"message":"'"$1"'"}' --account_id $USER 
echo
exit 0
