NODE = @node
COMPILER = $(NODE) --max-old-space-size=4096 node_modules/.bin/decentraland-compiler
TSC = $(NODE) --max-old-space-size=4096 node_modules/.bin/tsc
MOCHA = $(NODE) --max-old-space-size=4096 node_modules/.bin/mocha
NYC = $(NODE) --max-old-space-size=4096 node_modules/.bin/nyc
TSLINT = $(NODE) --max-old-space-size=4096 node_modules/.bin/tslint

GREEN=\n\033[1;34m
RESET=\033[0m

clean:
		@echo "$(GREEN Cleaning project RESET)"
		$(COMPILER) build.clean.json

build:
		@echo "$(GREEN Building project RESET)"
		rm -rf dist/ 
		${TSC} --project tsconfig-build.json

build-bundled:
		@echo "$(GREEN Bundling typescript RESET)"
		rm -rf bundled
		${COMPILER} build.json
		${MAKE} provision-bundled
		${MAKE} bundle-declarations

provision-bundled:
		@echo "$(GREEN Provisioning bundle package RESET)"
		cp ./static/package.json ./bundled/package.json
		cp ./static/api-extractor.json ./bundled/api-extractor.json
		cp ./static/tsconfig.json ./bundled/tsconfig.json
		cd ./bundled && npm i

bundle-declarations:
		@echo "$(GREEN Bundling declarations RESET)"
		cd ./bundled && npm run bundle-declarations

watch:
		@echo "$(GREEN Watching project RESET)"
		${TSC} --project tsconfig-build.json --watch

lint:
		${TSLINT}

test:
		${MOCHA} --reporter list

coverage:
		${NYC} mocha

test-coveralls:
		${NYC} report --reporter=text-lcov | coveralls --verbose

test-codecov:
		${NYC} report --reporter=text-lcov > coverage.lcov && codecov
