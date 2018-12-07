NODE = @node
COMPILER = $(NODE) --max-old-space-size=4096 node_modules/.bin/decentraland-compiler
TSC = $(NODE) --max-old-space-size=4096 node_modules/.bin/tsc
MOCHA = $(NODE) --max-old-space-size=4096 node_modules/.bin/mocha
NYC = $(NODE) --max-old-space-size=4096 node_modules/.bin/nyc
TSLINT = $(NODE) --max-old-space-size=4096 node_modules/.bin/tslint
COVERALLS = $(NODE) --max-old-space-size=4096 node_modules/.bin/coveralls

clean:
		@(rm -rf coverage || true)
		@(rm -rf dist || true)
		@(rm -rf .nyc_output || true)
		@(rm *.lcov || true)
		@(rm -rf bundled || true)
		@find test -name '*.js' -delete
		@find test -name '*.js.map' -delete

build: clean
		${TSC} --project tsconfig-build.json
		${TSC} --project tsconfig.json --noEmit # build everything with tests
		${COMPILER} build.json
		$(MAKE) provision-bundled

provision-bundled:
		cp ./static/package.json ./bundled/package.json
		cp ./static/api-extractor.json ./bundled/api-extractor.json
		cp ./static/tsconfig.json ./bundled/tsconfig.json
		cd ./bundled && npm i @microsoft/api-extractor
		cd ./bundled && ./node_modules/.bin/api-extractor run --typescript-compiler-folder ./node_modules/typescript --local
		mv ./bundled/lib/index.js ./bundled
		rm -rf ./bundled/lib
		rm -rf ./bundled/api-extractor.json
		rm -rf ./bundled/dist

watch:
		${TSC} --project tsconfig-build.json --watch

lint:
		${TSLINT}

test:
		${MOCHA} --reporter list

coverage:
		$(NYC) node_modules/.bin/mocha

test-coveralls:
		${NYC} report --reporter=text-lcov | ${COVERALLS} --verbose

test-codecov:
		${NYC} report --reporter=text-lcov > coverage.lcov && codecov

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
