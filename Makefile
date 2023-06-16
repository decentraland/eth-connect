NODE = @node
ROLLUP = $(NODE) --max-old-space-size=4096 node_modules/.bin/rollup

ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

clean:
		@echo '> Cleaning'
		@(rm -rf coverage || true)
		@(rm -rf .nyc_output || true)
		@(rm *.lcov || true)
		@(rm -rf dist || true)

build: clean
		@echo '> Building'
		${TSC} --project . --declarationDir ./dist --outDir ./dist --noEmit false
		${ROLLUP} --bundleConfigAsCjs -c --environment BUILD:production
		$(MAKE) provision-bundled

provision-bundled:
		@echo '> Generating bundles'
		@cp ./static/package.json ./dist/package.json
		@cp ./static/api-extractor.json ./dist/api-extractor.json
		@cp ./static/tsconfig.json ./dist/tsconfig.json
		@mkdir -p ./dist/etc
		cd ./dist && ../node_modules/.bin/api-extractor run $(LOCAL_ARG) --typescript-compiler-folder ../node_modules/typescript
		@cd ./dist && ../node_modules/.bin/api-documenter markdown --input-folder temp --output-folder ../docs
		@mv docs/eth-connect.md docs/index.md
		@cp static/docs_config.yml docs/_config.yml
		@mv ./dist/dist/eth-connect.d.ts ./dist
		@rm ./dist/tsconfig.json
		@rm -rf ./dist/node_modules
		@rm -rf ./dist/api-extractor.json
		@rm -rf ./dist/decl || true
		@rm -rf ./dist/dist || true
		@rm -rf ./dist/etc || true
		@rm -rf ./dist/src || true
		@rm -rf ./dist/test || true

watch:
		${TSC} --project tsconfig.json --watch

test:
		yarn test

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
        --allow-insecure-unlock \
				--http --http.addr 0.0.0.0 --http.api="admin,debug,eth,miner,net,personal,shh,txpool,web3,db" \
				--ws  --ws.addr 0.0.0.0  --ws.api="admin,debug,eth,miner,net,personal,shh,txpool,web3,db" --ws.origins \* \
				--mine \
				--dev --dev.period 0

kill-docker:
		# stop the node
		@(docker container kill geth-dev && docker container rm geth-dev) || true

ci: | build local-node test kill-docker

test-local: | build local-node test kill-docker

.PHONY: ci test test-coveralls watch lint build clean kill-docker local-node
