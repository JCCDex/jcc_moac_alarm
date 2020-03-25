#!/bin/bash

cross-env Contract=$1 Node=$2 Mainnet=$3 nuxt-ts generate

# test node
# npm run generate 0xc87f0b41e26da5919837427e46eb8b2e683380e7 https://mtnode1.jccdex.cn false

# production node
# npm run generate 0xf28f3c6c6bd4911d9947c5dfea1c3b4cb09ea7d8 https://chain3.mytokenpocket.vip true