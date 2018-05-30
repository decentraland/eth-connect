set -e

# ensure geth image
docker pull ethereum/client-go

# kill the previous geth node
(docker container kill geth-dev || true)
(docker container rm geth-dev || true)

# initialize geth node
docker run \
  -it --name geth-dev \
  -v "$(pwd)":/eth_common \
  -p 8545:8545 -p 8546:8546 \
  ethereum/client-go \
    --identity="TEST_NODE" --networkid="53611" \
    --rpc --rpcaddr 0.0.0.0 --rpcapi admin,debug,eth,miner,net,personal,shh,txpool,web3 \
    --ws  --wsaddr 0.0.0.0  --wsapi admin,debug,eth,miner,net,personal,shh,txpool,web3 --wsorigins \* \
    --mine --minerthreads=1 \
    --dev
