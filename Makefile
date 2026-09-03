.PHONY: cmp

all:
	npx http-server /tmp/short/app -p 3000 --cors -c-1

twi:
	npm install tailwindcss @tailwindcss/cli jsdom

tw:
	npm run tw

cmp.%:
	npm run build:st -- app/$*.st

dev:
	npm run dev
