.PHONY: cmp

all:twi dev

install:
	npm install

twi:
	npm install tailwindcss @tailwindcss/cli jsdom

tw:
	npm run tw

cmp.%:
	npm run build:st -- app/$*.st

dev:
	npm run dev

watch:
	npm run watch:st

publish:
	npm publish --access=public --tag beta
