NODE = @node
COMPILER = $(NODE) --max-old-space-size=4096 node_modules/.bin/decentraland-compiler
TSC = $(NODE) --max-old-space-size=4096 node_modules/.bin/tsc
MOCHA = $(NODE) --max-old-space-size=4096 node_modules/.bin/mocha
NYC = $(NODE) --max-old-space-size=4096 node_modules/.bin/nyc
TSLINT = $(NODE) --max-old-space-size=4096 node_modules/.bin/tslint

clean:
		$(COMPILER) build.clean.json

build:
		rm -rf dist/ 
		${TSC} --project tsconfig-build.json

build-bundled:
		rm -rf bundled
		${COMPILER} build.json
		${MAKE} provision-bundled
		${MAKE} bundle-declarations

provision-bundled:
		cp ./static/package.json ./bundled/package.json
		cp ./static/api-extractor.json ./bundled/api-extractor.json
		cp ./static/tsconfig.json ./bundled/tsconfig.json
		cd ./bundled && npm i

bundle-declarations:
		cd ./bundled && npm run bundle-declarations

watch:
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
