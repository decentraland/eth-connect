NODE = @node
COMPILER = $(NODE) --max-old-space-size=4096 node_modules/.bin/decentraland-compiler
TSC = $(NODE) --max-old-space-size=4096 node_modules/.bin/tsc
MOCHA = $(NODE) --max-old-space-size=4096 node_modules/.bin/mocha
NYC = $(NODE) --max-old-space-size=4096 node_modules/.bin/nyc
TSLINT = $(NODE) --max-old-space-size=4096 node_modules/.bin/tslint
COVERALLS = $(NODE) --max-old-space-size=4096 node_modules/.bin/coveralls

clean:
		@(rm -rf coverage || true)
		@(rm -rf .nyc_output || true)
		@(rm *.lcov || true)
		@(rm -rf dist || true)
		@find test -name '*.js' -delete
		@find test -name '*.js.map' -delete

build: clean
		${COMPILER} build.json
		$(MAKE) provision-bundled

provision-bundled:
		cp ./static/package.json ./dist/package.json
		cp ./static/api-extractor.json ./dist/api-extractor.json
		cp ./static/tsconfig.json ./dist/tsconfig.json
		cp ./static/esm.ts ./dist/esm.ts
		cd ./dist && npm i @microsoft/api-extractor
		cd ./dist && ./node_modules/.bin/api-extractor run --typescript-compiler-folder ./node_modules/typescript --local
		mv ./dist/lib/eth-connect.js ./dist
		mv ./dist/lib/eth-connect.esm.js ./dist
		rm -rf ./dist/libui
		rm -rf ./dist/api-extractor.json
		rm -rf ./dist/dist

watch:
		${TSC} --project tsconfig-build.json --watch

lint:
		${TSLINT}

test:
		export TS_NODE_PROJECT='./tsconfig-test.json'; 

coverage:
		export TS_NODE_PROJECT='./tsconfig-test.json'; node --experimental-modules node_modules/.bin/nyc node_modules/mocha/bin/_mocha --reporter list

test-coveralls:
		${NYC} report --reporter=text-lcov | ${COVERALLS} --verbose

test-codecov:
		${NYC} report --reporter=text-lcov > coverage.lcov

local-node:
		# ensure ethereum/client-go image
		@docker pull ethereum/client-go

		# kill the previous ethereum/client-go container if exist
		@(docker container kill geth-dev || true)
		@(docker container rm geth-dev || true)

		# initialize ethereum/client-go node
		@docker run \
				-d --name geth-dev \
				-v "$(PWD)":/eth_common \
				-p 8545:8545 -p 8546:8546 \
						ethereum/client-go \
				--identity="TEST_NODE" --networkid="53611" \
				--rpc --rpcaddr 0.0.0.0 --rpcapi admin,debug,eth,miner,net,personal,shh,txpool,web3 \
				--ws  --wsaddr 0.0.0.0  --wsapi admin,debug,eth,miner,net,personal,shh,txpool,web3 --wsorigins \* \
				--mine --minerthreads=1 \
				--dev

kill-docker:
		# stop the node
		@(docker container kill geth-dev && docker container rm geth-dev) || true

ci: | build local-node coverage test-codecov kill-docker

test-local: | build local-node test kill-docker

.PHONY: ci test coverage test-coveralls watch lint build clean kill-docker local-node
