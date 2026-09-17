.PHONY: cmp

all:
	npx http-server .short/app -p 3000 --cors -c-1

twi:
	npm install tailwindcss @tailwindcss/cli jsdom

tw:
	npx @tailwindcss/cli -i ./style-i.css -o ./style-o.css --watch

cmp.%:
	npm run build:st -- $*.st
