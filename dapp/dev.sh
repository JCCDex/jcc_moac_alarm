#!/bin/bash
cross-env Contract=$1 Node=$2 Mainnet=$3 MoacAddress=$4 MoacSecret=$5 nuxt-ts

# internal test node
# npm run dev 0xc87f0b41e26da5919837427e46eb8b2e683380e7 http://192.168.66.249:8546 false 0xc524127a8f76132ce643ecea6dbc45f3af382084 cdc9b77d3a08485684e7136eab5eef2f21464e30fc926b8296c2bb30f3ba9ad6

# public test node
# npm run dev 0xc87f0b41e26da5919837427e46eb8b2e683380e7 https://mtnode1.jccdex.cn false 0xc524127a8f76132ce643ecea6dbc45f3af382084 cdc9b77d3a08485684e7136eab5eef2f21464e30fc926b8296c2bb30f3ba9ad6

# public production node
# npm run dev 0xf28f3c6c6bd4911d9947c5dfea1c3b4cb09ea7d8 https://chain3.mytokenpocket.vip true  0xc524127a8f76132ce643ecea6dbc45f3af382084 cdc9b77d3a08485684e7136eab5eef2f21464e30fc926b8296c2bb30f3ba9ad6